#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const pkg = require('../package.json');

// Helpers
const reset = '\x1b[0m';
const yellow = '\x1b[33m';
const blue = '\x1b[34m';

const log = (message) => console.log(`${blue}${message}${reset}`);

const modulesDir = 'node_modules';

function fileExists(path) {
  try {
    fs.accessSync(path);
    return true;
  } catch (e) {
    return false;
  }
}

// Main
log(`${pkg.name}@${pkg.version}`);

try {
  const lIndex = __dirname.lastIndexOf(path.sep + modulesDir + path.sep);
  if (lIndex === -1) {
    throw new Error('- Could not find node_modules directory in __dirname');
  }

  const base = path.resolve(__dirname.slice(0, lIndex));
  const baseLink = path.resolve(base, modulesDir, '$');

  if (fileExists(baseLink)) {
    if (base === fs.realpathSync(baseLink)) {
      log('- $ symlink already points to base\n');
      process.exit();
    }

    throw new Error(`- File already exists: ${baseLink}`);
  }

  fs.symlinkSync(base, baseLink, 'junction');

  log(`- Created $ symlink to ${base}\n`);
} catch (error) {
  console.warn(`${yellow}${error.message}\n- Not creating $ symlink${reset}\n`);
}
