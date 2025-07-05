import * as path from "jsr:@std/path";

import { readBookmarkFiles } from "./helpers.ts";

const directory = path.join("./input");
for await (const uniqueAnchorList of readBookmarkFiles(directory)) {
  console.log(uniqueAnchorList);
}
