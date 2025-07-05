import * as path from "jsr:@std/path";

import { parse, stringify } from "superjson";
import { ulid } from "@std/ulid";

import {
fetchPage,
  generateBookmarks,
  getTitleAndDescriptionFromPage,
  readBookmarkFiles,
} from "./helpers.ts";
import { BookmarkDataListType, bookmarkElementListSchema } from "./schema.ts";

const directory = path.join("./input");

const tmpFile = path.join("tmp", "cache.tmp");
let cacheFileContent: string | null = null;
try {
  cacheFileContent = Deno.readTextFileSync(tmpFile);
} catch (e) {}

for await (const uniqueAnchorList of readBookmarkFiles(directory)) {
  let bookmarkElements: BookmarkDataListType = [];
  if (cacheFileContent !== null) {
    const parsedFileContent = bookmarkElementListSchema.safeParse(
      parse(cacheFileContent),
    );
    if (parsedFileContent.success) {
      bookmarkElements = parsedFileContent.data;
    }
  }

  for (const url of uniqueAnchorList) {
    try {
      const result = await fetchPage(url);
      if (result.url != url) {
        console.log(`${url} has been redirected to ${result.url}`);
      }

      const { title, description } = getTitleAndDescriptionFromPage(
        result.pageContent,
      );

      bookmarkElements.push({
        title,
        description,
        url: result.url,
        favicon: result.favicon,
      });

      await Deno.writeTextFile(tmpFile, stringify(bookmarkElements));
    } catch (e) {
      if (e instanceof Error) {
        console.error(`${url} is error : ${e.message}`);
        uniqueAnchorList.delete(url);
      }
    }
  }

  console.log(bookmarkElements);

  await Deno.writeTextFile(
    path.join("output", ulid() + ".html"),
    generateBookmarks(bookmarkElements),
  );
}
