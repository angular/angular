import {__esDecorate, __runInitializers} from 'tslib';
// TODO: Import computed from @angular/core
import {Component, signal, ChangeDetectionStrategy} from '@angular/core';
let App = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-root',
      template: `
    <div class="user-profile">
      <h1>User Dashboard</h1>
      <div class="status-indicator" [class]="userStatus()">
        <span class="status-dot"></span>
        Status: {{ userStatus() }}
      </div>

      <div class="status-info">
        <div class="notifications">
          <strong>Notifications:</strong>
          <!-- TODO: Replace 'Loading...' with @if block using notificationsEnabled() -->
          Loading...
        </div>
        <div class="message">
          <strong>Message:</strong>
          <!-- TODO: Replace 'Loading...' with {{ statusMessage() }} -->
          Loading...
        </div>
        <div class="working-hours">
          <strong>Within Working Hours:</strong>
          <!-- TODO: Replace 'Loading...' with @if block using isWithinWorkingHours() -->
          Loading...
        </div>
      </div>

      <div class="status-controls">
        <button (click)="goOnline()" [disabled]="userStatus() === 'online'">
          Go Online
        </button>
        <button (click)="goAway()" [disabled]="userStatus() === 'away'">
          Set Away
        </button>
        <button (click)="goOffline()" [disabled]="userStatus() === 'offline'">
          Go Offline
        </button>
        <button (click)="toggleStatus()" class="toggle-btn">
          Cycle Status
        </button>
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
    userStatus = signal('offline');
    // TODO: Create notificationsEnabled computed signal that returns true when status is 'online'
    // TODO: Create statusMessage computed signal that returns appropriate message for each status
    // TODO: Create isWithinWorkingHours computed signal that calculates if user is within working hours
    goOnline() {
      this.userStatus.set('online');
    }
    goAway() {
      this.userStatus.set('away');
    }
    goOffline() {
      this.userStatus.set('offline');
    }
    toggleStatus() {
      const current = this.userStatus();
      switch (current) {
        case 'offline':
          this.userStatus.set('online');
          break;
        case 'online':
          this.userStatus.set('away');
          break;
        case 'away':
          this.userStatus.set('offline');
          break;
      }
    }
  };
  return (App = _classThis);
})();
export {App};
//# sourceMappingURL=app.js.map
