import {Component, signal, computed, ChangeDetectionStrategy} from '@angular/core';

// TODO: Import linkedSignal from @angular/core

@Component({
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
          <!-- TODO: Add button to toggle notifications -->
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
})
export class App {
  userStatus = signal<'online' | 'away' | 'offline'>('offline');

  // Currently using computed - read-only
  notificationsEnabled = computed(() => this.userStatus() === 'online');

  // TODO: Replace notificationsEnabled with linkedSignal using the same expression:
  // notificationsEnabled = linkedSignal(() => this.userStatus() === 'online');

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

  // TODO: Add toggleNotifications method to manually set notificationsEnabled
  // toggleNotifications() {
  //   // This works with linkedSignal but would error with computed!
  //   this.notificationsEnabled.set(!this.notificationsEnabled());
  // }

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
}
