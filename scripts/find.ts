interface DumpAudio {
  name: string;
  id: number;
}

interface Dump {
  audios: DumpAudio[];
}

const DUMP_PATH = `${Deno.cwd()}/dump.json`;

const dump: Dump = JSON.parse(await Deno.readTextFile(DUMP_PATH)) as never;

const filterName = (name: string) => name.toLowerCase().replaceAll(/\W+/g, "");

const query = filterName(Deno.args.join("") ?? "");
const filtered = dump.audios.filter(({ name }) => filterName(name).includes(query));

console.log(`Found ${filtered.length} ${filtered.length !== 1 ? "queries" : "query"}`);
for (let i = 0; i < Math.min(filtered.length, 50); i++) {
    const { name, id } = filtered[i];
    console.log(`    ${i + 1}. ${name} (${id})`);
}
