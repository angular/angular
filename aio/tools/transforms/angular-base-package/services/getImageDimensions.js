const { join } = require('canonical-path');
const sizeOf = require('image-size');

module.exports = function getImageDimensions() {
  return (basePaths, path) => {
    let error;
    for (const basePath of basePaths) {
      try {
        return sizeOf(join(basePath, path));
      } catch (e) {
        // Fall back to next basePath if not found
        error = e;
      }
    }
    if (error) {
      throw error;
    }
  };
};
