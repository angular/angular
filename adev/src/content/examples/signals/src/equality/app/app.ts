import {Component, signal, computed, effect} from '@angular/core';
import {JsonPipe} from '@angular/common';

interface User {
  id: number;
  name: string;
}

@Component({
  selector: 'app-equality',
  imports: [JsonPipe],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class Equality {
  user = signal<User>({id: 1, name: 'Alice'});

  userLog = computed<User>(() => this.user(), {
    equal: (a, b) => a.id === b.id, // Compare by ID only
  });

  log = signal<string[]>([]);

  constructor() {
    effect(() => {
      const currentUser = this.userLog();
      this.log.update((currentLog) => [
        ...currentLog,
        `Effect ran! User changed to ${currentUser.name}`,
      ]);
    });
  }

  updateName() {
    this.user.set({id: 1, name: 'Alice Smith'});
  }

  setNewUser() {
    this.user.set({id: 2, name: 'Bob'});
  }
}
