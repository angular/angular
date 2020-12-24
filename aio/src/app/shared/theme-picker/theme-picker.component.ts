import {
    ChangeDetectionStrategy,
    Component,
    ViewEncapsulation,
  } from '@angular/core';
  import {DocsSiteTheme, ThemeStorageService} from './theme-storage/theme-storage.service';

@Component({
  selector: 'theme-picker',
  templateUrl: 'theme-picker.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class ThemePickerComponent {
  readonly themes: DocsSiteTheme[] = [
    {
      primary: '#1976d2',
      accent: '#e91e63',
      displayName: 'Light Theme',
      name: 'ng-io-theme',
      icon: 'light_mode'
    },
    {
      primary: '#00796b',
      accent: '#80cbc4',
      displayName: 'Night Theme',
      name: 'night-theme',
      isDark: true,
      icon: 'dark_mode'
    },
  ];

  readonly defaultTheme: DocsSiteTheme = this.themes[0];
  currentTheme: DocsSiteTheme = this.themes[0];

  constructor(private themeStorageService: ThemeStorageService) {
    const themeName = this.themeStorageService.getStoredThemeName();
    if (themeName) {
      this.selectTheme(themeName);
    }
  }

  selectTheme(themeName: string) {
    const theme = this.themes.find(currentTheme => currentTheme.name === themeName);
    this.currentTheme = theme || this.defaultTheme;
    if (this.currentTheme.name === this.defaultTheme.name) {
      document.body.classList.value = '';
    } else {
      document.body.classList.value = this.currentTheme.name;
    }
    this.themeStorageService.storeTheme(this.currentTheme);
  }
}
