// #docplaster
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Message, MessageService } from './message.service';
import { Observable, filter, map, startWith } from 'rxjs';

/** Display messages received from the MessageService */
@Component({
  standalone: true,
  selector: 'app-message',
  templateUrl: './message.component.html',
  imports: [ CommonModule ],
  styleUrls: [ './message.component.css']
})
export class MessageComponent {

  /** Observable of all messages from the MessageService */
  messages$: Observable<Message>;

  /** Observable of Error message texts */
  errors$: Observable<string>;

  /** Observable of Warning message texts */
  warnings$: Observable<string>;

  constructor(messageService: MessageService) {
    // #docregion observables
    // Observable of ALL messages
    this.messages$ = messageService.messages$;

    // Derived string observable of just the error message texts
    this.errors$ = this.messages$.pipe(
      filter(m => m.type === 'Error'),
      map(m => m.text),
      // #enddocregion observables
      startWith('none')
      // #docregion observables
    );

    // Derived string observable of just the warning message texts
    this.warnings$ = this.messages$.pipe(
      filter(m => m.type === 'Warning'),
      map(m => m.text),
      // #enddocregion observables
      startWith('none')
      // #docregion observables
    );
    // #enddocregion observables

  }

}
