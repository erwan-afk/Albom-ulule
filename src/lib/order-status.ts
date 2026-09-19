import type { OrderStatus } from "@prisma/client"

/** Statuts affichés dans le dashboard (3 valeurs métier). */
export type AdminOrderWorkflowStatus = "AWAITING" | "TO_PRINT" | "SHIPPED"

export const adminWorkflowLabels: Record<AdminOrderWorkflowStatus, string> = {
  AWAITING: "En attente",
  TO_PRINT: "A imprimer",
  SHIPPED: "Expédiée",
}

/** Couleurs distinctes pour le select de statut dans le tableau admin. */
export const adminWorkflowColors: Record<AdminOrderWorkflowStatus, string> = {
  AWAITING:
    "border-amber-300 bg-amber-100 text-amber-950 hover:bg-amber-100 focus:ring-amber-300",
  TO_PRINT:
    "border-sky-300 bg-sky-100 text-sky-950 hover:bg-sky-100 focus:ring-sky-300",
  SHIPPED:
    "border-emerald-300 bg-emerald-100 text-emerald-950 hover:bg-emerald-100 focus:ring-emerald-300",
}

export const adminWorkflowItemColors: Record<AdminOrderWorkflowStatus, string> =
  {
    AWAITING: "text-amber-900 focus:bg-amber-50 focus:text-amber-950",
    TO_PRINT: "text-sky-900 focus:bg-sky-50 focus:text-sky-950",
    SHIPPED: "text-emerald-900 focus:bg-emerald-50 focus:text-emerald-950",
  }

export function toAdminWorkflowStatus(
  status: OrderStatus
): AdminOrderWorkflowStatus {
  if (status === "SHIPPED") return "SHIPPED"
  if (status === "PHOTOS_UPLOADED" || status === "PRINTED") return "TO_PRINT"
  return "AWAITING"
}

export function workflowToDbStatus(
  workflow: AdminOrderWorkflowStatus,
  previous: OrderStatus
): OrderStatus {
  switch (workflow) {
    case "AWAITING":
      return previous === "LINK_SENT" ? "LINK_SENT" : "PENDING"
    case "TO_PRINT":
      return previous === "PRINTED" ? "PRINTED" : "PHOTOS_UPLOADED"
    case "SHIPPED":
      return "SHIPPED"
  }
}
