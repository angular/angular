
module.exports = function copyContentAssetsProcessor(copyFolder) {
  return {
    $runBefore: ['postProcessHtml'],
    assetMappings: [],
    $process() {
      this.assetMappings.forEach(map => {
        copyFolder(map.from, map.to);
      });
    }
  };
};
