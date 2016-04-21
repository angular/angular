import {Injectable} from 'angular2/src/core/di';
import {print} from 'angular2/src/facade/lang';

@Injectable()
export class Console {
  log(message: string): void { print(message); }
}