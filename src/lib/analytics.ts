"use client"

import type { PostHog, PostHogConfig } from "posthog-js"

import { env } from "@/env.mjs"

/**
 * Events maison. Le reste (pages vues, scroll, clics, appareil, referrer) est
 * couvert par l'autocapture PostHog — on ne redéclare que ce qui porte du sens
 * métier et qu'on veut pouvoir lire tel quel dans un dashboard.
 */
type EventMap = {
  /** Le texte du bouton est déjà porté par l'autocapture (`$el_text`). */
  ulule_cta_clicked: { location: string }
  faq_opened: { question: string }
  consent_answered: { choice: ConsentChoice }
}

export type ConsentChoice = "granted" | "denied"
export type ConsentStatus = ConsentChoice | "pending"

/**
 * Routes privées : l'usage quotidien du dashboard par Charlotte noierait le
 * trafic réel dans les stats.
 */
const TRACKING_EXCLUDED_PREFIXES = ["/dashboard", "/signin"] as const

/**
 * Le replay est en plus coupé sur /upload : les contributeurs y manipulent
 * leurs photos personnelles, elles ne doivent jamais partir dans un
 * enregistrement de session.
 */
const REPLAY_EXCLUDED_PREFIXES = [
  ...TRACKING_EXCLUDED_PREFIXES,
  "/upload",
] as const

function matchesPrefix(pathname: string, prefixes: readonly string[]): boolean {
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )
}

export function isTrackingExcluded(pathname: string): boolean {
  return matchesPrefix(pathname, TRACKING_EXCLUDED_PREFIXES)
}

export function isReplayExcluded(pathname: string): boolean {
  return matchesPrefix(pathname, REPLAY_EXCLUDED_PREFIXES)
}

/** Sans clé publique, tout l'analytics reste inerte. */
export function isAnalyticsConfigured(): boolean {
  return Boolean(env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN)
}

function buildConfig(): Partial<PostHogConfig> {
  return {
    /**
     * Toujours le proxy servi depuis notre domaine : c'est lui qui protège
     * l'ingestion des bloqueurs de pub. La région réelle est configurée sur le
     * proxy (cf. next.config.mjs), pas ici.
     */
    api_host: "/ingest",
    /** Uniquement pour que les liens du toolbar PostHog pointent au bon endroit. */
    ui_host: (env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com").replace(
      ".i.posthog.com",
      ".posthog.com"
    ),
    defaults: "2026-08-30",

    /**
     * Stratégie de consentement hybride :
     * - tant que le visiteur n'a pas répondu (ou s'il refuse), PostHog mesure
     *   en mode cookieless — aucun cookie, aucun localStorage, identité
     *   dérivée d'un hash côté serveur ;
     * - s'il accepte, on bascule sur le fonctionnement normal.
     *
     * ⚠️ Le mode cookieless doit être activé dans les réglages du projet
     * PostHog, sinon les events pré-consentement sont ignorés à l'ingestion.
     */
    cookieless_mode: "on_reject",
    opt_out_capturing_by_default: true,

    /** Pages vues : couvre aussi les navigations client de l'App Router. */
    capture_pageview: "history_change",
    /** Porte le scroll max de la page précédente (`$prev_pageview_max_*`). */
    capture_pageleave: true,

    autocapture: true,
    capture_heatmaps: true,
    /** Économise le quota : pas de profil pour chaque visiteur anonyme. */
    person_profiles: "identified_only",

    /** Le replay ne démarre qu'après consentement explicite. */
    disable_session_recording: true,
    session_recording: {
      maskAllInputs: true,
    },

    /**
     * Dernier filet : même si un event est déclenché pendant une navigation
     * vers une route privée, il ne part pas.
     */
    before_send: (result) => {
      if (!result) return null
      const pathname =
        typeof result.properties?.$pathname === "string"
          ? result.properties.$pathname
          : window.location.pathname
      return isTrackingExcluded(pathname) ? null : result
    },
  }
}

let instance: PostHog | null = null
let pending: Promise<PostHog | null> | null = null

/**
 * Charge et initialise PostHog à la demande. L'import est dynamique pour que
 * les ~300 ko de la librairie ne pèsent pas sur le premier rendu de la landing.
 *
 * Idempotent, et appelable depuis n'importe quel composant client : l'ordre de
 * montage n'a donc pas d'importance.
 */
export function loadAnalytics(): Promise<PostHog | null> {
  const token = env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN
  if (!token) return Promise.resolve(null)
  if (instance) return Promise.resolve(instance)
  if (typeof window === "undefined") return Promise.resolve(null)

  pending ??= import("posthog-js").then(({ default: posthog }) => {
    // Un double appel (StrictMode rejoue les effets) retomberait ici une seule
    // fois grâce à `pending`, mais on reste prudent.
    instance ??= posthog.init(token, buildConfig()) ?? posthog
    return instance
  })

  return pending
}

export async function getConsentStatus(): Promise<ConsentStatus> {
  const posthog = await loadAnalytics()
  return posthog?.get_explicit_consent_status() ?? "pending"
}

export async function setConsent(choice: ConsentChoice): Promise<void> {
  const posthog = await loadAnalytics()
  if (!posthog) return

  if (choice === "granted") {
    // On émet notre propre event juste après, pas besoin du `$opt_in`.
    posthog.opt_in_capturing({ captureEventName: false })
  } else {
    // Repasse en mode cookieless (cf. `cookieless_mode: "on_reject"`).
    posthog.opt_out_capturing()
  }

  posthog.capture("consent_answered", { choice })
}

/** Le replay suit le consentement ET la route courante. */
export async function syncSessionRecording(pathname: string): Promise<void> {
  const posthog = await loadAnalytics()
  if (!posthog) return

  const isAllowed =
    posthog.get_explicit_consent_status() === "granted" &&
    !isReplayExcluded(pathname)

  if (isAllowed) {
    posthog.startSessionRecording()
  } else {
    posthog.stopSessionRecording()
  }
}

/**
 * Volontairement synchrone côté appelant : un clic ne doit jamais attendre
 * l'analytics. L'event part dès que la librairie est prête.
 */
export function track<K extends keyof EventMap>(
  name: K,
  properties: EventMap[K]
): void {
  void loadAnalytics().then((posthog) => posthog?.capture(name, properties))
}
