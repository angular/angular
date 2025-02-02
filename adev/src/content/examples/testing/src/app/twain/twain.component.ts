// #docregion
import {Component, inject, OnInit, signal} from '@angular/core';
import {AsyncPipe} from '@angular/common';
import {sharedImports} from '../shared/shared';

import {Observable, of} from 'rxjs';
import {catchError, startWith} from 'rxjs/operators';

import {TwainService} from './twain.service';

@Component({
  selector: 'twain-quote',
  // #docregion template
  template: ` <p class="twain">
      <i>{{ quote | async }}</i>
    </p>
    <button type="button" (click)="getQuote()">Next quote</button>
    @if (errorMessage()) {
      <p class="error">{{ errorMessage() }}</p>
    }`,
  // #enddocregion template
  styles: ['.twain { font-style: italic; } .error { color: red; }'],
  imports: [AsyncPipe, sharedImports],
})
export class TwainComponent {
  errorMessage = signal('');
  quote?: Observable<string>;

  private twainService = inject(TwainService);

  constructor() {
    this.getQuote();
  }

  // #docregion get-quote
  getQuote() {
    this.errorMessage.set('');
    this.quote = this.twainService.getQuote().pipe(
      startWith('...'),
      catchError((err: any) => {
        this.errorMessage.set(err.message || err.toString());
        return of('...'); // reset message to placeholder
      }),
    );
    // #enddocregion get-quote
  }
}
