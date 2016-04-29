import {
  SimpleChange,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  ElementRef,
  ViewContainerRef,
  Renderer,
  RenderComponentType,
  Injector,
  QueryList,
  ViewEncapsulation,
  TemplateRef
} from '@angular/core';
import {
  AppElement,
  AppView,
  DebugAppView,
  ChangeDetectorState,
  checkBinding,
  DebugContext,
  devModeEqual,
  flattenNestedViewRenderNodes,
  interpolate,
  RenderDebugInfo,
  StaticNodeDebugInfo,
  TemplateRef_,
  uninitialized,
  ValueUnwrapper,
  ViewType,
  ViewUtils,
  castByValue,
  EMPTY_ARRAY,
  EMPTY_MAP,
  pureProxy1,
  pureProxy2,
  pureProxy3,
  pureProxy4,
  pureProxy5,
  pureProxy6,
  pureProxy7,
  pureProxy8,
  pureProxy9,
  pureProxy10
} from '../core_private';

import {CompileIdentifierMetadata, CompileTokenMetadata} from './compile_metadata';
import {assetUrl} from './util';

var APP_VIEW_MODULE_URL = assetUrl('core', 'linker/view');
var VIEW_UTILS_MODULE_URL = assetUrl('core', 'linker/view_utils');
var CD_MODULE_URL = assetUrl('core', 'change_detection/change_detection');

// Reassign the imports to different variables so we can
// define static variables with the name of the import.
// (only needed for Dart).
var impViewUtils = ViewUtils;
var impAppView = AppView;
var impDebugAppView = DebugAppView;
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
var impCastByValue = castByValue;
var impEMPTY_ARRAY = EMPTY_ARRAY;
var impEMPTY_MAP = EMPTY_MAP;

export class Identifiers {
  static ViewUtils = new CompileIdentifierMetadata({
    name: 'ViewUtils',
    moduleUrl: assetUrl('core', 'linker/view_utils'),
    runtime: impViewUtils
  });
  static AppView = new CompileIdentifierMetadata(
      {name: 'AppView', moduleUrl: APP_VIEW_MODULE_URL, runtime: impAppView});
  static DebugAppView = new CompileIdentifierMetadata(
      {name: 'DebugAppView', moduleUrl: APP_VIEW_MODULE_URL, runtime: impDebugAppView});
  static AppElement = new CompileIdentifierMetadata({
    name: 'AppElement',
    moduleUrl: assetUrl('core', 'linker/element'),
    runtime: impAppElement
  });
  static ElementRef = new CompileIdentifierMetadata({
    name: 'ElementRef',
    moduleUrl: assetUrl('core', 'linker/element_ref'),
    runtime: impElementRef
  });
  static ViewContainerRef = new CompileIdentifierMetadata({
    name: 'ViewContainerRef',
    moduleUrl: assetUrl('core', 'linker/view_container_ref'),
    runtime: impViewContainerRef
  });
  static ChangeDetectorRef = new CompileIdentifierMetadata({
    name: 'ChangeDetectorRef',
    moduleUrl: assetUrl('core', 'change_detection/change_detector_ref'),
    runtime: impChangeDetectorRef
  });
  static RenderComponentType = new CompileIdentifierMetadata({
    name: 'RenderComponentType',
    moduleUrl: assetUrl('core', 'render/api'),
    runtime: impRenderComponentType
  });
  static QueryList = new CompileIdentifierMetadata({
    name: 'QueryList',
    moduleUrl: assetUrl('core', 'linker/query_list'),
    runtime: impQueryList
  });
  static TemplateRef = new CompileIdentifierMetadata({
    name: 'TemplateRef',
    moduleUrl: assetUrl('core', 'linker/template_ref'),
    runtime: impTemplateRef
  });
  static TemplateRef_ = new CompileIdentifierMetadata({
    name: 'TemplateRef_',
    moduleUrl: assetUrl('core', 'linker/template_ref'),
    runtime: impTemplateRef_
  });
  static ValueUnwrapper = new CompileIdentifierMetadata(
      {name: 'ValueUnwrapper', moduleUrl: CD_MODULE_URL, runtime: impValueUnwrapper});
  static Injector = new CompileIdentifierMetadata({
    name: 'Injector',
    moduleUrl: assetUrl('core', 'di/injector'),
    runtime: impInjector
  });
  static ViewEncapsulation = new CompileIdentifierMetadata({
    name: 'ViewEncapsulation',
    moduleUrl: assetUrl('core', 'metadata/view'),
    runtime: impViewEncapsulation
  });
  static ViewType = new CompileIdentifierMetadata({
    name: 'ViewType',
    moduleUrl: assetUrl('core', 'linker/view_type'),
    runtime: impViewType
  });
  static ChangeDetectionStrategy = new CompileIdentifierMetadata({
    name: 'ChangeDetectionStrategy',
    moduleUrl: CD_MODULE_URL,
    runtime: impChangeDetectionStrategy
  });
  static StaticNodeDebugInfo = new CompileIdentifierMetadata({
    name: 'StaticNodeDebugInfo',
    moduleUrl: assetUrl('core', 'linker/debug_context'),
    runtime: impStaticNodeDebugInfo
  });
  static DebugContext = new CompileIdentifierMetadata({
    name: 'DebugContext',
    moduleUrl: assetUrl('core', 'linker/debug_context'),
    runtime: impDebugContext
  });
  static Renderer = new CompileIdentifierMetadata({
    name: 'Renderer',
    moduleUrl: assetUrl('core', 'render/api'),
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
  static castByValue = new CompileIdentifierMetadata(
      {name: 'castByValue', moduleUrl: VIEW_UTILS_MODULE_URL, runtime: impCastByValue});
  static EMPTY_ARRAY = new CompileIdentifierMetadata(
      {name: 'EMPTY_ARRAY', moduleUrl: VIEW_UTILS_MODULE_URL, runtime: impEMPTY_ARRAY});
  static EMPTY_MAP = new CompileIdentifierMetadata(
      {name: 'EMPTY_MAP', moduleUrl: VIEW_UTILS_MODULE_URL, runtime: impEMPTY_MAP});

  static pureProxies = [
    null,
    new CompileIdentifierMetadata(
        {name: 'pureProxy1', moduleUrl: VIEW_UTILS_MODULE_URL, runtime: pureProxy1}),
    new CompileIdentifierMetadata(
        {name: 'pureProxy2', moduleUrl: VIEW_UTILS_MODULE_URL, runtime: pureProxy2}),
    new CompileIdentifierMetadata(
        {name: 'pureProxy3', moduleUrl: VIEW_UTILS_MODULE_URL, runtime: pureProxy3}),
    new CompileIdentifierMetadata(
        {name: 'pureProxy4', moduleUrl: VIEW_UTILS_MODULE_URL, runtime: pureProxy4}),
    new CompileIdentifierMetadata(
        {name: 'pureProxy5', moduleUrl: VIEW_UTILS_MODULE_URL, runtime: pureProxy5}),
    new CompileIdentifierMetadata(
        {name: 'pureProxy6', moduleUrl: VIEW_UTILS_MODULE_URL, runtime: pureProxy6}),
    new CompileIdentifierMetadata(
        {name: 'pureProxy7', moduleUrl: VIEW_UTILS_MODULE_URL, runtime: pureProxy7}),
    new CompileIdentifierMetadata(
        {name: 'pureProxy8', moduleUrl: VIEW_UTILS_MODULE_URL, runtime: pureProxy8}),
    new CompileIdentifierMetadata(
        {name: 'pureProxy9', moduleUrl: VIEW_UTILS_MODULE_URL, runtime: pureProxy9}),
    new CompileIdentifierMetadata(
        {name: 'pureProxy10', moduleUrl: VIEW_UTILS_MODULE_URL, runtime: pureProxy10}),
  ];
}

export function identifierToken(identifier: CompileIdentifierMetadata): CompileTokenMetadata {
  return new CompileTokenMetadata({identifier: identifier});
}
