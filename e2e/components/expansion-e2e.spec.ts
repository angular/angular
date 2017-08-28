import {browser, by, element} from 'protractor';
import {screenshot} from '../screenshot';

describe('expansion', () => {

  beforeEach(() => browser.get('/expansion'));

  it('should show a expansion panel', async () => {
    expect(element(by.css('.mat-expansion-panel'))).toBeDefined();

    screenshot();
  });

  it('should hide contents of the expansion panel on click', async () => {
    const panelHeader = element(by.css('.mat-expansion-panel-header'));
    const panelContent = element(by.css('.mat-expansion-panel-content'));

    expect(panelContent.isDisplayed()).toBe(false);

    panelHeader.click();

    expect(panelContent.isDisplayed()).toBe(true);
  });

});
