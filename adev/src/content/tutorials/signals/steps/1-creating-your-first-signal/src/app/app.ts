import {Component, ChangeDetectionStrategy} from '@angular/core';

// TODO: Import signal from @angular/core

@Component({
  selector: 'app-root',
  template: `
    <div class="user-profile">
      <h1>User Dashboard</h1>
      <div class="status-indicator offline">
        <span class="status-dot"></span>
        Status: ???
      </div>
    </div>
  `,
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  // TODO: Create a userStatus signal with type 'online' | 'offline' | 'away' and initial value 'offline'
}
