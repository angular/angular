import {browser, element, by} from 'protractor';

describe('i18n E2E Tests', () => {
  beforeEach(() => browser.get(''));

  it('should display i18n translated welcome: Bonjour !', async () => {
    expect(await element(by.css('h1')).getText()).toEqual('Bonjour i18n !');
  });

  it('should display the node texts without elements', async () => {
    expect(await element(by.css('app-root')).getText()).toContain(`Je n'affiche aucun élément`);
  });

  it('should display the translated title attribute', async () => {
    const title = await element(by.css('img')).getAttribute('title');
    expect(title).toBe(`Logo d'Angular`);
  });

  it('should display the ICU plural expression', async () => {
    expect(await element.all(by.css('span')).get(0).getText()).toBe(`Mis à jour à l'instant`);
  });

  it('should display the ICU select expression', async () => {
    const selectIcuExp = element.all(by.css('span')).get(1);
    expect(await selectIcuExp.getText()).toBe(`L'auteur est une femme`);
    await element.all(by.css('button')).get(2).click();
    expect(await selectIcuExp.getText()).toBe(`L'auteur est un homme`);
  });

  it('should display the nested expression', async () => {
    const nestedExp = element.all(by.css('span')).get(2);
    const incBtn = element.all(by.css('button')).get(0);
    expect(await nestedExp.getText()).toBe(`Mis à jour: à l'instant`);
    await incBtn.click();
    expect(await nestedExp.getText()).toBe(`Mis à jour: il y a une minute`);
    await incBtn.click();
    await incBtn.click();
    await element.all(by.css('button')).get(4).click();
    expect(await nestedExp.getText()).toBe(`Mis à jour: il y a 3 minutes par autre`);
  });
});
