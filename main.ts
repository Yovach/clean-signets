import * as path from "jsr:@std/path";

import { DOMParser } from "jsr:@b-fuze/deno-dom";

const directory = path.join("./tmp");
console.log(directory);

const domParser = new DOMParser();

const uniqueAnchorList = new Set<string>();
const anchorList = new Array<string>();

for await (const file of Deno.readDir(directory)) {
  const filepath = path.join(directory, file.name);

  const filecontent = await Deno.readTextFile(filepath);
  const parsedDom = domParser.parseFromString(filecontent, "text/html");

  for (const anchor of parsedDom.querySelectorAll("a[href]")) {
    const href = anchor.getAttribute("href");
    if (href != null) {
      uniqueAnchorList.add(href);
      anchorList.push(href);
    }
  }
}

console.log(uniqueAnchorList.size, anchorList.length);
