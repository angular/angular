// #docregion
import { Directive, OnInit, OnDestroy } from '@angular/core';

import { LoggerService } from './logger.service';

// #docregion spy-directive
let nextId = 1;

// Spy on any element to which it is applied.
// Usage: <div appSpy>...</div>
@Directive({selector: '[appSpy]'})
export class SpyDirective implements OnInit, OnDestroy {

  constructor(private logger: LoggerService) { }

  ngOnInit() {
    this.logger.log(`Spy #${nextId++} onInit`);
  }

  ngOnDestroy() {
    this.logger.log(`Spy #${nextId++} onDestroy`);
  }
}
// #enddocregion spy-directive
