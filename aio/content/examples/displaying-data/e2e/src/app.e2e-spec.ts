import { browser, element, by } from 'protractor';

describe('Displaying Data Tests', () => {
  const title = 'Tour of Heroes';
  const defaultHero = 'Windstorm';

  beforeAll(() => {
    browser.get('');
  });

  it('should display correct title: ' + title, () => {
    expect(element(by.css('h1')).getText()).toEqual(title);
  });

  it('should have correct default hero:  ' + defaultHero, () => {
    expect(element(by.css('h2')).getText()).toContain(defaultHero);
  });

  it('should have heroes', () => {
    const heroEls = element.all(by.css('li'));
    expect(heroEls.count()).not.toBe(0, 'should have heroes');
  });

  it('should display "there are many heroes!"', () => {
    expect(element(by.css('ul ~ p')).getText()).toContain('There are many heroes!');
  });
});
