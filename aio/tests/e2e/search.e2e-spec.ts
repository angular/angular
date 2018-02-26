import { SitePage } from './app.po';

describe('site search', () => {
  let page;

  beforeEach(() => {
    page = new SitePage();
    page.navigateTo('');
  });

  it('should find pages when searching by a partial word in the title', () => {
    page.enterSearch('ngCont');
    expect(page.getSearchResults()).toContain('NgControl');

    page.enterSearch('accessor');
    expect(page.getSearchResults()).toContain('ControlValueAccessor');
  });

  it('should find API docs whose instance member name matches the search query', () => {
    page.enterSearch('decode');
    expect(page.getSearchResults()).toContain('HttpParameterCodec');
  });

  it('should find API docs whose static method name matches the search query', () => {
    page.enterSearch('compose');
    expect(page.getSearchResults()).toContain('Validators');
  });
});
