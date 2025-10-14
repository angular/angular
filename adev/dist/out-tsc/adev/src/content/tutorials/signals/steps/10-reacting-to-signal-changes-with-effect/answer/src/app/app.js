import {__esDecorate, __runInitializers} from 'tslib';
import {Component, signal, computed, effect, ChangeDetectionStrategy} from '@angular/core';
let App = (() => {
  let _classDecorators = [
    Component({
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
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var App = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      App = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    theme = signal('light');
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
  };
  return (App = _classThis);
})();
export {App};
//# sourceMappingURL=app.js.map
