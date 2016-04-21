import {Injectable} from './di';
import {print} from '../facade/lang';

@Injectable()
export class Console {
  log(message: string): void { print(message); }
}
