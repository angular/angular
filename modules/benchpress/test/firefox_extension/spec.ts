/// <reference path="../../../angular2/typings/node/node.d.ts" />
/// <reference path="../../../angular2/typings/angular-protractor/angular-protractor.d.ts" />
/// <reference path="../../../angular2/typings/jasmine/jasmine.d.ts" />

var fs = require('fs');

var validateFile = function() {
  try {
    var content = fs.readFileSync(browser.params.profileSavePath, 'utf8');
    // TODO(hankduan): This check not very useful. Ideally we want to validate
    // that the file contains all the events that we are looking for. Pending
    // on data transformer.
    expect(content).toContain('forceGC');
    // Delete file
    fs.unlinkSync(browser.params.profileSavePath);
  } catch (err) {
    if (err.code === 'ENOENT') {
      // If files doesn't exist
      console.error('Error: firefox extension did not save profile JSON');
    } else {
      console.error('Error: ' + err);
    }
    throw err;
  }
};

describe('firefox extension', function() {
  it('should measure performance', function() {
    browser.sleep(3000);  // wait for extension to load

    browser.driver.get('http://www.angularjs.org');

    browser.executeScript('window.startProfiler()')
        .then(function() { console.log('started measuring perf'); });

    browser.executeScript('window.forceGC()');

    // Run some commands
    element(by.model('yourName')).sendKeys('Hank');
    expect(element(by.binding('yourName')).getText()).toEqual('Hello Hank!');

    browser.executeScript('window.forceGC()');

    var script = 'window.stopAndRecord("' + browser.params.profileSavePath + '")';
    browser.executeScript(script).then(function() { console.log('stopped measuring perf'); });

    // wait for it to finish, then validate file.
    browser.sleep(3000).then(validateFile);
  })
});
