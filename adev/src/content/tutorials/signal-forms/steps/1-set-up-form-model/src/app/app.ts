// TODO: Add signal to the import from @angular/core below
import {Component, ChangeDetectionStrategy} from '@angular/core';
// TODO: Import form from @angular/forms/signals

// TODO: Define LoginData interface with email, password, and rememberMe fields

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  // TODO: Create loginModel signal with LoginData type and initial values
  // TODO: Create loginForm using form() function
}
