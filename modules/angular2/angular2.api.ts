// This module is used by dgeni to produce the angular2.d.ts file.

// Re-export everything we export to the application runtime
export * from './angular2';

// Horrible hack. See
// https://docs.google.com/document/d/1nNebWTiLzz5ePcit_bjZPtaiSIFU4EsQKUlX7LX0c0A/edit
// Exports needed to make angular2.d.ts work,
// because these symbols are dependencies of other exports but are not otherwise exported.
// This should be cleaned up in one of two ways:
// 1) if the symbol is intended to be part of the public API, then re-export somewhere else
// 2) if the symbol should be omitted from the public API, then the class exposing it should
//    not be exported, or should avoid exposing the symbol.
export {AbstractChangeDetector} from './src/change_detection/abstract_change_detector';
export {ProtoRecord} from './src/change_detection/proto_record';
export * from './src/core/compiler/element_injector';
// FIXME: this is a workaround for https://github.com/angular/angular/issues/2356
// We export the Directive *annotation* instead of the *decorator*.
// But it breaks the build.
export {Directive, LifecycleEvent} from './src/core/annotations_impl/annotations';
export {Form} from './src/forms/directives/form_interface';
export {ControlContainer} from './src/forms/directives/control_container';
export {Injectable} from './src/di/annotations_impl';
export {BaseQueryList} from './src/core/compiler/base_query_list';
export {AppProtoView, AppView, AppViewContainer} from './src/core/compiler/view';
export * from './src/change_detection/parser/ast';
export {Visibility} from './src/core/annotations_impl/visibility';
export {AppViewManager} from './src/core/compiler/view_manager';
