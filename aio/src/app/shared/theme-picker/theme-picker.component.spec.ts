import {async, TestBed} from '@angular/core/testing';
import { ThemePickerComponent } from './theme-picker.component';
import { ThemeStorageService } from './theme-storage/theme-storage.service';


describe('ThemePicker', () => {
  let themeStorageService: any;

  beforeEach(async(() => {
    themeStorageService = jasmine.createSpyObj('themeStorageService', ['getStoredThemeName', 'storeTheme']);
    TestBed.configureTestingModule({
      declarations: [ThemePickerComponent],
      providers: [ { provide: ThemeStorageService, useValue: themeStorageService } ]
    }).compileComponents();
  }));

  it('should install theme based on name', () => {
    const fixture = TestBed.createComponent(ThemePickerComponent);
    const component = fixture.componentInstance;
    const name = 'night-theme';
    component.selectTheme(name);
    expect(themeStorageService.storeTheme).toHaveBeenCalledWith(component.themes[1]);
  });
});
