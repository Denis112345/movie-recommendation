import z from "zod";

export const GenreExternalSchema = z.object({
    id: z.number(),
    name: z.string()
})

export type GenreExternalDTO = z.infer<typeof GenreExternalSchema>