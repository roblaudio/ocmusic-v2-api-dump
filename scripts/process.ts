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

const newAudios = dump.audios.filter(({ name, id }) => {
  if (cfg.audios.exclude_ids.includes(id)) return false;
  for (const e of excludedNames) {
    const i = e.indexOf(name);
    if (i > -1) console.log(i, name);
    if (name.toLowerCase().includes(e)) {
      console.log(`BEGONE ${name}`);
      return false;
    }
    if (name.toLowerCase().replaceAll(/\s+/g, "").includes(e)) {
      console.log(`BEGONE ${name}`);
      return false;
    }
  }

  return true;
});

if (newAudios === dump.audios) throw "oops";
dump.audios = newAudios;

Deno.writeTextFile(`./wow.json`, JSON.stringify(dump));
