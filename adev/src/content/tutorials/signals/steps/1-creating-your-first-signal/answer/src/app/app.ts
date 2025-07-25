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
    </div>
  `,
  styleUrls: ['./app.css'],
})
export class App {
  userStatus = signal<'online' | 'offline' | 'away'>('offline');
}
