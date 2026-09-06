"use client"

import * as React from "react"
import { updateUluleUrl } from "@/actions/site-settings"

import { useToast } from "@/hooks/use-toast"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function UluleUrlForm({
  initialUrl,
}: {
  initialUrl: string
}): JSX.Element {
  const { toast } = useToast()
  const [url, setUrl] = React.useState(initialUrl)
  const [isPending, startTransition] = React.useTransition()

  React.useEffect(() => {
    setUrl(initialUrl)
  }, [initialUrl])

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    startTransition(async () => {
      const result = await updateUluleUrl(url)
      if (!result.success) {
        toast({
          title: "Lien non enregistré",
          description: result.error ?? "Réessaie dans un instant.",
          variant: "destructive",
        })
        return
      }

      if (result.ululeUrl) {
        setUrl(result.ululeUrl)
      }

      toast({
        title: "Lien Ulule mis à jour",
        description:
          "Tous les boutons de la landing pointent maintenant vers cette URL.",
      })
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="ululeUrl">URL de la campagne Ulule</Label>
        <Input
          id="ululeUrl"
          name="ululeUrl"
          type="url"
          required
          inputMode="url"
          autoComplete="url"
          placeholder="https://fr.ulule.com"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
        />
        <p className="text-sm text-muted-foreground">
          Tous les CTA publics (bandeau, navbar, boutons de la page) utilisent
          ce lien. Tu pourras le remplacer par l&apos;URL définitive de la
          campagne sans republier le site.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Enregistrement..." : "Enregistrer le lien"}
        </Button>
        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium underline-offset-4 hover:underline"
          >
            Ouvrir le lien actuel
          </a>
        ) : null}
      </div>
    </form>
  )
}
