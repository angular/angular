import { BaseException, print, CONST } from 'angular2/src/facade/lang';
import { bootstrap } from 'angular2/angular2';
// TODO(radokirov): Once the application is transpiled by TS instead of Traceur,
// add those imports back into 'angular2/angular2';
import {Component} from 'angular2/src/core/annotations_impl/annotations';
import {View} from 'angular2/src/core/annotations_impl/view';

@Component({
  selector: 'error-app',
})
@View({
  template: `
           <button class="errorButton" (click)="createError()">create error</button>`,
  directives: []
})
export class ErrorComponent {
  createError() {
    throw new BaseException('Sourcemap test');
  }
}

export function main() {
  bootstrap(ErrorComponent);
}
