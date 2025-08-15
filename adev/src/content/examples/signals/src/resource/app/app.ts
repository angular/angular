import {Component, signal, resource} from '@angular/core';

interface UserModel {
  name: string;
  email: string;
}

@Component({
  selector: 'app-user',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class User {
  userId = signal(1);

  userResource = resource({
    params: () => this.userId(),
    loader: async ({params}) => {
      const res = await fetch(`https://jsonplaceholder.typicode.com/users/${params}`);
      if (!res.ok) {
        throw new Error(`User not found (status ${res.status})`);
      }
      return (await res.json()) as UserModel;
    },
  });

  selectUser(id: number) {
    this.userId.set(id);
  }
}
