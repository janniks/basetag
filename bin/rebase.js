#!/usr/bin/env node

console.log('todo: rebase command');

// todo: add .gitignore patterns to ignore list
const IGNORE_LIST = ['node_modules', '.git'];

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

var path = require('path');
var fs = require('fs').promises;

// assume that the command is run from the package root
var pkglen = process.cwd().length; // no trailing '/'

// matches requires that start with '../' (leaves child-relative requires alone)
var parentRequires = /(require\(['"])(\.\..*)(['"]\))/g;
var parentImports = /(import\s*\(?[\w\s{}]*['"])(\.\..*)(['"]\)?)/g;
// matches requires that start with './' (includes child-relative requires)
var allRequires = /(require\(['"])(\..*)(['"]\))/g;
var allImports = /(import\s*\(?[\w\s{}]*['"])(\..*)(['"]\)?)/g;

// add flag parsing
var opts = {};
[['all', '-a', '--all']].forEach(function (flags) {
  flags.slice(1).some(function (alias) {
    if (process.argv.slice(2).includes(alias)) {
      opts[flags[0]] = true;
    }
  });
});

async function rootify(pathname, filename) {
  // TODO not sure if this load order is exactly correct
  var loadable = ['.js', '.cjs', '.mjs', '.json'];
  if (!loadable.includes(path.extname(filename))) {
    //console.warn("# warn: skipping non-js file '%s'", filename);
    return;
  }

  var dirname = path.dirname(pathname);
  pathname = path.resolve(pathname);

  var requiresRe;
  var importsRe;
  if (opts.all) {
    requiresRe = allRequires;
    importsRe = allImports;
  } else {
    requiresRe = parentRequires;
    importsRe = parentImports;
  }

  var oldTxt = await fs.readFile(pathname, 'utf8');
  var changes = [];
  var txt = oldTxt
    .replace(requiresRe, replaceImports)
    .replace(importsRe, replaceImports);

  function replaceImports(_, a, b, c) {
    //console.log(a, b, c);
    // a = 'require("' OR 'import("' OR 'import "'
    // b = '../../foo.js'
    // c = '")' OR ''

    // /User/me/project/lib/foo/bar + ../foo.js
    // becomes $/lib/foo/foo.js
    var pkgpath = '$' + path.resolve(dirname + '/', b).slice(pkglen);

    var result = a + pkgpath + c;
    changes.push([pkgpath, b]);
    return result;
  }

  if (oldTxt != txt) {
    console.info('\n# [', dirname, filename, ']');
    changes.forEach(function ([pkgpath, b]) {
      console.log('#', pkgpath, '<=', b);
    });
    await fs.writeFile(pathname, txt);
    console.info('git add', path.join(dirname, filename), ';');
  }
}

walk('.', async function (err, pathname, dirent) {
  if (IGNORE_LIST.includes(dirent.name)) {
    return false;
  }

  if (!dirent.isFile()) {
    return;
  }

  return rootify(pathname, dirent.name).catch(function (e) {
    console.error(e);
  });
});
