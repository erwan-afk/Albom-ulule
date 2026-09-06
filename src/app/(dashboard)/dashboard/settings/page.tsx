import { getUluleUrl } from "@/lib/site-settings"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { UluleUrlForm } from "@/components/admin/UluleUrlForm"

export default async function SettingsPage(): Promise<JSX.Element> {
  const ululeUrl = await getUluleUrl()

  return (
    <div className="container min-w-0 space-y-8 px-4 py-8 sm:px-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
        <p className="text-muted-foreground">
          Réglages publics du site, sans republier le code.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Campagne Ulule</CardTitle>
          <CardDescription>
            Lien vers lequel pointent tous les boutons de la landing. Par
            défaut : fr.ulule.com, à remplacer par l&apos;URL de la campagne
            dès qu&apos;elle est en ligne.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UluleUrlForm initialUrl={ululeUrl} />
        </CardContent>
      </Card>
    </div>
  )
}
