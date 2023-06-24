const {rimrafSync} = require('rimraf');
module.exports = function cleanGeneratedFiles() {
  return {
    $runAfter: ['writing-files'],
    $runBefore: ['writeFilesProcessor'],
    $process: function() {
      rimrafSync('src/generated/{docs,*.json}', {glob: true});
    }
  };
};
