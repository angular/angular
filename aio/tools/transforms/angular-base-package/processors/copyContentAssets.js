
module.exports = function copyContentAssetsProcessor(copyFolder) {
  return {
    assetMappings: [],
    $process() {
      this.assetMappings.forEach(map => {
        copyFolder(map.from, map.to);
      });
    }
  };
};
