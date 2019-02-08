// #docregion
import { Component, OnInit } from '@angular/core';

import { Observable, of } from 'rxjs';
import { catchError, startWith } from 'rxjs/operators';

import { TwainService } from './twain.service';

// #docregion component
@Component({
  selector: 'twain-quote',
  // #docregion template
  template: `
    <p class="twain"><i>{{quote | async}}</i></p>
    <button (click)="getQuote()">Next quote</button>
    <p class="error" *ngIf="errorMessage">{{ errorMessage }}</p>`,
  // #enddocregion template
  styles: [
    `.twain { font-style: italic; } .error { color: red; }`
  ]

})
export class TwainComponent implements OnInit {
  errorMessage: string;
  quote: Observable<string>;

  constructor(private twainService: TwainService) {}

  ngOnInit(): void {
    this.getQuote();
  }

  // #docregion get-quote
  getQuote() {
    this.errorMessage = '';
    this.quote = this.twainService.getQuote().pipe(
      startWith('...'),
      catchError( (err: any) => {
        // 이번 싸이클에서 errorMessage가 한 번 할당되었기 때문에 한 싸이클 기다립니다.
        setTimeout(() => this.errorMessage = err.message || err.toString());
        return of('...'); // quote 프로퍼티의 값을 '...'로 재설정합니다.
      })
    );
    // #enddocregion get-quote
  }

}
// #enddocregion component
