/**
 * This indirection is needed to free up Component, etc symbols in the public API
 * to be used by the decorator versions of these annotations.
 */

import {makeDecorator} from 'angular2/src/util/decorators';
import {CanActivate as CanActivateAnnotation} from './lifecycle_annotations_impl';

export {
  canReuse,
  canDeactivate,
  onActivate,
  onReuse,
  onDeactivate
} from './lifecycle_annotations_impl';

export var CanActivate = makeDecorator(CanActivateAnnotation);
