import type { Order, OrderFile } from "@prisma/client"

import { Badge } from "@/components/ui/badge"
import {
  AdminMobileCard,
  AdminMobileField,
  AdminTableDesktop,
  AdminTableMobile,
} from "@/components/admin/admin-table-layout"
import { DeleteOrderButton } from "@/components/upload/DeleteOrderButton"
import { EditOrderDialog } from "@/components/upload/EditOrderDialog"
import { OrderSessionInfo } from "@/components/upload/OrderSessionInfo"
import { RegeneratePdfButton } from "@/components/upload/RegeneratePdfButton"
import { ReminderEmailButton } from "@/components/upload/ReminderEmailButton"
import { ResendOrderButton } from "@/components/upload/ResendOrderButton"
import { ViewPdfButton } from "@/components/upload/ViewPdfButton"

type OrderWithFiles = Order & { files: OrderFile[] }

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

function OrderActions({ order }: { order: OrderWithFiles }) {
  return (
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
      <ViewPdfButton status={order.status} sessionToken={order.token} />
      <EditOrderDialog order={order} />
      <DeleteOrderButton
        orderId={order.id}
        customerName={order.customerName}
      />
    </div>
  )
}

export function OrdersTable({ orders }: { orders: OrderWithFiles[] }) {
  return (
    <>
      <AdminTableDesktop>
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
                    <p className="font-medium">{order.customerName || "—"}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.customerEmail}
                    </p>
                    <OrderSessionInfo sessionToken={order.token} />
                  </div>
                </td>
                <td className="py-3">{order.productName || "—"}</td>
                <td className="py-3">
                  <Badge variant={statusColors[order.status] || "secondary"}>
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
                  <OrderActions order={order} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminTableDesktop>

      <AdminTableMobile>
        {orders.map((order) => (
          <AdminMobileCard key={order.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium">{order.customerName || "—"}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {order.customerEmail}
                </p>
              </div>
              <Badge
                variant={statusColors[order.status] || "secondary"}
                className="shrink-0"
              >
                {statusLabels[order.status] || order.status}
              </Badge>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <AdminMobileField label="Produit">
                {order.productName || "—"}
              </AdminMobileField>
              <AdminMobileField label="Fichiers">
                {order.files.length > 0
                  ? `${order.files.length} fichier(s)`
                  : "—"}
              </AdminMobileField>
              <AdminMobileField label="Date">
                {new Date(order.createdAt).toLocaleDateString("fr-FR")}
              </AdminMobileField>
              <AdminMobileField label="Session">
                <OrderSessionInfo sessionToken={order.token} />
              </AdminMobileField>
            </div>

            <AdminMobileField label="Actions">
              <OrderActions order={order} />
            </AdminMobileField>
          </AdminMobileCard>
        ))}
      </AdminTableMobile>
    </>
  )
}
