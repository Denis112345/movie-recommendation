import z from "zod";


export const AuthCreateSchema = z.object({
    username: z.string().min(3, 'Username должен быть минимум 3 символа'),
    email: z.email('Неверный email'),
    password: z.string().min(12, 'Пароль слишком маленький')
});

export type AuthCreateDTO = z.infer<typeof AuthCreateSchema>;