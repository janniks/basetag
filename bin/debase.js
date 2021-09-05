#!/usr/bin/env node

const path = require('path');
const fs = require('fs').promises;

// todo: add .gitignore patterns to ignore list
const IGNORE_LIST = ['node_modules', '.git'];

const args = new Set(process.argv);
const OPT_DRY_RUN = args.has('--dry-run');

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

// matches requires that start with '$/' (leaves child-relative requires alone)
const requiresRe = /(require\(['"])(\$.*)(['"]\))/g;
const importsRe = /(import\s*\(?[\w\s{}]*['"])($.*)(['"]\)?)/g;

async function derootify(pathname, filename) {
    // todo: not sure if this load order is exactly correct
    const loadable = ['.js', '.cjs', '.mjs', '.json'];
    if (!loadable.includes(path.extname(filename))) {
        //console.warn("# warn: skipping non-js file '%s'", filename);
        return;
    }

    const totalpathname = path.resolve(pathname);

    function replaceImports(_, a, b, c) {
        const pkgTrimmed = b.slice(2);
        const pkgSplit = pkgTrimmed.split('/');
        const pathSplit = pathname.split('/');

        let pkgPath = ''

        // take 2 off pkg to trim package name + respect 0 indexing
        for (let i = pathSplit.length - 2; i >= 0; i--) {
            if (pkgSplit[i] !== pathSplit[i]) {
                pkgPath += `..${path.sep}`
            } else {
                break;
            }
        }

        for (let i = 0; i < pkgSplit.length; i++) {
            if (pkgSplit[i] !== pathSplit[i]) {
                pkgPath += pkgSplit[i];

                if (i != pkgSplit.length - 1) {
                    pkgPath += path.sep;
                }

            } else {
                break;
            }
        }

        const result = a + pkgPath + c;
        changes.push([b, pkgPath]);
        return result;
    }

    const originalText = await fs.readFile(totalpathname, 'utf8');
    const changes = [];
    const newText = originalText
        .replace(requiresRe, replaceImports)
        .replace(importsRe, replaceImports);

    if (originalText != newText) {
        console.info(`\n# ${pathname}`);
        changes.forEach(function ([oldPath, pkgPath]) {
            console.log(`  ${oldPath} -> ${pkgPath}`);
        });

        if (OPT_DRY_RUN) return;

        await fs.writeFile(totalpathname, newText);
    }
}

walk('.', async function (err, pathname, dirent) {
    if (IGNORE_LIST.includes(dirent.name)) {
        return false;
    }

    if (!dirent.isFile()) {
        return;
    }

    return derootify(pathname, dirent.name).catch(function (e) {
        console.error(e);
    });
});