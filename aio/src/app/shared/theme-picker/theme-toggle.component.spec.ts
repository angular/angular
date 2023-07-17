import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { By } from '@angular/platform-browser';
import { LocalStorage, NoopStorage } from '../storage.service';
import { storageKey as themeStorageKey, ThemeToggleComponent } from './theme-toggle.component';

describe('ThemeToggleComponent', () => {
  let component: ThemeToggleComponent;
  let fixture: ComponentFixture<ThemeToggleComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ ThemeToggleComponent ],
      imports: [ MatIconModule ],
      providers: [ { provide: LocalStorage, useValue: new NoopStorage() } ],
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

  it('should store the theme in `localStorage`', () => {
    const storage = TestBed.inject(LocalStorage);
    const setItemSpy = spyOn(storage, 'setItem');

    component.toggleTheme();
    expect(setItemSpy).toHaveBeenCalledWith(themeStorageKey, 'true');

    component.toggleTheme();
    expect(setItemSpy).toHaveBeenCalledWith(themeStorageKey, 'false');
  });

  it('should initialize the theme from `localStorage`', () => {
    const storage = TestBed.inject(LocalStorage);
    const getItemSpy = spyOn(storage, 'getItem').withArgs(themeStorageKey);

    getItemSpy.and.returnValue('false');
    const component1 = TestBed.createComponent(ThemeToggleComponent).componentInstance;
    expect(component1.isDark).toBe(false);

    getItemSpy.and.returnValue('true');
    const component2 = TestBed.createComponent(ThemeToggleComponent).componentInstance;
    expect(component2.isDark).toBe(true);
  });

  // Helpers
  function getToggleButton(): HTMLButtonElement {
    return fixture.debugElement.query(By.css('button')).nativeElement;
  }
});
