/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as o from '../output/output_ast';

const CORE = '@angular/core';

// Copied from core and must be in sync with the value in the runtime.
export const enum LifeCycleGuard {ON_INIT = 1, ON_DESTROY = 2, ON_CHANGES = 4}

// TODO: Include assignments that use the enum literals
//  e.g. { let a: core.LifeCycleGuard.ON_INIT = LifeCycleGuard.ON_INIT; ...}
// Ensure these get removed in bundling.

export class Identifiers {
  /* Methods */
  static NEW_METHOD = 'n';
  static HOST_BINDING_METHOD = 'h';
  static TRANSFORM_METHOD = 'transform';

  /* Instructions */
  static createElement: o.ExternalReference = {name: 'ɵE', moduleName: CORE};

  static elementEnd: o.ExternalReference = {name: 'ɵe', moduleName: CORE};

  static elementProperty: o.ExternalReference = {name: 'ɵp', moduleName: CORE};

  static elementAttribute: o.ExternalReference = {name: 'ɵa', moduleName: CORE};

  static elementClass: o.ExternalReference = {name: 'ɵk', moduleName: CORE};

  static elementStyle: o.ExternalReference = {name: 'ɵs', moduleName: CORE};

  static containerCreate: o.ExternalReference = {name: 'ɵC', moduleName: CORE};

  static containerEnd: o.ExternalReference = {name: 'ɵc', moduleName: CORE};

  static containerRefreshStart: o.ExternalReference = {name: 'ɵcR', moduleName: CORE};

  static containerRefreshEnd: o.ExternalReference = {name: 'ɵcr', moduleName: CORE};

  static directiveCreate: o.ExternalReference = {name: 'ɵD', moduleName: CORE};

  static text: o.ExternalReference = {name: 'ɵT', moduleName: CORE};

  static directiveInput: o.ExternalReference = {name: 'ɵi', moduleName: CORE};

  static textCreateBound: o.ExternalReference = {name: 'ɵt', moduleName: CORE};

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

  static pipeBind1: o.ExternalReference = {name: 'ɵpb1', moduleName: CORE};
  static pipeBind2: o.ExternalReference = {name: 'ɵpb2', moduleName: CORE};
  static pipeBind3: o.ExternalReference = {name: 'ɵpb3', moduleName: CORE};
  static pipeBind4: o.ExternalReference = {name: 'ɵpb4', moduleName: CORE};
  static pipeBindV: o.ExternalReference = {name: 'ɵpbV', moduleName: CORE};

  static load: o.ExternalReference = {name: 'ɵld', moduleName: CORE};

  static pipe: o.ExternalReference = {name: 'ɵPp', moduleName: CORE};

  static projection: o.ExternalReference = {name: 'ɵP', moduleName: CORE};
  static projectionDef: o.ExternalReference = {name: 'ɵpD', moduleName: CORE};

  static refreshComponent: o.ExternalReference = {name: 'ɵr', moduleName: CORE};

  static directiveLifeCycle: o.ExternalReference = {name: 'ɵl', moduleName: CORE};

  static injectElementRef: o.ExternalReference = {name: 'ɵinjectElementRef', moduleName: CORE};

  static injectTemplateRef: o.ExternalReference = {name: 'ɵinjectTemplateRef', moduleName: CORE};

  static injectViewContainerRef:
      o.ExternalReference = {name: 'ɵinjectViewContainerRef', moduleName: CORE};

  static inject: o.ExternalReference = {name: 'ɵinject', moduleName: CORE};

  static defineComponent: o.ExternalReference = {name: 'ɵdefineComponent', moduleName: CORE};

  static defineDirective: o.ExternalReference = {
    name: 'ɵdefineDirective',
    moduleName: CORE,
  };

  static definePipe: o.ExternalReference = {name: 'ɵdefinePipe', moduleName: CORE};

  static NgOnChangesFeature: o.ExternalReference = {name: 'ɵNgOnChangesFeature', moduleName: CORE};
}