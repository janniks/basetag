#!/usr/bin/env node

const { resolve } = require('path');
const { spawnSync } = require('child_process');

const { fileExists } = require('../lib/utils');

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

const spawnOptions = {
  shell: true,
  stdio: 'inherit',
};

// execute sub-command
let result;
try {
  const path = resolve(__dirname, '..', '..', '.bin', `basetag-${command}`);
  if (fileExists(path)) {
    result = spawnSync(path, args, spawnOptions);
  } else {
    result = spawnSync('npx', [`basetag-${command}`, ...args], spawnOptions);
  }
} catch (e) {
  console.error(e);
}

process.exit(result.status || 0);
