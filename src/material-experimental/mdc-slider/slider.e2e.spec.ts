import {browser, by, element} from 'protractor';

// TODO: disabled until we implement the new MDC slider.
describe('mat-slider dummy' , () => it('', () => {}));

// tslint:disable-next-line:ban
xdescribe('mat-slider', () => {
  beforeEach(async () => await browser.get('/mdc-slider'));

  it('should show a slider', async () => {
    expect(await element(by.tagName('mat-slider')).isPresent()).toBe(true);
  });

});
