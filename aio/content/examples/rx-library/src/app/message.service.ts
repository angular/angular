import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

/** The interface for values emitted by the Message Service */
export interface Message {
  type: 'Warning' | 'Error';
  text: string;
}

@Injectable({providedIn: 'root'})
export class MessageService {
  // Tip: never expose the Subject itself.
  private messageSubject = new Subject<Message>();

  /** Observable of all messages */
  messages$ = this.messageSubject.asObservable();

  /** Add an error message to the Subject */
  addError(text: string) {
    this.messageSubject.next({ type: 'Error', text });
  }

  /** Add a warning message to the Subject */
  addWarning(text: string) {
    this.messageSubject.next({ type: 'Warning', text });
  }
}
