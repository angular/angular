/**
 * @module
 * @description
 * Define angular core API here.
 */
export {bootstrap, ApplicationRef} from 'angular2/src/core/application';
export {appComponentTypeToken} from 'angular2/src/core/application_tokens';


// Compiler Related Dependencies.
export {AppRootUrl} from 'angular2/src/services/app_root_url';
export {UrlResolver} from 'angular2/src/services/url_resolver';
export {ComponentUrlMapper} from 'angular2/src/core/compiler/component_url_mapper';
export {DirectiveResolver} from 'angular2/src/core/compiler/directive_resolver';
export {Compiler} from 'angular2/src/core/compiler/compiler';

export {AppViewManager} from 'angular2/src/core/compiler/view_manager';
export {QueryList} from 'angular2/src/core/compiler/query_list';
export {BaseQueryList} from 'angular2/src/core/compiler/base_query_list';
export {ElementRef} from 'angular2/src/core/compiler/element_ref';
export {RenderElementRef} from 'angular2/src/render/api';
export {ViewRef, ProtoViewRef} from 'angular2/src/core/compiler/view_ref';
export {ViewContainerRef} from 'angular2/src/core/compiler/view_container_ref';

export {
  DynamicComponentLoader,
  ComponentRef
} from 'angular2/src/core/compiler/dynamic_component_loader';

export {NgZone} from 'angular2/src/core/zone/ng_zone';
export {Observable, EventEmitter} from 'angular2/src/facade/async';
