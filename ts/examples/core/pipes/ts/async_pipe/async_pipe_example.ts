import {Component, provide, Observable} from 'angular2/angular2';
import {bootstrap} from 'angular2/bootstrap';

// #docregion AsyncPipe
@Component({
  selector: 'async-example',
  template: `<div>
    <p>Wait for it... {{promise | async}}</p>
    <button (click)="clicked()">{{resolved ? 'Reset' : 'Resolve'}}</button> 
  </div>`
})
export class AsyncPipeExample {
  resolved: boolean = false;
  promise: Promise<string> = null;
  resolve: Function = null;

  constructor() { this.reset(); }

  reset() {
    this.resolved = false;
    this.promise = new Promise<string>((resolve, reject) => { this.resolve = resolve; });
  }

  clicked() {
    if (this.resolved) {
      this.reset();
    } else {
      this.resolve("resolved!");
      this.resolved = true;
    }
  }
}
// #enddocregion

// #docregion AsyncPipeObservable
@Component({selector: "task-cmp", template: "Time: {{ time | async }}"})
class Task {
  time = new Observable<number>(
      observer => { setInterval(_ => observer.next(new Date().getTime()), 500); });
}
// #enddocregion

@Component({
  selector: 'example-app',
  directives: [AsyncPipeExample],
  template: ` 
    <h1>AsyncPipe Example</h1>
    <async-example></async-example>
  `
})
export class AppCmp {
}

export function main() {
  bootstrap(AppCmp);
}
