import {Component, signal, computed} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {Child} from './child';

@Component({
  selector: 'app-parent',
  imports: [FormsModule, Child],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class Parent {
  userName = signal('Alice');
  selectedTheme = signal<'light' | 'dark'>('light');

  userObject = computed(() => ({
    name: this.userName(),
    email: `${this.userName().toLowerCase()}@example.com`,
  }));
}
