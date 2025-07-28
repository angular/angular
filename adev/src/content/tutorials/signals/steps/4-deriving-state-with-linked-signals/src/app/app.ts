import {Component, signal, computed, ChangeDetectionStrategy} from '@angular/core';

// TODO: Import linkedSignal from @angular/core

@Component({
  selector: 'app-root',
  template: `
    <div class="user-profile">
      <h1>User Dashboard</h1>
      <div class="status-indicator" [class]="userStatus()">
        <span class="status-dot" [style.background]="statusColor()"></span>
        Status: {{ userStatus() }}
      </div>

      <div class="status-info">
        <div class="availability">
          <strong>Available:</strong> 
          @if (isAvailable()) {
            Yes
          } @else {
            No
          }
        </div>
        <div class="message">
          <strong>Message:</strong> {{ statusMessage() }}
        </div>
      </div>

      <div class="preferences">
        <h3>User Preferences</h3>
        <div class="preference-item">
          <label>
            <input type="checkbox" [checked]="false" (change)="toggleNotifications()">
            Notifications: Disabled
          </label>
        </div>
        <p class="info">💡 Notice: This preference automatically syncs with your status changes!</p>
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
})
export class App {
  userStatus = signal<'online' | 'offline' | 'away'>('offline');

  isAvailable = computed(() => this.userStatus() === 'online');

  statusColor = computed(() => {
    switch (this.userStatus()) {
      case 'online':
        return '#4caf50';
      case 'away':
        return '#ff9800';
      case 'offline':
        return '#f44336';
      default:
        return '#9e9e9e';
    }
  });

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

  // TODO: Create notificationsEnabled linkedSignal that tracks if userStatus is 'online'
  // Use linkedSignal(() => this.userStatus() === 'online')

  // TODO: Create autoAwayMinutes linkedSignal that returns 15 when online, 60 otherwise
  // Use linkedSignal(() => (this.userStatus() === 'online' ? 15 : 60))

  toggleNotifications() {
    // TODO: Implement to toggle notificationsEnabled using set()
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
    this.userStatus.update((current: 'online' | 'offline' | 'away') => {
      switch (current) {
        case 'offline':
          return 'online';
        case 'online':
          return 'away';
        case 'away':
          return 'offline';
        default:
          return 'offline';
      }
    });
  }
}
