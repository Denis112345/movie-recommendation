import z from "zod";

export const GenreSchema = z.object({
    title: z.string().min(5)
})

export type GenreDTO = z.infer<typeof GenreSchema>