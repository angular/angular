/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
const CORE = '@angular/core';
export class Identifiers {
  /* Methods */
  static NEW_METHOD = 'factory';
  static TRANSFORM_METHOD = 'transform';
  static PATCH_DEPS = 'patchedDeps';
  static core = {name: null, moduleName: CORE};
  /* Instructions */
  static namespaceHTML = {name: 'ɵɵnamespaceHTML', moduleName: CORE};
  static namespaceMathML = {name: 'ɵɵnamespaceMathML', moduleName: CORE};
  static namespaceSVG = {name: 'ɵɵnamespaceSVG', moduleName: CORE};
  static element = {name: 'ɵɵelement', moduleName: CORE};
  static elementStart = {name: 'ɵɵelementStart', moduleName: CORE};
  static elementEnd = {name: 'ɵɵelementEnd', moduleName: CORE};
  static domElement = {name: 'ɵɵdomElement', moduleName: CORE};
  static domElementStart = {name: 'ɵɵdomElementStart', moduleName: CORE};
  static domElementEnd = {name: 'ɵɵdomElementEnd', moduleName: CORE};
  static domElementContainer = {
    name: 'ɵɵdomElementContainer',
    moduleName: CORE,
  };
  static domElementContainerStart = {
    name: 'ɵɵdomElementContainerStart',
    moduleName: CORE,
  };
  static domElementContainerEnd = {
    name: 'ɵɵdomElementContainerEnd',
    moduleName: CORE,
  };
  static domTemplate = {name: 'ɵɵdomTemplate', moduleName: CORE};
  static domListener = {name: 'ɵɵdomListener', moduleName: CORE};
  static advance = {name: 'ɵɵadvance', moduleName: CORE};
  static syntheticHostProperty = {
    name: 'ɵɵsyntheticHostProperty',
    moduleName: CORE,
  };
  static syntheticHostListener = {
    name: 'ɵɵsyntheticHostListener',
    moduleName: CORE,
  };
  static attribute = {name: 'ɵɵattribute', moduleName: CORE};
  static classProp = {name: 'ɵɵclassProp', moduleName: CORE};
  static elementContainerStart = {
    name: 'ɵɵelementContainerStart',
    moduleName: CORE,
  };
  static elementContainerEnd = {
    name: 'ɵɵelementContainerEnd',
    moduleName: CORE,
  };
  static elementContainer = {name: 'ɵɵelementContainer', moduleName: CORE};
  static styleMap = {name: 'ɵɵstyleMap', moduleName: CORE};
  static classMap = {name: 'ɵɵclassMap', moduleName: CORE};
  static styleProp = {name: 'ɵɵstyleProp', moduleName: CORE};
  static interpolate = {
    name: 'ɵɵinterpolate',
    moduleName: CORE,
  };
  static interpolate1 = {
    name: 'ɵɵinterpolate1',
    moduleName: CORE,
  };
  static interpolate2 = {
    name: 'ɵɵinterpolate2',
    moduleName: CORE,
  };
  static interpolate3 = {
    name: 'ɵɵinterpolate3',
    moduleName: CORE,
  };
  static interpolate4 = {
    name: 'ɵɵinterpolate4',
    moduleName: CORE,
  };
  static interpolate5 = {
    name: 'ɵɵinterpolate5',
    moduleName: CORE,
  };
  static interpolate6 = {
    name: 'ɵɵinterpolate6',
    moduleName: CORE,
  };
  static interpolate7 = {
    name: 'ɵɵinterpolate7',
    moduleName: CORE,
  };
  static interpolate8 = {
    name: 'ɵɵinterpolate8',
    moduleName: CORE,
  };
  static interpolateV = {
    name: 'ɵɵinterpolateV',
    moduleName: CORE,
  };
  static nextContext = {name: 'ɵɵnextContext', moduleName: CORE};
  static resetView = {name: 'ɵɵresetView', moduleName: CORE};
  static templateCreate = {name: 'ɵɵtemplate', moduleName: CORE};
  static defer = {name: 'ɵɵdefer', moduleName: CORE};
  static deferWhen = {name: 'ɵɵdeferWhen', moduleName: CORE};
  static deferOnIdle = {name: 'ɵɵdeferOnIdle', moduleName: CORE};
  static deferOnImmediate = {name: 'ɵɵdeferOnImmediate', moduleName: CORE};
  static deferOnTimer = {name: 'ɵɵdeferOnTimer', moduleName: CORE};
  static deferOnHover = {name: 'ɵɵdeferOnHover', moduleName: CORE};
  static deferOnInteraction = {name: 'ɵɵdeferOnInteraction', moduleName: CORE};
  static deferOnViewport = {name: 'ɵɵdeferOnViewport', moduleName: CORE};
  static deferPrefetchWhen = {name: 'ɵɵdeferPrefetchWhen', moduleName: CORE};
  static deferPrefetchOnIdle = {
    name: 'ɵɵdeferPrefetchOnIdle',
    moduleName: CORE,
  };
  static deferPrefetchOnImmediate = {
    name: 'ɵɵdeferPrefetchOnImmediate',
    moduleName: CORE,
  };
  static deferPrefetchOnTimer = {
    name: 'ɵɵdeferPrefetchOnTimer',
    moduleName: CORE,
  };
  static deferPrefetchOnHover = {
    name: 'ɵɵdeferPrefetchOnHover',
    moduleName: CORE,
  };
  static deferPrefetchOnInteraction = {
    name: 'ɵɵdeferPrefetchOnInteraction',
    moduleName: CORE,
  };
  static deferPrefetchOnViewport = {
    name: 'ɵɵdeferPrefetchOnViewport',
    moduleName: CORE,
  };
  static deferHydrateWhen = {name: 'ɵɵdeferHydrateWhen', moduleName: CORE};
  static deferHydrateNever = {name: 'ɵɵdeferHydrateNever', moduleName: CORE};
  static deferHydrateOnIdle = {
    name: 'ɵɵdeferHydrateOnIdle',
    moduleName: CORE,
  };
  static deferHydrateOnImmediate = {
    name: 'ɵɵdeferHydrateOnImmediate',
    moduleName: CORE,
  };
  static deferHydrateOnTimer = {
    name: 'ɵɵdeferHydrateOnTimer',
    moduleName: CORE,
  };
  static deferHydrateOnHover = {
    name: 'ɵɵdeferHydrateOnHover',
    moduleName: CORE,
  };
  static deferHydrateOnInteraction = {
    name: 'ɵɵdeferHydrateOnInteraction',
    moduleName: CORE,
  };
  static deferHydrateOnViewport = {
    name: 'ɵɵdeferHydrateOnViewport',
    moduleName: CORE,
  };
  static deferEnableTimerScheduling = {
    name: 'ɵɵdeferEnableTimerScheduling',
    moduleName: CORE,
  };
  static conditionalCreate = {name: 'ɵɵconditionalCreate', moduleName: CORE};
  static conditionalBranchCreate = {
    name: 'ɵɵconditionalBranchCreate',
    moduleName: CORE,
  };
  static conditional = {name: 'ɵɵconditional', moduleName: CORE};
  static repeater = {name: 'ɵɵrepeater', moduleName: CORE};
  static repeaterCreate = {name: 'ɵɵrepeaterCreate', moduleName: CORE};
  static repeaterTrackByIndex = {
    name: 'ɵɵrepeaterTrackByIndex',
    moduleName: CORE,
  };
  static repeaterTrackByIdentity = {
    name: 'ɵɵrepeaterTrackByIdentity',
    moduleName: CORE,
  };
  static componentInstance = {name: 'ɵɵcomponentInstance', moduleName: CORE};
  static text = {name: 'ɵɵtext', moduleName: CORE};
  static enableBindings = {name: 'ɵɵenableBindings', moduleName: CORE};
  static disableBindings = {name: 'ɵɵdisableBindings', moduleName: CORE};
  static getCurrentView = {name: 'ɵɵgetCurrentView', moduleName: CORE};
  static textInterpolate = {name: 'ɵɵtextInterpolate', moduleName: CORE};
  static textInterpolate1 = {name: 'ɵɵtextInterpolate1', moduleName: CORE};
  static textInterpolate2 = {name: 'ɵɵtextInterpolate2', moduleName: CORE};
  static textInterpolate3 = {name: 'ɵɵtextInterpolate3', moduleName: CORE};
  static textInterpolate4 = {name: 'ɵɵtextInterpolate4', moduleName: CORE};
  static textInterpolate5 = {name: 'ɵɵtextInterpolate5', moduleName: CORE};
  static textInterpolate6 = {name: 'ɵɵtextInterpolate6', moduleName: CORE};
  static textInterpolate7 = {name: 'ɵɵtextInterpolate7', moduleName: CORE};
  static textInterpolate8 = {name: 'ɵɵtextInterpolate8', moduleName: CORE};
  static textInterpolateV = {name: 'ɵɵtextInterpolateV', moduleName: CORE};
  static restoreView = {name: 'ɵɵrestoreView', moduleName: CORE};
  static pureFunction0 = {name: 'ɵɵpureFunction0', moduleName: CORE};
  static pureFunction1 = {name: 'ɵɵpureFunction1', moduleName: CORE};
  static pureFunction2 = {name: 'ɵɵpureFunction2', moduleName: CORE};
  static pureFunction3 = {name: 'ɵɵpureFunction3', moduleName: CORE};
  static pureFunction4 = {name: 'ɵɵpureFunction4', moduleName: CORE};
  static pureFunction5 = {name: 'ɵɵpureFunction5', moduleName: CORE};
  static pureFunction6 = {name: 'ɵɵpureFunction6', moduleName: CORE};
  static pureFunction7 = {name: 'ɵɵpureFunction7', moduleName: CORE};
  static pureFunction8 = {name: 'ɵɵpureFunction8', moduleName: CORE};
  static pureFunctionV = {name: 'ɵɵpureFunctionV', moduleName: CORE};
  static pipeBind1 = {name: 'ɵɵpipeBind1', moduleName: CORE};
  static pipeBind2 = {name: 'ɵɵpipeBind2', moduleName: CORE};
  static pipeBind3 = {name: 'ɵɵpipeBind3', moduleName: CORE};
  static pipeBind4 = {name: 'ɵɵpipeBind4', moduleName: CORE};
  static pipeBindV = {name: 'ɵɵpipeBindV', moduleName: CORE};
  static domProperty = {name: 'ɵɵdomProperty', moduleName: CORE};
  static ariaProperty = {name: 'ɵɵariaProperty', moduleName: CORE};
  static property = {name: 'ɵɵproperty', moduleName: CORE};
  static animationEnterListener = {
    name: 'ɵɵanimateEnterListener',
    moduleName: CORE,
  };
  static animationLeaveListener = {
    name: 'ɵɵanimateLeaveListener',
    moduleName: CORE,
  };
  static animationEnter = {name: 'ɵɵanimateEnter', moduleName: CORE};
  static animationLeave = {name: 'ɵɵanimateLeave', moduleName: CORE};
  static i18n = {name: 'ɵɵi18n', moduleName: CORE};
  static i18nAttributes = {name: 'ɵɵi18nAttributes', moduleName: CORE};
  static i18nExp = {name: 'ɵɵi18nExp', moduleName: CORE};
  static i18nStart = {name: 'ɵɵi18nStart', moduleName: CORE};
  static i18nEnd = {name: 'ɵɵi18nEnd', moduleName: CORE};
  static i18nApply = {name: 'ɵɵi18nApply', moduleName: CORE};
  static i18nPostprocess = {name: 'ɵɵi18nPostprocess', moduleName: CORE};
  static pipe = {name: 'ɵɵpipe', moduleName: CORE};
  static projection = {name: 'ɵɵprojection', moduleName: CORE};
  static projectionDef = {name: 'ɵɵprojectionDef', moduleName: CORE};
  static reference = {name: 'ɵɵreference', moduleName: CORE};
  static inject = {name: 'ɵɵinject', moduleName: CORE};
  static injectAttribute = {name: 'ɵɵinjectAttribute', moduleName: CORE};
  static directiveInject = {name: 'ɵɵdirectiveInject', moduleName: CORE};
  static invalidFactory = {name: 'ɵɵinvalidFactory', moduleName: CORE};
  static invalidFactoryDep = {name: 'ɵɵinvalidFactoryDep', moduleName: CORE};
  static templateRefExtractor = {
    name: 'ɵɵtemplateRefExtractor',
    moduleName: CORE,
  };
  static forwardRef = {name: 'forwardRef', moduleName: CORE};
  static resolveForwardRef = {name: 'resolveForwardRef', moduleName: CORE};
  static replaceMetadata = {name: 'ɵɵreplaceMetadata', moduleName: CORE};
  static getReplaceMetadataURL = {
    name: 'ɵɵgetReplaceMetadataURL',
    moduleName: CORE,
  };
  static ɵɵdefineInjectable = {name: 'ɵɵdefineInjectable', moduleName: CORE};
  static declareInjectable = {name: 'ɵɵngDeclareInjectable', moduleName: CORE};
  static InjectableDeclaration = {
    name: 'ɵɵInjectableDeclaration',
    moduleName: CORE,
  };
  static resolveWindow = {name: 'ɵɵresolveWindow', moduleName: CORE};
  static resolveDocument = {name: 'ɵɵresolveDocument', moduleName: CORE};
  static resolveBody = {name: 'ɵɵresolveBody', moduleName: CORE};
  static getComponentDepsFactory = {
    name: 'ɵɵgetComponentDepsFactory',
    moduleName: CORE,
  };
  static defineComponent = {name: 'ɵɵdefineComponent', moduleName: CORE};
  static declareComponent = {name: 'ɵɵngDeclareComponent', moduleName: CORE};
  static setComponentScope = {name: 'ɵɵsetComponentScope', moduleName: CORE};
  static ChangeDetectionStrategy = {
    name: 'ChangeDetectionStrategy',
    moduleName: CORE,
  };
  static ViewEncapsulation = {
    name: 'ViewEncapsulation',
    moduleName: CORE,
  };
  static ComponentDeclaration = {
    name: 'ɵɵComponentDeclaration',
    moduleName: CORE,
  };
  static FactoryDeclaration = {
    name: 'ɵɵFactoryDeclaration',
    moduleName: CORE,
  };
  static declareFactory = {name: 'ɵɵngDeclareFactory', moduleName: CORE};
  static FactoryTarget = {name: 'ɵɵFactoryTarget', moduleName: CORE};
  static defineDirective = {name: 'ɵɵdefineDirective', moduleName: CORE};
  static declareDirective = {name: 'ɵɵngDeclareDirective', moduleName: CORE};
  static DirectiveDeclaration = {
    name: 'ɵɵDirectiveDeclaration',
    moduleName: CORE,
  };
  static InjectorDef = {name: 'ɵɵInjectorDef', moduleName: CORE};
  static InjectorDeclaration = {
    name: 'ɵɵInjectorDeclaration',
    moduleName: CORE,
  };
  static defineInjector = {name: 'ɵɵdefineInjector', moduleName: CORE};
  static declareInjector = {name: 'ɵɵngDeclareInjector', moduleName: CORE};
  static NgModuleDeclaration = {
    name: 'ɵɵNgModuleDeclaration',
    moduleName: CORE,
  };
  static ModuleWithProviders = {
    name: 'ModuleWithProviders',
    moduleName: CORE,
  };
  static defineNgModule = {name: 'ɵɵdefineNgModule', moduleName: CORE};
  static declareNgModule = {name: 'ɵɵngDeclareNgModule', moduleName: CORE};
  static setNgModuleScope = {name: 'ɵɵsetNgModuleScope', moduleName: CORE};
  static registerNgModuleType = {
    name: 'ɵɵregisterNgModuleType',
    moduleName: CORE,
  };
  static PipeDeclaration = {name: 'ɵɵPipeDeclaration', moduleName: CORE};
  static definePipe = {name: 'ɵɵdefinePipe', moduleName: CORE};
  static declarePipe = {name: 'ɵɵngDeclarePipe', moduleName: CORE};
  static declareClassMetadata = {
    name: 'ɵɵngDeclareClassMetadata',
    moduleName: CORE,
  };
  static declareClassMetadataAsync = {
    name: 'ɵɵngDeclareClassMetadataAsync',
    moduleName: CORE,
  };
  static setClassMetadata = {name: 'ɵsetClassMetadata', moduleName: CORE};
  static setClassMetadataAsync = {
    name: 'ɵsetClassMetadataAsync',
    moduleName: CORE,
  };
  static setClassDebugInfo = {name: 'ɵsetClassDebugInfo', moduleName: CORE};
  static queryRefresh = {name: 'ɵɵqueryRefresh', moduleName: CORE};
  static viewQuery = {name: 'ɵɵviewQuery', moduleName: CORE};
  static loadQuery = {name: 'ɵɵloadQuery', moduleName: CORE};
  static contentQuery = {name: 'ɵɵcontentQuery', moduleName: CORE};
  // Signal queries
  static viewQuerySignal = {name: 'ɵɵviewQuerySignal', moduleName: CORE};
  static contentQuerySignal = {name: 'ɵɵcontentQuerySignal', moduleName: CORE};
  static queryAdvance = {name: 'ɵɵqueryAdvance', moduleName: CORE};
  // Two-way bindings
  static twoWayProperty = {name: 'ɵɵtwoWayProperty', moduleName: CORE};
  static twoWayBindingSet = {name: 'ɵɵtwoWayBindingSet', moduleName: CORE};
  static twoWayListener = {name: 'ɵɵtwoWayListener', moduleName: CORE};
  static declareLet = {name: 'ɵɵdeclareLet', moduleName: CORE};
  static storeLet = {name: 'ɵɵstoreLet', moduleName: CORE};
  static readContextLet = {name: 'ɵɵreadContextLet', moduleName: CORE};
  static attachSourceLocations = {
    name: 'ɵɵattachSourceLocations',
    moduleName: CORE,
  };
  static NgOnChangesFeature = {name: 'ɵɵNgOnChangesFeature', moduleName: CORE};
  static InheritDefinitionFeature = {
    name: 'ɵɵInheritDefinitionFeature',
    moduleName: CORE,
  };
  static CopyDefinitionFeature = {
    name: 'ɵɵCopyDefinitionFeature',
    moduleName: CORE,
  };
  static ProvidersFeature = {name: 'ɵɵProvidersFeature', moduleName: CORE};
  static HostDirectivesFeature = {
    name: 'ɵɵHostDirectivesFeature',
    moduleName: CORE,
  };
  static ExternalStylesFeature = {
    name: 'ɵɵExternalStylesFeature',
    moduleName: CORE,
  };
  static listener = {name: 'ɵɵlistener', moduleName: CORE};
  static getInheritedFactory = {
    name: 'ɵɵgetInheritedFactory',
    moduleName: CORE,
  };
  // sanitization-related functions
  static sanitizeHtml = {name: 'ɵɵsanitizeHtml', moduleName: CORE};
  static sanitizeStyle = {name: 'ɵɵsanitizeStyle', moduleName: CORE};
  static sanitizeResourceUrl = {
    name: 'ɵɵsanitizeResourceUrl',
    moduleName: CORE,
  };
  static sanitizeScript = {name: 'ɵɵsanitizeScript', moduleName: CORE};
  static sanitizeUrl = {name: 'ɵɵsanitizeUrl', moduleName: CORE};
  static sanitizeUrlOrResourceUrl = {
    name: 'ɵɵsanitizeUrlOrResourceUrl',
    moduleName: CORE,
  };
  static trustConstantHtml = {name: 'ɵɵtrustConstantHtml', moduleName: CORE};
  static trustConstantResourceUrl = {
    name: 'ɵɵtrustConstantResourceUrl',
    moduleName: CORE,
  };
  static validateIframeAttribute = {
    name: 'ɵɵvalidateIframeAttribute',
    moduleName: CORE,
  };
  // type-checking
  static InputSignalBrandWriteType = {name: 'ɵINPUT_SIGNAL_BRAND_WRITE_TYPE', moduleName: CORE};
  static UnwrapDirectiveSignalInputs = {name: 'ɵUnwrapDirectiveSignalInputs', moduleName: CORE};
  static unwrapWritableSignal = {name: 'ɵunwrapWritableSignal', moduleName: CORE};
  static assertType = {name: 'ɵassertType', moduleName: CORE};
}
//# sourceMappingURL=r3_identifiers.js.map
