const path = require('canonical-path');

exports.RUNFILES_ROOT = path.resolve(process.env.RUNFILES, 'angular');

exports.getExamplesBasePath = function(root) {
    return path.join(root, 'aio', 'content', 'examples');
}

exports.getSharedPath = function(root) {
    return path.join(root, 'aio', 'tools', 'examples', 'shared');
}
  
exports.EXAMPLE_CONFIG_FILENAME = 'example-config.json';
exports.STACKBLITZ_CONFIG_FILENAME = 'stackblitz.json';
