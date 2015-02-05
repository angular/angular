import {CONST} from 'facade/src/lang';
import {DependencyAnnotation} from 'di/di';

/**
 * The directive can only be injected from the current element
 * or from its parent.
 */
export class Parent extends DependencyAnnotation {
  @CONST()
  constructor() {
  }
}

/**
 * The directive can only be injected from the current element
 * or from its ancestor.
 */
export class Ancestor extends DependencyAnnotation {
  @CONST()
  constructor() {
  }
}
