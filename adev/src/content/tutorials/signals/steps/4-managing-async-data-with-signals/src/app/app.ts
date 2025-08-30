// TODO: Add the resource import from @angular/core
import {Component, signal, computed, ChangeDetectionStrategy} from '@angular/core';
import {loadUser} from './user-api';

@Component({
  selector: 'app-root',
  template: `
    <div>
      <h2>User Profile Loader</h2>

      <!-- TODO: Attach the appropriate methods for each button -->
      <div>
        <button>Load User 1</button>
        <button>Load User 2</button>
        <button>Load Invalid User</button>
        <button>Reload</button>
      </div>

      <div class="status">
        <!-- TODO: Add conditional rendering for different resource states -->
        <p>Click a button to load user data</p>
      </div>
    </div>
  `,
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  // TODO: Create a signal for userId
  // TODO: Create a resource for user data
  // TODO: Create computed signals for resource states
  // TODO: Add loadUser method
  // TODO: Add reloadUser method
}
