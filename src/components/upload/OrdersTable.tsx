import type { Order, OrderFile } from "@prisma/client"

import {
  AdminMobileCard,
  AdminMobileField,
  AdminTableDesktop,
  AdminTableMobile,
} from "@/components/admin/admin-table-layout"
import { OrderActionsMenu } from "@/components/upload/OrderActionsMenu"
import { OrderSessionInfo } from "@/components/upload/OrderSessionInfo"
import { OrderStatusSelect } from "@/components/upload/OrderStatusSelect"
import { ViewPdfButton } from "@/components/upload/ViewPdfButton"

type OrderWithFiles = Order & { files: OrderFile[] }

function OrderActions({ order }: { order: OrderWithFiles }) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <a
        href={`/upload/${order.productHandle ?? "product"}?token=${order.token}`}
        className="text-xs text-primary underline hover:no-underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        Lien dépôt
      </a>
      <ViewPdfButton status={order.status} sessionToken={order.token} />
      <OrderActionsMenu order={order} />
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
              <th className="pb-3 text-right font-semibold">Actions</th>
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
                  <OrderStatusSelect order={order} />
                </td>
                <td className="py-3">
                  {order.files.length > 0
                    ? `${order.files.length} fichier(s)`
                    : "—"}
                </td>
                <td className="py-3 text-xs text-muted-foreground">
                  {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                </td>
                <td className="py-3 text-right">
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
              <OrderStatusSelect order={order} />
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
              <div className="flex justify-end">
                <OrderActions order={order} />
              </div>
            </AdminMobileField>
          </AdminMobileCard>
        ))}
      </AdminTableMobile>
    </>
  )
}
