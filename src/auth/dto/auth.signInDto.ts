import z from "zod";

export const AuthSignInSchema = z.object({
    username: z.string().trim().min(1, 'Введите логин'),
    password: z.string().min(1, 'Введите пароль')
});

export type AuthSignInDTO = z.infer<typeof AuthSignInSchema>;