// TODO: Import signal from @angular/core
import {Component, ChangeDetectionStrategy} from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <div class="user-profile">
      <h1>User Dashboard</h1>
      <!-- TODO: Update class binding and display userStatus() -->
      <div class="status-indicator offline">
        <span class="status-dot"></span>
        Status: ???
      </div>

      <div class="status-controls">
        <!-- TODO: Add (click) and [disabled] bindings -->
        <button>
          Go Online
        </button>
        <button>
          Go Offline
        </button>
        <button class="toggle-btn">
          Toggle Status
        </button>
      </div>
    </div>
  `,
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  // TODO: Create a userStatus signal with type 'online' | 'offline' and the initial value of 'offline'
  // TODO: Add goOnline() method using set()
  // TODO: Add goOffline() method using set()
  // TODO: Add toggleStatus() method using update()
}
