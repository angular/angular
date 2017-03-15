// #docplaster
// #docregion
import { Injectable } from '@angular/core';

@Injectable()
// #docregion example
export class ExceptionService {
  constructor() { }
  // #enddocregion example
  // testing harness
  getException() { return 42; }
  // #docregion example
}
// #enddocregion example
