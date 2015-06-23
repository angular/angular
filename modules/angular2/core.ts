/**
 * @module
 * @public
 * @description
 * Define angular core API here.
 */
export {
  SelfAnnotation,
  AncestorAnnotation,
  ParentAnnotation,
  UnboundedAnnotation
} from './src/core/annotations/visibility';

export {ViewAnnotation, ViewArgs} from './src/core/annotations/view';
export {QueryAnnotation, AttributeAnnotation} from './src/core/annotations/di';
export {bootstrap, ApplicationRef} from './src/core/application';

export {appComponentRefToken, appComponentTypeToken} from './src/core/application_tokens';

export {CompilerCache, Compiler} from './src/core/compiler/compiler';

export {
  OnChange,
  OnDestroy,
  OnCheck,
  OnInit,
  OnAllChangesDone,
} from './src/core/compiler/interfaces';

export {QueryList} from './src/core/compiler/query_list';
export {DirectiveResolver} from './src/core/compiler/directive_resolver';

export {ComponentRef, DynamicComponentLoader} from './src/core/compiler/dynamic_component_loader';

export {ViewRef, ProtoViewRef} from './src/core/compiler/view_ref';
export {ViewContainerRef} from './src/core/compiler/view_container_ref';
export {ElementRef} from './src/core/compiler/element_ref';

export {NgZone} from './src/core/zone/ng_zone';
