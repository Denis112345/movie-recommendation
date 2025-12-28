import z from "zod";
import { usernameRulse } from "./auth.createDto";


export const CreatedAuthUserSchema = z.object({
    id: z.number(),
    username: usernameRulse,
    email: z.email()
});

export type CreatedAuthUserDTO = z.infer<typeof CreatedAuthUserSchema>;