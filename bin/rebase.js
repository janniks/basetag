#!/usr/bin/env node

const path = require('path');
const fs = require('fs').promises;

// todo: add .gitignore patterns to ignore list
const IGNORE_LIST = ['node_modules', '.git'];

const args = new Set(process.argv);
const OPT_DRY_RUN = args.has('--dry-run');
const OPT_ALL = ['all', '--all', '-a'].some((x) => args.has(x));

// @root/walk (https://git.rootprojects.org/root/walk.js)
// Copyright 2020 AJ ONeal - Mozilla Public License Version 2.0

async function walk(pathname, walkFunc, _dirent) {
  const fs = require('fs').promises;
  const path = require('path');
  const _pass = (err) => err;
  let dirent = _dirent;

  let err;

  // special case: walk the very first file or folder
  if (!dirent) {
    let filename = path.basename(path.resolve(pathname));
    dirent = await fs.lstat(pathname).catch(_pass);
    if (dirent instanceof Error) {
      err = dirent;
    } else {
      dirent.name = filename;
    }
  }

  // run the user-supplied function and either skip, bail, or continue
  err = await walkFunc(err, pathname, dirent).catch(_pass);
  if (false === err) {
    // walkFunc can return false to skip
    return;
  }
  if (err instanceof Error) {
    // if walkFunc throws, we throw
    throw err;
  }

  // "walk does not follow symbolic links"
  // (doing so could cause infinite loops)
  if (!dirent.isDirectory()) {
    return;
  }
  let result = await fs.readdir(pathname, { withFileTypes: true }).catch(_pass);
  if (result instanceof Error) {
    // notify on directory read error
    return walkFunc(result, pathname, dirent);
  }
  for (let entity of result) {
    await walk(path.join(pathname, entity.name), walkFunc, entity);
  }
}

('use strict');

// assume that the command is run from the package root
var pkglen = process.cwd().length; // no trailing '/'

// matches requires that start with '../' (leaves child-relative requires alone)
const parentRequires = /(require\(['"])(\.\..*)(['"]\))/g;
const parentImports = /(import\s*\(?[\w\s{}]*['"])(\.\..*)(['"]\)?)/g;

// matches requires that start with './' (includes child-relative requires)
const allRequires = /(require\(['"])(\..*)(['"]\))/g;
const allImports = /(import\s*\(?[\w\s{}]*['"])(\..*)(['"]\)?)/g;

async function rootify(pathname, filename) {
  // todo: not sure if this load order is exactly correct
  const loadable = ['.js', '.cjs', '.mjs', '.json'];
  if (!loadable.includes(path.extname(filename))) {
    //console.warn("# warn: skipping non-js file '%s'", filename);
    return;
  }

  const dirname = path.dirname(pathname);
  pathname = path.resolve(pathname);

  var requiresRe;
  var importsRe;
  if (OPT_ALL) {
    requiresRe = allRequires;
    importsRe = allImports;
  } else {
    requiresRe = parentRequires;
    importsRe = parentImports;
  }

  function replaceImports(_, a, b, c) {
    // a = 'require("' OR 'import("' OR 'import "'
    // b = '../../foo.js'
    // c = '")' OR ''

    // /User/me/project/lib/foo/bar + ../foo.js
    // becomes $/lib/foo/foo.js
    const pkgPath = '$' + path.resolve(dirname + '/', b).slice(pkglen);

    const result = a + pkgPath + c;
    changes.push([b, pkgPath]);
    return result;
  }

  const originalText = await fs.readFile(pathname, 'utf8');
  const changes = [];
  const newText = originalText
    .replace(requiresRe, replaceImports)
    .replace(importsRe, replaceImports);

  if (originalText != newText) {
    console.info(`\n# ${dirname}${path.sep}${filename}`);
    changes.forEach(function ([oldPath, pkgPath]) {
      console.log(`  ${oldPath} -> ${pkgPath}`);
    });

    if (OPT_DRY_RUN) return;

    await fs.writeFile(pathname, newText);
  }
}

walk('.', async function (err, pathname, dirent) {
  if (IGNORE_LIST.includes(dirent.name)) {
    return false;
  }

  // skip child directories that have their own package.json (such as git submodules)
  const isChildDir = '.' !== pathname && dirent.isDirectory();
  if (isChildDir) {
    const submodulePkg = path.join(pathname, 'package.json');
    const isNormalDir = await fs.access(submodulePkg).catch(Boolean);
    if (!isNormalDir) {
      return false;
    }
  }
  
  if (!dirent.isFile()) {
    return;
  }

  return rootify(pathname, dirent.name).catch(function (e) {
    console.error(e);
  });
});
