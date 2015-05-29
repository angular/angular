import {verifyNoBrowserErrors} from 'angular2/src/test_lib/e2e_util';

describe('md-radio-button', function() {
  var url = 'examples/src/material/radio/index.html';

  beforeEach(() => { browser.get(url); });
  afterEach(verifyNoBrowserErrors);

  it('should check one radio button and then check another', () => {
    var standaloneRadios = element.all(by.css('[name="element"]'));
    var firstRadio = standaloneRadios.first();
    var lastRadio = standaloneRadios.last();

    firstRadio.click();
    expect(firstRadio.getAttribute('aria-checked')).toEqual('true');

    lastRadio.click();
    expect(firstRadio.getAttribute('aria-checked')).toEqual('false');
    expect(lastRadio.getAttribute('aria-checked')).toEqual('true');
  });
});
