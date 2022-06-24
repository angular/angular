import { browser, element, by } from 'protractor';

describe('Structural Directives', () => {

  beforeAll(() => browser.get(''));

  it('first div should show hero name with *ngIf', async () => {
    const allDivs = element.all(by.tagName('div'));
    expect(await allDivs.get(0).getText()).toEqual('Dr. Nice');
  });

  it('first li should show hero name with *ngFor', async () => {
    const allLis = element.all(by.tagName('li'));
    expect(await allLis.get(0).getText()).toEqual('Dr. Nice');
  });

  it('ngSwitch have two <happy-hero> instances', async () => {
    const happyHeroEls = element.all(by.tagName('app-happy-hero'));
    expect(await happyHeroEls.count()).toEqual(2);
  });

  it('should toggle *ngIf="hero" with a button', async () => {
    const toggleHeroButton = element.all(by.cssContainingText('button', 'Toggle hero')).get(0);
    const paragraph = element.all(by.cssContainingText('p', 'I turned the corner'));
    expect(await paragraph.get(0).getText()).toContain('I waved');
    await toggleHeroButton.click();
    expect(await paragraph.get(0).getText()).not.toContain('I waved');
  });

  it('appUnless should show 3 paragraph (A)s and (B)s at the start', async () => {
    const paragraph = element.all(by.css('p.unless'));
    expect(await paragraph.count()).toEqual(3);
    for (let i = 0; i < 3; i++) {
      expect(await paragraph.get(i).getText()).toContain('(A)');
    }
  });

  it('appUnless should show 1 paragraph (B) after toggling condition', async () => {
    const toggleConditionButton = element.all(by.cssContainingText('button', 'Toggle condition')).get(0);
    const paragraph = element.all(by.css('p.unless'));

    await toggleConditionButton.click();

    expect(await paragraph.count()).toEqual(1);
    expect(await paragraph.get(0).getText()).toContain('(B)');
  });
});

