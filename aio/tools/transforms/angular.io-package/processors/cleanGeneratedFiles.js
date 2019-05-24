const rimraf = require('rimraf');
module.exports = function cleanGeneratedFiles() {
  return {
    $runAfter: ['writing-files'],
    $runBefore: ['writeFilesProcessor'],
    $process: function() {
      rimraf.sync('src/generated/{docs,*.json}');
    }
  };
};
