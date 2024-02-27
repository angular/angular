// #docregion
import {Component, OnInit} from '@angular/core';
import {AsyncPipe} from '@angular/common';
import {sharedImports} from '../shared/shared';

import {Observable, of} from 'rxjs';
import {catchError, startWith} from 'rxjs/operators';

import {TwainService} from './twain.service';

@Component({
  standalone: true,
  selector: 'twain-quote',
  // #docregion template
  template: ` <p class="twain">
      <i>{{ quote | async }}</i>
    </p>
    <button type="button" (click)="getQuote()">Next quote</button>
    @if (errorMessage) {
      <p class="error">{{ errorMessage }}</p>
    }`,
  // #enddocregion template
  styles: ['.twain { font-style: italic; } .error { color: red; }'],
  imports: [AsyncPipe, sharedImports],
})
export class TwainComponent implements OnInit {
  errorMessage!: string;
  quote!: Observable<string>;

  constructor(private twainService: TwainService) {}

  ngOnInit(): void {
    this.getQuote();
  }

  // #docregion get-quote
  getQuote() {
    this.errorMessage = '';
    this.quote = this.twainService.getQuote().pipe(
      startWith('...'),
      catchError((err: any) => {
        // Wait a turn because errorMessage already set once this turn
        setTimeout(() => (this.errorMessage = err.message || err.toString()));
        return of('...'); // reset message to placeholder
      }),
    );
    // #enddocregion get-quote
  }
}
