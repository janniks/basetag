const fs = require("fs");
const path = require("path");

const reset = "\x1b[0m";
const yellow = "\x1b[33m";
const blue = "\x1b[34m";

const logBlue = (message) => console.log(`${blue}${message}${reset}`);
const logYellow = (message) => console.warn(`${yellow}${message}${reset}`);

logBlue("at-base:");

try {
  const scriptPath = fs.realpathSync(__dirname);

  logBlue(scriptPath);

  const lIndex = scriptPath.lastIndexOf("/node_modules/");
  if (lIndex === -1) {
    throw "- Could not find node_modules directory in __dirname\n- Not creating @ symlink";
  }

  const base = scriptPath.slice(0, lIndex);
  logBlue(base);

  const atLink = path.resolve(base, "node_modules/@");

  logBlue(atLink);

  if (fs.accessSync(atLink)) {
    throw "- File already exists\n- Not creating @ symlink";
  }

  fs.symlinkSync(base, atLink, "junction");

  logBlue(`- Created @ symlink to ${base}\n`);
} catch (error) {
  logYellow(error);
}
