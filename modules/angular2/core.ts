/**
 * @module
 * @description
 * Define angular core API here.
 */
export {APP_COMPONENT} from 'angular2/src/core/application_tokens';
export {ApplicationRef, commonBootstrap as bootstrap} from 'angular2/src/core/application_common';
export {Type} from 'angular2/src/facade/lang';


// Compiler Related Dependencies.
export {AppRootUrl} from 'angular2/src/services/app_root_url';
export {UrlResolver} from 'angular2/src/services/url_resolver';
export {ComponentUrlMapper} from 'angular2/src/core/compiler/component_url_mapper';
export {DirectiveResolver} from 'angular2/src/core/compiler/directive_resolver';
export {Compiler} from 'angular2/src/core/compiler/compiler';

export {AppViewManager} from 'angular2/src/core/compiler/view_manager';
export {QueryList} from 'angular2/src/core/compiler/query_list';
export {DynamicComponentLoader} from 'angular2/src/core/compiler/dynamic_component_loader';
export {LifeCycle} from 'angular2/src/core/life_cycle/life_cycle';

export {ElementRef} from 'angular2/src/core/compiler/element_ref';
export {TemplateRef} from 'angular2/src/core/compiler/template_ref';
export {ViewRef, HostViewRef, ProtoViewRef} from 'angular2/src/core/compiler/view_ref';
export {ViewContainerRef} from 'angular2/src/core/compiler/view_container_ref';
export {ComponentRef} from 'angular2/src/core/compiler/dynamic_component_loader';

export {NgZone} from 'angular2/src/core/zone/ng_zone';
export {NgZoneImpl} from 'angular2/src/core/zone/ng_zone_impl';
export {Observable, EventEmitter} from 'angular2/src/facade/async';
