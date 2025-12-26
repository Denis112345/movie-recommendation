import z from "zod";


export const CreatedAuthUserSchema = z.object({
    id: z.number(),
    username: z.string(),
})

export type CreatedAuthUserDTO = z.infer<typeof CreatedAuthUserSchema>