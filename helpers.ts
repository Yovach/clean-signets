import * as path from "jsr:@std/path";
import { JSDOM } from "npm:jsdom";
import { encodeBase64 } from "jsr:@std/encoding/base64";
import { BookmarkDataListType } from "./schema.ts";

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

async function fetchFavicon(url: string) {
  const urlObject = new URL(url);

  // https://www.google.com/s2/favicons?domain=${domain}&sz=${size}
  const faviconUrl = new URL("https://www.google.com/s2/favicons");
  faviconUrl.searchParams.set("domain", urlObject.hostname);
  faviconUrl.searchParams.set("sz", "128");

  const result = await fetch(faviconUrl);
  const faviconBytes = await result.arrayBuffer();
  return `data:image/png;base64,${encodeBase64(faviconBytes)}`;
}

export async function fetchPage(url: string, redirectCount = 0) {
  if (MAX_REDIRECTS < redirectCount) {
    throw new Error("Too many redirects");
  }

  const urlObj = new URL(url);

  console.log(`Call ${urlObj.toString()}`);
  const result = await fetch(urlObj.toString(), {
    redirect: "follow",
    headers: {
      "Accept-Language": "fr-FR",
    },
    signal: AbortSignal.timeout(5000),
  });
  if (result.redirected) {
    // console.log(result.url)
    const newUrl = new URL(result.url);
    newUrl.hash = urlObj.hash;
    return await fetchPage(newUrl.toString(), ++redirectCount);
  }

  const [pageContent, favicon] = await Promise.all([
    result.text(),
    fetchFavicon(url),
  ]);

  // if (!result.ok) {
  //   throw new Error(`Invalid URL with status ${result.status} (${result.statusText})`);
  // }

  return { pageContent, url, favicon };
}

interface BookmarkData {
  title: string;
  description: string | undefined | null;
}

export function getTitleAndDescriptionFromPage(page: string): BookmarkData {
  const jsdom = new JSDOM(page, { pretendToBeVisual: true });
  const document = jsdom.window.document;
  return {
    title: document.title,
    description: document.querySelector('meta[name="description"]')
      ?.textContent,
  };
}

export function generateBookmarks(elements: BookmarkDataListType): string {
  const date = Math.floor(Date.now() / 1000).toString();
  const bookmarksList = elements.map((bookmark) =>
    `        <DT><A HREF="${bookmark.url}" ADD_DATE="${date}" ICON="${bookmark.favicon}">${bookmark.title}</A>`
  ).join("\n");

  return `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file.
     It will be read and overwritten.
     DO NOT EDIT! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
    <DT><H3 ADD_DATE="1743102788" LAST_MODIFIED="${date}" PERSONAL_TOOLBAR_FOLDER="true">Signets</H3>
    <DL><p>
${bookmarksList}
    </DL><p>
</DL><p>`;
}
