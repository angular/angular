import {Component, input} from '@angular/core';

export interface User {
  name: string;
  email: string;
}

@Component({
  selector: 'app-child',
  templateUrl: './child.html',
  styleUrl: './child.css',
})
export class Child {
  user = input.required<User>();
  theme = input<'light' | 'dark'>('light');
}
