import { by, element } from 'protractor';
import { SitePage } from './app.po';

describe('api-list', () => {
  const apiSearchInput = element(by.css('aio-api-list .form-search input'));
  const apiStatusDropdown = element(by.css('aio-api-list aio-select[label="Status:"]'));
  const apiTypeDropdown = element(by.css('aio-api-list aio-select[label="Type:"]'));
  let page: SitePage;

  beforeEach(() => {
    page = new SitePage();
    page.navigateTo('api');
  });

  it('should find AnimationSequenceMetadata when searching by partial word anima', () => {
    expect(page.getApiSearchResults()).toContain('HttpEventType');

    apiSearchInput.clear();
    apiSearchInput.sendKeys('anima');

    expect(page.getApiSearchResults()).not.toContain('HttpEventType');
    expect(page.getApiSearchResults()).toContain('AnimationSequenceMetadata');
  });

  it('should find getLocaleDateTimeFormat when searching by partial word date', () => {
    expect(page.getApiSearchResults()).toContain('formatCurrency');

    apiSearchInput.clear();
    apiSearchInput.sendKeys('date');

    expect(page.getApiSearchResults()).not.toContain('formatCurrency');
    expect(page.getApiSearchResults()).toContain('getLocaleDateTimeFormat');
  });

  it('should find LowerCasePipe when searching for type pipe', () => {
    expect(page.getApiSearchResults()).toContain('getLocaleDateTimeFormat');

    page.clickDropdownItem(apiTypeDropdown, 'Pipe');

    expect(page.getApiSearchResults()).not.toContain('getLocaleDateTimeFormat');
    expect(page.getApiSearchResults()).toContain('LowerCasePipe');
  });

  it('should find ElementRef when searching for status Security Risk', () => {
    expect(page.getApiSearchResults()).toContain('getLocaleDateTimeFormat');

    page.clickDropdownItem(apiStatusDropdown, 'Security Risk');

    expect(page.getApiSearchResults()).not.toContain('getLocaleDateTimeFormat');
    expect(page.getApiSearchResults()).toContain('ElementRef');
  });
});
