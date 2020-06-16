import { SitePage } from './app.po';
import { element, by } from 'protractor';

describe('api-list', () => {
  let page: SitePage;

  beforeEach(() => {
    page = new SitePage();
    page.navigateTo('api');
  });

  it('should find AnimationSequenceMetadata when searching by partial word anima', () => {
    const input = element(by.css('aio-api-list .form-search input'));
    input.clear();
    input.sendKeys('anima');
    expect(page.getApiSearchResults()).toContain('AnimationSequenceMetadata');
  });

  it('should find getLocaleDateTimeFormat when searching by partial word date', () => {
    const input = element(by.css('aio-api-list .form-search input'));
    input.clear();
    input.sendKeys('date');
    expect(page.getApiSearchResults()).toContain('getLocaleDateTimeFormat');
  });

  it('should find LowerCasePipe when searching for type pipe', () => {
    const select = element(by.css('aio-api-list aio-select[label="Type:"] .form-select-button'));
    select.click();
    const menuItem = element.all(by.css('aio-api-list aio-select[label="Type:"] .form-select-dropdown li')).get(8);
    menuItem.click();
    expect(page.getApiSearchResults()).toContain('LowerCasePipe');
  });

  it('should find ElementRef when searching for status Security Risk', () => {
    const select = element(by.css('aio-api-list aio-select[label="Status:"] .form-select-button'));
    select.click();
    const menuItem = element.all(by.css('aio-api-list aio-select[label="Status:"] .form-select-dropdown li')).get(3);
    menuItem.click();
    expect(page.getApiSearchResults()).toContain('ElementRef');
  });
});
