import { NextResponse } from "next/server"

import { getOrderByToken } from "@/actions/order"

export async function GET(
  _req: Request,
  { params }: { params: { token: string } }
) {
  try {
    const order = await getOrderByToken(params.token)

    if (!order) {
      return NextResponse.json(
        { error: "Commande introuvable." },
        { status: 404 }
      )
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Erreur serveur." },
      { status: 500 }
    )
  }
}
