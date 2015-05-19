var q = require('q');
var FirefoxProfile = require('firefox-profile');
var pathUtil = require('path');
var fs = require('fs');

exports.getFirefoxProfile = function(extensionPath) {
  var deferred = q.defer();

  var firefoxProfile = new FirefoxProfile();
  firefoxProfile.addExtensions([extensionPath], function() {
    firefoxProfile.encoded(function(encodedProfile) {
      var multiCapabilities = [{
        browserName: 'firefox',
        firefox_profile : encodedProfile
      }];
      deferred.resolve(multiCapabilities);
    });
  });

  return deferred.promise;
};

exports.getAbsolutePath = function(path) {
  var normalizedPath = pathUtil.normalize(path);
  if (pathUtil.resolve(normalizedPath) == normalizedPath) {
    // Already absolute path
    return normalizedPath;
  } else {
    return pathUtil.join(__dirname, normalizedPath);
  }
};

exports.onCleanUp = function(profileSavePath, exitCode) {
  if (exitCode) {
    return exitCode;
  }
  try {
    fs.unlinkSync(profileSavePath);
    return 0;
  } catch (err) {
    if (err.code === 'ENOENT') {
      // If files doesn't exist
      console.error('Error: firefox extension did not save profile JSON');
    } else {
      console.error('Error: ' + err);
    }
    return 1;
  }
}
