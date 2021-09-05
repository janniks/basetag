#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const { fileExists } = require('basetag/lib/utils');

const pkg = require('basetag/package.json');

// Config
const reset = '\x1b[0m';
const yellow = '\x1b[33m';
const blue = '\x1b[34m';

const modulesDir = 'node_modules';

// Options
const args = new Set(process.argv);
const OPT_ABSOLUTE = args.has('--absolute');
const OPT_HOOK = args.has('--hook');
const OPT_VERBOSE = args.has('--verbose');

// Paths
const basePath = process.cwd();
const modulesPath = path.resolve(basePath, modulesDir);

// Methods
const log = (message) =>
  OPT_VERBOSE && console.log(`${blue}${message}${reset}`);

const createLink = () => {
  try {
    if (!fs.existsSync(modulesPath)) {
      throw new Error(`${modulesDir} directory does not exist`);
    }

    const linkPath = path.resolve(modulesPath, '$');
    if (fileExists(linkPath)) {
      if (basePath === fs.realpathSync(linkPath)) {
        log('- $ symlink already points to base');
        return;
      }

      throw new Error(`file already exists: ${linkPath}`);
    }

    if (OPT_ABSOLUTE) {
      fs.symlinkSync(basePath, linkPath, 'junction');
    } else {
      fs.symlinkSync('..', linkPath, 'junction');
    }

    log(`- created $ symlink to ${basePath}`);
  } catch (error) {
    console.warn(
      `${yellow}- ${error.message}\n- $ symlink not created${reset}`
    );
  }
};

const copyLinkScript = (scriptName) => {
  const currentFile = path.resolve(__filename);
  const hooksPath = path.resolve(modulesPath, '.hooks');
  const scriptPath = path.resolve(hooksPath, scriptName);

  if (!fs.existsSync(hooksPath)) {
    fs.mkdirSync(hooksPath, { recursive: true });
  }

  if (fileExists(scriptPath)) {
    log(`- ${scriptName} npm hook already exists`);
    return;
  }

  fs.createReadStream(currentFile).pipe(fs.createWriteStream(scriptPath));
  fs.copyFileSync(currentFile, scriptPath);
  log(`- ${scriptName} npm hook installed`);
};

// Main
log(`${pkg.name}@${pkg.version}`);

createLink();

OPT_HOOK && copyLinkScript('postinstall');
