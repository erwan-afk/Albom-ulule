import dynamic from "next/dynamic"
import { getOrders } from "@/actions/order"

import { getUluleUrl } from "@/lib/site-settings"
import { cn } from "@/lib/utils"

import { DashboardSectionNav } from "@/components/admin/DashboardSectionNav"
import { UluleUrlForm } from "@/components/admin/UluleUrlForm"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { CreateOrderForm } from "@/components/upload/CreateOrderForm"
import { OrdersTable } from "@/components/upload/OrdersTable"

const DashboardTemplates = dynamic(
  () =>
    import("@/components/admin/DashboardTemplates").then(
      (m) => m.DashboardTemplates
    ),
  { ssr: false }
)

const SECTION_TITLE = "text-2xl font-semibold leading-tight tracking-tight"

const tintedCardClass =
  "h-full shadow-none [&_label]:text-brun [&_.text-muted-foreground]:text-brun/70 [&_input]:border-brun/20 [&_input]:bg-blanc-casse [&_input]:shadow-none"

export default async function DashboardPage(): Promise<JSX.Element> {
  const [orders, ululeUrl] = await Promise.all([getOrders(), getUluleUrl()])

  return (
    <div className="container min-w-0 space-y-8 px-4 py-8 sm:px-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Gérez les commandes et les dépôts de photos.
        </p>
        <DashboardSectionNav />
      </div>

      <div className="grid gap-8 lg:grid-cols-2 lg:items-stretch">
        <Card
          id="campagne-ulule"
          className={cn(
            tintedCardClass,
            "scroll-mt-8 border-beurre-deep bg-beurre text-brun [&_button[type=submit]]:bg-brun [&_button[type=submit]]:text-beurre [&_button[type=submit]]:shadow-none [&_button[type=submit]]:hover:bg-brun-deep [&_a]:text-brun"
          )}
        >
          <CardHeader>
            <CardTitle className={cn(SECTION_TITLE, "text-brun")}>
              Campagne Ulule
            </CardTitle>
            <CardDescription className="text-brun/70">
              Lien vers lequel pointent tous les boutons de la landing. Par
              défaut : fr.ulule.com, à remplacer par l&apos;URL de la campagne
              dès qu&apos;elle est en ligne.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UluleUrlForm initialUrl={ululeUrl} />
          </CardContent>
        </Card>

        <Card
          id="nouvelle-commande"
          className={cn(
            tintedCardClass,
            "scroll-mt-8 border-maya-deep bg-maya text-brun [&_button[type=submit]]:bg-brun [&_button[type=submit]]:text-maya [&_button[type=submit]]:shadow-none [&_button[type=submit]]:hover:bg-brun-deep"
          )}
        >
          <CardHeader>
            <CardTitle className={cn(SECTION_TITLE, "text-brun")}>
              Nouvelle commande
            </CardTitle>
            <CardDescription className="text-brun/70">
              Créez une commande et envoyez automatiquement le lien de dépôt au
              client.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateOrderForm />
          </CardContent>
        </Card>
      </div>

      <Card id="commandes" className="scroll-mt-8 shadow-none">
        <CardHeader>
          <CardTitle className={SECTION_TITLE}>
            Commandes ({orders.length})
          </CardTitle>
          <CardDescription>
            Suivez l&apos;état de chaque commande.
          </CardDescription>
        </CardHeader>
        <CardContent className="min-w-0">
          {orders.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              Aucune commande pour le moment.
            </p>
          ) : (
            <OrdersTable orders={orders} />
          )}
        </CardContent>
      </Card>

      <DashboardTemplates />
    </div>
  )
}
