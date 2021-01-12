#!/usr/bin/env node

const resolve = require('path').resolve;
const spawnSync = require('child_process').spawnSync;

const fileExists = require('../lib/utils').fileExists;

const [, , ...args] = process.argv;

// git-style sub-commands
const command = args.shift();

// help menu
if (command === undefined) {
  console.log(`usage: basetag <command> [options]

commands:
  - link:     creates $ link in node_modules
  - rebase:   rewrites requires/imports to absolute $ syntax
  - debase:   rewrites requires/imports to relative ../.. syntax

options:
  --help/-h:  shows the commands' help menu
`);
  process.exit();
}

// execute sub-command
let result;
try {
  const path = resolve(__dirname, '..', '..', '.bin', `basetag-${command}`);
  if (fileExists(path)) {
    result = spawnSync(path, args, { shell: true });
  } else {
    result = spawnSync('npx', [`basetag-${command}`, ...args], { shell: true });
  }
} catch (e) {
  console.error(e);
}

if (result && result.stdout) console.log(`${result.stdout}`);
if (result && result.stderr) console.log(`${result.stderr}`);

process.exit(result.status || 0);
