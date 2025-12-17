import z from "zod";


export const MovieExternalSchema = z.object({
    nameRu: z.string(),
    description: z.string(),
    year: z.number(),
    genres: z.array(
        z.object({
            genre: z.string()
        })
    )
}).transform((data) => ({
    title: data.nameRu,
    description: data.description,
    year: data.year,
    genres: data.genres.map((genre_obj) => ({title: genre_obj.genre}))
}))


export type MovieExternalDTO = z.infer<typeof MovieExternalSchema>