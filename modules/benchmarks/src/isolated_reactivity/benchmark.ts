/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ChangeDetectionStrategy,
  RenderFlags,
  WritableSignal,
  signal,
  ɵɵadvance,
  ɵɵconditional,
  ɵɵdefineComponent,
  ɵɵelement,
  ɵɵisolatedCreate,
  ɵɵtext,
  ɵɵtextInterpolate,
} from '@angular/core';

export const HEAVY_BINDING_COUNT = 1_000;

interface BenchmarkCase {
  clock: WritableSignal<number>;
  parentRefreshes: number;
  heavyBindingChecks: number;
  clockRefreshes: number;
}

abstract class HeavyCase {
  readonly heavyValues = Array.from({length: HEAVY_BINDING_COUNT}, (_, index) => `heavy-${index}`);
  parentRefreshes = 0;
  heavyBindingChecks = 0;
  clockRefreshes = 0;

  readHeavyValue(index: number): string {
    this.heavyBindingChecks++;
    return this.heavyValues[index];
  }
}

function createHeavyNodes(): void {
  for (let index = 0; index < HEAVY_BINDING_COUNT; index++) {
    ɵɵtext(index);
  }
}

function updateHeavyBindings(ctx: HeavyCase): void {
  for (let index = 0; index < HEAVY_BINDING_COUNT; index++) {
    if (index > 0) {
      ɵɵadvance();
    }
    ɵɵtextInterpolate(ctx.readHeavyValue(index));
  }
}

export class BaselineCase extends HeavyCase {
  static instance: BaselineCase;

  readonly clock = signal(0);

  constructor() {
    super();
    BaselineCase.instance = this;
  }

  static ɵfac = () => new BaselineCase();
  static ɵcmp = ɵɵdefineComponent({
    type: BaselineCase,
    selectors: [['baseline-case']],
    decls: HEAVY_BINDING_COUNT + 1,
    vars: HEAVY_BINDING_COUNT + 1,
    template: (rf: RenderFlags, ctx: BaselineCase) => {
      if (rf & RenderFlags.Create) {
        createHeavyNodes();
        ɵɵtext(HEAVY_BINDING_COUNT);
      }
      if (rf & RenderFlags.Update) {
        ctx.parentRefreshes++;
        updateHeavyBindings(ctx);
        ɵɵadvance();
        ctx.clockRefreshes++;
        ɵɵtextInterpolate(ctx.clock());
      }
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
  });
}

export class IsolatedCase extends HeavyCase {
  static instance: IsolatedCase;

  readonly clock = signal(0);

  constructor() {
    super();
    IsolatedCase.instance = this;
  }

  static ɵfac = () => new IsolatedCase();
  static ɵcmp = ɵɵdefineComponent({
    type: IsolatedCase,
    selectors: [['isolated-case']],
    decls: HEAVY_BINDING_COUNT + 1,
    vars: HEAVY_BINDING_COUNT + 1,
    template: (rf: RenderFlags, ctx: IsolatedCase) => {
      if (rf & RenderFlags.Create) {
        createHeavyNodes();
        ɵɵisolatedCreate(HEAVY_BINDING_COUNT, isolatedClockTemplate, 1, 1);
      }
      if (rf & RenderFlags.Update) {
        ctx.parentRefreshes++;
        updateHeavyBindings(ctx);
        ɵɵconditional(HEAVY_BINDING_COUNT, ctx);
      }
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
  });
}

function isolatedClockTemplate(rf: RenderFlags, ctx: IsolatedCase): void {
  if (rf & RenderFlags.Create) {
    ɵɵtext(0);
  }
  if (rf & RenderFlags.Update) {
    ctx.clockRefreshes++;
    ɵɵtextInterpolate(ctx.clock());
  }
}

export class ExtractedClockCase {
  static instance: ExtractedClockCase;

  readonly clock = signal(0);
  clockRefreshes = 0;

  constructor() {
    ExtractedClockCase.instance = this;
  }

  static ɵfac = () => new ExtractedClockCase();
  static ɵcmp = ɵɵdefineComponent({
    type: ExtractedClockCase,
    selectors: [['extracted-clock-case']],
    decls: 1,
    vars: 1,
    template: (rf: RenderFlags, ctx: ExtractedClockCase) => {
      if (rf & RenderFlags.Create) {
        ɵɵtext(0);
      }
      if (rf & RenderFlags.Update) {
        ctx.clockRefreshes++;
        ɵɵtextInterpolate(ctx.clock());
      }
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
  });
}

export class ExtractedCase extends HeavyCase {
  static instance: ExtractedCase;

  constructor() {
    super();
    ExtractedCase.instance = this;
  }

  static ɵfac = () => new ExtractedCase();
  static ɵcmp = ɵɵdefineComponent({
    type: ExtractedCase,
    selectors: [['extracted-case']],
    decls: HEAVY_BINDING_COUNT + 1,
    vars: HEAVY_BINDING_COUNT,
    dependencies: [ExtractedClockCase],
    template: (rf: RenderFlags, ctx: ExtractedCase) => {
      if (rf & RenderFlags.Create) {
        createHeavyNodes();
        ɵɵelement(HEAVY_BINDING_COUNT, 'extracted-clock-case');
      }
      if (rf & RenderFlags.Update) {
        ctx.parentRefreshes++;
        updateHeavyBindings(ctx);
      }
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
  });
}

export class BenchmarkApp {
  static ɵfac = () => new BenchmarkApp();
  static ɵcmp = ɵɵdefineComponent({
    type: BenchmarkApp,
    selectors: [['benchmark-app']],
    decls: 3,
    vars: 0,
    dependencies: [BaselineCase, IsolatedCase, ExtractedCase],
    template: (rf: RenderFlags) => {
      if (rf & RenderFlags.Create) {
        ɵɵelement(0, 'baseline-case');
        ɵɵelement(1, 'isolated-case');
        ɵɵelement(2, 'extracted-case');
      }
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
  });
}

export function benchmarkCases(): Record<string, BenchmarkCase> {
  const extracted = ExtractedCase.instance;
  return {
    baseline: BaselineCase.instance,
    isolated: IsolatedCase.instance,
    component: {
      get clock() {
        return ExtractedClockCase.instance.clock;
      },
      get parentRefreshes() {
        return extracted.parentRefreshes;
      },
      set parentRefreshes(value: number) {
        extracted.parentRefreshes = value;
      },
      get heavyBindingChecks() {
        return extracted.heavyBindingChecks;
      },
      set heavyBindingChecks(value: number) {
        extracted.heavyBindingChecks = value;
      },
      get clockRefreshes() {
        return ExtractedClockCase.instance.clockRefreshes;
      },
      set clockRefreshes(value: number) {
        ExtractedClockCase.instance.clockRefreshes = value;
      },
    },
  };
}
