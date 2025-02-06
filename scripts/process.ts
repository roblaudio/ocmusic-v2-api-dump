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
const ORIGINAL_PATH = `${Deno.cwd()}/original-archive.json`;
const DUMP_PATH = `${Deno.cwd()}/dump.json`;
const EXCLUDED_PATH = `${Deno.cwd()}/excluded.txt`;

const cfg: Config = parseToml(CONFIG_FILE) as never;
const dump: Dump = JSON.parse(await Deno.readTextFile(ORIGINAL_PATH)) as never;

const filterName = (name: string) => name.toLowerCase().replaceAll(/\W+/g, "");

const excludedNames = cfg.audios.exclude.map(filterName);
const excludedIds = cfg.audios.exclude_ids;
const excluded: number[] = [];

const newAudios = dump.audios.filter(({ name, id }) => {
  if (excludedIds.includes(id)) {
    excluded.push(id);
    return false;
  }

  const filteredName = filterName(name);
  for (const e of excludedNames) {
    if (filteredName.includes(e)) {
      console.log(`BEGONE ${name} (rule: "${e}") — ${id}`);
      excluded.push(id);
      return false;
    }
  }

  return true;
});

if (newAudios.length === dump.audios.length) throw "all done 🎉";
dump.audios = newAudios;

console.log(`Excluded ${excluded.length} audio(s)`);

Deno.writeTextFile(DUMP_PATH, JSON.stringify(dump));
Deno.writeTextFile(EXCLUDED_PATH, excluded.join("\n"));
