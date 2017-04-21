
module.exports = function copyContentAssetsProcessor(copyFolder) {
  return {
    $runAfter: ['files-written'],
    assetMappings: [],
    $process() {
      this.assetMappings.forEach(map => {
        copyFolder(map.from, map.to);
      });
    }
  };
};
