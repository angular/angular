import { browser, element, by } from 'protractor';

describe('Displaying Data Tests', () => {
  let _title = 'Tour of Heroes';
  let _defaultHero = 'Windstorm';

  beforeAll(() => {
    browser.get('');
  });

  it('should display correct title: ' + _title, () => {
    expect(element(by.css('h1')).getText()).toEqual(_title);
  });

  it('should have correct default hero:  ' + _defaultHero, () => {
    expect(element(by.css('h2')).getText()).toContain(_defaultHero);
  });

  it('should have heroes', () => {
    let heroEls = element.all(by.css('li'));
    expect(heroEls.count()).not.toBe(0, 'should have heroes');
  });

  it('should display "there are many heroes!"', () => {
    expect(element(by.css('ul ~ p')).getText()).toContain('There are many heroes!');
  });
});
