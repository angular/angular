import {print} from 'angular2/src/facade/lang';

export class Console {
  log(message: string): void { print(message); }
}