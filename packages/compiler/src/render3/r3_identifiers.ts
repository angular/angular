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

  static bind1: o.ExternalReference = {name: 'ɵb1', moduleName: CORE};
  static bind2: o.ExternalReference = {name: 'ɵb2', moduleName: CORE};
  static bind3: o.ExternalReference = {name: 'ɵb3', moduleName: CORE};
  static bind4: o.ExternalReference = {name: 'ɵb4', moduleName: CORE};
  static bind5: o.ExternalReference = {name: 'ɵb5', moduleName: CORE};
  static bind6: o.ExternalReference = {name: 'ɵb6', moduleName: CORE};
  static bind7: o.ExternalReference = {name: 'ɵb7', moduleName: CORE};
  static bind8: o.ExternalReference = {name: 'ɵb8', moduleName: CORE};
  static bindV: o.ExternalReference = {name: 'ɵbV', moduleName: CORE};

  static memory: o.ExternalReference = {name: 'ɵm', moduleName: CORE};

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

  static NgOnChangesFeature: o.ExternalReference = {name: 'ɵNgOnChangesFeature', moduleName: CORE};
}