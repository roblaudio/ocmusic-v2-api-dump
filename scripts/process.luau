local serde = require("@lune/serde")
local fs = require("@lune/fs")
local process = require("@lune/process")

type Audio = {
	name: string,
	id: number,
}

local CONFIG_FILE = serde.decode("toml", fs.readFile(`{process.cwd}/config.toml`))
local DUMP_PATH = `{process.cwd}/dump.json`

local OLD_DUMP = serde.decode("json", fs.readFile(DUMP_PATH))
local audios: { Audio } = OLD_DUMP.audios

for k in OLD_DUMP do
	print(k)
end

local excludedNames = { "hungry4adventure", "superbombsurvival", "skythefloof", "findeverythingost", "superdoomspire" }

local newAudios = {}
for index, a in ipairs(audios) do
	local cleanName = a.name:gsub("%s", ""):lower():gsub("-", "")

	local dontKeep = false
	for _, n in excludedNames do
		if cleanName:find(n, 1, true) then
			print("BEGONE", a.name, cleanName)
			dontKeep = true
			break
		end
	end

	if not dontKeep then
		table.insert(newAudios, a)
	end
end

OLD_DUMP.audios = newAudios

fs.writeFile("./test2.json", serde.encode("json", OLD_DUMP, false))
