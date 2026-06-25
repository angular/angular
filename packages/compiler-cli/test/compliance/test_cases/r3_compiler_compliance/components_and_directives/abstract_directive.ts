import {Component, Directive} from '@angular/core';

@Directive({
  selector: '[test-dir]',
})
export abstract class AbstractDir {
}

@Directive({
  selector: '[dir2]',
})
export abstract class AbstractInherited extends AbstractDir {
}

@Component({
  selector: 'test-comp',
  template: ''
})
export abstract class AbstractComp {
}