import * as path from "jsr:@std/path";

import { fetchData, readBookmarkFiles } from "./helpers.ts";

const directory = path.join("./input");
for await (const uniqueAnchorList of readBookmarkFiles(directory)) {
  for (const url of uniqueAnchorList) {
    try {
      const result = await fetchData(url);
      if (result.url != url) {
        console.log(`${url} has been redirected to ${result.url}`);
      }
    } catch (e) {
      console.error(`${url} is error : ${e.message}`);
      uniqueAnchorList.delete(url);
    }
  }
}
