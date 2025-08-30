import {Component, signal} from '@angular/core';
import {httpResource} from '@angular/common/http';

interface User {
  name: string;
  email: string;
}

@Component({
  selector: 'app-http-resource',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class HttpUser {
  currentUserId = signal(1);

  user = httpResource<User>(
    () => `https://jsonplaceholder.typicode.com/users/${this.currentUserId()}`,
  );

  selectUser(id: number) {
    this.currentUserId.set(id);
  }
}
