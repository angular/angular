var helper = require('./helper.js');

var EXTENSION_PATH = '../../../src/util/firefox_extension/ffperf-addon.xpi';
// Where to save profile results (parent folder must exist)
var PROFILE_SAVE_PATH = './perfProfile.json';

exports.config = {
  directConnect: true,

  specs: ['spec.js'],

  getMultiCapabilities: helper.getFirefoxProfile.bind(null, EXTENSION_PATH),

  params: {
    profileSavePath: helper.getAbsolutePath(PROFILE_SAVE_PATH)
  },

  onCleanUp: helper.onCleanUp.bind(null, PROFILE_SAVE_PATH)
};
