# AGENTS.md — Albom (édition Bord de mer, campagne Ulule)

Source de vérité pour les agents et collaborateurs qui interviennent sur ce dépôt.
Ce fichier décrit le produit, la stratégie de page, la direction artistique stricte, la stack et les règles à respecter.

> Si ce que tu vas faire entre en conflit avec ce fichier, on suit ce fichier — pas l'instinct.

## Addendum produit — 02/06/2026 (référentiel Figma)

À partir de cette date, la maquette Figma `Desktop / Accueil` (node `125:113`) devient le référentiel prioritaire pour la landing publique.

Implications :

- La structure visuelle de la page, l'ordre des sections et les volumes typographiques suivent Figma.
- L'usage de Burned Pancakes est élargi aux titres décoratifs/labels visibles dans la maquette (pas uniquement au logotype).
- La navbar publique est sticky et ne contient pas d'ancres de menu : logo + CTA Ulule uniquement.
- La version mobile est une interprétation fidèle de l'intention Figma (pas un clone pixel perfect desktop réduit).
- Les textes validés dans Figma priment ; en cas de placeholder/lorem ipsum, le copywriting peut être inventé en cohérence de ton de marque.

Cet addendum complète les sections ci-dessous ; en cas de contradiction, cet addendum prévaut pour la landing.

---

## 1. Produit et contexte

Albom est une jeune entreprise française fondée en 2026 par **Charlotte**. Elle conçoit et commercialise un **kit créatif d'album-souvenir personnalisé à compléter soi-même**.

Composition du kit (édition standard) :

- un cahier-magazine thématique pré-mis en page, en partie vierge ;
- une planche de photos personnelles imprimées en format autocollant (Charlotte imprime les photos envoyées par le·a client·e) ;
- une planche de stickers décoratifs thématiques ;
- des feutres pour annoter, dessiner, écrire.

Le·a client·e compose un objet souvenir entièrement personnalisé, à offrir ou à conserver. Le format hybride **magazine + impression photo + DIY** n'a pas d'équivalent direct sur le marché.

### Étude marché (mars 2026, n=60)

- cible majoritairement féminine, 18–39 ans ;
- occasions d'achat prioritaires : **retours de voyage, anniversaires, Saint-Valentin** ;
- freins identifiés sur les albums classiques : manque de personnalité, prix élevé, création fastidieuse — exactement les trois points que le produit résout.

### Concurrence et zone de jeu

Les acteurs généralistes de l'album photo en ligne (Photobox, Cheerz, Lalalab, Rosemood…) proposent des produits **finis, automatisés, sans expérience créative**. **Albom ne joue pas dans ce terrain**. Voir §1-bis ci-dessous pour le positionnement réel.

### Première édition : "Bord de mer"

C'est l'édition que la campagne Ulule présente.
Composition du pack :

- 1 livret-magazine "Bord de mer" pré-mis en page ;
- 1 planche de 21 photos autocollantes (photos personnelles du client, imprimées par Charlotte) ;
- 1 planche de stickers illustrations thématiques mer ;
- 2 feutres en bonus / upsell potentiel sur Ulule.

### Objectif financier campagne Ulule

Atteindre **5 000 € de chiffre d'affaires d'ici fin 2026** pour financer les premiers stocks, le lancement commercial et la stratégie d'acquisition.

### Double fonction du site

Aujourd'hui, le site a deux rôles distincts :

1. Landing one-page publique → vendre l'idée et générer des contributions Ulule. Tous les CTA renvoient vers `ULULE_URL` (constante `src/config/site.ts`).
2. Application interne (dashboard + upload) → réservée à Charlotte (et plus tard aux contributeurs qui reçoivent un lien personnalisé par email après leur commande Ulule).

> Pour la session en cours, on s'occupe uniquement de la landing. L'app derrière sera traitée plus tard.

**Important** : la landing ne doit pas exposer le dashboard ni un bouton "Se connecter" public.
Charlotte se connecte via un chemin direct (`/signin`) qu'on ne lie pas depuis la landing.

---

## 1-bis. Positionnement stratégique, vision, valeurs

> Cette section est la **source de vérité de la voix de marque**. Si une formulation, un argument, un titre ou une icône te fait basculer hors de ce territoire, c'est qu'il faut le réécrire — pas l'inverse.

### Vision

Remettre **le collage et la créativité manuelle au goût du jour**, pour que chacun·e puisse transformer ses souvenirs en un objet unique dont iel est fier·e — **sans complexité, sans écran, juste avec ses mains**.

Vision plus large à moyen terme : créer toute une famille de **projets créatifs hors-écran, à faire avec ses mains**.

### Positionnement (la règle d'or)

**Albom ne se positionne PAS dans l'univers des albums photo** (Cheerz, Lalalab, Photobox, Rosemood). Cette catégorie est mentionnée uniquement pour **s'en démarquer**, jamais pour s'y comparer favorablement.

**Albom se positionne dans l'univers des activités créatives pour adultes** — aux côtés des **puzzles, Lego, paint by number, broderie, peinture diamant** — avec une différence fondamentale : **c'est la seule activité où le résultat raconte ta vie.**

- **Territoire de marque** : activité créative & souvenir personnel.
- **Angle de différenciation** : la créativité accessible, sans le chaos du scrapbooking. Le souvenir physique, sans l'ennui d'un éditeur en ligne.
- **Catégorie mentale visée** : "ce que je vais faire dimanche après-midi", pas "ce que je commande après mes vacances".

Implications concrètes pour la landing :

- Ne **jamais** présenter Albom comme un "album photo" ou un "service d'impression photo". Ce sont des **mots-de-tendance-concurrents**.
- Les mots à privilégier : **activité, kit créatif, moment, dimanche, mains, papier, créer, coller, déconnexion, cosy, fierté**.
- Les mots à bannir : "service photo", "solution album", "plateforme", "expérience phygitale", "innovation", "premium", "boostez".
- Une comparaison directe est OK : "Comme un puzzle — sauf qu'à la fin l'objet raconte ta vie." Le but est de **récupérer le rituel** du puzzle / paint by number, pas de remplacer Lalalab.

### Valeurs (3 piliers, à imprégner dans la page)

1. **Créativité accessible.** Pas besoin d'être artiste, pas besoin de matériel complexe. On rend la créativité évidente et agréable pour tout le monde.
2. **Douceur & déconnexion.** Un moment cosy, à soi, loin des écrans. Les mains dans le papier, la tête dans les souvenirs. Ralentir, prendre soin de soi, être dans sa bulle / sa safe place créative.
3. **Mémoire vivante.** Tes souvenirs méritent mieux qu'un dossier qui dort dans ton téléphone. Albom leur donne une forme, une matière, une vie.

### Proposition de valeur (phrase canonique)

> **Albom, c'est une activité créative pour transformer tes photos en souvenir unique : sans écran, sans complexité, juste toi, tes mains et tes meilleurs moments.**

Si la page d'accueil devait porter une seule promesse, c'est celle-ci. La H1 et la baseline du footer doivent en être des variantes courtes.

### 5 arguments de vente structurants

À piocher pour les sections "Reasons", "Story", FAQ, social proof. **Toujours formuler en tutoiement, en voix de proche.**

1. **Rupture avec l'album photo classique.** *"Les albums photo c'est bien, mais c'est des heures derrière un écran pour un résultat qui se ressemble tous. Albom c'est une activité, pas une corvée."*
2. **Rupture avec le scrapbooking.** *"Le scrapbooking c'est intimidant, ça demande du matériel, des idées, du temps. Albom c'est le juste milieu : toute la créativité, zéro prise de tête."*
3. **Le moment pour soi.** *"Un dimanche cosy, les mains dans le papier, à te replonger dans tes meilleurs souvenirs. Comme un puzzle — sauf qu'à la fin l'objet raconte ta vie."*
4. **La culpabilité transformée en plaisir.** *"Tu as des centaines de photos dans ton téléphone que tu ne regardes plus. Albom te donne enfin une belle raison de t'en occuper."*
5. **L'objet dont tu seras fière.** *"Pas un album générique sorti d'une usine. Un objet que t'as fait de tes mains, qui te ressemble, que tu garderas des années."*

### Points de douleur (à utiliser en accroche / FAQ / micro-copy)

**La prison du téléphone** — milliers de photos, aucun souvenir tangible, on les voit défiler sans jamais les revivre, le jour où on perd son téléphone on perd tout.

**La corvée qu'on repousse** — "je ferai un album un jour" depuis 3 ans, le problème n'est pas la flemme, c'est que le processus est nul (trier, redimensionner, choisir un template, attendre). *Commander un album, c'est une corvée. Faire un Albom, c'est une activité.*

**Le scrapbooking c'est pas pour toi (mais Albom si)** — t'as pas besoin d'être créative pour faire un Albom, t'as juste besoin d'avoir envie. Toute la créativité du scrapbooking, sans la prise de tête.

**L'activité du dimanche** — comme un puzzle, comme une peinture par numéro, sauf que l'objet final parle de toi. Activité pour les mains, la tête ailleurs, téléphone posé. Le genre de dimanche d'où tu ressors avec quelque chose dont tu es fière. Seule, en couple, entre ami·es ou en famille.

**La déconnexion** — une heure sans scroller, sans notif. Le papier a une texture que l'écran n'aura jamais. Se reconnecter à ses souvenirs en se déconnectant de son téléphone. *Coller une photo de ses mains, c'est pas pareil que la liker.*

**L'objet unique** — deux Albom ne se ressembleront jamais. Dans 10 ans tu l'ouvriras et tu te souviendras de tout. L'objet que tes enfants fouineront dans tes affaires un jour.

**La fierté du fait-main** — t'as pas juste commandé un truc sur internet, t'as passé un bon moment ET t'as un bel objet. *Un cadeau que t'as fait toi-même frappe toujours plus fort qu'un cadeau commandé.*

**Cadeau (sujet secondaire, à travailler quand on dégainera le format cadeau)** — le cadeau le plus personnel qu'on puisse offrir sans être dans la tête de quelqu'un. Offrir un Albom, c'est offrir un moment autant qu'un objet.

### Occasions d'achat prioritaires (confirmées par l'étude marché)

1. Retours de voyage
2. Anniversaires
3. Saint-Valentin

À utiliser pour ouvrir des saisonnalités éditoriales, des FAQ "pour quelle occasion ?", ou des accroches secondaires. La campagne Bord de mer cible **les retours de voyage** d'abord.

### Première édition : "Bord de mer"

C'est l'édition que la campagne Ulule présente.
Composition du pack :

- 1 livret-magazine "Bord de mer" pré-mis en page ;
- 1 planche de 21 photos autocollantes (photos personnelles du client, imprimées par Charlotte) ;
- 1 planche de stickers illustrations thématiques mer ;
- 2 feutres en bonus / upsell potentiel sur Ulule.

### Double fonction du site

Aujourd'hui, le site a deux rôles distincts :

1. Landing one-page publique → vendre l'idée et générer des contributions Ulule. Tous les CTA renvoient vers `ULULE_URL` (constante `src/config/site.ts`).
2. Application interne (dashboard + upload) → réservée à Charlotte (et plus tard aux contributeurs qui reçoivent un lien personnalisé par email après leur commande Ulule).

> Pour la session en cours, on s'occupe uniquement de la landing. L'app derrière sera traitée plus tard.

**Important** : la landing ne doit pas exposer le dashboard ni un bouton "Se connecter" public.
Charlotte se connecte via un chemin direct (`/signin`) qu'on ne lie pas depuis la landing.

---

## 2. Objectif de la landing

Un seul objectif mesurable :

> Générer des clics vers la campagne Ulule.

CTA unique répété dans la page :

> **Soutenir sur Ulule** (ou variantes ponctuelles : "Précommander sur Ulule", "Découvrir la campagne")

Toujours en lien externe `<a href={siteConfig.ululeUrl} target="_blank" rel="noopener">`.

### Structure cible de la page

1. Barre teasing campagne (top bar) — micro-info Ulule / soutien projet émergent
2. Header (logo Albom + nav d'ancres + CTA Ulule)
3. Hero
4. Bandeau valeurs de marque (5 mots-clés du brandboard)
5. Pack "Bord de mer" — décomposition du contenu
6. Comment ça marche (3 étapes : commander Ulule → personnaliser via lien email → recevoir)
7. Raisons d'acheter / bénéfices
8. Ils en parlent mieux que nous — grille placeholder "bientôt"
9. Histoire de la marque — Charlotte, citation, photo
10. FAQ
11. Bandeau confiance (livraison, paiement Ulule, projet local, contact)
12. CTA final
13. Footer minimal (mentions, contact, réseaux)

### Ce qu'on ne fait pas

- Pas de prix dans le hero. Le prix vit sur Ulule (paliers).
- Pas de tunnel d'achat sur le site.
- Pas de connexion exposée publiquement.
- Pas de blog actif pour la campagne (les routes blog/about/etc. existent en stub Next.js mais ne sont pas mises en avant).

---

## 3. Direction artistique — brandboard strict

Toute la DA suit **strictement** le brandboard fourni par Charlotte. Pas d'improvisation de couleur, pas de glissement vers d'autres palettes.

### Palette (4 couleurs, pas une de plus)

| Token        | HEX       | Usage                                                                   |
| ------------ | --------- | ----------------------------------------------------------------------- |
| Brun         | `#673A36` | Texte principal, fond fort des sections d'autorité (FAQ, How, Footer)   |
| Maya         | `#C0DFFF` | Accents, surlignages, badges, sections de respiration                   |
| Beurre       | `#F8F5CA` | Jaune beurre pâle. Sections Pack + Histoire, cartes/badges chauds.      |
| Blanc Cassé  | `#F9F9F4` | **Fond par défaut** de la page et de la majorité des sections claires   |

Règles :

- **Fond par défaut = Blanc Cassé** (`bg-blanc-casse`). Le Beurre n'est jamais utilisé en fond de page principal, mais comme accent chaud sur une section dédiée (Histoire) et en fond de cartes (Pack, Reasons, Trust icons).
- Pas de noir pur, pas de blanc pur. Le texte est en Brun sur fond clair, ou en Beurre sur fond Brun.
- Maya s'utilise en larges aplats pour les sections de respiration (Values, Reasons, Trust), et en touches accent (surligneur sur un mot, badge, sticker, bouton).
- Pas de gradient générique, pas de glassmorphism, pas de néon, pas de combinaison de couleurs hors palette.
- Au CSS : toujours via les tokens (`bg-blanc-casse`, `bg-beurre`, `bg-maya`, `bg-brun`), jamais via des valeurs `[#xxxxxx]` arbitraires.

### Polices

| Rôle                                                      | Police              | Variable CSS          |
| --------------------------------------------------------- | ------------------- | --------------------- |
| Tout le site : titres, corps, UI, microcopy, chiffres     | **Albert Sans**     | `--font-albert-sans`  |
| Logotype "albom" **et rien d'autre**                      | **Burned Pancakes** | `--font-display`      |

Burned Pancakes est une police payante fournie par Charlotte. À placer dans `public/fonts/burned-pancakes.woff2`, puis basculer dans `src/config/fonts.ts` (un seul endroit à toucher). Tant que le fichier n'est pas livré, on charge **Caveat Brush** (Google Fonts) sous la même variable `--font-display`.

> ⚠️ Albert Sans porte **toute** la hiérarchie typographique : H1, H2, H3, chiffres, FAQ, microcopy. Burned Pancakes est strictement réservé au mot "albom" (logotype en nav, en footer, et inline dans 2-3 paragraphes au plus). Pas de Burned Pancakes pour "01", "FR", "— Charlotte", etc. C'est ce qui garde le système lisible et la voix éditoriale serrée.

### Système typographique strict — 6 styles, point.

Le fichier `src/app/(landing)/page.tsx` expose une constante `T` qui contient les 6 styles autorisés. **Aucun nouveau style ne doit apparaître ailleurs.** Si tu as besoin d'une variante, c'est probablement qu'il faut réutiliser l'un de ces 6.

| Token        | Tailwind                                                       | Usage                                                 |
| ------------ | -------------------------------------------------------------- | ----------------------------------------------------- |
| `display1`   | `font-semibold leading-[1.05] tracking-tight text-[clamp(40px,6vw,68px)]` | **H1 unique du hero**                         |
| `display2`   | `font-semibold leading-[1.08] tracking-tight text-[clamp(28px,4vw,46px)]` | H2 de chaque section                          |
| `display3`   | `text-xl font-semibold leading-snug`                           | H3 de carte, citation, libellé fort (20px)            |
| `bodyLead`   | `text-lg leading-relaxed`                                      | Paragraphe d'intro / chapeau de section (18px)        |
| `body`       | `text-base leading-relaxed`                                    | Paragraphe standard, description carte, liens nav, FAQ réponse, microcopy "longue" (16px) |
| `caption`    | `text-xs font-semibold uppercase tracking-[0.22em]`            | Overlines, labels, badges, étiquettes (12px)          |
| `numeral`    | `text-4xl font-semibold leading-none tracking-tight`           | Grands chiffres / stats (36px)                        |

Règles :

- **Un seul `<h1>` sur la page** (le titre du hero).
- Toutes les descriptions de carte sont en `body` (16px) — **on ne descend pas à 14 ou 13px** pour "tasser" de l'info. Si une carte est trop dense, on enlève du contenu, on n'écrase pas la typo.
- Les libellés répétés (badges "Inclus", étiquettes "Item 01", overlines de section, intro top-bar, étiquettes d'étape) sont **tous** en `caption`.
- Pas de couleur seule pour porter une info : tout texte respecte le contraste WCAG AA contre son fond (Brun sur Blanc-Cassé/Beurre/Maya ✅, Beurre sur Brun ✅).
- Italique = uniquement pour les "accents" éditoriaux dans les H2 (ex : *prêt à recevoir*, *à vivre*), en italique d'Albert Sans semibold — pas en font-display.

### Photographie et visuels

- On utilise les 4 photos issues du brandboard (`public/images/brand/`) comme placeholders éditoriaux le temps que Charlotte fournisse des assets définitifs.
- `next/image` partout, avec `alt` descriptifs en français.
- Pas de mockups SaaS flottants, pas de glow IA. On reste sur des compositions éditoriales : tape, papier, stickers, photos polaroïd.

### Stickers / accents graphiques

Petits stickers ronds Maya, badges "édition 01", numérotations manuscrites, flèches simples. On reste sobre : la photographie et la typographie portent l'identité.

### Logotype "albom" — règle stricte

À chaque fois qu'on écrit le mot **albom** à l'écran, on utilise le composant `LogoAlbom` (`src/components/landing/logo.tsx`) — pas une typo, même pas Burned Pancakes en HTML. Ce composant rend le vrai logotype SVG fourni par Charlotte, sa couleur s'hérite via `currentColor` (donc `text-brun`, `text-beurre`, etc.).

Cas d'usage :

- Header (sticky, hauteur 28px)
- Hero (overlay géant, 95–105% de la largeur)
- Inline dans 2 paragraphes (chapeau, citation Charlotte)
- Footer (hauteur 40px)

Burned Pancakes / `font-display` n'est plus appelé directement dans la landing : on s'appuie uniquement sur le SVG. La variable reste configurée pour d'éventuelles utilisations futures (page contact ?).

### Mockups SVG (en attendant les shoots)

`src/components/landing/mockups.tsx` regroupe les composants SVG qui simulent le produit physique. Ils sont là **uniquement** parce qu'on n'a pas encore de vrais visuels print. À remplacer par de vraies photos / renders 3D dès que Charlotte les aura.

- `MagazineCover` — la couverture papier "Bord de mer"
- `PhotoSheet` — la planche de 21 photos perso
- `StickerSheet` — la planche d'illustrations
- `Markers` — les 2 feutres
- `WashiTape` — tape adhésif décoratif (3 tons : beurre, maya, kraft)
- `Stamp` — cachet diagonal type "Bientôt", "Édition limitée"
- `StickerBadge` — sticker rond signature
- `Polaroid` — cadre polaroid générique

Quand on remplace ces mockups par de vraies photos, on **supprime** le composant correspondant — pas question de garder un fallback SVG dans la prod long-terme.

---

## 3-bis. Animations et interactions

L'esprit du site : le **magazine est l'acteur** dont le site met en scène le remplissage. Pas de scroll horizontal, pas de "pages", pas de page-turn. Tout reste vertical et fluide.

### Animations autorisées

- **Sticky scrollytelling** (1 section : Pack) : le magazine reste fixe à droite pendant que les 4 étapes du pack défilent à gauche, et des éléments (planche photos, stickers, feutres) viennent s'y coller au scroll. Implémenté dans `sticky-pack.tsx` via Framer Motion `useScroll` + `useTransform`.
- **Apparition au scroll-in** (`whileInView`) : pour les washi tapes, signatures SVG, marker strokes.
- **Marker stroke animé** : composant `MarkerStroke` qui dessine un trait au marqueur sous un mot/groupe de mots quand l'élément entre dans le viewport (SVG path + `stroke-dasharray`).
- **Hover stickers** : composant `ReasonCard` révèle un mini-sticker au coin de la carte au hover. `VideoTile` révèle un sticker "vue par X" au hover.
- **Polaroid hover tape** : `FounderFigure` révèle un washi tape supplémentaire au hover, et redresse légèrement la photo.

### Règles d'animation

- **Toujours** prévoir un fallback statique pour `prefers-reduced-motion`. C'est implémenté via `useReducedMotion()` dans chaque composant animé.
- **Aucune animation** sur le contenu textuel critique (h1, paragraphes essentiels). Seuls les décors animent.
- **Aucune animation** ne doit dépendre du curseur pour fonctionner sur mobile : tout doit être lisible sans interaction.
- **Pas de carrousel auto-play, pas de typing effect, pas de gradient mesh animé.** Si tu en as envie, c'est qu'on est en train de dériver.
- Durées : 200–800ms max. Au-delà c'est de la latence pour l'utilisateur.

### Mobile

- Le sticky scrollytelling du pack **n'est pas sticky sur mobile** : on déroule les 4 étapes en colonne classique, et on montre une mini composition statique en bas.
- Tous les hover stickers ont une version "déjà visible" par défaut sur tactile (vu que `reduce` n'est pas suffisant pour détecter le touch).

---

## 4. Ton éditorial

Tutoiement systématique. Voix proche, chaude, un peu malicieuse, jamais corporate. On parle comme une copine qui te raconte son dimanche, **pas comme une marque qui te vend un service**.

Toujours s'aligner sur §1-bis : on est une **activité créative**, pas un album photo. Le copy doit pouvoir tenir à côté d'une description de puzzle Ravensburger ou de kit paint by number sans dénoter.

À privilégier :

- "Tes souvenirs méritent mieux qu'un dossier oublié dans ton téléphone."
- "Tu colles, tu griffonnes, tu refermes. Pas de couleur à choisir, pas de Photoshop."
- "Un objet qu'on touche, qu'on offre, qu'on garde."
- "Comme un puzzle — sauf qu'à la fin l'objet raconte ta vie."
- "Un dimanche cosy, les mains dans le papier."
- "Toute la créativité du scrapbooking, zéro prise de tête."
- "Une heure sans scroller, sans notif."

À éviter :

- "Notre solution innovante…"
- "Boostez vos souvenirs…"
- "Une expérience phygitale unique…"
- "L'album photo nouvelle génération…" (on n'est pas un album photo)
- "Service d'impression photo personnalisé…" (on n'est pas un service photo)
- Le vouvoiement.
- Les superlatifs vides ("incroyable", "révolutionnaire", "premium").
- Le vocabulaire SaaS/tech ("plateforme", "expérience", "solution", "boost").

### Champ lexical à mobiliser

**Verbes** : coller, glisser, griffonner, refermer, ouvrir, choisir, créer, ralentir, se poser, prendre le temps, se reconnecter.

**Objets / matières** : papier, mat 170g, sticker, washi tape, marqueur, planche, couverture, polaroïd, table basse.

**Moments** : dimanche, soir, vacances, anniversaire, Saint-Valentin, retour de voyage, première soirée d'automne.

**Émotions / états** : fierté, douceur, cosy, déconnexion, calme, nostalgie chaude, bulle.

**Repères catégoriels** (à utiliser comme analogies, jamais comme concurrents) : puzzle, paint by number, Lego, broderie, peinture diamant, scrapbooking (en repoussoir : "sans la prise de tête").

---

## 5. SEO, accessibilité, performance

### SEO

- Locale : `fr_FR` partout (Open Graph, `<html lang>`).
- Titre par défaut : `Albom — Le magazine-souvenir à compléter à la main`.
- Description : phrase humaine ~150 caractères, sans bourrage de mots-clés.
- Mots-clés métiers : magazine souvenir, album photo, carnet de voyage, scrapbook, souvenirs vacances, cadeau personnalisé, Ulule.
- Image Open Graph : `src/app/opengraph-image.png` (à actualiser pour l'édition Bord de mer dès qu'on a un visuel produit).

### Accessibilité

- Contrastes Brun/Beurre OK (ratio ~10:1). Maya seul **ne suffit jamais** pour porter du texte critique.
- Focus visible obligatoire sur tous les éléments interactifs (boutons, liens, accordéon FAQ).
- Tous les `<img>` ont un `alt` explicite (vide si purement décoratif).
- Un seul `h1`. Hiérarchie `h2 → h3` cohérente.
- Navigation clavier complète sur la FAQ (Enter / Space pour ouvrir).
- Respecter `prefers-reduced-motion` : aucune animation > 200ms si l'utilisateur le demande.

### Performance

- `next/image` systématique avec `sizes` adapté.
- Fonts via `next/font` (déjà en place) pour éviter le FOUT.
- Pas de librairie d'animation lourde sur la landing (Framer Motion existe, on l'utilise avec parcimonie).
- Pas de carrousel JS si on peut s'en passer avec scroll-snap natif.
- Lighthouse cible : > 90 sur les 4 axes en production.

---

## 6. Responsive

Mobile-first obligatoire. Breakpoints Tailwind :

- `sm` 640px / `md` 768px / `lg` 1024px / `xl` 1280px / `2xl` 1400px (override container).

Règles non négociables :

- Le hero doit être lisible sans scroll horizontal dès 360px.
- Les grilles 4 colonnes passent en 2 colonnes (md) puis 1 colonne (mobile).
- Les CTA restent visibles : un CTA Ulule sticky en bas d'écran mobile est acceptable.
- Pas de débordement horizontal (overflow-x hidden au niveau `<html>` côté layout root déjà en place).

---

## 7. Stack

- Next.js 14 (App Router) + TypeScript.
- Tailwind CSS + variables CSS pour le theming.
- `next-themes` présent mais on **force le thème clair** sur la landing publique (l'admin/dashboard peut garder le dark).
- shadcn/ui pour les composants UI utilitaires (Accordion, Dialog).
- Public Sans + Burned Pancakes via `next/font` (cf. `src/config/fonts.ts`).
- Resend + Prisma + NextAuth restent en place pour la partie app (hors scope landing).

### Scripts utiles

```bash
pnpm dev          # lance le dev server (https local)
pnpm lint         # next lint
pnpm typecheck    # tsc --noEmit
pnpm build        # next build (vérifie la prod)
```

Avant chaque merge sur la branche principale : `pnpm lint && pnpm typecheck && pnpm build` doivent passer.

---

## 8. Conventions de code

- TSX strict (`tsconfig` déjà en `strict`).
- Pas de classes Tailwind avec valeurs arbitraires hex (`bg-[#673A36]`) pour les couleurs de marque : utiliser les tokens (`bg-brun`, `text-beurre`, `bg-maya`, `bg-blanc-casse`) déjà mappés dans `tailwind.config.ts`.
- Les arbitrary values restent OK pour des espacements ponctuels ou des `clamp()` typographiques.
- Composants de section dans `src/components/landing/` (un fichier par section), composés dans `src/app/(landing)/page.tsx`.
- Tout composant qui a besoin de state (`useState`, FAQ accordion par ex.) est marqué `"use client"` ; le reste reste serveur pour profiter du SSR et exposer les metadata.
- Pas de `any`. Si une typage manque, on l'écrit.

---

## 9. Checklist de livraison landing

- [ ] Site en français, tutoiement
- [ ] Aucun lien public vers `/signin` ou `/dashboard`
- [ ] Tous les CTA principaux pointent vers `siteConfig.ululeUrl`
- [ ] Un seul `h1` (titre du hero)
- [ ] Brand tokens (brun, maya, beurre) utilisés, plus de couleurs hardcodées dans les composants
- [ ] `next/image` partout
- [ ] Metadata FR + Open Graph `fr_FR`
- [ ] Responsive testé à 360, 768, 1024, 1440
- [ ] FAQ navigable au clavier
- [ ] `pnpm lint` OK
- [ ] `pnpm typecheck` OK
- [ ] `pnpm build` OK
- [ ] Lighthouse > 90 (mobile et desktop)

---

## 10. À récupérer auprès de Charlotte (parking lot)

- [ ] Fichier `burned-pancakes.woff2` (et `.woff` si dispo) → `public/fonts/`
- [ ] URL définitive de la campagne Ulule
- [ ] Visuels produit (livret Bord de mer, planches de stickers, photos en situation)
- [ ] Portrait de Charlotte pour la section Histoire
- [ ] Citation finale de Charlotte (texte d'introduction du "Pourquoi j'ai créé Albom")
- [ ] Validation des FAQ (la version actuelle est draftée)
- [ ] Email de contact (le `hello@albom.fr` est un placeholder)
- [ ] Compte Instagram / TikTok / Pinterest officiels
- [ ] Plus tard : visuels et vidéos pour la section "Ils en parlent"
