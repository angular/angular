import {print} from '../src/facade/lang';
import {Injectable} from './di/decorators';

@Injectable()
export class Console {
  log(message: string): void { print(message); }
}
