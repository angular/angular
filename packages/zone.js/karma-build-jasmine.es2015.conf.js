
module.exports = function(config) {
  require('./karma-build-jasmine.conf.js')(config);
  for (let i = 0; i < config.files.length; i++) {
    if (config.files[i] === 'node_modules/core-js-bundle/index.js') {
      config.files.splice(i, 1);
      break;
    }
  }
  config.client.entrypoint = 'browser_es2015_entry_point';
};
