import z from "zod";


export const MovieExternalSchema = z.object({
    Title: z.string(),
    Plot: z.string(),
    Year: z.string(),
    Genre: z.string()
}).transform((data) => ({
    Title: data.Title,
    Plot: data.Plot,
    Year: data.Year,
    Genre: data.Genre.split(',').map(g => g.trim())
}))


export type MovieExternalDTO = z.infer<typeof MovieExternalSchema>