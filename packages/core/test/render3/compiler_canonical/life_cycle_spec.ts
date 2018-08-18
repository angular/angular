/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChild, ContentChildren, Directive, HostBinding, HostListener, Injectable, Input, NgModule, OnDestroy, Optional, Pipe, PipeTransform, QueryList, SimpleChanges, TemplateRef, ViewChild, ViewChildren, ViewContainerRef} from '../../../src/core';
import * as $r3$ from '../../../src/core_render3_private_export';
import {ComponentDefInternal} from '../../../src/render3/interfaces/definition';
import {renderComponent, toHtml} from '../render_util';


/// See: `normative.md`
describe('lifecycle hooks', () => {
  let events: string[] = [];
  let simpleLayout: SimpleLayout;

  type $RenderFlags$ = $r3$.ɵRenderFlags;
  type $LifecycleComp$ = LifecycleComp;
  type $SimpleLayout$ = SimpleLayout;

  beforeEach(() => { events = []; });

  @Component({selector: 'lifecycle-comp', template: ``})
  class LifecycleComp {
    // TODO(issue/24571): remove '!'.
    @Input('name') nameMin !: string;

    ngOnChanges() { events.push('changes' + this.nameMin); }

    ngOnInit() { events.push('init' + this.nameMin); }
    ngDoCheck() { events.push('check' + this.nameMin); }

    ngAfterContentInit() { events.push('content init' + this.nameMin); }
    ngAfterContentChecked() { events.push('content check' + this.nameMin); }

    ngAfterViewInit() { events.push('view init' + this.nameMin); }
    ngAfterViewChecked() { events.push('view check' + this.nameMin); }

    ngOnDestroy() { events.push(this.nameMin); }

    // NORMATIVE
    static ngComponentDef = $r3$.ɵdefineComponent({
      type: LifecycleComp,
      selectors: [['lifecycle-comp']],
      factory: function LifecycleComp_Factory() { return new LifecycleComp(); },
      consts: 0,
      vars: 0,
      template: function LifecycleComp_Template(rf: $RenderFlags$, ctx: $LifecycleComp$) {},
      inputs: {nameMin: ['name', 'nameMin']},
      features: [$r3$.ɵNgOnChangesFeature]
    });
    // /NORMATIVE
  }

  @Component({
    selector: 'simple-layout',
    template: `
      <lifecycle-comp [name]="name1"></lifecycle-comp>
      <lifecycle-comp [name]="name2"></lifecycle-comp>
    `
  })
  class SimpleLayout {
    name1 = '1';
    name2 = '2';

    // NORMATIVE
    static ngComponentDef = $r3$.ɵdefineComponent({
      type: SimpleLayout,
      selectors: [['simple-layout']],
      factory: function SimpleLayout_Factory() { return simpleLayout = new SimpleLayout(); },
      consts: 2,
      vars: 2,
      template: function SimpleLayout_Template(rf: $RenderFlags$, ctx: $SimpleLayout$) {
        if (rf & 1) {
          $r3$.ɵelement(0, 'lifecycle-comp');
          $r3$.ɵelement(1, 'lifecycle-comp');
        }
        if (rf & 2) {
          $r3$.ɵelementProperty(0, 'name', $r3$.ɵbind(ctx.name1));
          $r3$.ɵelementProperty(1, 'name', $r3$.ɵbind(ctx.name2));
        }
      }
    });
    // /NORMATIVE
  }

  // NON-NORMATIVE
  (SimpleLayout.ngComponentDef as ComponentDefInternal<any>).directiveDefs =
      [LifecycleComp.ngComponentDef];
  // /NON-NORMATIVE

  it('should gen hooks with a few simple components', () => {
    expect(toHtml(renderComponent(SimpleLayout)))
        .toEqual(`<lifecycle-comp></lifecycle-comp><lifecycle-comp></lifecycle-comp>`);
    expect(events).toEqual([
      'changes1', 'init1', 'check1', 'changes2', 'init2', 'check2', 'content init1',
      'content check1', 'content init2', 'content check2', 'view init1', 'view check1',
      'view init2', 'view check2'
    ]);

    events = [];
    simpleLayout.name1 = '-one';
    simpleLayout.name2 = '-two';
    $r3$.ɵdetectChanges(simpleLayout);
    expect(events).toEqual([
      'changes-one', 'check-one', 'changes-two', 'check-two', 'content check-one',
      'content check-two', 'view check-one', 'view check-two'
    ]);
  });

});
