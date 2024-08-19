import {ComponentFixture, TestBed} from '@angular/core/testing';

import {STORAGE_KEY_PREFIX, TopLevelBannerComponent} from './top-level-banner.component';
import {LOCAL_STORAGE} from '../../providers';

describe('TopLevelBannerComponent', () => {
  let component: TopLevelBannerComponent;
  let fixture: ComponentFixture<TopLevelBannerComponent>;
  let mockLocalStorage: jasmine.SpyObj<Storage>;

  const EXAMPLE_TEXT = 'Click Here';
  const EXAMPLE_LINK = 'https://example.com';
  const EXAMPLE_ID = 'banner-id';

  beforeEach(async () => {
    mockLocalStorage = jasmine.createSpyObj('Storage', ['getItem', 'setItem']);

    await TestBed.configureTestingModule({
      imports: [TopLevelBannerComponent],
      providers: [{provide: LOCAL_STORAGE, useValue: mockLocalStorage}],
    }).compileComponents();

    fixture = TestBed.createComponent(TopLevelBannerComponent);
    fixture.componentRef.setInput('text', EXAMPLE_TEXT);
    fixture.componentRef.setInput('id', EXAMPLE_ID);

    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render an anchor element when link is provided', () => {
    fixture.componentRef.setInput('text', EXAMPLE_TEXT);
    fixture.componentRef.setInput('link', EXAMPLE_LINK);
    fixture.detectChanges();

    const bannerElement = fixture.nativeElement.querySelector('a.adev-top-level-banner');
    expect(bannerElement).toBeTruthy();
    expect(bannerElement.getAttribute('href')).toBe(EXAMPLE_LINK);
    expect(bannerElement.textContent).toContain(EXAMPLE_TEXT);
  });

  it('should render a div element when link is not provided', () => {
    const EXAMPLE_TEXT = 'No Link Available';

    fixture.componentRef.setInput('text', EXAMPLE_TEXT);
    fixture.detectChanges();

    const bannerElement = fixture.nativeElement.querySelector('div.adev-top-level-banner');
    expect(bannerElement).toBeTruthy();
    expect(bannerElement.textContent).toContain(EXAMPLE_TEXT);
  });

  it('should correctly render the text input', () => {
    const EXAMPLE_TEXT = 'Lorem ipsum dolor...';

    fixture.componentRef.setInput('text', EXAMPLE_TEXT);
    fixture.detectChanges();

    const bannerElement = fixture.nativeElement.querySelector('.adev-top-level-banner-cta');
    expect(bannerElement).toBeTruthy();
    expect(bannerElement.textContent).toBe(EXAMPLE_TEXT);
  });

  it('should set hasClosed to true if the banner was closed before', () => {
    mockLocalStorage.getItem.and.returnValue('true');

    component.ngOnInit();

    expect(component.hasClosed()).toBeTrue();
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith(`${STORAGE_KEY_PREFIX}${EXAMPLE_ID}`);
  });

  it('should set hasClosed to false if the banner was not closed before', () => {
    mockLocalStorage.getItem.and.returnValue('false');

    component.ngOnInit();

    expect(component.hasClosed()).toBeFalse();
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith(`${STORAGE_KEY_PREFIX}${EXAMPLE_ID}`);
  });

  it('should set hasClosed to false if accessing localStorage throws an error', () => {
    mockLocalStorage.getItem.and.throwError('Local storage error');

    component.ngOnInit();

    expect(component.hasClosed()).toBeFalse();
  });

  it('should set the banner as closed in localStorage and update hasClosed', () => {
    component.close();

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      `${STORAGE_KEY_PREFIX}${EXAMPLE_ID}`,
      'true',
    );
    expect(component.hasClosed()).toBeTrue();
  });
});
