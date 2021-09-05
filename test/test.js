const path = require('path');
const { spawnSync } = require('child_process');

const pkg = require('../package');

const exampleDir = path.resolve(__dirname, 'example');
console.log(exampleDir);

function runShell(command) {
  return spawnSync(command, [], {
    cwd: exampleDir,
    shell: true,
    stdio: 'inherit',
  });
}

const logs = [];

function runCommand(command) {
  try {
    const result = runShell(command);

    if (result.error) throw result.error;

    if (result.status != 0) {
      throw 'Bad status code';
    }

    logs.push(`✓ ${command}`);
  } catch (error) {
    logs.push(`⨯ ${command}`);
    console.error(`${error.stack ? error.stack : error}`);
    process.exit(1);
  }
}

function runPreparation() {
  [
    'rm -rf node_modules *.json *.tgz',
    'npm init -y',
    `npm pack ..${path.sep}..`,
    `npm install --save ${pkg.name}-${pkg.version}.tgz`,
  ].forEach(runCommand);
}

// Tests

/// Run relative
runPreparation();
runCommand(`node_modules${path.sep}.bin${path.sep}basetag link`);
runCommand('node index.js');

/// Run via npx
runPreparation();
runCommand(`npx basetag link`);
runCommand(`npx basetag rebase`);
runCommand('node index.js');

/// Run via npx
runPreparation();
runCommand(`npx basetag debase`);
runCommand('node index.js');

logs.forEach(element => console.log);

// Success
console.log('\nTests passed.');
