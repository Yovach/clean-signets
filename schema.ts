import * as z from "zod/v4";

export const bookmarkElementSchema = z.object({
  title: z.string(),
  description: z.string().nullish(),
  url: z.url(),
  favicon: z.base64url(),
});

export const bookmarkElementListSchema = z.array(bookmarkElementSchema);

export type BookmarkDataType = z.infer<typeof bookmarkElementSchema>;
export type BookmarkDataListType = z.infer<typeof bookmarkElementListSchema>;
