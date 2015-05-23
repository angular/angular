var testHelper = require('../../src/firefox_extension/lib/test_helper.js');

// Where to save profile results (parent folder must exist)
var PROFILE_SAVE_PATH = './perfProfile.json';

exports.config = {
  seleniumAddress: 'http://127.0.0.1:4444/wd/hub',

  specs: ['spec.js'],

  getMultiCapabilities: function() {
    return testHelper.getFirefoxProfileWithExtension();
  },

  params: {
    profileSavePath: testHelper.getAbsolutePath(PROFILE_SAVE_PATH)
  }
};
