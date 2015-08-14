/**
 * Contains everything you need to bootstrap your application.
 */
export {bootstrap} from 'angular2/src/core/application';

// TODO(someone familiar with systemjs): the exports below are copied from
// angular2_exports.ts. Re-exporting from angular2_exports.ts causes systemjs
// to resolve imports very very very slowly. See also a similar notice in
// angular2.ts
export * from './metadata';
export * from './change_detection';
export * from './core';
export * from './di';
export * from './directives';
export * from './forms';
export * from './render';
