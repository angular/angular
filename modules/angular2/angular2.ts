/**
 * The `angular2` is the single place to import all of the individual types.
 */
export {commonBootstrap as bootstrap} from 'angular2/src/core/application_common';

// TODO(someone familiar with systemjs): the exports below are copied from
// angular2_exports.ts. Re-exporting from angular2_exports.ts causes systemjs
// to resolve imports very very very slowly. See also a similar notice in
// bootstrap.ts
export * from './annotations';
export * from './core';
export * from './change_detection';
export * from './di';
export * from './forms';
export * from './directives';
export * from './http';
export {
  RenderEventDispatcher,
  Renderer,
  RenderElementRef,
  RenderViewRef,
  RenderProtoViewRef,
  RenderFragmentRef,
  RenderViewWithFragments
} from 'angular2/src/render/api';
export {
  DomRenderer,
  DOCUMENT_TOKEN,
  DOM_REFLECT_PROPERTIES_AS_ATTRIBUTES
} from 'angular2/src/render/dom/dom_renderer';
