import {Injectable} from '../index';

@Injectable()
export class Log {
  logItems: any[];

  constructor() { this.logItems = []; }

  add(value): void { this.logItems.push(value); }

  fn(value) {
    return (a1: any = null, a2: any = null, a3: any = null, a4: any = null, a5: any = null) => {
      this.logItems.push(value);
    };
  }

  clear(): void { this.logItems = []; }

  result(): string { return this.logItems.join("; "); }
}
