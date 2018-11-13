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
  static namespaceHTML: o.ExternalReference = {name: 'ɵnamespaceHTML', moduleName: CORE};

  static namespaceMathML: o.ExternalReference = {name: 'ɵnamespaceMathML', moduleName: CORE};

  static namespaceSVG: o.ExternalReference = {name: 'ɵnamespaceSVG', moduleName: CORE};

  static element: o.ExternalReference = {name: 'ɵelement', moduleName: CORE};

  static elementStart: o.ExternalReference = {name: 'ɵelementStart', moduleName: CORE};

  static elementEnd: o.ExternalReference = {name: 'ɵelementEnd', moduleName: CORE};

  static elementProperty: o.ExternalReference = {name: 'ɵelementProperty', moduleName: CORE};

  static elementAttribute: o.ExternalReference = {name: 'ɵelementAttribute', moduleName: CORE};

  static elementClassProp: o.ExternalReference = {name: 'ɵelementClassProp', moduleName: CORE};

  static elementContainerStart: o.ExternalReference = {name: 'ɵEC', moduleName: CORE};

  static elementContainerEnd: o.ExternalReference = {name: 'ɵeC', moduleName: CORE};

  static elementStyling: o.ExternalReference = {name: 'ɵelementStyling', moduleName: CORE};

  static elementStylingMap: o.ExternalReference = {name: 'ɵelementStylingMap', moduleName: CORE};

  static elementStyleProp: o.ExternalReference = {name: 'ɵelementStyleProp', moduleName: CORE};

  static elementStylingApply:
      o.ExternalReference = {name: 'ɵelementStylingApply', moduleName: CORE};

  static containerCreate: o.ExternalReference = {name: 'ɵcontainer', moduleName: CORE};

  static nextContext: o.ExternalReference = {name: 'ɵnextContext', moduleName: CORE};

  static templateCreate: o.ExternalReference = {name: 'ɵtemplate', moduleName: CORE};

  static text: o.ExternalReference = {name: 'ɵtext', moduleName: CORE};

  static textBinding: o.ExternalReference = {name: 'ɵtextBinding', moduleName: CORE};

  static bind: o.ExternalReference = {name: 'ɵbind', moduleName: CORE};

  static enableBindings: o.ExternalReference = {name: 'ɵenableBindings', moduleName: CORE};

  static disableBindings: o.ExternalReference = {name: 'ɵdisableBindings', moduleName: CORE};

  static getCurrentView: o.ExternalReference = {name: 'ɵgetCurrentView', moduleName: CORE};

  static restoreView: o.ExternalReference = {name: 'ɵrestoreView', moduleName: CORE};

  static interpolation1: o.ExternalReference = {name: 'ɵinterpolation1', moduleName: CORE};
  static interpolation2: o.ExternalReference = {name: 'ɵinterpolation2', moduleName: CORE};
  static interpolation3: o.ExternalReference = {name: 'ɵinterpolation3', moduleName: CORE};
  static interpolation4: o.ExternalReference = {name: 'ɵinterpolation4', moduleName: CORE};
  static interpolation5: o.ExternalReference = {name: 'ɵinterpolation5', moduleName: CORE};
  static interpolation6: o.ExternalReference = {name: 'ɵinterpolation6', moduleName: CORE};
  static interpolation7: o.ExternalReference = {name: 'ɵinterpolation7', moduleName: CORE};
  static interpolation8: o.ExternalReference = {name: 'ɵinterpolation8', moduleName: CORE};
  static interpolationV: o.ExternalReference = {name: 'ɵinterpolationV', moduleName: CORE};

  static pureFunction0: o.ExternalReference = {name: 'ɵpureFunction0', moduleName: CORE};
  static pureFunction1: o.ExternalReference = {name: 'ɵpureFunction1', moduleName: CORE};
  static pureFunction2: o.ExternalReference = {name: 'ɵpureFunction2', moduleName: CORE};
  static pureFunction3: o.ExternalReference = {name: 'ɵpureFunction3', moduleName: CORE};
  static pureFunction4: o.ExternalReference = {name: 'ɵpureFunction4', moduleName: CORE};
  static pureFunction5: o.ExternalReference = {name: 'ɵpureFunction5', moduleName: CORE};
  static pureFunction6: o.ExternalReference = {name: 'ɵpureFunction6', moduleName: CORE};
  static pureFunction7: o.ExternalReference = {name: 'ɵpureFunction7', moduleName: CORE};
  static pureFunction8: o.ExternalReference = {name: 'ɵpureFunction8', moduleName: CORE};
  static pureFunctionV: o.ExternalReference = {name: 'ɵpureFunctionV', moduleName: CORE};

  static pipeBind1: o.ExternalReference = {name: 'ɵpipeBind1', moduleName: CORE};
  static pipeBind2: o.ExternalReference = {name: 'ɵpipeBind2', moduleName: CORE};
  static pipeBind3: o.ExternalReference = {name: 'ɵpipeBind3', moduleName: CORE};
  static pipeBind4: o.ExternalReference = {name: 'ɵpipeBind4', moduleName: CORE};
  static pipeBindV: o.ExternalReference = {name: 'ɵpipeBindV', moduleName: CORE};

  static i18nAttributes: o.ExternalReference = {name: 'ɵi18nAttributes', moduleName: CORE};
  static i18nExp: o.ExternalReference = {name: 'ɵi18nExp', moduleName: CORE};
  static i18nStart: o.ExternalReference = {name: 'ɵi18nStart', moduleName: CORE};
  static i18nEnd: o.ExternalReference = {name: 'ɵi18nEnd', moduleName: CORE};
  static i18nApply: o.ExternalReference = {name: 'ɵi18nApply', moduleName: CORE};

  static load: o.ExternalReference = {name: 'ɵload', moduleName: CORE};
  static loadQueryList: o.ExternalReference = {name: 'ɵloadQueryList', moduleName: CORE};

  static pipe: o.ExternalReference = {name: 'ɵpipe', moduleName: CORE};

  static projection: o.ExternalReference = {name: 'ɵprojection', moduleName: CORE};
  static projectionDef: o.ExternalReference = {name: 'ɵprojectionDef', moduleName: CORE};

  static reference: o.ExternalReference = {name: 'ɵreference', moduleName: CORE};

  static inject: o.ExternalReference = {name: 'inject', moduleName: CORE};

  static injectAttribute: o.ExternalReference = {name: 'ɵinjectAttribute', moduleName: CORE};

  static directiveInject: o.ExternalReference = {name: 'ɵdirectiveInject', moduleName: CORE};

  static templateRefExtractor:
      o.ExternalReference = {name: 'ɵtemplateRefExtractor', moduleName: CORE};

  static defineBase: o.ExternalReference = {name: 'ɵdefineBase', moduleName: CORE};

  static BaseDef: o.ExternalReference = {
    name: 'ɵBaseDef',
    moduleName: CORE,
  };

  static defineComponent: o.ExternalReference = {name: 'ɵdefineComponent', moduleName: CORE};

  static ComponentDefWithMeta: o.ExternalReference = {
    name: 'ɵComponentDefWithMeta',
    moduleName: CORE,
  };

  static defineDirective: o.ExternalReference = {
    name: 'ɵdefineDirective',
    moduleName: CORE,
  };

  static DirectiveDefWithMeta: o.ExternalReference = {
    name: 'ɵDirectiveDefWithMeta',
    moduleName: CORE,
  };

  static InjectorDef: o.ExternalReference = {
    name: 'ɵInjectorDef',
    moduleName: CORE,
  };

  static defineInjector: o.ExternalReference = {
    name: 'defineInjector',
    moduleName: CORE,
  };

  static NgModuleDefWithMeta: o.ExternalReference = {
    name: 'ɵNgModuleDefWithMeta',
    moduleName: CORE,
  };

  static defineNgModule: o.ExternalReference = {name: 'ɵdefineNgModule', moduleName: CORE};

  static PipeDefWithMeta: o.ExternalReference = {name: 'ɵPipeDefWithMeta', moduleName: CORE};

  static definePipe: o.ExternalReference = {name: 'ɵdefinePipe', moduleName: CORE};

  static query: o.ExternalReference = {name: 'ɵquery', moduleName: CORE};
  static queryRefresh: o.ExternalReference = {name: 'ɵqueryRefresh', moduleName: CORE};
  static registerContentQuery:
      o.ExternalReference = {name: 'ɵregisterContentQuery', moduleName: CORE};

  static NgOnChangesFeature: o.ExternalReference = {name: 'ɵNgOnChangesFeature', moduleName: CORE};

  static InheritDefinitionFeature:
      o.ExternalReference = {name: 'ɵInheritDefinitionFeature', moduleName: CORE};

  static ProvidersFeature: o.ExternalReference = {name: 'ɵProvidersFeature', moduleName: CORE};

  static listener: o.ExternalReference = {name: 'ɵlistener', moduleName: CORE};

  static getFactoryOf: o.ExternalReference = {
    name: 'ɵgetFactoryOf',
    moduleName: CORE,
  };

  static getInheritedFactory: o.ExternalReference = {
    name: 'ɵgetInheritedFactory',
    moduleName: CORE,
  };

  // sanitization-related functions
  static sanitizeHtml: o.ExternalReference = {name: 'ɵsanitizeHtml', moduleName: CORE};
  static sanitizeStyle: o.ExternalReference = {name: 'ɵsanitizeStyle', moduleName: CORE};
  static defaultStyleSanitizer:
      o.ExternalReference = {name: 'ɵdefaultStyleSanitizer', moduleName: CORE};
  static sanitizeResourceUrl:
      o.ExternalReference = {name: 'ɵsanitizeResourceUrl', moduleName: CORE};
  static sanitizeScript: o.ExternalReference = {name: 'ɵsanitizeScript', moduleName: CORE};
  static sanitizeUrl: o.ExternalReference = {name: 'ɵsanitizeUrl', moduleName: CORE};
}
