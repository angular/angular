import {Component, Directive} from '@angular/core';

@Directive({
  selector: '[test-dir]',
})
export abstract class AbstractDir {
}

@Component({
  selector: 'test-comp',
  template: ''
})
export abstract class AbstractComp {
}
