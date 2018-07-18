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
  static namespaceHTML: o.ExternalReference = {name: 'ɵNH', moduleName: CORE};

  static namespaceMathML: o.ExternalReference = {name: 'ɵNM', moduleName: CORE};

  static namespaceSVG: o.ExternalReference = {name: 'ɵNS', moduleName: CORE};

  static element: o.ExternalReference = {name: 'ɵEe', moduleName: CORE};

  static elementStart: o.ExternalReference = {name: 'ɵE', moduleName: CORE};

  static elementEnd: o.ExternalReference = {name: 'ɵe', moduleName: CORE};

  static elementProperty: o.ExternalReference = {name: 'ɵp', moduleName: CORE};

  static elementAttribute: o.ExternalReference = {name: 'ɵa', moduleName: CORE};

  static elementClassProp: o.ExternalReference = {name: 'ɵcp', moduleName: CORE};

  static elementStyling: o.ExternalReference = {name: 'ɵs', moduleName: CORE};

  static elementStylingMap: o.ExternalReference = {name: 'ɵsm', moduleName: CORE};

  static elementStyleProp: o.ExternalReference = {name: 'ɵsp', moduleName: CORE};

  static elementStylingApply: o.ExternalReference = {name: 'ɵsa', moduleName: CORE};

  static containerCreate: o.ExternalReference = {name: 'ɵC', moduleName: CORE};

  static text: o.ExternalReference = {name: 'ɵT', moduleName: CORE};

  static textBinding: o.ExternalReference = {name: 'ɵt', moduleName: CORE};

  static bind: o.ExternalReference = {name: 'ɵb', moduleName: CORE};

  static interpolation1: o.ExternalReference = {name: 'ɵi1', moduleName: CORE};
  static interpolation2: o.ExternalReference = {name: 'ɵi2', moduleName: CORE};
  static interpolation3: o.ExternalReference = {name: 'ɵi3', moduleName: CORE};
  static interpolation4: o.ExternalReference = {name: 'ɵi4', moduleName: CORE};
  static interpolation5: o.ExternalReference = {name: 'ɵi5', moduleName: CORE};
  static interpolation6: o.ExternalReference = {name: 'ɵi6', moduleName: CORE};
  static interpolation7: o.ExternalReference = {name: 'ɵi7', moduleName: CORE};
  static interpolation8: o.ExternalReference = {name: 'ɵi8', moduleName: CORE};
  static interpolationV: o.ExternalReference = {name: 'ɵiV', moduleName: CORE};

  static pureFunction0: o.ExternalReference = {name: 'ɵf0', moduleName: CORE};
  static pureFunction1: o.ExternalReference = {name: 'ɵf1', moduleName: CORE};
  static pureFunction2: o.ExternalReference = {name: 'ɵf2', moduleName: CORE};
  static pureFunction3: o.ExternalReference = {name: 'ɵf3', moduleName: CORE};
  static pureFunction4: o.ExternalReference = {name: 'ɵf4', moduleName: CORE};
  static pureFunction5: o.ExternalReference = {name: 'ɵf5', moduleName: CORE};
  static pureFunction6: o.ExternalReference = {name: 'ɵf6', moduleName: CORE};
  static pureFunction7: o.ExternalReference = {name: 'ɵf7', moduleName: CORE};
  static pureFunction8: o.ExternalReference = {name: 'ɵf8', moduleName: CORE};
  static pureFunctionV: o.ExternalReference = {name: 'ɵfV', moduleName: CORE};

  static pipeBind1: o.ExternalReference = {name: 'ɵpb1', moduleName: CORE};
  static pipeBind2: o.ExternalReference = {name: 'ɵpb2', moduleName: CORE};
  static pipeBind3: o.ExternalReference = {name: 'ɵpb3', moduleName: CORE};
  static pipeBind4: o.ExternalReference = {name: 'ɵpb4', moduleName: CORE};
  static pipeBindV: o.ExternalReference = {name: 'ɵpbV', moduleName: CORE};

  static load: o.ExternalReference = {name: 'ɵld', moduleName: CORE};
  static loadDirective: o.ExternalReference = {name: 'ɵd', moduleName: CORE};
  static loadQueryList: o.ExternalReference = {name: 'ɵql', moduleName: CORE};

  static pipe: o.ExternalReference = {name: 'ɵPp', moduleName: CORE};

  static projection: o.ExternalReference = {name: 'ɵP', moduleName: CORE};
  static projectionDef: o.ExternalReference = {name: 'ɵpD', moduleName: CORE};

  static reference: o.ExternalReference = {name: 'ɵr', moduleName: CORE};

  static inject: o.ExternalReference = {name: 'inject', moduleName: CORE};

  static injectAttribute: o.ExternalReference = {name: 'ɵinjectAttribute', moduleName: CORE};

  static injectElementRef: o.ExternalReference = {name: 'ɵinjectElementRef', moduleName: CORE};

  static injectTemplateRef: o.ExternalReference = {name: 'ɵinjectTemplateRef', moduleName: CORE};

  static injectViewContainerRef:
      o.ExternalReference = {name: 'ɵinjectViewContainerRef', moduleName: CORE};

  static injectChangeDetectorRef:
      o.ExternalReference = {name: 'ɵinjectChangeDetectorRef', moduleName: CORE};

  static directiveInject: o.ExternalReference = {name: 'ɵdirectiveInject', moduleName: CORE};

  static defineComponent: o.ExternalReference = {name: 'ɵdefineComponent', moduleName: CORE};

  static ComponentDef: o.ExternalReference = {
    name: 'ɵComponentDef',
    moduleName: CORE,
  };

  static defineDirective: o.ExternalReference = {
    name: 'ɵdefineDirective',
    moduleName: CORE,
  };

  static DirectiveDef: o.ExternalReference = {
    name: 'ɵDirectiveDef',
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

  static NgModuleDef: o.ExternalReference = {
    name: 'ɵNgModuleDef',
    moduleName: CORE,
  };

  static defineNgModule: o.ExternalReference = {name: 'ɵdefineNgModule', moduleName: CORE};

  static PipeDef: o.ExternalReference = {name: 'ɵPipeDef', moduleName: CORE};

  static definePipe: o.ExternalReference = {name: 'ɵdefinePipe', moduleName: CORE};

  static query: o.ExternalReference = {name: 'ɵQ', moduleName: CORE};
  static queryRefresh: o.ExternalReference = {name: 'ɵqR', moduleName: CORE};
  static registerContentQuery: o.ExternalReference = {name: 'ɵQr', moduleName: CORE};

  static NgOnChangesFeature: o.ExternalReference = {name: 'ɵNgOnChangesFeature', moduleName: CORE};

  static InheritDefinitionFeature:
      o.ExternalReference = {name: 'ɵInheritDefinitionFeature', moduleName: CORE};

  static listener: o.ExternalReference = {name: 'ɵL', moduleName: CORE};

  // Reserve slots for pure functions
  static reserveSlots: o.ExternalReference = {name: 'ɵrS', moduleName: CORE};

  // sanitization-related functions
  static sanitizeHtml: o.ExternalReference = {name: 'ɵzh', moduleName: CORE};
  static sanitizeStyle: o.ExternalReference = {name: 'ɵzs', moduleName: CORE};
  static defaultStyleSanitizer: o.ExternalReference = {name: 'ɵzss', moduleName: CORE};
  static sanitizeResourceUrl: o.ExternalReference = {name: 'ɵzr', moduleName: CORE};
  static sanitizeScript: o.ExternalReference = {name: 'ɵzc', moduleName: CORE};
  static sanitizeUrl: o.ExternalReference = {name: 'ɵzu', moduleName: CORE};
}
