import {CompileIdentifierMetadata, CompileTokenMetadata} from './compile_metadata';
import {AppView} from 'angular2/src/core/linker/view';
import {StaticNodeDebugInfo, DebugContext} from 'angular2/src/core/linker/debug_context';
import {
  flattenNestedViewRenderNodes,
  interpolate,
  checkBinding
} from 'angular2/src/core/linker/view_utils';
import {
  uninitialized,
  devModeEqual,
  SimpleChange,
  ValueUnwrapper,
  ChangeDetectorRef,
  ChangeDetectorState,
  ChangeDetectionStrategy
} from 'angular2/src/core/change_detection/change_detection';
import {AppViewManager_} from 'angular2/src/core/linker/view_manager';
import {AppElement} from 'angular2/src/core/linker/element';
import {ElementRef} from 'angular2/src/core/linker/element_ref';
import {ViewContainerRef} from 'angular2/src/core/linker/view_container_ref';
import {Renderer, RenderComponentType, RenderDebugInfo} from 'angular2/src/core/render/api';
import {ViewEncapsulation} from 'angular2/src/core/metadata/view';
import {ViewType} from 'angular2/src/core/linker/view_type';
import {QueryList} from 'angular2/src/core/linker';
import {Injector} from 'angular2/src/core/di/injector';
import {TemplateRef, TemplateRef_} from 'angular2/src/core/linker/template_ref';
import {MODULE_SUFFIX} from './util';

var APP_VIEW_MODULE_URL = 'asset:angular2/lib/src/core/linker/view' + MODULE_SUFFIX;
var VIEW_UTILS_MODULE_URL = 'asset:angular2/lib/src/core/linker/view_utils' + MODULE_SUFFIX;
var CD_MODULE_URL = 'asset:angular2/lib/src/core/change_detection/change_detection' + MODULE_SUFFIX;

// Reassign the imports to different variables so we can
// define static variables with the name of the import.
// (only needed for Dart).
var impAppViewManager_ = AppViewManager_;
var impAppView = AppView;
var impDebugContext = DebugContext;
var impAppElement = AppElement;
var impElementRef = ElementRef;
var impViewContainerRef = ViewContainerRef;
var impChangeDetectorRef = ChangeDetectorRef;
var impRenderComponentType = RenderComponentType;
var impQueryList = QueryList;
var impTemplateRef = TemplateRef;
var impTemplateRef_ = TemplateRef_;
var impValueUnwrapper = ValueUnwrapper;
var impInjector = Injector;
var impViewEncapsulation = ViewEncapsulation;
var impViewType = ViewType;
var impChangeDetectionStrategy = ChangeDetectionStrategy;
var impStaticNodeDebugInfo = StaticNodeDebugInfo;
var impRenderer = Renderer;
var impSimpleChange = SimpleChange;
var impUninitialized = uninitialized;
var impChangeDetectorState = ChangeDetectorState;
var impFlattenNestedViewRenderNodes = flattenNestedViewRenderNodes;
var impDevModeEqual = devModeEqual;
var impInterpolate = interpolate;
var impCheckBinding = checkBinding;

export class Identifiers {
  static AppViewManager_ = new CompileIdentifierMetadata({
    name: 'AppViewManager_',
    moduleUrl: 'asset:angular2/lib/src/core/linker/view_manager' + MODULE_SUFFIX,
    runtime: impAppViewManager_
  });
  static AppView = new CompileIdentifierMetadata(
      {name: 'AppView', moduleUrl: APP_VIEW_MODULE_URL, runtime: impAppView});
  static AppElement = new CompileIdentifierMetadata({
    name: 'AppElement',
    moduleUrl: 'asset:angular2/lib/src/core/linker/element' + MODULE_SUFFIX,
    runtime: impAppElement
  });
  static ElementRef = new CompileIdentifierMetadata({
    name: 'ElementRef',
    moduleUrl: 'asset:angular2/lib/src/core/linker/element_ref' + MODULE_SUFFIX,
    runtime: impElementRef
  });
  static ViewContainerRef = new CompileIdentifierMetadata({
    name: 'ViewContainerRef',
    moduleUrl: 'asset:angular2/lib/src/core/linker/view_container_ref' + MODULE_SUFFIX,
    runtime: impViewContainerRef
  });
  static ChangeDetectorRef = new CompileIdentifierMetadata({
    name: 'ChangeDetectorRef',
    moduleUrl: 'asset:angular2/lib/src/core/change_detection/change_detector_ref' + MODULE_SUFFIX,
    runtime: impChangeDetectorRef
  });
  static RenderComponentType = new CompileIdentifierMetadata({
    name: 'RenderComponentType',
    moduleUrl: 'asset:angular2/lib/src/core/render/api' + MODULE_SUFFIX,
    runtime: impRenderComponentType
  });
  static QueryList = new CompileIdentifierMetadata({
    name: 'QueryList',
    moduleUrl: 'asset:angular2/lib/src/core/linker/query_list' + MODULE_SUFFIX,
    runtime: impQueryList
  });
  static TemplateRef = new CompileIdentifierMetadata({
    name: 'TemplateRef',
    moduleUrl: 'asset:angular2/lib/src/core/linker/template_ref' + MODULE_SUFFIX,
    runtime: impTemplateRef
  });
  static TemplateRef_ = new CompileIdentifierMetadata({
    name: 'TemplateRef_',
    moduleUrl: 'asset:angular2/lib/src/core/linker/template_ref' + MODULE_SUFFIX,
    runtime: impTemplateRef_
  });
  static ValueUnwrapper = new CompileIdentifierMetadata(
      {name: 'ValueUnwrapper', moduleUrl: CD_MODULE_URL, runtime: impValueUnwrapper});
  static Injector = new CompileIdentifierMetadata({
    name: 'Injector',
    moduleUrl: `asset:angular2/lib/src/core/di/injector${MODULE_SUFFIX}`,
    runtime: impInjector
  });
  static ViewEncapsulation = new CompileIdentifierMetadata({
    name: 'ViewEncapsulation',
    moduleUrl: 'asset:angular2/lib/src/core/metadata/view' + MODULE_SUFFIX,
    runtime: impViewEncapsulation
  });
  static ViewType = new CompileIdentifierMetadata({
    name: 'ViewType',
    moduleUrl: `asset:angular2/lib/src/core/linker/view_type${MODULE_SUFFIX}`,
    runtime: impViewType
  });
  static ChangeDetectionStrategy = new CompileIdentifierMetadata({
    name: 'ChangeDetectionStrategy',
    moduleUrl: CD_MODULE_URL,
    runtime: impChangeDetectionStrategy
  });
  static StaticNodeDebugInfo = new CompileIdentifierMetadata({
    name: 'StaticNodeDebugInfo',
    moduleUrl: `asset:angular2/lib/src/core/linker/debug_context${MODULE_SUFFIX}`,
    runtime: impStaticNodeDebugInfo
  });
  static DebugContext = new CompileIdentifierMetadata({
    name: 'DebugContext',
    moduleUrl: `asset:angular2/lib/src/core/linker/debug_context${MODULE_SUFFIX}`,
    runtime: impDebugContext
  });
  static Renderer = new CompileIdentifierMetadata({
    name: 'Renderer',
    moduleUrl: 'asset:angular2/lib/src/core/render/api' + MODULE_SUFFIX,
    runtime: impRenderer
  });
  static SimpleChange = new CompileIdentifierMetadata(
      {name: 'SimpleChange', moduleUrl: CD_MODULE_URL, runtime: impSimpleChange});
  static uninitialized = new CompileIdentifierMetadata(
      {name: 'uninitialized', moduleUrl: CD_MODULE_URL, runtime: impUninitialized});
  static ChangeDetectorState = new CompileIdentifierMetadata(
      {name: 'ChangeDetectorState', moduleUrl: CD_MODULE_URL, runtime: impChangeDetectorState});
  static checkBinding = new CompileIdentifierMetadata(
      {name: 'checkBinding', moduleUrl: VIEW_UTILS_MODULE_URL, runtime: impCheckBinding});
  static flattenNestedViewRenderNodes = new CompileIdentifierMetadata({
    name: 'flattenNestedViewRenderNodes',
    moduleUrl: VIEW_UTILS_MODULE_URL,
    runtime: impFlattenNestedViewRenderNodes
  });
  static devModeEqual = new CompileIdentifierMetadata(
      {name: 'devModeEqual', moduleUrl: CD_MODULE_URL, runtime: impDevModeEqual});
  static interpolate = new CompileIdentifierMetadata(
      {name: 'interpolate', moduleUrl: VIEW_UTILS_MODULE_URL, runtime: impInterpolate});
}

export function identifierToken(identifier: CompileIdentifierMetadata): CompileTokenMetadata {
  return new CompileTokenMetadata({identifier: identifier});
}
