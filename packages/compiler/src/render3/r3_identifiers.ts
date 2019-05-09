/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as o from '../output/output_ast';

const CORE = '@angular/core';

export class Identifiers {
  /* Methods */
  static NEW_METHOD = 'factory';
  static TRANSFORM_METHOD = 'transform';
  static PATCH_DEPS = 'patchedDeps';

  /* Instructions */
  static namespaceHTML: o.ExternalReference = {name: 'ΔnamespaceHTML', moduleName: CORE};

  static namespaceMathML: o.ExternalReference = {name: 'ΔnamespaceMathML', moduleName: CORE};

  static namespaceSVG: o.ExternalReference = {name: 'ΔnamespaceSVG', moduleName: CORE};

  static element: o.ExternalReference = {name: 'Δelement', moduleName: CORE};

  static elementStart: o.ExternalReference = {name: 'ΔelementStart', moduleName: CORE};

  static elementEnd: o.ExternalReference = {name: 'ΔelementEnd', moduleName: CORE};

  static elementProperty: o.ExternalReference = {name: 'ΔelementProperty', moduleName: CORE};

  static select: o.ExternalReference = {name: 'Δselect', moduleName: CORE};

  static componentHostSyntheticProperty:
      o.ExternalReference = {name: 'ΔcomponentHostSyntheticProperty', moduleName: CORE};

  static componentHostSyntheticListener:
      o.ExternalReference = {name: 'ΔcomponentHostSyntheticListener', moduleName: CORE};

  static elementAttribute: o.ExternalReference = {name: 'ΔelementAttribute', moduleName: CORE};

  static classProp: o.ExternalReference = {name: 'ΔclassProp', moduleName: CORE};

  static elementContainerStart:
      o.ExternalReference = {name: 'ΔelementContainerStart', moduleName: CORE};

  static elementContainerEnd:
      o.ExternalReference = {name: 'ΔelementContainerEnd', moduleName: CORE};

  static styling: o.ExternalReference = {name: 'Δstyling', moduleName: CORE};

  static styleMap: o.ExternalReference = {name: 'ΔstyleMap', moduleName: CORE};

  static classMap: o.ExternalReference = {name: 'ΔclassMap', moduleName: CORE};

  static styleProp: o.ExternalReference = {name: 'ΔstyleProp', moduleName: CORE};

  static stylingApply: o.ExternalReference = {name: 'ΔstylingApply', moduleName: CORE};

  static elementHostAttrs: o.ExternalReference = {name: 'ΔelementHostAttrs', moduleName: CORE};

  static containerCreate: o.ExternalReference = {name: 'Δcontainer', moduleName: CORE};

  static nextContext: o.ExternalReference = {name: 'ΔnextContext', moduleName: CORE};

  static templateCreate: o.ExternalReference = {name: 'Δtemplate', moduleName: CORE};

  static text: o.ExternalReference = {name: 'Δtext', moduleName: CORE};

  static textBinding: o.ExternalReference = {name: 'ΔtextBinding', moduleName: CORE};

  static bind: o.ExternalReference = {name: 'Δbind', moduleName: CORE};

  static enableBindings: o.ExternalReference = {name: 'ΔenableBindings', moduleName: CORE};

  static disableBindings: o.ExternalReference = {name: 'ΔdisableBindings', moduleName: CORE};

  static allocHostVars: o.ExternalReference = {name: 'ΔallocHostVars', moduleName: CORE};

  static getCurrentView: o.ExternalReference = {name: 'ΔgetCurrentView', moduleName: CORE};

  static restoreView: o.ExternalReference = {name: 'ΔrestoreView', moduleName: CORE};

  static interpolation1: o.ExternalReference = {name: 'Δinterpolation1', moduleName: CORE};
  static interpolation2: o.ExternalReference = {name: 'Δinterpolation2', moduleName: CORE};
  static interpolation3: o.ExternalReference = {name: 'Δinterpolation3', moduleName: CORE};
  static interpolation4: o.ExternalReference = {name: 'Δinterpolation4', moduleName: CORE};
  static interpolation5: o.ExternalReference = {name: 'Δinterpolation5', moduleName: CORE};
  static interpolation6: o.ExternalReference = {name: 'Δinterpolation6', moduleName: CORE};
  static interpolation7: o.ExternalReference = {name: 'Δinterpolation7', moduleName: CORE};
  static interpolation8: o.ExternalReference = {name: 'Δinterpolation8', moduleName: CORE};
  static interpolationV: o.ExternalReference = {name: 'ΔinterpolationV', moduleName: CORE};

  static pureFunction0: o.ExternalReference = {name: 'ΔpureFunction0', moduleName: CORE};
  static pureFunction1: o.ExternalReference = {name: 'ΔpureFunction1', moduleName: CORE};
  static pureFunction2: o.ExternalReference = {name: 'ΔpureFunction2', moduleName: CORE};
  static pureFunction3: o.ExternalReference = {name: 'ΔpureFunction3', moduleName: CORE};
  static pureFunction4: o.ExternalReference = {name: 'ΔpureFunction4', moduleName: CORE};
  static pureFunction5: o.ExternalReference = {name: 'ΔpureFunction5', moduleName: CORE};
  static pureFunction6: o.ExternalReference = {name: 'ΔpureFunction6', moduleName: CORE};
  static pureFunction7: o.ExternalReference = {name: 'ΔpureFunction7', moduleName: CORE};
  static pureFunction8: o.ExternalReference = {name: 'ΔpureFunction8', moduleName: CORE};
  static pureFunctionV: o.ExternalReference = {name: 'ΔpureFunctionV', moduleName: CORE};

  static pipeBind1: o.ExternalReference = {name: 'ΔpipeBind1', moduleName: CORE};
  static pipeBind2: o.ExternalReference = {name: 'ΔpipeBind2', moduleName: CORE};
  static pipeBind3: o.ExternalReference = {name: 'ΔpipeBind3', moduleName: CORE};
  static pipeBind4: o.ExternalReference = {name: 'ΔpipeBind4', moduleName: CORE};
  static pipeBindV: o.ExternalReference = {name: 'ΔpipeBindV', moduleName: CORE};

  static property: o.ExternalReference = {name: 'Δproperty', moduleName: CORE};

  static propertyInterpolate:
      o.ExternalReference = {name: 'ΔpropertyInterpolate', moduleName: CORE};
  static propertyInterpolate1:
      o.ExternalReference = {name: 'ΔpropertyInterpolate1', moduleName: CORE};
  static propertyInterpolate2:
      o.ExternalReference = {name: 'ΔpropertyInterpolate2', moduleName: CORE};
  static propertyInterpolate3:
      o.ExternalReference = {name: 'ΔpropertyInterpolate3', moduleName: CORE};
  static propertyInterpolate4:
      o.ExternalReference = {name: 'ΔpropertyInterpolate4', moduleName: CORE};
  static propertyInterpolate5:
      o.ExternalReference = {name: 'ΔpropertyInterpolate5', moduleName: CORE};
  static propertyInterpolate6:
      o.ExternalReference = {name: 'ΔpropertyInterpolate6', moduleName: CORE};
  static propertyInterpolate7:
      o.ExternalReference = {name: 'ΔpropertyInterpolate7', moduleName: CORE};
  static propertyInterpolate8:
      o.ExternalReference = {name: 'ΔpropertyInterpolate8', moduleName: CORE};
  static propertyInterpolateV:
      o.ExternalReference = {name: 'ΔpropertyInterpolateV', moduleName: CORE};

  static i18n: o.ExternalReference = {name: 'Δi18n', moduleName: CORE};
  static i18nAttributes: o.ExternalReference = {name: 'Δi18nAttributes', moduleName: CORE};
  static i18nExp: o.ExternalReference = {name: 'Δi18nExp', moduleName: CORE};
  static i18nStart: o.ExternalReference = {name: 'Δi18nStart', moduleName: CORE};
  static i18nEnd: o.ExternalReference = {name: 'Δi18nEnd', moduleName: CORE};
  static i18nApply: o.ExternalReference = {name: 'Δi18nApply', moduleName: CORE};
  static i18nPostprocess: o.ExternalReference = {name: 'Δi18nPostprocess', moduleName: CORE};
  static i18nLocalize: o.ExternalReference = {name: 'Δi18nLocalize', moduleName: CORE};

  static load: o.ExternalReference = {name: 'Δload', moduleName: CORE};

  static pipe: o.ExternalReference = {name: 'Δpipe', moduleName: CORE};

  static projection: o.ExternalReference = {name: 'Δprojection', moduleName: CORE};
  static projectionDef: o.ExternalReference = {name: 'ΔprojectionDef', moduleName: CORE};

  static reference: o.ExternalReference = {name: 'Δreference', moduleName: CORE};

  static inject: o.ExternalReference = {name: 'Δinject', moduleName: CORE};

  static injectAttribute: o.ExternalReference = {name: 'ΔinjectAttribute', moduleName: CORE};

  static directiveInject: o.ExternalReference = {name: 'ΔdirectiveInject', moduleName: CORE};

  static templateRefExtractor:
      o.ExternalReference = {name: 'ΔtemplateRefExtractor', moduleName: CORE};

  static resolveWindow: o.ExternalReference = {name: 'ΔresolveWindow', moduleName: CORE};
  static resolveDocument: o.ExternalReference = {name: 'ΔresolveDocument', moduleName: CORE};
  static resolveBody: o.ExternalReference = {name: 'ΔresolveBody', moduleName: CORE};

  static defineBase: o.ExternalReference = {name: 'ΔdefineBase', moduleName: CORE};

  static BaseDef: o.ExternalReference = {
    name: 'ΔBaseDef',
    moduleName: CORE,
  };

  static defineComponent: o.ExternalReference = {name: 'ΔdefineComponent', moduleName: CORE};

  static setComponentScope: o.ExternalReference = {name: 'ΔsetComponentScope', moduleName: CORE};

  static ComponentDefWithMeta: o.ExternalReference = {
    name: 'ΔComponentDefWithMeta',
    moduleName: CORE,
  };

  static defineDirective: o.ExternalReference = {
    name: 'ΔdefineDirective',
    moduleName: CORE,
  };

  static DirectiveDefWithMeta: o.ExternalReference = {
    name: 'ΔDirectiveDefWithMeta',
    moduleName: CORE,
  };

  static InjectorDef: o.ExternalReference = {
    name: 'ΔInjectorDef',
    moduleName: CORE,
  };

  static defineInjector: o.ExternalReference = {
    name: 'ΔdefineInjector',
    moduleName: CORE,
  };

  static NgModuleDefWithMeta: o.ExternalReference = {
    name: 'ΔNgModuleDefWithMeta',
    moduleName: CORE,
  };

  static defineNgModule: o.ExternalReference = {name: 'ΔdefineNgModule', moduleName: CORE};
  static setNgModuleScope: o.ExternalReference = {name: 'ΔsetNgModuleScope', moduleName: CORE};

  static PipeDefWithMeta: o.ExternalReference = {name: 'ΔPipeDefWithMeta', moduleName: CORE};

  static definePipe: o.ExternalReference = {name: 'ΔdefinePipe', moduleName: CORE};

  static queryRefresh: o.ExternalReference = {name: 'ΔqueryRefresh', moduleName: CORE};
  static viewQuery: o.ExternalReference = {name: 'ΔviewQuery', moduleName: CORE};
  static staticViewQuery: o.ExternalReference = {name: 'ΔstaticViewQuery', moduleName: CORE};
  static staticContentQuery: o.ExternalReference = {name: 'ΔstaticContentQuery', moduleName: CORE};
  static loadViewQuery: o.ExternalReference = {name: 'ΔloadViewQuery', moduleName: CORE};
  static contentQuery: o.ExternalReference = {name: 'ΔcontentQuery', moduleName: CORE};
  static loadContentQuery: o.ExternalReference = {name: 'ΔloadContentQuery', moduleName: CORE};

  static NgOnChangesFeature: o.ExternalReference = {name: 'ΔNgOnChangesFeature', moduleName: CORE};

  static InheritDefinitionFeature:
      o.ExternalReference = {name: 'ΔInheritDefinitionFeature', moduleName: CORE};

  static ProvidersFeature: o.ExternalReference = {name: 'ΔProvidersFeature', moduleName: CORE};

  static listener: o.ExternalReference = {name: 'Δlistener', moduleName: CORE};

  static getFactoryOf: o.ExternalReference = {
    name: 'ΔgetFactoryOf',
    moduleName: CORE,
  };

  static getInheritedFactory: o.ExternalReference = {
    name: 'ΔgetInheritedFactory',
    moduleName: CORE,
  };

  // sanitization-related functions
  static sanitizeHtml: o.ExternalReference = {name: 'ΔsanitizeHtml', moduleName: CORE};
  static sanitizeStyle: o.ExternalReference = {name: 'ΔsanitizeStyle', moduleName: CORE};
  static defaultStyleSanitizer:
      o.ExternalReference = {name: 'ΔdefaultStyleSanitizer', moduleName: CORE};
  static sanitizeResourceUrl:
      o.ExternalReference = {name: 'ΔsanitizeResourceUrl', moduleName: CORE};
  static sanitizeScript: o.ExternalReference = {name: 'ΔsanitizeScript', moduleName: CORE};
  static sanitizeUrl: o.ExternalReference = {name: 'ΔsanitizeUrl', moduleName: CORE};
  static sanitizeUrlOrResourceUrl:
      o.ExternalReference = {name: 'ΔsanitizeUrlOrResourceUrl', moduleName: CORE};
}
