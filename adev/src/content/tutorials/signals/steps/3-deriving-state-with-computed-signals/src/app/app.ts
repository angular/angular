// TODO: Import computed from @angular/core
import {Component, signal} from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <div class="user-profile">
      <h1>User Dashboard</h1>
      <div class="status-indicator {{ userStatus() }}">
        <span class="status-dot"></span>
        Status: {{ userStatus() }}
      </div>

      <div class="status-info">
        <div class="availability">
          <strong>Available:</strong> Loading...
        </div>
        <div class="message">
          <strong>Message:</strong> Loading...
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
  styleUrls: ['./app.css'],
})
export class App {
  userStatus = signal<'online' | 'away' | 'offline'>('offline');

  // TODO: Create isAvailable computed signal that returns true when status is 'online'

  // TODO: Create statusColor computed signal that returns:
  // '#4caf50' for 'online', '#ff9800' for 'away', '#f44336' for 'offline'

  // TODO: Create statusMessage computed signal that returns appropriate message for each status

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
