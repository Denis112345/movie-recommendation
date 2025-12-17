import z from "zod";


export const MovieExternalSchema = z.object({
    nameRu: z.string(),
    description: z.string(),
    year: z.number(),
    genres: z.array(
        z.object({
            genre: z.string()
        })
    ),
    ratingImdb: z.float32(),
    kinopoiskId: z.number()
}).transform((data) => ({
    title: data.nameRu,
    description: data.description,
    year: data.year,
    genres: data.genres.map((genre_obj) => ({title: genre_obj.genre})),
    ratingImdb: data.ratingImdb,
    kinopoiskId: data.kinopoiskId
}))


export type MovieExternalDTO = z.infer<typeof MovieExternalSchema>