import z from "zod";

export const ExternalMovieListSchema = z.object({
    items: z.array(
        z.object({
            kinopoiskId: z.number()
        })
    )
})

export type ExternalMovieListDTO = z.infer<typeof ExternalMovieListSchema>