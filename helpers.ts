import * as path from "jsr:@std/path";
import { JSDOM } from "npm:jsdom";

export async function* readBookmarkFiles(directory: string) {
  const regexToRemoveSubDomain = new RegExp("//fr.");

  for await (const file of Deno.readDir(directory)) {
    const uniqueAnchorList = new Set<string>();
    const filepath = path.join(directory, file.name);

    const filecontent = await Deno.readTextFile(filepath);

    const parsedDom = new JSDOM(filecontent);
    const document = parsedDom.window.document;
    for (const anchor of document.querySelectorAll("a[href]")) {
      const href = anchor.getAttribute("href");
      const cleanedHref = href
        ? href.replace(regexToRemoveSubDomain, "//")
        : null;
      if (cleanedHref != null) {
        uniqueAnchorList.add(cleanedHref);
      }
    }

    yield uniqueAnchorList;
  }
}

const MAX_REDIRECTS = 5;

export async function fetchData(url: string, redirectCount = 0) {
  if (MAX_REDIRECTS < redirectCount) {
    throw new Error("Too many redirects");
  }

  const result = await fetch(url, { redirect: "follow" });
  if (result.redirected) {
    return await fetchData(result.url, ++redirectCount);
  }

  // if (!result.ok) {
  //   throw new Error(`Invalid URL with status ${result.status} (${result.statusText})`);
  // }

  return { result: await result.text(), url };
}
