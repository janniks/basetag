exports.fileExists = function (path) {
  try {
    fs.accessSync(path);
    return true;
  } catch (e) {
    return false;
  }
};
