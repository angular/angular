import { AppPage } from './app.po';

describe('angular example application', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should display: Hello World!', async () => {
    await page.navigateTo();
    expect(await page.getParagraphText()).toEqual(`Hello world!`);
    await page.clearInput();
    await page.typeInInput('!');
    await page.waitForAngular();
    expect(await page.getParagraphText()).toEqual(`Hello !!`);
  });
});
