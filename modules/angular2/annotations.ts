/**
 * @module
 * @public
 * @description
 *
 * Annotations provide the additional information that Angular requires in order to run your
 * application. This module
 * contains {@link Component}, {@link Directive}, and {@link View} annotations, as well as {@link
 * Parent} and {@link Ancestor} annotations that are
 * used by Angular to resolve dependencies.
 *
 */

/** decorator wrappers for all annotations. This is an empty file for dart. */
export * from './src/core/annotations/decorators';

/** raw annotation classes */
export * from './src/core/annotations/annotations';
export * from './src/core/annotations/view';
export * from './src/core/annotations/visibility';
export * from './src/core/annotations/di';
