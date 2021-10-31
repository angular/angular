import { Injectable } from '@angular/core';

export interface User {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {

  constructor() { }

  getUsers(): Promise<User[]> {
    return Promise.resolve([
      { id: 1, name: 'Maria' },
      { id: 2, name: 'Alex' },
      { id: 3, name: 'Chuntao' },
      { id: 4, name: 'Béatrice' },
      { id: 5, name: 'Sarah' },
      { id: 6, name: 'Andrés' },
      { id: 7, name: 'Abdul' },
      { id: 8, name: 'Pierre' },
      { id: 9, name: 'Jiao' },
      { id: 10, name: 'Seth' }
    ]);
  }

}
