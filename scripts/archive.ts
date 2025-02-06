import { sleep } from "https://deno.land/x/sleep@v1.3.0/mod.ts"
import { format } from "node:util";
import { strictEqual } from "node:assert";
import process from "node:process";

const DID_ARCHIVE_PATH = `${Deno.cwd()}/__did_archive.txt`;

const ARCHIVE_POST_URL = "https://develop.roblox.com/v1/assets/%s/archive";
const CSRF_POST_URL = "https://auth.roblox.com/v2/logout";

const COOKIE = {
    cookie: `.ROBLOSECURITY=${process.env.rbx_cookie}`
};

console.log("NOTE: Please run `deno run process` beforehand!");

const excluded = await Deno.readTextFile(`${Deno.cwd()}/excluded.txt`).then(text => text.split("\n"));

let didArchive: string[] = [];
try {
    didArchive = await Deno.readTextFile(DID_ARCHIVE_PATH).then(text => text.split("\n"));
} catch (err) {
    if (!(err instanceof Deno.errors.NotFound)) throw err
}

console.log("Getting CSRF");

const csrfRes = await fetch(CSRF_POST_URL, {
    method: "POST",
    headers: COOKIE
});
let token = csrfRes.headers.get("x-csrf-token")!;
strictEqual(typeof token, "string");

const goThrough = excluded.filter(e => !didArchive.includes(e));
for (let i = 0; i < goThrough.length; i++) {
    const id = goThrough[i];
    const archived = await fetch(format(ARCHIVE_POST_URL, id), {
        method: "POST",
        headers: {
            ...COOKIE,
            "x-csrf-token": token
        }
    });

    if (archived.status === 429) {
        i--;
        const timeout = Number(archived.headers.get("x-ratelimit-reset")) || 25;
        console.log(`Reached timeout! Retrying in ${timeout}s`);
        await sleep(timeout + 1);
    } else if (archived.status !== 200) throw new SyntaxError(`Archive request failed:\n${archived.status}\n${archived.url}\n${await archived.text()}`);
        else {
        const newToken = archived.headers.get("x-csrf-token");
        if (typeof newToken === "string") token = newToken;

        console.log(`Archived ID: ${id} ${archived.status} ${await archived.text()}  (${i + 1}/${goThrough.length})`);
        didArchive.push(id);
        await Deno.writeTextFile(DID_ARCHIVE_PATH, didArchive.join("\n"));
        }
}
