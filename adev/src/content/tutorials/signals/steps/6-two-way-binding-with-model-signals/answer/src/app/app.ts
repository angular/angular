import {Component, model, ChangeDetectionStrategy} from '@angular/core';
import {CustomCheckbox} from './custom-checkbox';

@Component({
  selector: 'app-root',
  imports: [CustomCheckbox],
  template: `
    <div class="shopping-app">
      <h1>Custom Checkbox Example</h1>


      <div class="demo-section">
        <!-- Two-way binding with custom components -->
        <custom-checkbox
          [(checked)]="agreedToTerms"
          label="I agree to the terms"
        />

        <custom-checkbox
          [(checked)]="enableNotifications"
          label="Enable notifications"
        />

        <!-- Controls to test two-way binding -->
        <div class="controls">
          <p>Terms agreed:
            @if (agreedToTerms()) {
              Yes
            } @else {
              No
            }
          </p>
          <p>Notifications:
            @if (enableNotifications()) {
              Enabled
            } @else {
              Disabled
            }
          </p>
          <button (click)="toggleTermsFromParent()">Toggle Terms from Parent</button>
          <button (click)="resetAll()">Reset All</button>
        </div>
      </div>
    </div>
  `,
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  // Parent signal models
  agreedToTerms = model(false);
  enableNotifications = model(true);

  // Methods to test two-way binding
  toggleTermsFromParent() {
    this.agreedToTerms.set(!this.agreedToTerms());
  }

  resetAll() {
    this.agreedToTerms.set(false);
    this.enableNotifications.set(false);
  }
}
