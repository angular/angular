import { SitePage } from './app.po';

describe('site search', () => {
  let page: SitePage;

  beforeEach(async () => {
    page = new SitePage();
    await page.navigateTo('');
  });

  it('should find pages when searching by a partial word in the title', async () => {
    await page.enterSearch('ngCont');
    expect(await page.getSearchResults()).toContain('NgControl');

    await page.enterSearch('valueaccess');
    expect(await page.getSearchResults()).toContain('ControlValueAccessor');
  });

  it('should find API docs whose instance member name matches the search query', async () => {
    await page.enterSearch('decode');
    expect(await page.getSearchResults()).toContain('HttpParameterCodec');
  });

  it('should find API docs whose static method name matches the search query', async () => {
    await page.enterSearch('compose');
    expect(await page.getSearchResults()).toContain('Validators');
  });
});
