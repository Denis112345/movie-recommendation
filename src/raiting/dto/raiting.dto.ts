import z from "zod";

export const RaitingSchema = z.object({
    user_id: z.number().int().positive(),
    movie_id: z.number().int().positive(),
    raiting: z.number().min(1).max(5)
})

export type RaitingDTO = z.infer<typeof RaitingSchema>