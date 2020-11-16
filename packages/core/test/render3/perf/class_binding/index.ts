/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ɵɵproperty} from '../../../../src/render3/instructions/all';
import {ɵɵelement} from '../../../../src/render3/instructions/element';
import {ɵɵclassMap, ɵɵclassProp} from '../../../../src/render3/instructions/styling';
import {ComponentTemplate, RenderFlags} from '../../../../src/render3/interfaces/definition';
import {AttributeMarker, TAttributes} from '../../../../src/render3/interfaces/node';
import {Benchmark, createBenchmark} from '../micro_bench';
import {setupTestHarness} from '../setup';

const PROFILE_CREATE = true;
const PROFILE_UPDATE = true;
const PROFILE_NOOP = true;

const consts: TAttributes[] = [
  [AttributeMarker.Classes, 'A', 'B']  // 0
];
const context: any = {};
const benchmarks: Benchmark[] = [];

function benchmark(
    name: string, template: ComponentTemplate<any>, baselineTemplate: ComponentTemplate<any>) {
  const ivyHarness = setupTestHarness(template, 1, 4, 1000, context, consts);
  const baseHarness = setupTestHarness(baselineTemplate, 1, 4, 1000, context, consts);

  if (PROFILE_CREATE) {
    const benchmark = createBenchmark('class binding[create]: ' + name);
    benchmarks.push(benchmark);
    const ivyProfile = benchmark('styling');
    console.profile(benchmark.name + ':' + ivyProfile.name);
    while (ivyProfile()) {
      ivyHarness.createEmbeddedLView();
    }
    console.profileEnd();

    const baseProfile = benchmark('base');
    console.profile(benchmark.name + ':' + baseProfile.name);
    while (baseProfile()) {
      baseHarness.createEmbeddedLView();
    }
    console.profileEnd();
  }

  if (PROFILE_UPDATE) {
    const benchmark = createBenchmark('class binding[update]: ' + name);
    benchmarks.push(benchmark);
    const ivyProfile = benchmark('styling');
    console.profile(benchmark.name + ':' + ivyProfile.name);
    while (ivyProfile()) {
      toggle = !toggle;
      ivyHarness.detectChanges();
    }
    console.profileEnd();

    const baseProfile = benchmark('base');
    console.profile(benchmark.name + ':' + baseProfile.name);
    while (baseProfile()) {
      toggle = !toggle;
      baseHarness.detectChanges();
    }
    console.profileEnd();
  }


  if (PROFILE_NOOP) {
    const benchmark = createBenchmark('class binding[noop]: ' + name);
    benchmarks.push(benchmark);
    const ivyProfile = benchmark('styling');
    console.profile(benchmark.name + ':' + ivyProfile.name);
    while (ivyProfile()) {
      ivyHarness.detectChanges();
    }
    console.profileEnd();

    const baseProfile = benchmark('base');
    console.profile(benchmark.name + ':' + baseProfile.name);
    while (baseProfile()) {
      baseHarness.detectChanges();
    }
    console.profileEnd();
  }
}

const A_1 = 'one';
const B_1 = A_1.toUpperCase();
const A_10 = 'one two three four five six seven eight nine ten';
const B_10 = A_10.toUpperCase();
let toggle = true;

benchmark(
    `<div class="A B">`,
    function(rf: RenderFlags, ctx: any) {
      if (rf & 1) {
        ɵɵelement(0, 'div', 0);
      }
    },
    function(rf: RenderFlags, ctx: any) {
      if (rf & 1) {
        ɵɵelement(0, 'div', 0);
      }
    });


benchmark(
    `<div [class]="toggle ? A_1 : B_1">`,
    function(rf: RenderFlags, ctx: any) {
      if (rf & 1) {
        ɵɵelement(0, 'div');
      }
      if (rf & 2) {
        ɵɵclassMap(toggle ? A_1 : B_1);
      }
    },
    function(rf: RenderFlags, ctx: any) {
      if (rf & 1) {
        ɵɵelement(0, 'div');
      }
      if (rf & 2) {
        ɵɵproperty('className', toggle ? A_1 : B_1);
      }
    });

benchmark(
    `<div [class]="toggle ? A_10 : B_10">`,
    function(rf: RenderFlags, ctx: any) {
      if (rf & 1) {
        ɵɵelement(0, 'div');
      }
      if (rf & 2) {
        ɵɵclassMap(toggle ? A_10 : B_10);
      }
    },
    function(rf: RenderFlags, ctx: any) {
      if (rf & 1) {
        ɵɵelement(0, 'div');
      }
      if (rf & 2) {
        ɵɵproperty('className', toggle ? A_10 : B_10);
      }
    });

benchmark(
    `<div [class]="toggle ? A_1 : B_1">`,
    function(rf: RenderFlags, ctx: any) {
      if (rf & 1) {
        ɵɵelement(0, 'div');
      }
      if (rf & 2) {
        ɵɵclassMap(toggle ? A_1 : B_1);
      }
    },
    function(rf: RenderFlags, ctx: any) {
      if (rf & 1) {
        ɵɵelement(0, 'div');
      }
      if (rf & 2) {
        ɵɵproperty('className', toggle ? A_1 : B_1);
      }
    });

benchmark(
    `<div class="A B" [class]="toggle ? A_1 : B_1">`,
    function(rf: RenderFlags, ctx: any) {
      if (rf & 1) {
        ɵɵelement(0, 'div', 0);
      }
      if (rf & 2) {
        ɵɵclassMap(toggle ? A_1 : B_1);
      }
    },
    function(rf: RenderFlags, ctx: any) {
      if (rf & 1) {
        ɵɵelement(0, 'div', 0);
      }
      if (rf & 2) {
        ɵɵproperty('className', toggle ? A_1 : B_1);
      }
    });

benchmark(
    `<div class="A B" [class]="toggle ? A_10 : B_10">`,
    function(rf: RenderFlags, ctx: any) {
      if (rf & 1) {
        ɵɵelement(0, 'div', 0);
      }
      if (rf & 2) {
        ɵɵclassMap(toggle ? A_10 : B_10);
      }
    },
    function(rf: RenderFlags, ctx: any) {
      if (rf & 1) {
        ɵɵelement(0, 'div', 0);
      }
      if (rf & 2) {
        ɵɵproperty('className', toggle ? A_10 : B_10);
      }
    });

benchmark(
    `<div class="A B" [class]="toggle ? A_1 : B_1" [class.foo]="toggle">`,
    function(rf: RenderFlags, ctx: any) {
      if (rf & 1) {
        ɵɵelement(0, 'div', 0);
      }
      if (rf & 2) {
        ɵɵclassMap(toggle ? A_1 : B_1);
        ɵɵclassProp('foo', toggle);
      }
    },
    function(rf: RenderFlags, ctx: any) {
      if (rf & 1) {
        ɵɵelement(0, 'div', 0);
      }
      if (rf & 2) {
        ɵɵproperty('className', toggle ? A_1 + 'foo' : B_1);
      }
    });


benchmarks.forEach(b => b.report());
