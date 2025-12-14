import z from "zod";
import { GenreSchema } from "./genre.dto"

export const MovieSchema = z.object(({
    title: z.string(),
    description: z.string(),
    releaseYear: z.number(),
    genres: z.array(
        GenreSchema
    )
}))

export type MovieDTO = z.infer<typeof MovieSchema>
