import { by, element } from 'protractor';
import { SitePage } from './app.po';

describe('api-list', () => {
  const apiSearchInput = element(by.css('aio-api-list .form-search input'));
  const apiStatusDropdown = element(by.css('aio-api-list aio-select[label="Status:"]'));
  const apiTypeDropdown = element(by.css('aio-api-list aio-select[label="Type:"]'));
  let page: SitePage;

  beforeEach(async () => {
    page = new SitePage();
    await page.navigateTo('api');
  });

  it('should find AnimationSequenceMetadata when searching by partial word anima', async () => {
    expect(await page.getApiSearchResults()).toContain('HttpEventType');

    await apiSearchInput.clear();
    await apiSearchInput.sendKeys('anima');

    expect(await page.getApiSearchResults()).not.toContain('HttpEventType');
    expect(await page.getApiSearchResults()).toContain('AnimationSequenceMetadata');
  });

  it('should find getLocaleDateTimeFormat when searching by partial word date', async () => {
    expect(await page.getApiSearchResults()).toContain('formatCurrency');

    await apiSearchInput.clear();
    await apiSearchInput.sendKeys('date');

    expect(await page.getApiSearchResults()).not.toContain('formatCurrency');
    expect(await page.getApiSearchResults()).toContain('getLocaleDateTimeFormat');
  });

  it('should find LowerCasePipe when searching for type pipe', async () => {
    expect(await page.getApiSearchResults()).toContain('getLocaleDateTimeFormat');

    await page.clickDropdownItem(apiTypeDropdown, 'Pipe');

    expect(await page.getApiSearchResults()).not.toContain('getLocaleDateTimeFormat');
    expect(await page.getApiSearchResults()).toContain('LowerCasePipe');
  });

  it('should find ElementRef when searching for status Security Risk', async () => {
    expect(await page.getApiSearchResults()).toContain('getLocaleDateTimeFormat');

    await page.clickDropdownItem(apiStatusDropdown, 'Security Risk');

    expect(await page.getApiSearchResults()).not.toContain('getLocaleDateTimeFormat');
    expect(await page.getApiSearchResults()).toContain('ElementRef');
  });
});
