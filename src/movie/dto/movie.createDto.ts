import z from "zod";

export const MovieRequestCreateSchema = z.object({
    title: z.string()
            .min(2, 'Название должно быть не меньше 2-х символов')
            .max(300, 'Название должно быть не больше 300-т символов'),
})

export type MovieRequestCreateDTO = z.infer<typeof MovieRequestCreateSchema>