import { parse, stringify } from "superjson";
import { ulid } from "@std/ulid";

import {
  fetchPage,
  generateBookmarks,
  getTitleAndDescriptionFromPage,
  readBookmarkFiles,
} from "./helpers.ts";
import { BookmarkDataListType, bookmarkElementListSchema } from "./schema.ts";
import path from "node:path";
import { readFile, writeFile } from "node:fs/promises";

const directory = path.join("./input/**.html");
const tmpFile = path.join("tmp", "cache.tmp");
let cacheFileContent: string | null = null;
try {
  cacheFileContent = await readFile(tmpFile, { encoding: "utf8" });
} catch (e) {
  console.log(e);
}

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

      await writeFile(tmpFile, stringify(bookmarkElements));
    } catch (e) {
      if (e instanceof Error) {
        console.error(`${url} is error : ${e.message}`);
        uniqueAnchorList.delete(url);
      }
    }
  }

  await writeFile(
    path.join("output", ulid() + ".html"),
    generateBookmarks(bookmarkElements),
  );
}
