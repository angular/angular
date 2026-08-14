import * as webdriver from 'selenium-webdriver';

describe('Structural Directives', () => {
  let driver: webdriver.WebDriver;

  beforeAll(async () => {
    await driver.get('');
  });

  it('first div should show hero name with *ngIf', async () => {
    const allDivs = await driver.findElements(webdriver.By.css('div'));
    expect(await allDivs[0].getText()).toEqual('Dr. Nice');
  });

  it('first li should show hero name with *ngFor', async () => {
    const allLis = await driver.findElements(webdriver.By.css('li'));
    expect(await allLis[0].getText()).toEqual('Dr. Nice');
  });

  it('ngSwitch have two <happy-hero> instances', async () => {
    const happyHeroEls = await driver.findElements(webdriver.By.css('app-happy-hero'));
    expect(happyHeroEls.length).toEqual(2);
  });

  it('should toggle *ngIf="hero" with a button', async () => {
    const buttons = await driver.findElements(webdriver.By.css('button'));
    let toggleHeroButton: webdriver.WebElement | null = null;
    for (const b of buttons) {
      if ((await b.getText()).includes('Toggle hero')) {
        toggleHeroButton = b;
        break;
      }
    }

    const paragraphs = await driver.findElements(webdriver.By.css('p'));
    let paragraph: webdriver.WebElement | null = null;
    for (const p of paragraphs) {
      if ((await p.getText()).includes('I turned the corner')) {
        paragraph = p;
        break;
      }
    }

    expect(await paragraph!.getText()).toContain('I waved');
    await toggleHeroButton!.click();
    expect(await paragraph!.getText()).not.toContain('I waved');
  });

  it('appUnless should show 3 paragraph (A)s and (B)s at the start', async () => {
    const paragraph = await driver.findElements(webdriver.By.css('p.unless'));
    expect(paragraph.length).toEqual(3);
    for (let i = 0; i < 3; i++) {
      expect(await paragraph[i].getText()).toContain('(A)');
    }
  });

  it('appUnless should show 1 paragraph (B) after toggling condition', async () => {
    const buttons = await driver.findElements(webdriver.By.css('button'));
    let toggleConditionButton: webdriver.WebElement | null = null;
    for (const b of buttons) {
      if ((await b.getText()).includes('Toggle condition')) {
        toggleConditionButton = b;
        break;
      }
    }

    await toggleConditionButton!.click();

    const paragraph = await driver.findElements(webdriver.By.css('p.unless'));
    expect(paragraph.length).toEqual(1);
    expect(await paragraph[0].getText()).toContain('(B)');
  });
});
