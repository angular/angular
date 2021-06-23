import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LocalStorage } from 'app/shared/storage.service';
import { CookiesPopupComponent, storageKey } from './cookies-popup.component';

describe('CookiesPopupComponent', () => {
  let mockLocalStorage: MockLocalStorage;
  let fixture: ComponentFixture<CookiesPopupComponent>;

  beforeEach(() => {
    mockLocalStorage = new MockLocalStorage();

    TestBed.configureTestingModule({
      declarations: [
        CookiesPopupComponent,
      ],
      providers: [
        { provide: LocalStorage, useValue: mockLocalStorage },
      ],
    });

    fixture = TestBed.createComponent(CookiesPopupComponent);
  });

  it('should make the popup visible by default', () => {
    fixture.detectChanges();

    expect(getCookiesPopup()).not.toBeNull();
  });

  it('should include the correct content in the popup', () => {
    fixture.detectChanges();

    const popup = getCookiesPopup() as Element;
    const infoBtn = popup.querySelector<HTMLAnchorElement>('a[mat-button]:nth-child(1)');
    const okBtn = popup.querySelector<HTMLButtonElement>('button[mat-button]:nth-child(2)');

    expect(popup.textContent).toContain(
        'This site uses cookies from Google to deliver its services and to analyze traffic.');

    expect(infoBtn).toBeInstanceOf(HTMLElement);
    expect(infoBtn?.href).toBe('https://policies.google.com/technologies/cookies');
    expect(infoBtn?.textContent).toMatch(/learn more/i);

    expect(okBtn).toBeInstanceOf(HTMLElement);
    expect(okBtn?.textContent).toMatch(/ok, got it/i);
  });

  it('should hide the cookies popup if the user has already accepted cookies', () => {
    mockLocalStorage.setItem(storageKey, 'true');
    fixture = TestBed.createComponent(CookiesPopupComponent);

    fixture.detectChanges();

    expect(getCookiesPopup()).toBeNull();
  });

  describe('acceptCookies()', () => {
    it('should hide the cookies popup', () => {
      fixture.detectChanges();
      expect(getCookiesPopup()).not.toBeNull();

      fixture.componentInstance.acceptCookies();
      fixture.detectChanges();
      expect(getCookiesPopup()).toBeNull();
    });

    it('should store the user\'s confirmation', () => {
      fixture.detectChanges();
      expect(mockLocalStorage.getItem(storageKey)).toBeNull();

      fixture.componentInstance.acceptCookies();
      expect(mockLocalStorage.getItem(storageKey)).toBe('true');
    });
  });

  // Helpers
  function getCookiesPopup() {
    return (fixture.nativeElement as HTMLElement).querySelector('.cookies-popup');
  }

  class MockLocalStorage implements Pick<Storage, 'getItem' | 'setItem'> {
    private items = new Map<string, string>();

    getItem(key: string): string | null {
      return this.items.get(key) ?? null;
    }

    setItem(key: string, val: string): void {
      this.items.set(key, val);
    }
  }
});
