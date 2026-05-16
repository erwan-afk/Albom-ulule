/**
 * Sets the PDF URL metafield on a Shopify order via Admin API.
 */

function getDomain(): string {
  return (process.env.SHOPIFY_STORE_DOMAIN ?? "").replace(/https?:\/\//, "")
}

function getAccessToken(): string {
  return process.env.SHOPIFY_ADMIN_API_TOKEN ?? ""
}

export async function setOrderPdfUrl(
  orderGid: string,
  pdfUrl: string,
): Promise<void> {
  const domain = getDomain()
  const token = getAccessToken()

  if (!domain || !token) {
    console.warn("[shopify] setOrderPdfUrl: Shopify not configured, skipping metafield")
    return
  }

  // Extract the numeric ID from the GID (e.g., "gid://shopify/Order/123456")
  const idMatch = orderGid.match(/(\d+)$/)
  const orderId = idMatch ? idMatch[1] : orderGid

  const query = `
    mutation SetOrderMetafield($input: OrderInput!) {
      orderUpdate(input: $input) {
        order {
          id
        }
        userErrors {
          field
          message
        }
      }
    }
  `

  const variables = {
    input: {
      id: `gid://shopify/Order/${orderId}`,
      metafields: [
        {
          namespace: "custom",
          key: "pdf_url",
          value: pdfUrl,
          type: "single_line_text_field",
        },
      ],
    },
  }

  const res = await fetch(
    `https://${domain}/admin/api/2024-04/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": token,
      },
      body: JSON.stringify({ query, variables }),
    },
  )

  const body = await res.json()
  if (body.errors) {
    throw new Error(
      `Shopify API error: ${body.errors[0]?.message ?? JSON.stringify(body.errors)}`,
    )
  }

  const userErrors = body.data?.orderUpdate?.userErrors
  if (userErrors && userErrors.length > 0) {
    console.warn(
      `[shopify] Metafield userErrors: ${JSON.stringify(userErrors)}`,
    )
  }
}
