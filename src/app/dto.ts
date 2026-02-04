import z from "zod";

export const createBookSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
});

export const updateBookSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
});

export const getUsersSchema = z.object({
  limit: z.string().optional(),
  offset: z.string().optional(),
});

export type CreateBookDto = z.infer<typeof createBookSchema>;
export type UpdateBookDto = z.infer<typeof updateBookSchema>;
export type GetUsersDto = z.infer<typeof getUsersSchema>;
