import * as path from "jsr:@std/path";

import { JSDOM } from "npm:jsdom";

const directory = path.join("./tmp");
console.log(directory);

const uniqueAnchorList = new Set<string>();

const regexToRemoveSubDomain = new RegExp("\/\/fr\.");

for await (const file of Deno.readDir(directory)) {
  const filepath = path.join(directory, file.name);

  const parsedDom = await JSDOM.fromFile(filepath);

  const document = parsedDom.window.document;
  for (const anchor of document.querySelectorAll("a[href]")) {
    const href = anchor.getAttribute("href");
    if (href != null) {
      const cleanedHref = href.replace(regexToRemoveSubDomain, "//");
      if (!uniqueAnchorList.has(cleanedHref)) {
        uniqueAnchorList.add(cleanedHref);
      }
    }
  }
}

console.log(uniqueAnchorList);

const signetList = [...uniqueAnchorList.values()].map((val) =>
  `<DT><A HREF="${val}" ADD_DATE="0" DESCRIPTION="Improve the quality of your codebase with encapsulation and custom React hooks." ICON="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAC5klEQVQ4jaVTS2tVVxhde++zT865Jze5T68iaZXqwEdaApHoQEWEzlQoFDq0FCIE0lrwMbANFwV/QM3MOmhHocNGaxFfILEIQUTqQFEvmJe5x9zc57lnn3P2/hwYgggOStfs+9a3FmuwPuB/4PgWOPzEUO+BtZn9Rz1zc9nvOIfYtyZeNygD/ANDtrZ7nycCFTA2nJ36gFjHqS/hfSzZTyPF7SdH8n+z8eH8bL9rbhioSxfvBUtfA2L4q817pC3GSln7sOpES/5CdwbG/Dl7Z+X+LkDxQ4WhwFiTcawz7MeR/O2Mw3YZ0MsvPi9WpC22PVto7XFtgU9L7svlaru7shjmkthYnms9GdjouvOrettCLWpoohXLlZQYjZrrWSXHsfYKBqQ9Oen7rctjv1ceA8C5A+5A0Ut/u7HgloOIDDHW6PMsWWtEgtuCLWkyPem05OAsiRL4o1dejO8fLDgzE7vHr36/45vPCrmRk9er56XFHwVKhyqiKOvZGQAdi1vmV8RsX7rPyQHEay3VP74/tzMRVPQc+UsuzVBl7K/LxzYtWwJb6x3dNFwgjDRXiZnmE7dW7/U4/EHKFbmFN93mUj3s7h0sXG02cLAeJNVA6URKPh8mOEdAJjYUASQDlcz5QWeKA0C+kPptuRnplWakMr0SXo+1pRkmpznj+SDUWgoxSoSdYWSCUr9Mxwmlwkhfmvq3O8cBsLE/Xt3shPG0JVhuQ58jVazD1VbskyEDTcQ5uj02p/nXnYpgSEmOh7Nzr68QwNYb1wqDn/N9dpJyhB0oHatEc01EDARDYK4jvEDpaPlNd9Hh8dnrz6GAd80zZYBfmK49KfbaE7ZgVqA0iAi1VqRUBG1xsJQjXMcRAybRkz9cq94HwBhAAgDuAlQG+Og//szRoWx+tR3vZoCpt2P59FW7UW8nLcG5zUG3p2/4Z46vaT76gReOlLbanp3nhm2qVNrxYi30Benm4CdqrnwX4fu3bwETWWLiqPmc9QAAAABJRU5ErkJggg==">useEncapsulation | Kyle Shevlin</A>`
).join("\n.   ");

const header = `
<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!--This is an automatically generated file.
It will be read and overwritten.
Do Not Edit! -->
<Title>Bookmarks</Title>
<H1>Bookmarks</H1>`;

const content = `
    <DL><p>${signetList}</DL><p>
    `;
Deno.writeTextFile(path.join(directory, "cleaned.html"), header + content);
