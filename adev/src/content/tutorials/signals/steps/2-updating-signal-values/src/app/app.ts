import {Component, signal, ChangeDetectionStrategy} from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <div class="user-profile">
      <h1>User Dashboard</h1>
      <div class="status-indicator" [class]="userStatus()">
        <span class="status-dot"></span>
        Status: {{ userStatus() }}
      </div>

      <!-- TODO: Add status control buttons here -->
    </div>
  `,
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  userStatus = signal<'online' | 'offline' | 'away'>('offline');

  // TODO: Implement goOnline() method using set() to change status to 'online'
  goOnline() {
    // Your code here
  }

  // TODO: Implement goAway() method using set() to change status to 'away'
  goAway() {
    // Your code here
  }

  // TODO: Implement goOffline() method using set() to change status to 'offline'
  goOffline() {
    // Your code here
  }

  // TODO: Implement toggleStatus() method using update() to cycle through statuses
  // offline -> online -> away -> offline
  toggleStatus() {
    // Your code here
  }
}
