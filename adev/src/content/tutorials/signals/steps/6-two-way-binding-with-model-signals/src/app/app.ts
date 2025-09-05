// TODO: Import model from @angular/core
import {Component, ChangeDetectionStrategy} from '@angular/core';
import {CustomCheckbox} from './custom-checkbox';

@Component({
  selector: 'app-root',
  imports: [CustomCheckbox],
  template: `
    <div class="shopping-app">
      <h1>Custom Checkbox Example</h1>

      <div class="demo-section">
        <!-- TODO: Add two-way binding with custom checkboxes -->
        <!--
        <custom-checkbox
          [(checked)]="agreedToTerms"
          label="I agree to the terms"
        />

        <custom-checkbox
          [(checked)]="enableNotifications"
          label="Enable notifications"
        />
        -->

        <!-- TODO: Add controls to test two-way binding -->
        <div class="controls">
          <!-- TODO: Display current values -->
          <!-- TODO: Add control buttons -->
        </div>
      </div>
    </div>
  `,
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  // TODO: Add parent signal models
  // agreedToTerms = model(false);
  // enableNotifications = model(true);
  // TODO: Add methods to test two-way binding
  // toggleTermsFromParent() {
  //   this.agreedToTerms.set(!this.agreedToTerms());
  // }
  // resetAll() {
  //   this.agreedToTerms.set(false);
  //   this.enableNotifications.set(false);
  // }
}
