const fs = require("fs");
const path = require("path");

const reset = "\x1b[0m";
const yellow = "\x1b[33m";
const blue = "\x1b[34m";

const logBlue = (message) => console.log(`${blue}${message}${reset}`);
const logYellow = (message) => console.log(`${yellow}${message}${reset}`);

logBlue("Creating @ symlink to base directory");
logBlue(__dirname);

try {
  const scriptPath = fs.realpathSync(__dirname);

  const lIndex = scriptPath.lastIndexOf("/node_modules/");
  if (lIndex === -1) {
    throw "010: Could not find node_modules directory in __dirname";
  }

  const base = scriptPath.slice(0, lIndex);
  const atLink = path.resolve(base, "/node_modules/@");

  fs.symlinkSync(base, atLink, "junction");
} catch (error) {
  logYellow(error.message);
}
