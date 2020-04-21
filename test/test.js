const resolve = require("path").resolve;
const spawnSync = require("child_process").spawnSync;

const package = require("../package");

const example = resolve(__dirname, "example");

function execute(command) {
  const args = command.split(" ");
  const prog = args.shift();
  return spawnSync(prog, args, { cwd: example });
}

[
  "rm -rf node_modules *.json *.tgz",
  "npm init -y",
  "npm pack ../..",
  `npm install --save ${package.name}-${package.version}.tgz`,
  "node index.js",
].forEach((command) => {
  try {
    const result = execute(command);

    if (result.error) throw result.error;

    if (result.status != 0) {
      console.log(`stdout:\n${result.stdout}`);
      console.error(`stderr:\n${result.stderr}`);
      throw "Bad status code";
    }

    console.log(`✓ ${command}`);
  } catch (error) {
    console.log(`⨯ ${command}`);
    console.error(`${error.stack ? error.stack : error}`);
    process.exit(1);
  }
});

console.log("\nTest passed.");
