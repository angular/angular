// TODO: Import signal from @angular/core
import {Component, ChangeDetectionStrategy} from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <div class="user-profile">
      <h1>User Dashboard</h1>
      <div class="status-indicator offline">
        <span class="status-dot"></span>
        Status: ???
      </div>

      <!-- TODO: Add status control buttons -->
    </div>
  `,
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  // TODO: Create a userStatus signal with type 'online' | 'offline' and the initial value of 'offline'
}
