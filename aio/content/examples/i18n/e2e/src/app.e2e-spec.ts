import { browser, element, by } from 'protractor';

describe('i18n E2E Tests', () => {

  beforeEach(function () {
    browser.get('');
  });

  it('should display i18n translated welcome: Bonjour !', function () {
    expect(element(by.css('h1')).getText()).toEqual('Bonjour i18n !');
  });

  it('should display the node texts without elements', function () {
    expect(element(by.css('app-root')).getText()).toContain(`Je n'affiche aucun élément`);
  });

  it('should display the translated title attribute', function () {
    const title = element(by.css('img')).getAttribute('title');
    expect(title).toBe(`Logo d'Angular`);
  });

  it('should display the ICU plural expression', function () {
    expect(element.all(by.css('span')).get(0).getText()).toBe(`Mis à jour à l'instant`);
  });

  it('should display the ICU select expression', function () {
    const selectIcuExp = element.all(by.css('span')).get(1);
    expect(selectIcuExp.getText()).toBe(`L'auteur est une femme`);
    element.all(by.css('button')).get(2).click();
    expect(selectIcuExp.getText()).toBe(`L'auteur est un homme`);
  });

  it('should display the nested expression', function() {
    const nestedExp = element.all(by.css('span')).get(2);
    const incBtn = element.all(by.css('button')).get(0);
    expect(nestedExp.getText()).toBe(`Mis à jour: à l'instant`);
    incBtn.click();
    expect(nestedExp.getText()).toBe(`Mis à jour: il y a une minute`);
    incBtn.click();
    incBtn.click();
    element.all(by.css('button')).get(4).click();
    expect(nestedExp.getText()).toBe(`Mis à jour: il y a 3 minutes par autre`);
  });

});
