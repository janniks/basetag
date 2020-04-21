// Both require methods will use the same npm module
module.exports = () => {
  const randomRelative = require("../../../../../somewhere/deep/and/random");
  randomRelative();

  const randomAt = require("$/somewhere/deep/and/random");
  randomAt();
};
