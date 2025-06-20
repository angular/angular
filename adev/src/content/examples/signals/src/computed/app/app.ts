import {Component, signal, computed} from '@angular/core';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-user-profile',
  imports: [FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class UserProfile {
  firstName = signal('Jane');
  lastName = signal('Doe');

  fullName = computed(() => `${this.firstName()} ${this.lastName()}`);
}
