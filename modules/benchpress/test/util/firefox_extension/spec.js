describe('firefox extension', function() {
  it ('should measure performance', function() {
    browser.sleep(3000); // wait for extension to load

    browser.driver.get('http://www.angularjs.org');

    browser.executeScript('window.startProfiler()').then(function() {
      console.log('started measuring perf');
    });

    browser.executeScript('window.forceGC()');

    // Run some commands
    element(by.model('yourName')).sendKeys('Hank');
    expect(element(by.binding('yourName')).getText()).toEqual('Hello Hank!');

    browser.executeScript('window.forceGC()');

    var script = 
        'window.stopAndRecord("' + browser.params.profileSavePath + '")';
    browser.executeScript(script).then(function() {
      console.log('stopped measuring perf');
    });

    browser.sleep(3000); // wait for it to finish
  })
});
