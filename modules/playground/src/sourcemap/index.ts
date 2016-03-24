import {BaseException, WrappedException} from 'angular2/src/facade/exceptions';
import {bootstrap} from 'angular2/platform/browser';
import {Component} from 'angular2/core';

@Component({
  selector: 'error-app',
  template: `
           <button class="errorButton" (click)="createError()">create error</button>`
})
export class ErrorComponent {
  createError(): void { throw new BaseException('Sourcemap test'); }
}

export function main() {
  bootstrap(ErrorComponent);
}
