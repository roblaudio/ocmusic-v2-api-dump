import { parse as parseToml } from "@std/toml";

interface DumpAudio {
  name: string;
  id: number;
}

interface Dump {
  audios: DumpAudio[];
}

interface Config {
  audios: {
    exclude: string[];
    exclude_ids: number[];
  };
}

const CONFIG_FILE = await Deno.readTextFile(`${Deno.cwd()}/config.toml`);
const DUMP_PATH = `${Deno.cwd()}/dump.json`;

const cfg: Config = parseToml(CONFIG_FILE) as never;
const dump: Dump = JSON.parse(await Deno.readTextFile(DUMP_PATH)) as never;

const excludedNamesNoWhitespace = cfg.audios.exclude.map((v) =>
  v.replaceAll(/\s+/g, ""),
);

const excludedNames = cfg.audios.exclude
  .concat(excludedNamesNoWhitespace)
  .map((v) => v.toLowerCase());

const newAudios = dump.audios
  .filter(({ name }) => {
    console.log(name.toLowerCase());
    return excludedNames.includes(name.toLowerCase());
  })
  .filter(({ name }) => {
    console.log(name.replaceAll(/\s+/g, "").toLowerCase());
    return excludedNames.includes(name.replaceAll(/\s+/g, "").toLowerCase());
  })
  .filter(({ id }) => cfg.audios.exclude_ids.includes(id));

if (newAudios === dump.audios) throw "oops";
dump.audios = newAudios;

console.log(excludedNames);

Deno.writeTextFile(`./test.json`, JSON.stringify(dump));
