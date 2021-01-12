const path = require('path');
const spawnSync = require('child_process').spawnSync;

const pkg = require('../package');

const exampleDir = path.resolve(__dirname, 'example');
console.log(exampleDir);

function execute(command) {
  const args = command.split(' ');
  const prog = args.shift();
  return spawnSync(prog, args, { cwd: exampleDir, shell: true });
}

[
  'rm -rf node_modules *.json *.tgz',
  'npm init -y',
  `npm pack ..${path.sep}..`,
  `npm install --save ${pkg.name}-${pkg.version}.tgz`,
  './node_modules/.bin/basetag link',
  'node index.js',
].forEach((command) => {
  try {
    const result = execute(command);

    if (result.error) throw result.error;

    if (result.status != 0) {
      console.log(`stdout:\n${result.stdout}`);
      console.error(`stderr:\n${result.stderr}`);
      throw 'Bad status code';
    }

    console.log(`✓ ${command}`);
  } catch (error) {
    console.log(`⨯ ${command}`);
    console.error(`${error.stack ? error.stack : error}`);
    process.exit(1);
  }
});

console.log('\nTest passed.');
