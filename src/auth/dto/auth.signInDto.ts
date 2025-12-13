import z from "zod";


export const AuthSignInSchema = z.object({
    username: z.string().min(3, 'Username должен быть минимум 3 символа'),
    password: z.string().min(12, 'Неверный пароль')
})

export type AuthSignInDTO = z.infer<typeof AuthSignInSchema>