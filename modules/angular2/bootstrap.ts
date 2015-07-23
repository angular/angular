/**
 * Contains everything you need to bootstrap your application.
 */
export {bootstrap} from 'angular2/src/core/application';

// TODO(someone familiar with systemjs): the exports below are copied from
// angular2_exports.ts. Re-exporting from angular2_exports.ts causes systemjs
// to resolve imports very very very slowly. See also a similar notice in
// angular2.ts
export * from 'angular2/annotations';
export * from 'angular2/core';

export {
  DehydratedException,
  ExpressionChangedAfterItHasBeenChecked,
  ChangeDetectionError,

  ON_PUSH,
  DEFAULT,

  ChangeDetectorRef,

  Pipes,
  WrappedValue,
  Pipe,
  PipeFactory,
  NullPipe,
  NullPipeFactory,
  defaultPipes,
  BasePipe,

  Locals
} from './change_detection';

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
