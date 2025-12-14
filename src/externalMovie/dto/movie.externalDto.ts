import z from "zod";


export const MovieExternalSchema = z.object({
    original_title: z.string(),
    overview: z.string(),
    release_date: z.string(),
    genre_ids: z.array(z.number())
})

const MovieExternalPaginateSchema = z.object({
    results: z.array(MovieExternalSchema),
})


export type MovieExternalDTO = z.infer<typeof MovieExternalSchema>
export type MovieExternalPaginateDTO = z.infer<typeof MovieExternalPaginateSchema>