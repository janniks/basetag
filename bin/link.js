#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const fileExists = require('../lib/utils').fileExists;

const pkg = require('../package.json');

// Helpers
const reset = '\x1b[0m';
const yellow = '\x1b[33m';
const blue = '\x1b[34m';

const log = (message) => console.log(`${blue}${message}${reset}`);

const modulesDir = 'node_modules';

// Main
log(`${pkg.name}@${pkg.version}`);

try {
  // todo: change __dirname to process.cwd() to allow usage with npx
  const lIndex = __dirname.lastIndexOf(path.sep + modulesDir + path.sep);
  if (lIndex === -1) {
    throw new Error(`- Could not find ${modulesDir} directory in __dirname`);
  }

  const base = path.resolve(__dirname.slice(0, lIndex));
  const baseLink = path.resolve(base, modulesDir, '$');

  if (fileExists(baseLink)) {
    if (base === fs.realpathSync(baseLink)) {
      log('- $ symlink already points to base');
      process.exit();
    }

    throw new Error(`- File already exists: ${baseLink}`);
  }

  fs.symlinkSync(base, baseLink, 'junction');

  log(`- Created $ symlink to ${base}`);
} catch (error) {
  console.warn(`${yellow}${error.message}\n- Not creating $ symlink${reset}`);
}

// todo: add this file to node_modules/.hooks/postinstall to persist
