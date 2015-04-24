/**
 * This indirection is needed to free up Component, etc symbols in the public API
 * to be used by the decorator versions of these annotations.
 */

export {
  Inject as InjectAnnotation,
  InjectPromise as InjectPromiseAnnotation,
  InjectLazy as InjectLazyAnnotation,
  Optional as OptionalAnnotation,
  Injectable as InjectableAnnotation,
  DependencyAnnotation,  // abstract base class, does not need a decorator
} from './annotations_impl';
