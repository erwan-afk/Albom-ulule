import dynamic from "next/dynamic"
import { getOrders } from "@/actions/order"

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

export default async function DashboardPage(): Promise<JSX.Element> {
  const orders = await getOrders()

  return (
    <div className="container min-w-0 space-y-8 px-4 py-8 sm:px-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Gérez les commandes et les dépôts de photos.
        </p>
      </div>

      {/* Nouvelle commande */}
      <Card>
        <CardHeader>
          <CardTitle>Nouvelle commande</CardTitle>
          <CardDescription>
            Créez une commande et envoyez automatiquement le lien de dépôt au
            client.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateOrderForm />
        </CardContent>
      </Card>

      {/* Liste des commandes */}
      <Card>
        <CardHeader>
          <CardTitle>Commandes ({orders.length})</CardTitle>
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

      {/* Templates PDF */}
      <DashboardTemplates />
    </div>
  )
}
