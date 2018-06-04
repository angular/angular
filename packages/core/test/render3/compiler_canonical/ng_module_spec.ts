/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as $core$ from '../../../index';
import {ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChild, ContentChildren, Directive, HostBinding, HostListener, Injectable, Input, NgModule, OnDestroy, Optional, Pipe, PipeTransform, QueryList, SimpleChanges, TemplateRef, ViewChild, ViewChildren, ViewContainerRef} from '../../../src/core';
import * as $r3$ from '../../../src/core_render3_private_export';
import {renderComponent, toHtml} from '../render_util';


/// See: `normative.md`
xdescribe('NgModule', () => {

  interface Injectable {
    providedIn?: /*InjectorDefType<any>*/ any;
    factory: Function;
  }

  function defineInjectable(opts: Injectable): Injectable {
    // This class should be imported from https://github.com/angular/angular/pull/20850
    return opts;
  }
  function defineInjector(opts: any): any {
    // This class should be imported from https://github.com/angular/angular/pull/20850
    return opts;
  }
  it('should convert module', () => {
    @Injectable()
    class Toast {
      constructor(name: String) {}
      // NORMATIVE
      static ngInjectableDef = defineInjectable({
        factory: () => new Toast($r3$.ɵdirectiveInject(String)),
      });
      // /NORMATIVE
    }

    class CommonModule {
      // NORMATIVE
      static ngInjectorDef = defineInjector({});
      // /NORMATIVE
    }

    @NgModule({
      providers: [Toast, {provide: String, useValue: 'Hello'}],
      imports: [CommonModule],
    })
    class MyModule {
      constructor(toast: Toast) {}
      // NORMATIVE
      static ngInjectorDef = defineInjector({
        factory: () => new MyModule($r3$.ɵdirectiveInject(Toast)),
        provider: [
          {provide: Toast, deps: [String]},  // If Toast has metadata generate this line
          Toast,                             // If Toast has no metadata generate this line.
          {provide: String, useValue: 'Hello'}
        ],
        imports: [CommonModule]
      });
      // /NORMATIVE
    }

    @Injectable(/*{MyModule}*/)
    class BurntToast {
      constructor(@Optional() toast: Toast|null, name: String) {}
      // NORMATIVE
      static ngInjectableDef = defineInjectable({
        providedIn: MyModule,
        factory: () => new BurntToast(
                     $r3$.ɵdirectiveInject(Toast, $core$.InjectFlags.Optional),
                     $r3$.ɵdirectiveInject(String)),
      });
      // /NORMATIVE
    }

  });
});
