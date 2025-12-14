import z from "zod";
import { GenreExternalSchema } from "./genre.externalDto";

export const GenreExternalListSchema = z.object({
    genres: z.array(
        GenreExternalSchema
    )
})

export type GenreExternalListDTO = z.infer<typeof GenreExternalListSchema>