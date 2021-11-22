/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as o from './output/output_ast';

const CORE = '@angular/core';

export class Identifiers {
  static ANALYZE_FOR_ENTRY_COMPONENTS: o.ExternalReference = {
    name: 'ANALYZE_FOR_ENTRY_COMPONENTS',
    moduleName: CORE,

  };
  static ElementRef: o.ExternalReference = {name: 'ElementRef', moduleName: CORE};
  static NgModuleRef: o.ExternalReference = {name: 'NgModuleRef', moduleName: CORE};
  static ViewContainerRef: o.ExternalReference = {name: 'ViewContainerRef', moduleName: CORE};
  static ChangeDetectorRef: o.ExternalReference = {
    name: 'ChangeDetectorRef',
    moduleName: CORE,

  };
  static QueryList: o.ExternalReference = {name: 'QueryList', moduleName: CORE};
  static TemplateRef: o.ExternalReference = {name: 'TemplateRef', moduleName: CORE};
  static Renderer2: o.ExternalReference = {name: 'Renderer2', moduleName: CORE};
  static CodegenComponentFactoryResolver: o.ExternalReference = {
    name: 'ɵCodegenComponentFactoryResolver',
    moduleName: CORE,

  };
  static ComponentFactoryResolver: o.ExternalReference = {
    name: 'ComponentFactoryResolver',
    moduleName: CORE,

  };
  static ComponentFactory: o.ExternalReference = {name: 'ComponentFactory', moduleName: CORE};
  static ComponentRef: o.ExternalReference = {name: 'ComponentRef', moduleName: CORE};
  static NgModuleFactory: o.ExternalReference = {name: 'NgModuleFactory', moduleName: CORE};
  static createModuleFactory: o.ExternalReference = {
    name: 'ɵcmf',
    moduleName: CORE,

  };
  static moduleDef: o.ExternalReference = {
    name: 'ɵmod',
    moduleName: CORE,

  };
  static moduleProviderDef: o.ExternalReference = {
    name: 'ɵmpd',
    moduleName: CORE,

  };
  static RegisterModuleFactoryFn: o.ExternalReference = {
    name: 'ɵregisterModuleFactory',
    moduleName: CORE,

  };
  static inject: o.ExternalReference = {name: 'ɵɵinject', moduleName: CORE};
  static directiveInject: o.ExternalReference = {name: 'ɵɵdirectiveInject', moduleName: CORE};
  static INJECTOR: o.ExternalReference = {name: 'INJECTOR', moduleName: CORE};
  static Injector: o.ExternalReference = {name: 'Injector', moduleName: CORE};
  static ViewEncapsulation: o.ExternalReference = {
    name: 'ViewEncapsulation',
    moduleName: CORE,

  };
  static ChangeDetectionStrategy: o.ExternalReference = {
    name: 'ChangeDetectionStrategy',
    moduleName: CORE,

  };
  static SecurityContext: o.ExternalReference = {
    name: 'SecurityContext',
    moduleName: CORE,

  };
  static LOCALE_ID: o.ExternalReference = {name: 'LOCALE_ID', moduleName: CORE};
  static TRANSLATIONS_FORMAT: o.ExternalReference = {
    name: 'TRANSLATIONS_FORMAT',
    moduleName: CORE,

  };
  static inlineInterpolate: o.ExternalReference = {
    name: 'ɵinlineInterpolate',
    moduleName: CORE,
  };
  static interpolate: o.ExternalReference = {name: 'ɵinterpolate', moduleName: CORE};
  static EMPTY_ARRAY: o.ExternalReference = {name: 'ɵEMPTY_ARRAY', moduleName: CORE};
  static EMPTY_MAP: o.ExternalReference = {name: 'ɵEMPTY_MAP', moduleName: CORE};
  static Renderer: o.ExternalReference = {name: 'Renderer', moduleName: CORE};
  // type only
  static RendererType2: o.ExternalReference = {
    name: 'RendererType2',
    moduleName: CORE,

  };
  // type only
  static ViewDefinition: o.ExternalReference = {
    name: 'ɵViewDefinition',
    moduleName: CORE,
  };
  static createComponentFactory: o.ExternalReference = {name: 'ɵccf', moduleName: CORE};
}
