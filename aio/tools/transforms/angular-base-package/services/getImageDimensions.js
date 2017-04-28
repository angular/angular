const { resolve } = require('canonical-path');
const sizeOf = require('image-size');

module.exports = function getImageDimensions() {
  return (basePath, path) => sizeOf(resolve(basePath, path));
};
