import z from "zod";
import { MovieExternalSchema } from "./movie.externalDto";


export const MovieSchema =  MovieExternalSchema.transform((data) => ({
        title: data.original_title,
        description: data.overview,
        releaseYear: data.release_date,
        genre_ids: data.genre_ids,
}))

export type MovieDTO = z.infer<typeof MovieSchema>
