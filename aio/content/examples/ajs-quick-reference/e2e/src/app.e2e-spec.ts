import { browser, element, by } from 'protractor';

describe('AngularJS to Angular Quick Reference Tests', () => {

  beforeAll(() => browser.get(''));

  it('should display no poster images after bootstrap', async () => {
    await testImagesAreDisplayed(false);
  });

  it('should display proper movie data', async () => {
    // We check only a few samples
    const expectedSamples: any[] = [
      {row: 0, column: 0, element: 'img', attr: 'src', value: 'images/hero.png', contains: true},
      {row: 0, column: 2, value: 'Celeritas'},
      {row: 1, column: 3, matches: /Dec 1[678], 2015/}, // absorb timezone dif; we care about date format
      {row: 1, column: 5, value: '$14.95'},
      {row: 2, column: 4, value: 'PG-13'},
      {row: 2, column: 7, value: '100%'},
      {row: 2, column: 0, element: 'img', attr: 'src', value: 'images/ng-logo.png', contains: true},
    ];

    // Go through the samples
    const movieRows = getMovieRows();
    for (const sample of expectedSamples) {
      const tableCell = movieRows.get(sample.row)
        .all(by.tagName('td')).get(sample.column);
      // Check the cell or its nested element
      const elementToCheck = sample.element
        ? tableCell.element(by.tagName(sample.element))
        : tableCell;

      // Check element attribute or text
      const valueToCheck = sample.attr
        ? await elementToCheck.getAttribute(sample.attr)
        : await elementToCheck.getText();

      // Test for equals/contains/match
      if (sample.contains) {
        expect(valueToCheck).toContain(sample.value);
      } else if (sample.matches) {
        expect(valueToCheck).toMatch(sample.matches);
      } else {
        expect(valueToCheck).toEqual(sample.value);
      }
    }
  });

  it('should display images after Show Poster', async () => {
    await testPosterButtonClick('Show Poster', true);
  });

  it('should hide images after Hide Poster', async () => {
    await testPosterButtonClick('Hide Poster', false);
  });

  it('should display no movie when no favorite hero is specified', async () => {
    await testFavoriteHero(null, 'Please enter your favorite hero.');
  });

  it('should display no movie for Magneta', async () => {
    await testFavoriteHero('Magneta', 'No movie, sorry!');
  });

  it('should display a movie for Dr Nice', async () => {
    await testFavoriteHero('Dr Nice', 'Excellent choice!');
  });

  async function testImagesAreDisplayed(isDisplayed: boolean) {
    const expectedMovieCount = 3;

    const movieRows = getMovieRows();
    expect(await movieRows.count()).toBe(expectedMovieCount);
    for (let i = 0; i < expectedMovieCount; i++) {
      const movieImage = movieRows.get(i).element(by.css('td > img'));
      expect(await movieImage.isDisplayed()).toBe(isDisplayed);
    }
  }

  async function testPosterButtonClick(expectedButtonText: string, isDisplayed: boolean) {
    const posterButton = element(by.css('app-movie-list tr > th > button'));
    expect(await posterButton.getText()).toBe(expectedButtonText);

    await posterButton.click();
    await testImagesAreDisplayed(isDisplayed);
  }

  function getMovieRows() {
    return element.all(by.css('app-movie-list tbody > tr'));
  }

  async function testFavoriteHero(heroName: string, expectedLabel: string) {
    const movieListComp = element(by.tagName('app-movie-list'));
    const heroInput = movieListComp.element(by.tagName('input'));
    const favoriteHeroLabel = movieListComp.element(by.tagName('h3'));
    const resultLabel = movieListComp.element(by.css('span > p'));

    await heroInput.clear();
    await heroInput.sendKeys(heroName || '');

    expect(await resultLabel.getText()).toBe(expectedLabel);
    if (heroName) {
      expect(await favoriteHeroLabel.isDisplayed()).toBe(true);
      expect(await favoriteHeroLabel.getText()).toContain(heroName);
    } else {
      expect(await favoriteHeroLabel.isDisplayed()).toBe(false);
    }
  }
});
