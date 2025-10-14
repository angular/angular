import {__esDecorate, __runInitializers} from 'tslib';
import {Component, signal, computed, linkedSignal, ChangeDetectionStrategy} from '@angular/core';
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
          @if (notificationsEnabled()) {
            Enabled
          } @else {
            Disabled
          }
          <button (click)="toggleNotifications()" class="override-btn">
            @if (notificationsEnabled()) {
              Disable
            } @else {
              Enable
            }
          </button>
        </div>
        <div class="message">
          <strong>Message:</strong> {{ statusMessage() }}
        </div>
        <div class="working-hours">
          <strong>Within Working Hours:</strong> 
          @if (isWithinWorkingHours()) {
            Yes
          } @else {
            No
          }
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
    // Now using linkedSignal instead of computed - writable!
    notificationsEnabled = linkedSignal(() => this.userStatus() === 'online');
    statusMessage = computed(() => {
      const status = this.userStatus();
      switch (status) {
        case 'online':
          return 'Available for meetings and messages';
        case 'away':
          return 'Temporarily away, will respond soon';
        case 'offline':
          return 'Not available, check back later';
        default:
          return 'Status unknown';
      }
    });
    isWithinWorkingHours = computed(() => {
      const now = new Date();
      const hour = now.getHours();
      const isWeekday = now.getDay() > 0 && now.getDay() < 6;
      return isWeekday && hour >= 9 && hour < 17 && this.userStatus() !== 'offline';
    });
    toggleNotifications() {
      // This works with linkedSignal but would error with computed!
      this.notificationsEnabled.set(!this.notificationsEnabled());
    }
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
