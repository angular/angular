/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {LifecycleHooksFeature, renderComponent, whenRendered} from './component';
import {ɵɵdefineBase, ɵɵdefineComponent, ɵɵdefineDirective, ɵɵdefineNgModule, ɵɵdefinePipe, ɵɵsetComponentScope, ɵɵsetNgModuleScope} from './definition';
import {ɵɵInheritDefinitionFeature} from './features/inherit_definition_feature';
import {ɵɵNgOnChangesFeature} from './features/ng_onchanges_feature';
import {ɵɵProvidersFeature} from './features/providers_feature';
import {ComponentDef, ComponentTemplate, ComponentType, DirectiveDef, DirectiveDefFlags, DirectiveType, PipeDef, ɵɵBaseDef, ɵɵComponentDefWithMeta, ɵɵDirectiveDefWithMeta, ɵɵPipeDefWithMeta} from './interfaces/definition';
import {getComponent, getDirectives, getHostElement, getRenderedText} from './util/discovery_utils';

export {ComponentFactory, ComponentFactoryResolver, ComponentRef, injectComponentFactoryResolver} from './component_ref';
export {ɵɵgetFactoryOf, ɵɵgetInheritedFactory} from './di';
// clang-format off
export {
  detectChanges,
  markDirty,
  store,
  tick,

  ɵɵallocHostVars,

  ɵɵattribute,
  ɵɵattributeInterpolate1,
  ɵɵattributeInterpolate2,
  ɵɵattributeInterpolate3,
  ɵɵattributeInterpolate4,
  ɵɵattributeInterpolate5,
  ɵɵattributeInterpolate6,
  ɵɵattributeInterpolate7,
  ɵɵattributeInterpolate8,
  ɵɵattributeInterpolateV,

  ɵɵclassMap,
  ɵɵclassMapInterpolate1,
  ɵɵclassMapInterpolate2,
  ɵɵclassMapInterpolate3,
  ɵɵclassMapInterpolate4,
  ɵɵclassMapInterpolate5,
  ɵɵclassMapInterpolate6,
  ɵɵclassMapInterpolate7,
  ɵɵclassMapInterpolate8,
  ɵɵclassMapInterpolateV,

  ɵɵclassProp,
  ɵɵcomponentHostSyntheticListener,

  ɵɵcontainer,
  ɵɵcontainerRefreshEnd,
  ɵɵcontainerRefreshStart,

  ɵɵdirectiveInject,

  ɵɵelement,
  ɵɵelementContainer,
  ɵɵelementContainerEnd,

  ɵɵelementContainerStart,
  ɵɵelementEnd,

  ɵɵelementHostAttrs,
  ɵɵelementStart,
  ɵɵembeddedViewEnd,

  ɵɵembeddedViewStart,

  ɵɵgetCurrentView,
  ɵɵinjectAttribute,

  ɵɵlistener,
  ɵɵload,

  ɵɵnamespaceHTML,
  ɵɵnamespaceMathML,
  ɵɵnamespaceSVG,

  ɵɵnextContext,

  ɵɵprojection,
  ɵɵprojectionDef,
  ɵɵhostProperty,
  ɵɵproperty,
  ɵɵpropertyInterpolate,
  ɵɵpropertyInterpolate1,
  ɵɵpropertyInterpolate2,
  ɵɵpropertyInterpolate3,
  ɵɵpropertyInterpolate4,
  ɵɵpropertyInterpolate5,
  ɵɵpropertyInterpolate6,
  ɵɵpropertyInterpolate7,
  ɵɵpropertyInterpolate8,
  ɵɵpropertyInterpolateV,

  ɵɵreference,

  ɵɵselect,
  ɵɵstyleMap,

  ɵɵstyleProp,
  ɵɵstylePropInterpolate1,
  ɵɵstylePropInterpolate2,
  ɵɵstylePropInterpolate3,
  ɵɵstylePropInterpolate4,
  ɵɵstylePropInterpolate5,
  ɵɵstylePropInterpolate6,
  ɵɵstylePropInterpolate7,
  ɵɵstylePropInterpolate8,
  ɵɵstylePropInterpolateV,

  ɵɵstyleSanitizer,
  ɵɵstyling,
  ɵɵstylingApply,
  ɵɵtemplate,

  ɵɵtext,
  ɵɵtextBinding,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1,
  ɵɵtextInterpolate2,
  ɵɵtextInterpolate3,
  ɵɵtextInterpolate4,
  ɵɵtextInterpolate5,
  ɵɵtextInterpolate6,
  ɵɵtextInterpolate7,
  ɵɵtextInterpolate8,
  ɵɵtextInterpolateV,

  ɵɵupdateSyntheticHostBinding,
} from './instructions/all';
export {RenderFlags} from './interfaces/definition';
export {CssSelectorList, ProjectionSlots} from './interfaces/projection';

export {
  ɵɵrestoreView,

  ɵɵenableBindings,
  ɵɵdisableBindings,
} from './state';

export {
  ɵɵi18n,
  ɵɵi18nAttributes,
  ɵɵi18nExp,
  ɵɵi18nStart,
  ɵɵi18nEnd,
  ɵɵi18nApply,
  ɵɵi18nPostprocess,
  i18nConfigureLocalize,
  ɵɵi18nLocalize,
  getLocaleId,
  setLocaleId,
} from './i18n';

export {NgModuleFactory, NgModuleRef, NgModuleType} from './ng_module_ref';

export {
  AttributeMarker
} from './interfaces/node';

export {
  setClassMetadata,
} from './metadata';

export {
  ɵɵpipe,
  ɵɵpipeBind1,
  ɵɵpipeBind2,
  ɵɵpipeBind3,
  ɵɵpipeBind4,
  ɵɵpipeBindV,
} from './pipe';

export {
  ɵɵqueryRefresh,
  ɵɵviewQuery,
  ɵɵstaticViewQuery,
  ɵɵloadViewQuery,
  ɵɵcontentQuery,
  ɵɵloadContentQuery,
  ɵɵstaticContentQuery
} from './query';

export {
  ɵɵpureFunction0,
  ɵɵpureFunction1,
  ɵɵpureFunction2,
  ɵɵpureFunction3,
  ɵɵpureFunction4,
  ɵɵpureFunction5,
  ɵɵpureFunction6,
  ɵɵpureFunction7,
  ɵɵpureFunction8,
  ɵɵpureFunctionV,
} from './pure_function';

export {ɵɵtemplateRefExtractor, ɵɵinjectPipeChangeDetectorRef} from './view_engine_compatibility_prebound';

export {ɵɵresolveWindow, ɵɵresolveDocument, ɵɵresolveBody} from './util/misc_utils';

// clang-format on

export {
  ɵɵBaseDef,
  ComponentDef,
  ɵɵComponentDefWithMeta,
  ComponentTemplate,
  ComponentType,
  DirectiveDef,
  DirectiveDefFlags,
  ɵɵDirectiveDefWithMeta,
  DirectiveType,
  ɵɵNgOnChangesFeature,
  ɵɵInheritDefinitionFeature,
  ɵɵProvidersFeature,
  PipeDef,
  ɵɵPipeDefWithMeta,
  LifecycleHooksFeature,
  ɵɵdefineComponent,
  ɵɵdefineDirective,
  ɵɵdefineNgModule,
  ɵɵdefineBase,
  ɵɵdefinePipe,
  getHostElement,
  getComponent,
  getDirectives,
  getRenderedText,
  renderComponent,
  ɵɵsetComponentScope,
  ɵɵsetNgModuleScope,
  whenRendered,
};

export {NO_CHANGE} from './tokens';
