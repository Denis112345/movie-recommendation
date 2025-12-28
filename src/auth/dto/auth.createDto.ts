import z from "zod";

export const usernameRulse = z.string()
            .min(3, 'минимум символа')
            .max(20, 'максимум 20 символов')
            .regex(/^[a-zA-Z0-9_-]+$/, 'Только латиница, цифры, подчеркивание и знак минуса')
            .trim();

export const AuthCreateSchema = z.object({
    username: usernameRulse,
    email: z.email('Неверный формат email').toLowerCase().trim(),
    password: z.string()
        .min(12, 'Пароль должен быть не меньше 12 символов')
        .regex(/[A-Z]/, 'Пароль должен собержать хотя бы одну заглавную букву')
        .regex(/[0-9]/, 'Пароль должен содержать хотябы одну цифру')
});

export type AuthCreateDTO = z.infer<typeof AuthCreateSchema>;