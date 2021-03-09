import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
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

let themeStorage: ThemeStorage;

// Verify that FakeThemeStorage behaves like ThemeStorage would
describe('FakeThemeStorage', () => {
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


let component: ThemeToggleComponent;
let fixture: ComponentFixture<ThemeToggleComponent>;
let debugElement: DebugElement;

describe('ThemeToggleComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ThemeToggleComponent ],
      providers: [ { provide: ThemeStorage, useClass: FakeThemeStorage } ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ThemeToggleComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
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
    expect(component.getToggleLabel()).toBe(`Switch to dark mode`);
    component.toggleTheme();
    expect(component.getToggleLabel()).toBe(`Switch to light mode`);
  });
});

function getToggleButton(): HTMLButtonElement {
  return debugElement.query(By.css('button')).nativeElement;
}
