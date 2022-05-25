const { join } = require('canonical-path');
const sizeOf = require('image-size');

module.exports = function getImageDimensions() {
  return (basePath, path) => sizeOf(join(basePath, path));
};
