import {Component, signal, effect} from '@angular/core';

@Component({
  selector: 'app-settings-saver',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class SettingsSaver {
  theme = signal<'light' | 'dark'>('dark');
  storageValue = signal('');

  constructor() {
    effect(() => {
      const currentTheme = this.theme();
      console.log(`Effect ran: Theme changed to: ${currentTheme}. Saving...`);
      const val = JSON.stringify({theme: currentTheme}, null, 2);
      this.storageValue.set(val);
      localStorage.setItem('app-theme', val);
    });
  }

  toggleTheme() {
    this.theme.update((t) => (t === 'light' ? 'dark' : 'light'));
  }
}
