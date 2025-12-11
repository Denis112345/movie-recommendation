import z from "zod";


export const UserCreateSchema = z.object({
    username: z.string().min(3, 'Username должен быть минимум 3 символа'),
    email: z.email('Неверный email'),
    password: z.string().min(12, 'Пароль слишком маленький')
})

export type UserCreateDTO = z.infer<typeof UserCreateSchema>