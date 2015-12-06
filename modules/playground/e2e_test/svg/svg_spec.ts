import {verifyNoBrowserErrors} from 'angular2/src/testing/e2e_util';

describe('SVG', function() {

  var URL = 'playground/src/svg/index.html';

  afterEach(verifyNoBrowserErrors);
  beforeEach(() => { browser.get(URL); });

  it('should display SVG component contents', function() {
    var svgText = element.all(by.css('g text')).get(0);
    expect(svgText.getText()).toEqual('Hello');
  });

});
