import * as z from "zod"

export const ululeUrlSchema = z
  .string({
    required_error: "Indique l'URL de la campagne Ulule.",
    invalid_type_error: "L'URL doit être un texte.",
  })
  .trim()
  .min(1, "Indique l'URL de la campagne Ulule.")
  .max(2048, "L'URL est trop longue.")
  .transform((value) =>
    /^https?:\/\//i.test(value) ? value : `https://${value}`
  )
  .pipe(
    z
      .string()
      .url("URL invalide.")
      .refine((url) => url.startsWith("https://"), {
        message: "L'URL doit commencer par https://",
      })
  )

export const updateUluleUrlSchema = z.object({
  ululeUrl: ululeUrlSchema,
})

export type UpdateUluleUrlInput = z.infer<typeof updateUluleUrlSchema>
