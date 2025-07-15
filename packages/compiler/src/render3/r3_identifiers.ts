/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as o from '../output/output_ast';

const CORE = '@angular/core';

export class Identifiers {
  /* Methods */
  static NEW_METHOD = 'factory';
  static TRANSFORM_METHOD = 'transform';
  static PATCH_DEPS = 'patchedDeps';

  static core: o.ExternalReference = {name: null, moduleName: CORE};

  /* Instructions */
  static namespaceHTML: o.ExternalReference = {name: 'ɵɵnamespaceHTML', moduleName: CORE};

  static namespaceMathML: o.ExternalReference = {name: 'ɵɵnamespaceMathML', moduleName: CORE};

  static namespaceSVG: o.ExternalReference = {name: 'ɵɵnamespaceSVG', moduleName: CORE};

  static element: o.ExternalReference = {name: 'ɵɵelement', moduleName: CORE};

  static elementStart: o.ExternalReference = {name: 'ɵɵelementStart', moduleName: CORE};

  static elementEnd: o.ExternalReference = {name: 'ɵɵelementEnd', moduleName: CORE};

  static domElement: o.ExternalReference = {name: 'ɵɵdomElement', moduleName: CORE};
  static domElementStart: o.ExternalReference = {name: 'ɵɵdomElementStart', moduleName: CORE};
  static domElementEnd: o.ExternalReference = {name: 'ɵɵdomElementEnd', moduleName: CORE};
  static domElementContainer: o.ExternalReference = {
    name: 'ɵɵdomElementContainer',
    moduleName: CORE,
  };
  static domElementContainerStart: o.ExternalReference = {
    name: 'ɵɵdomElementContainerStart',
    moduleName: CORE,
  };
  static domElementContainerEnd: o.ExternalReference = {
    name: 'ɵɵdomElementContainerEnd',
    moduleName: CORE,
  };
  static domTemplate: o.ExternalReference = {name: 'ɵɵdomTemplate', moduleName: CORE};
  static domListener: o.ExternalReference = {name: 'ɵɵdomListener', moduleName: CORE};

  static advance: o.ExternalReference = {name: 'ɵɵadvance', moduleName: CORE};

  static syntheticHostProperty: o.ExternalReference = {
    name: 'ɵɵsyntheticHostProperty',
    moduleName: CORE,
  };

  static syntheticHostListener: o.ExternalReference = {
    name: 'ɵɵsyntheticHostListener',
    moduleName: CORE,
  };

  static attribute: o.ExternalReference = {name: 'ɵɵattribute', moduleName: CORE};

  static classProp: o.ExternalReference = {name: 'ɵɵclassProp', moduleName: CORE};

  static elementContainerStart: o.ExternalReference = {
    name: 'ɵɵelementContainerStart',
    moduleName: CORE,
  };

  static elementContainerEnd: o.ExternalReference = {
    name: 'ɵɵelementContainerEnd',
    moduleName: CORE,
  };

  static elementContainer: o.ExternalReference = {name: 'ɵɵelementContainer', moduleName: CORE};

  static styleMap: o.ExternalReference = {name: 'ɵɵstyleMap', moduleName: CORE};

  static classMap: o.ExternalReference = {name: 'ɵɵclassMap', moduleName: CORE};

  static styleProp: o.ExternalReference = {name: 'ɵɵstyleProp', moduleName: CORE};

  static interpolate: o.ExternalReference = {
    name: 'ɵɵinterpolate',
    moduleName: CORE,
  };
  static interpolate1: o.ExternalReference = {
    name: 'ɵɵinterpolate1',
    moduleName: CORE,
  };
  static interpolate2: o.ExternalReference = {
    name: 'ɵɵinterpolate2',
    moduleName: CORE,
  };
  static interpolate3: o.ExternalReference = {
    name: 'ɵɵinterpolate3',
    moduleName: CORE,
  };
  static interpolate4: o.ExternalReference = {
    name: 'ɵɵinterpolate4',
    moduleName: CORE,
  };
  static interpolate5: o.ExternalReference = {
    name: 'ɵɵinterpolate5',
    moduleName: CORE,
  };
  static interpolate6: o.ExternalReference = {
    name: 'ɵɵinterpolate6',
    moduleName: CORE,
  };
  static interpolate7: o.ExternalReference = {
    name: 'ɵɵinterpolate7',
    moduleName: CORE,
  };
  static interpolate8: o.ExternalReference = {
    name: 'ɵɵinterpolate8',
    moduleName: CORE,
  };
  static interpolateV: o.ExternalReference = {
    name: 'ɵɵinterpolateV',
    moduleName: CORE,
  };

  static nextContext: o.ExternalReference = {name: 'ɵɵnextContext', moduleName: CORE};

  static resetView: o.ExternalReference = {name: 'ɵɵresetView', moduleName: CORE};

  static templateCreate: o.ExternalReference = {name: 'ɵɵtemplate', moduleName: CORE};

  static defer: o.ExternalReference = {name: 'ɵɵdefer', moduleName: CORE};
  static deferWhen: o.ExternalReference = {name: 'ɵɵdeferWhen', moduleName: CORE};
  static deferOnIdle: o.ExternalReference = {name: 'ɵɵdeferOnIdle', moduleName: CORE};
  static deferOnImmediate: o.ExternalReference = {name: 'ɵɵdeferOnImmediate', moduleName: CORE};
  static deferOnTimer: o.ExternalReference = {name: 'ɵɵdeferOnTimer', moduleName: CORE};
  static deferOnHover: o.ExternalReference = {name: 'ɵɵdeferOnHover', moduleName: CORE};
  static deferOnInteraction: o.ExternalReference = {name: 'ɵɵdeferOnInteraction', moduleName: CORE};
  static deferOnViewport: o.ExternalReference = {name: 'ɵɵdeferOnViewport', moduleName: CORE};
  static deferPrefetchWhen: o.ExternalReference = {name: 'ɵɵdeferPrefetchWhen', moduleName: CORE};
  static deferPrefetchOnIdle: o.ExternalReference = {
    name: 'ɵɵdeferPrefetchOnIdle',
    moduleName: CORE,
  };
  static deferPrefetchOnImmediate: o.ExternalReference = {
    name: 'ɵɵdeferPrefetchOnImmediate',
    moduleName: CORE,
  };
  static deferPrefetchOnTimer: o.ExternalReference = {
    name: 'ɵɵdeferPrefetchOnTimer',
    moduleName: CORE,
  };
  static deferPrefetchOnHover: o.ExternalReference = {
    name: 'ɵɵdeferPrefetchOnHover',
    moduleName: CORE,
  };
  static deferPrefetchOnInteraction: o.ExternalReference = {
    name: 'ɵɵdeferPrefetchOnInteraction',
    moduleName: CORE,
  };
  static deferPrefetchOnViewport: o.ExternalReference = {
    name: 'ɵɵdeferPrefetchOnViewport',
    moduleName: CORE,
  };
  static deferHydrateWhen: o.ExternalReference = {name: 'ɵɵdeferHydrateWhen', moduleName: CORE};
  static deferHydrateNever: o.ExternalReference = {name: 'ɵɵdeferHydrateNever', moduleName: CORE};
  static deferHydrateOnIdle: o.ExternalReference = {
    name: 'ɵɵdeferHydrateOnIdle',
    moduleName: CORE,
  };
  static deferHydrateOnImmediate: o.ExternalReference = {
    name: 'ɵɵdeferHydrateOnImmediate',
    moduleName: CORE,
  };
  static deferHydrateOnTimer: o.ExternalReference = {
    name: 'ɵɵdeferHydrateOnTimer',
    moduleName: CORE,
  };
  static deferHydrateOnHover: o.ExternalReference = {
    name: 'ɵɵdeferHydrateOnHover',
    moduleName: CORE,
  };
  static deferHydrateOnInteraction: o.ExternalReference = {
    name: 'ɵɵdeferHydrateOnInteraction',
    moduleName: CORE,
  };
  static deferHydrateOnViewport: o.ExternalReference = {
    name: 'ɵɵdeferHydrateOnViewport',
    moduleName: CORE,
  };
  static deferEnableTimerScheduling: o.ExternalReference = {
    name: 'ɵɵdeferEnableTimerScheduling',
    moduleName: CORE,
  };

  static conditionalCreate: o.ExternalReference = {name: 'ɵɵconditionalCreate', moduleName: CORE};
  static conditionalBranchCreate: o.ExternalReference = {
    name: 'ɵɵconditionalBranchCreate',
    moduleName: CORE,
  };
  static conditional: o.ExternalReference = {name: 'ɵɵconditional', moduleName: CORE};
  static repeater: o.ExternalReference = {name: 'ɵɵrepeater', moduleName: CORE};
  static repeaterCreate: o.ExternalReference = {name: 'ɵɵrepeaterCreate', moduleName: CORE};
  static repeaterTrackByIndex: o.ExternalReference = {
    name: 'ɵɵrepeaterTrackByIndex',
    moduleName: CORE,
  };
  static repeaterTrackByIdentity: o.ExternalReference = {
    name: 'ɵɵrepeaterTrackByIdentity',
    moduleName: CORE,
  };
  static componentInstance: o.ExternalReference = {name: 'ɵɵcomponentInstance', moduleName: CORE};

  static text: o.ExternalReference = {name: 'ɵɵtext', moduleName: CORE};

  static enableBindings: o.ExternalReference = {name: 'ɵɵenableBindings', moduleName: CORE};

  static disableBindings: o.ExternalReference = {name: 'ɵɵdisableBindings', moduleName: CORE};

  static getCurrentView: o.ExternalReference = {name: 'ɵɵgetCurrentView', moduleName: CORE};

  static textInterpolate: o.ExternalReference = {name: 'ɵɵtextInterpolate', moduleName: CORE};
  static textInterpolate1: o.ExternalReference = {name: 'ɵɵtextInterpolate1', moduleName: CORE};
  static textInterpolate2: o.ExternalReference = {name: 'ɵɵtextInterpolate2', moduleName: CORE};
  static textInterpolate3: o.ExternalReference = {name: 'ɵɵtextInterpolate3', moduleName: CORE};
  static textInterpolate4: o.ExternalReference = {name: 'ɵɵtextInterpolate4', moduleName: CORE};
  static textInterpolate5: o.ExternalReference = {name: 'ɵɵtextInterpolate5', moduleName: CORE};
  static textInterpolate6: o.ExternalReference = {name: 'ɵɵtextInterpolate6', moduleName: CORE};
  static textInterpolate7: o.ExternalReference = {name: 'ɵɵtextInterpolate7', moduleName: CORE};
  static textInterpolate8: o.ExternalReference = {name: 'ɵɵtextInterpolate8', moduleName: CORE};
  static textInterpolateV: o.ExternalReference = {name: 'ɵɵtextInterpolateV', moduleName: CORE};

  static restoreView: o.ExternalReference = {name: 'ɵɵrestoreView', moduleName: CORE};

  static pureFunction0: o.ExternalReference = {name: 'ɵɵpureFunction0', moduleName: CORE};
  static pureFunction1: o.ExternalReference = {name: 'ɵɵpureFunction1', moduleName: CORE};
  static pureFunction2: o.ExternalReference = {name: 'ɵɵpureFunction2', moduleName: CORE};
  static pureFunction3: o.ExternalReference = {name: 'ɵɵpureFunction3', moduleName: CORE};
  static pureFunction4: o.ExternalReference = {name: 'ɵɵpureFunction4', moduleName: CORE};
  static pureFunction5: o.ExternalReference = {name: 'ɵɵpureFunction5', moduleName: CORE};
  static pureFunction6: o.ExternalReference = {name: 'ɵɵpureFunction6', moduleName: CORE};
  static pureFunction7: o.ExternalReference = {name: 'ɵɵpureFunction7', moduleName: CORE};
  static pureFunction8: o.ExternalReference = {name: 'ɵɵpureFunction8', moduleName: CORE};
  static pureFunctionV: o.ExternalReference = {name: 'ɵɵpureFunctionV', moduleName: CORE};

  static pipeBind1: o.ExternalReference = {name: 'ɵɵpipeBind1', moduleName: CORE};
  static pipeBind2: o.ExternalReference = {name: 'ɵɵpipeBind2', moduleName: CORE};
  static pipeBind3: o.ExternalReference = {name: 'ɵɵpipeBind3', moduleName: CORE};
  static pipeBind4: o.ExternalReference = {name: 'ɵɵpipeBind4', moduleName: CORE};
  static pipeBindV: o.ExternalReference = {name: 'ɵɵpipeBindV', moduleName: CORE};

  static domProperty: o.ExternalReference = {name: 'ɵɵdomProperty', moduleName: CORE};

  static property: o.ExternalReference = {name: 'ɵɵproperty', moduleName: CORE};

  static i18n: o.ExternalReference = {name: 'ɵɵi18n', moduleName: CORE};
  static i18nAttributes: o.ExternalReference = {name: 'ɵɵi18nAttributes', moduleName: CORE};
  static i18nExp: o.ExternalReference = {name: 'ɵɵi18nExp', moduleName: CORE};
  static i18nStart: o.ExternalReference = {name: 'ɵɵi18nStart', moduleName: CORE};
  static i18nEnd: o.ExternalReference = {name: 'ɵɵi18nEnd', moduleName: CORE};
  static i18nApply: o.ExternalReference = {name: 'ɵɵi18nApply', moduleName: CORE};
  static i18nPostprocess: o.ExternalReference = {name: 'ɵɵi18nPostprocess', moduleName: CORE};

  static pipe: o.ExternalReference = {name: 'ɵɵpipe', moduleName: CORE};

  static projection: o.ExternalReference = {name: 'ɵɵprojection', moduleName: CORE};
  static projectionDef: o.ExternalReference = {name: 'ɵɵprojectionDef', moduleName: CORE};

  static reference: o.ExternalReference = {name: 'ɵɵreference', moduleName: CORE};

  static inject: o.ExternalReference = {name: 'ɵɵinject', moduleName: CORE};

  static injectAttribute: o.ExternalReference = {name: 'ɵɵinjectAttribute', moduleName: CORE};

  static directiveInject: o.ExternalReference = {name: 'ɵɵdirectiveInject', moduleName: CORE};
  static invalidFactory: o.ExternalReference = {name: 'ɵɵinvalidFactory', moduleName: CORE};
  static invalidFactoryDep: o.ExternalReference = {name: 'ɵɵinvalidFactoryDep', moduleName: CORE};

  static templateRefExtractor: o.ExternalReference = {
    name: 'ɵɵtemplateRefExtractor',
    moduleName: CORE,
  };

  static forwardRef: o.ExternalReference = {name: 'forwardRef', moduleName: CORE};
  static resolveForwardRef: o.ExternalReference = {name: 'resolveForwardRef', moduleName: CORE};

  static replaceMetadata: o.ExternalReference = {name: 'ɵɵreplaceMetadata', moduleName: CORE};
  static getReplaceMetadataURL: o.ExternalReference = {
    name: 'ɵɵgetReplaceMetadataURL',
    moduleName: CORE,
  };

  static ɵɵdefineInjectable: o.ExternalReference = {name: 'ɵɵdefineInjectable', moduleName: CORE};
  static declareInjectable: o.ExternalReference = {name: 'ɵɵngDeclareInjectable', moduleName: CORE};
  static InjectableDeclaration: o.ExternalReference = {
    name: 'ɵɵInjectableDeclaration',
    moduleName: CORE,
  };

  static resolveWindow: o.ExternalReference = {name: 'ɵɵresolveWindow', moduleName: CORE};
  static resolveDocument: o.ExternalReference = {name: 'ɵɵresolveDocument', moduleName: CORE};
  static resolveBody: o.ExternalReference = {name: 'ɵɵresolveBody', moduleName: CORE};

  static getComponentDepsFactory: o.ExternalReference = {
    name: 'ɵɵgetComponentDepsFactory',
    moduleName: CORE,
  };

  static defineComponent: o.ExternalReference = {name: 'ɵɵdefineComponent', moduleName: CORE};
  static declareComponent: o.ExternalReference = {name: 'ɵɵngDeclareComponent', moduleName: CORE};

  static setComponentScope: o.ExternalReference = {name: 'ɵɵsetComponentScope', moduleName: CORE};

  static ChangeDetectionStrategy: o.ExternalReference = {
    name: 'ChangeDetectionStrategy',
    moduleName: CORE,
  };
  static ViewEncapsulation: o.ExternalReference = {
    name: 'ViewEncapsulation',
    moduleName: CORE,
  };

  static ComponentDeclaration: o.ExternalReference = {
    name: 'ɵɵComponentDeclaration',
    moduleName: CORE,
  };

  static FactoryDeclaration: o.ExternalReference = {
    name: 'ɵɵFactoryDeclaration',
    moduleName: CORE,
  };
  static declareFactory: o.ExternalReference = {name: 'ɵɵngDeclareFactory', moduleName: CORE};
  static FactoryTarget: o.ExternalReference = {name: 'ɵɵFactoryTarget', moduleName: CORE};

  static defineDirective: o.ExternalReference = {name: 'ɵɵdefineDirective', moduleName: CORE};
  static declareDirective: o.ExternalReference = {name: 'ɵɵngDeclareDirective', moduleName: CORE};

  static DirectiveDeclaration: o.ExternalReference = {
    name: 'ɵɵDirectiveDeclaration',
    moduleName: CORE,
  };

  static InjectorDef: o.ExternalReference = {name: 'ɵɵInjectorDef', moduleName: CORE};
  static InjectorDeclaration: o.ExternalReference = {
    name: 'ɵɵInjectorDeclaration',
    moduleName: CORE,
  };

  static defineInjector: o.ExternalReference = {name: 'ɵɵdefineInjector', moduleName: CORE};
  static declareInjector: o.ExternalReference = {name: 'ɵɵngDeclareInjector', moduleName: CORE};

  static NgModuleDeclaration: o.ExternalReference = {
    name: 'ɵɵNgModuleDeclaration',
    moduleName: CORE,
  };

  static ModuleWithProviders: o.ExternalReference = {
    name: 'ModuleWithProviders',
    moduleName: CORE,
  };

  static defineNgModule: o.ExternalReference = {name: 'ɵɵdefineNgModule', moduleName: CORE};
  static declareNgModule: o.ExternalReference = {name: 'ɵɵngDeclareNgModule', moduleName: CORE};
  static setNgModuleScope: o.ExternalReference = {name: 'ɵɵsetNgModuleScope', moduleName: CORE};
  static registerNgModuleType: o.ExternalReference = {
    name: 'ɵɵregisterNgModuleType',
    moduleName: CORE,
  };

  static PipeDeclaration: o.ExternalReference = {name: 'ɵɵPipeDeclaration', moduleName: CORE};

  static definePipe: o.ExternalReference = {name: 'ɵɵdefinePipe', moduleName: CORE};
  static declarePipe: o.ExternalReference = {name: 'ɵɵngDeclarePipe', moduleName: CORE};

  static declareClassMetadata: o.ExternalReference = {
    name: 'ɵɵngDeclareClassMetadata',
    moduleName: CORE,
  };
  static declareClassMetadataAsync: o.ExternalReference = {
    name: 'ɵɵngDeclareClassMetadataAsync',
    moduleName: CORE,
  };
  static setClassMetadata: o.ExternalReference = {name: 'ɵsetClassMetadata', moduleName: CORE};
  static setClassMetadataAsync: o.ExternalReference = {
    name: 'ɵsetClassMetadataAsync',
    moduleName: CORE,
  };
  static setClassDebugInfo: o.ExternalReference = {name: 'ɵsetClassDebugInfo', moduleName: CORE};
  static queryRefresh: o.ExternalReference = {name: 'ɵɵqueryRefresh', moduleName: CORE};
  static viewQuery: o.ExternalReference = {name: 'ɵɵviewQuery', moduleName: CORE};
  static loadQuery: o.ExternalReference = {name: 'ɵɵloadQuery', moduleName: CORE};
  static contentQuery: o.ExternalReference = {name: 'ɵɵcontentQuery', moduleName: CORE};

  // Signal queries
  static viewQuerySignal: o.ExternalReference = {name: 'ɵɵviewQuerySignal', moduleName: CORE};
  static contentQuerySignal: o.ExternalReference = {name: 'ɵɵcontentQuerySignal', moduleName: CORE};
  static queryAdvance: o.ExternalReference = {name: 'ɵɵqueryAdvance', moduleName: CORE};

  // Two-way bindings
  static twoWayProperty: o.ExternalReference = {name: 'ɵɵtwoWayProperty', moduleName: CORE};
  static twoWayBindingSet: o.ExternalReference = {name: 'ɵɵtwoWayBindingSet', moduleName: CORE};
  static twoWayListener: o.ExternalReference = {name: 'ɵɵtwoWayListener', moduleName: CORE};

  static declareLet: o.ExternalReference = {name: 'ɵɵdeclareLet', moduleName: CORE};
  static storeLet: o.ExternalReference = {name: 'ɵɵstoreLet', moduleName: CORE};
  static readContextLet: o.ExternalReference = {name: 'ɵɵreadContextLet', moduleName: CORE};

  static attachSourceLocations: o.ExternalReference = {
    name: 'ɵɵattachSourceLocations',
    moduleName: CORE,
  };

  static NgOnChangesFeature: o.ExternalReference = {name: 'ɵɵNgOnChangesFeature', moduleName: CORE};

  static InheritDefinitionFeature: o.ExternalReference = {
    name: 'ɵɵInheritDefinitionFeature',
    moduleName: CORE,
  };

  static CopyDefinitionFeature: o.ExternalReference = {
    name: 'ɵɵCopyDefinitionFeature',
    moduleName: CORE,
  };

  static ProvidersFeature: o.ExternalReference = {name: 'ɵɵProvidersFeature', moduleName: CORE};

  static HostDirectivesFeature: o.ExternalReference = {
    name: 'ɵɵHostDirectivesFeature',
    moduleName: CORE,
  };

  static ExternalStylesFeature: o.ExternalReference = {
    name: 'ɵɵExternalStylesFeature',
    moduleName: CORE,
  };

  static listener: o.ExternalReference = {name: 'ɵɵlistener', moduleName: CORE};

  static getInheritedFactory: o.ExternalReference = {
    name: 'ɵɵgetInheritedFactory',
    moduleName: CORE,
  };

  // sanitization-related functions
  static sanitizeHtml: o.ExternalReference = {name: 'ɵɵsanitizeHtml', moduleName: CORE};
  static sanitizeStyle: o.ExternalReference = {name: 'ɵɵsanitizeStyle', moduleName: CORE};
  static sanitizeResourceUrl: o.ExternalReference = {
    name: 'ɵɵsanitizeResourceUrl',
    moduleName: CORE,
  };
  static sanitizeScript: o.ExternalReference = {name: 'ɵɵsanitizeScript', moduleName: CORE};
  static sanitizeUrl: o.ExternalReference = {name: 'ɵɵsanitizeUrl', moduleName: CORE};
  static sanitizeUrlOrResourceUrl: o.ExternalReference = {
    name: 'ɵɵsanitizeUrlOrResourceUrl',
    moduleName: CORE,
  };
  static trustConstantHtml: o.ExternalReference = {name: 'ɵɵtrustConstantHtml', moduleName: CORE};
  static trustConstantResourceUrl: o.ExternalReference = {
    name: 'ɵɵtrustConstantResourceUrl',
    moduleName: CORE,
  };
  static validateIframeAttribute: o.ExternalReference = {
    name: 'ɵɵvalidateIframeAttribute',
    moduleName: CORE,
  };

  // type-checking
  static InputSignalBrandWriteType = {name: 'ɵINPUT_SIGNAL_BRAND_WRITE_TYPE', moduleName: CORE};
  static UnwrapDirectiveSignalInputs = {name: 'ɵUnwrapDirectiveSignalInputs', moduleName: CORE};
  static unwrapWritableSignal = {name: 'ɵunwrapWritableSignal', moduleName: CORE};
  static assertType = {name: 'ɵassertType', moduleName: CORE};
}
