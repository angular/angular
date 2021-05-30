import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ThemeStorage, ThemeToggleComponent } from './theme-toggle.component';

class FakeThemeStorage implements ThemeStorage {
  fakeStorage: string | null = null;

  getThemePreference(): string | null {
    return this.fakeStorage;
  }

  setThemePreference(isDark: boolean): void {
    this.fakeStorage = String(isDark);
  }
}

// Verify that FakeThemeStorage behaves like ThemeStorage would
describe('FakeThemeStorage', () => {
  let themeStorage: ThemeStorage;

  beforeEach(() => {
    themeStorage = new FakeThemeStorage();
  });

  it('should have null stored initially', () => {
    expect(themeStorage.getThemePreference()).toBeNull();
  });

  it('should store true as a string if isDark is true', () => {
    themeStorage.setThemePreference(true);
    expect(themeStorage.getThemePreference()).toBe('true');
  });

  it('should store false as a string if isDark is false', () => {
    themeStorage.setThemePreference(false);
    expect(themeStorage.getThemePreference()).toBe('false');
  });
});


describe('ThemeToggleComponent', () => {
  let component: ThemeToggleComponent;
  let fixture: ComponentFixture<ThemeToggleComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ ThemeToggleComponent ],
      providers: [ { provide: ThemeStorage, useClass: FakeThemeStorage } ],
    });

    fixture = TestBed.createComponent(ThemeToggleComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show toggle button', () => {
    expect(getToggleButton()).toBeDefined();
  });

  it('should toggle between light and dark mode', () => {
    expect(component.getThemeName()).toBe('light');
    getToggleButton().click();
    expect(component.getThemeName()).toBe('dark');
  });

  it('should have the correct next theme', () => {
    component.toggleTheme();
    expect(component.getThemeName()).toBe('dark');
    component.toggleTheme();
    expect(component.getThemeName()).toBe('light');
  });

  it('should have the correct aria-label', () => {
    expect(component.getToggleLabel()).toBe('Switch to dark mode');
    component.toggleTheme();
    expect(component.getToggleLabel()).toBe('Switch to light mode');
  });

  // Helpers
  function getToggleButton(): HTMLButtonElement {
    return fixture.debugElement.query(By.css('button')).nativeElement;
  }
});
