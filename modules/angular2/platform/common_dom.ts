/**
 * This is a set of classes and objects that can be used both in the browser and on the server.
 */
export {DOM, setRootDomAdapter, DomAdapter} from 'angular2/src/platform/dom/dom_adapter';
export {DomRenderer} from 'angular2/src/platform/dom/dom_renderer';
export {DOCUMENT} from 'angular2/src/platform/dom/dom_tokens';
export {SharedStylesHost, DomSharedStylesHost} from 'angular2/src/platform/dom/shared_styles_host';
export {DomEventsPlugin} from 'angular2/src/platform/dom/events/dom_events';
export {
  EVENT_MANAGER_PLUGINS,
  EventManager,
  EventManagerPlugin
} from 'angular2/src/platform/dom/events/event_manager';
export * from 'angular2/src/platform/dom/debug/by';
export * from 'angular2/src/platform/dom/debug/ng_probe';
