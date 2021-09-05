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

function runCommand(command) {
  try {
    const result = runShell(command);

    if (result.error) throw result.error;

    if (result.status != 0) {
      throw 'Bad status code';
    }

    console.log(`✓ ${command}`);
  } catch (error) {
    console.log(`⨯ ${command}`);
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
runCommand('node index.js');

// Success
console.log('\nTests passed.');
