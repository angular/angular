import {__esDecorate, __runInitializers} from 'tslib';
import {Component, signal, computed, ChangeDetectionStrategy} from '@angular/core';
// TODO: Import effect from @angular/core
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
        <p>Effects will automatically:</p>
        <ul>
          <li>Save theme to localStorage</li>
          <li>Log user activity changes</li>
          <li>Run a timer every 5 seconds</li>
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
      // TODO: Create effect to save theme to localStorage
      // Use localStorage.setItem('theme', this.theme()) and console.log
      // TODO: Create effect to log user activity changes
      // Read both isLoggedIn() and username() signals and console.log the status
      // TODO: Create effect with cleanup for timer
      // Use setInterval to log every 5 seconds, and onCleanup to clear the interval
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
