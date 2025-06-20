import {Component, signal, effect, untracked} from '@angular/core';

@Component({
  selector: 'app-untracked',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class Untracked {
  currentUser = signal({name: 'Alice'});
  activityCounter = signal(0);
  log = signal<string[]>([]);

  constructor() {
    effect(() => {
      const user = this.currentUser();
      const counter = untracked(this.activityCounter);
      const message = `Effect ran: User is ${user.name}. Activity count read as ${counter} (untracked).`;
      this.log.update((currentLog) => [...currentLog, message]);
    });
  }

  changeUser() {
    const newUser = this.currentUser().name === 'Alice' ? 'Bob' : 'Alice';
    this.currentUser.set({name: newUser});
  }

  incrementActivity() {
    this.activityCounter.update((c) => c + 1);
  }
}
