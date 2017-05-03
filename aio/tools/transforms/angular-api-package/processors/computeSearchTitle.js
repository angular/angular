module.exports = function computeSearchTitleProcessor() {
  return {
    $runAfter: ['ids-computed'],
    $runBefore: ['generateKeywordsProcessor'],
    $process(docs) {

    }
  };
};
