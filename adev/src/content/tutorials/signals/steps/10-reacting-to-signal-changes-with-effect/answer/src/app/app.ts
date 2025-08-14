import {Component, signal, computed, effect, ChangeDetectionStrategy} from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <div [class]="themeClass()">
      <h2>Theme Manager with Effects</h2>
      
      <div class="controls">
        <button (click)="toggleTheme()">
          Switch to 
          @if (theme() === 'light') {
            Dark
          } @else {
            Light
          } Theme
        </button>
        
        @if (!isLoggedIn()) {
          <button (click)="login()">Login</button>
        } @else {
          <button (click)="logout()">Logout</button>
        }
      </div>
      
      <div class="info">
        <p>Current theme: {{ theme() }}</p>
        <p>User: {{ username() }}</p>
        <p>Status: 
          @if (isLoggedIn()) {
            Logged in
          } @else {
            Logged out
          }
        </p>
      </div>
      
      <div class="demo">
        <p>Open the browser console to see the effects in action!</p>
        <p>Effects are automatically:</p>
        <ul>
          <li>Saving theme to localStorage</li>
          <li>Logging user activity changes</li>
          <li>Running a timer every 5 seconds</li>
        </ul>
      </div>
    </div>
  `,
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  theme = signal<'light' | 'dark'>('light');
  username = signal('Guest');
  isLoggedIn = signal(false);

  themeClass = computed(() => `theme-${this.theme()}`);

  constructor() {
    // Save theme to localStorage whenever it changes
    effect(() => {
      localStorage.setItem('theme', this.theme());
      console.log('Theme saved to localStorage:', this.theme());
    });

    // Log user activity changes
    effect(() => {
      const status = this.isLoggedIn() ? 'logged in' : 'logged out';
      const user = this.username();
      console.log(`User ${user} is ${status}`);
    });

    // Timer effect with cleanup
    effect((onCleanup) => {
      const interval = setInterval(() => {
        console.log('Timer tick - Current theme:', this.theme());
      }, 5000);

      // Clean up the interval when the effect is destroyed
      onCleanup(() => {
        clearInterval(interval);
        console.log('Timer cleaned up');
      });
    });
  }

  toggleTheme() {
    this.theme.set(this.theme() === 'light' ? 'dark' : 'light');
  }

  login() {
    this.username.set('John Doe');
    this.isLoggedIn.set(true);
  }

  logout() {
    this.username.set('Guest');
    this.isLoggedIn.set(false);
  }
}
