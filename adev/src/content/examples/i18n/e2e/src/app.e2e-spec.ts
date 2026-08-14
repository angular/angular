import * as webdriver from 'selenium-webdriver';

describe('i18n E2E Tests', () => {
  let driver: webdriver.WebDriver;

  beforeEach(async () => {
    await driver.get('');
  });

  it('should display i18n translated welcome: Bonjour !', async () => {
    expect(await (await driver.findElement(webdriver.By.css('h1'))).getText()).toEqual(
      'Bonjour i18n !',
    );
  });

  it('should display the node texts without elements', async () => {
    expect(await (await driver.findElement(webdriver.By.css('app-root'))).getText()).toContain(
      `Je n'affiche aucun élément`,
    );
  });

  it('should display the translated title attribute', async () => {
    const title = await (await driver.findElement(webdriver.By.css('img'))).getAttribute('title');
    expect(title).toBe(`Logo d'Angular`);
  });

  it('should display the ICU plural expression', async () => {
    const spans = await driver.findElements(webdriver.By.css('span'));
    expect(await spans[0].getText()).toBe(`Mis à jour à l'instant`);
  });

  it('should display the ICU select expression', async () => {
    const spans = await driver.findElements(webdriver.By.css('span'));
    const buttons = await driver.findElements(webdriver.By.css('button'));
    expect(await spans[1].getText()).toBe(`L'auteur est une femme`);
    await buttons[2].click();
    expect(await spans[1].getText()).toBe(`L'auteur est un homme`);
  });

  it('should display the nested expression', async () => {
    const spans = await driver.findElements(webdriver.By.css('span'));
    const buttons = await driver.findElements(webdriver.By.css('button'));
    expect(await spans[2].getText()).toBe(`Mis à jour: à l'instant`);
    await buttons[0].click();
    expect(await spans[2].getText()).toBe(`Mis à jour: il y a une minute`);
    await buttons[0].click();
    await buttons[0].click();
    await buttons[4].click();
    expect(await spans[2].getText()).toBe(`Mis à jour: il y a 3 minutes par autre`);
  });
});
