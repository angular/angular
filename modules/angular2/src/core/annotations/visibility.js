import {CONST} from 'angular2/src/facade/lang';
import {DependencyAnnotation} from 'angular2/di';

/**
 * The directive can only be injected from the current element
 * or from its parent.
 * @publicModule angular2/angular2
 */
export class Parent extends DependencyAnnotation {
  @CONST()
  constructor() {
    super();
  }
}

/**
 * The directive can only be injected from the current element
 * or from its ancestor.
 * @publicModule angular2/angular2
 */
export class Ancestor extends DependencyAnnotation {
  @CONST()
  constructor() {
    super();
  }
}
