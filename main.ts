import * as path from "jsr:@std/path";

import { fetchPage, readBookmarkFiles } from "./helpers.ts";

const directory = path.join("./input");
for await (const uniqueAnchorList of readBookmarkFiles(directory)) {
  for (const url of uniqueAnchorList) {
    try {
      const result = await fetchPage(url);
      if (result.url != url) {
        console.log(`${url} has been redirected to ${result.url}`);
      }

      console.log(result.favicon)
    } catch (e) {
      if (e instanceof Error) {
        console.error(`${url} is error : ${e.message}`);
        uniqueAnchorList.delete(url);
      }
    }
  }
}
