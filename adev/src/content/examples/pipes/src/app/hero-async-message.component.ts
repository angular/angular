import {Component} from '@angular/core';
import {AsyncPipe} from '@angular/common';

import {Observable, interval} from 'rxjs';
import {map, startWith, take} from 'rxjs/operators';

@Component({
  selector: 'app-hero-async-message',
  template: `
    <h2>Async Messages and AsyncPipe</h2>
    <p>{{ message$ | async }}</p>
    <button type="button" (click)="resend()">Resend Messages</button>`,
  imports: [AsyncPipe],
})
export class HeroAsyncMessageComponent {
  message$: Observable<string>;

  private messages = ['You are my hero!', 'You are the best hero!', 'Will you be my hero?'];

  constructor() {
    this.message$ = this.getResendObservable();
  }

  resend() {
    this.message$ = this.getResendObservable();
  }

  private getResendObservable() {
    return interval(1000).pipe(
      map((i) => `Message #${i + 1}: ${this.messages[i]}`),
      take(this.messages.length),
      startWith('Waiting for messages...'),
    );
  }
}
