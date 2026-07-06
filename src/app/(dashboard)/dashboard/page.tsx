import dynamic from "next/dynamic"
import { getOrders } from "@/actions/order"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { CreateOrderForm } from "@/components/upload/CreateOrderForm"
import { DeleteOrderButton } from "@/components/upload/DeleteOrderButton"
import { EditOrderDialog } from "@/components/upload/EditOrderDialog"
import { RegeneratePdfButton } from "@/components/upload/RegeneratePdfButton"
import { OrderSessionInfo } from "@/components/upload/OrderSessionInfo"
import { ReminderEmailButton } from "@/components/upload/ReminderEmailButton"
import { ResendOrderButton } from "@/components/upload/ResendOrderButton"
import { ViewPdfButton } from "@/components/upload/ViewPdfButton"

const DashboardTemplates = dynamic(
  () =>
    import("@/components/admin/DashboardTemplates").then(
      (m) => m.DashboardTemplates
    ),
  { ssr: false }
)

const statusLabels: Record<string, string> = {
  PENDING: "En attente",
  LINK_SENT: "Lien envoyé",
  PHOTOS_UPLOADED: "Photos reçues",
  PRINTED: "Imprimé",
  CANCELLED: "Annulé",
}

const statusColors: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  PENDING: "secondary",
  LINK_SENT: "default",
  PHOTOS_UPLOADED: "default",
  PRINTED: "default",
  CANCELLED: "destructive",
}

export default async function DashboardPage(): Promise<JSX.Element> {
  const orders = await getOrders()

  return (
    <div className="container space-y-8 py-8">
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
        <CardContent>
          {orders.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              Aucune commande pour le moment.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-semibold">Client</th>
                    <th className="pb-3 font-semibold">Produit</th>
                    <th className="pb-3 font-semibold">Statut</th>
                    <th className="pb-3 font-semibold">Fichiers</th>
                    <th className="pb-3 font-semibold">Date</th>
                    <th className="pb-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b last:border-0">
                      <td className="py-3">
                        <div>
                          <p className="font-medium">
                            {order.customerName || "—"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {order.customerEmail}
                          </p>
                          <OrderSessionInfo sessionToken={order.token} />
                        </div>
                      </td>
                      <td className="py-3">{order.productName || "—"}</td>
                      <td className="py-3">
                        <Badge
                          variant={statusColors[order.status] || "secondary"}
                        >
                          {statusLabels[order.status] || order.status}
                        </Badge>
                      </td>
                      <td className="py-3">
                        {order.files.length > 0
                          ? `${order.files.length} fichier(s)`
                          : "—"}
                      </td>
                      <td className="py-3 text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <a
                            href={`/upload/${order.productHandle ?? "product"}?token=${order.token}`}
                            className="text-xs text-primary underline hover:no-underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Lien dépôt
                          </a>
                          <ResendOrderButton orderId={order.id} />
                          <ReminderEmailButton orderId={order.id} />
                          <RegeneratePdfButton
                            orderId={order.id}
                            fileCount={order.files.length}
                          />
                          <ViewPdfButton
                            status={order.status}
                            sessionToken={order.token}
                          />
                          <EditOrderDialog order={order} />
                          <DeleteOrderButton
                            orderId={order.id}
                            customerName={order.customerName}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Templates PDF */}
      <DashboardTemplates />
    </div>
  )
}
