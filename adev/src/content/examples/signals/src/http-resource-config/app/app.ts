import {Component, signal} from '@angular/core';
import {httpResource} from '@angular/common/http';

interface User {
  name: string;
  email: string;
}

@Component({
  selector: 'app-http-user',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class HttpUser {
  currentUserId = signal(1);

  user = httpResource<User>(() => ({
    url: `https://jsonplaceholder.typicode.com/users/${this.currentUserId()}`,
    method: 'GET',
    headers: {'X-Example-Header': 'Angular Signals'},
    params: {'_start': '0', '_limit': '1'},
    reportProgress: true,
    withCredentials: true,
    transferCache: true,
  }));

  selectUser(id: number) {
    this.currentUserId.set(id);
  }
}
