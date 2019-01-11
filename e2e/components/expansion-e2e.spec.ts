import {browser, by, element} from 'protractor';

describe('expansion', () => {

  beforeEach(async () => await browser.get('/expansion'));

  it('should show an accordion', async () => {
    expect(await element(by.css('.mat-accordion'))).toBeDefined();
  });

  it('should show two panels', async () => {
    expect(await element.all(by.css('.mat-expansion-panel')).count()).toBe(2);
  });

  it('should hide contents of the expansion panel on click', async () => {
    const panelHeader = element.all(by.css('.mat-expansion-panel-header')).get(0);
    const panelContent = element.all(by.css('.mat-expansion-panel-content')).get(0);

    expect(await panelContent.isDisplayed()).toBe(false);

    await panelHeader.click();

    expect(await panelContent.isDisplayed()).toBe(true);
  });

  it('should emit events for expanding and collapsing', async () => {
    const panelHeader = element.all(by.css('.mat-expansion-panel-header')).get(1);
    const panelDescription = element
      .all(by.css('.mat-expansion-panel-header mat-panel-description')).get(1);

    await panelHeader.click();

    expect(await panelDescription.getText()).toContain('Currently I am open');

    await panelHeader.click();

    expect(await panelDescription.getText()).toContain('Currently I am closed');
  });

});

