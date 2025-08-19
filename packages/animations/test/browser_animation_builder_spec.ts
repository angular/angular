/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {
  animate,
  AnimationBuilder,
  style,
  ɵBrowserAnimationBuilder as BrowserAnimationBuilder,
} from '../src/animations';
import {AnimationDriver} from '../browser';
import {MockAnimationDriver} from '../browser/testing';
import {Component, NgZone, RendererFactory2, ViewChild, DOCUMENT} from '@angular/core';
import {fakeAsync, flushMicrotasks, TestBed} from '@angular/core/testing';
import {ɵDomRendererFactory2 as DomRendererFactory2} from '@angular/platform-browser';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {ɵAsyncAnimationRendererFactory as AsyncAnimationRendererFactory} from '@angular/platform-browser/animations/async';
import {BrowserTestingModule, platformBrowserTesting} from '@angular/platform-browser/testing';
import {isNode} from '@angular/private/testing';

describe('BrowserAnimationBuilder', () => {
  if (isNode) {
    // Jasmine will throw if there are no tests.
    it('should pass', () => {});
    return;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{provide: AnimationDriver, useClass: MockAnimationDriver}],
    });
  });

  it('should inject AnimationBuilder into a component', () => {
    @Component({
      selector: 'ani-cmp',
      template: '...',
      standalone: false,
    })
    class Cmp {
      constructor(public builder: AnimationBuilder) {}
    }

    TestBed.configureTestingModule({declarations: [Cmp]});

    const fixture = TestBed.createComponent(Cmp);
    const cmp = fixture.componentInstance;

    fixture.detectChanges();
    expect(cmp.builder instanceof BrowserAnimationBuilder).toBeTruthy();
  });

  it("should listen on start and done on the animation builder's player after it has been reset", fakeAsync(() => {
    @Component({
      selector: 'ani-cmp',
      template: '...',
      standalone: false,
    })
    class Cmp {
      @ViewChild('target') public target: any;

      constructor(public builder: AnimationBuilder) {}

      build() {
        const definition = this.builder.build([
          style({opacity: 0}),
          animate(1000, style({opacity: 1})),
        ]);

        return definition.create(this.target);
      }
    }

    TestBed.configureTestingModule({declarations: [Cmp]});

    const fixture = TestBed.createComponent(Cmp);
    const cmp = fixture.componentInstance;
    fixture.detectChanges();

    const player = cmp.build();

    let startedCount = 0;
    player.onStart(() => startedCount++);

    let finishedCount = 0;
    player.onDone(() => finishedCount++);

    player.init();
    flushMicrotasks();
    expect(startedCount).toEqual(0);
    expect(finishedCount).toEqual(0);

    player.play();
    flushMicrotasks();
    expect(startedCount).toEqual(1);
    expect(finishedCount).toEqual(0);

    player.finish();
    flushMicrotasks();
    expect(startedCount).toEqual(1);
    expect(finishedCount).toEqual(1);

    player.play();
    player.finish();
    flushMicrotasks();
    expect(startedCount).toEqual(1);
    expect(finishedCount).toEqual(1);

    [0, 1, 2, 3].forEach((i) => {
      player.reset();

      player.play();
      flushMicrotasks();
      expect(startedCount).toEqual(i + 2);
      expect(finishedCount).toEqual(i + 1);

      player.finish();
      flushMicrotasks();
      expect(startedCount).toEqual(i + 2);
      expect(finishedCount).toEqual(i + 2);
    });
  }));

  it("should listen on start and done on the animation builder's player", fakeAsync(() => {
    @Component({
      selector: 'ani-cmp',
      template: '...',
      standalone: false,
    })
    class Cmp {
      @ViewChild('target') public target: any;

      constructor(public builder: AnimationBuilder) {}

      build() {
        const definition = this.builder.build([
          style({opacity: 0}),
          animate(1000, style({opacity: 1})),
        ]);

        return definition.create(this.target);
      }
    }

    TestBed.configureTestingModule({declarations: [Cmp]});

    const fixture = TestBed.createComponent(Cmp);
    const cmp = fixture.componentInstance;
    fixture.detectChanges();

    const player = cmp.build();

    let started = false;
    player.onStart(() => (started = true));

    let finished = false;
    player.onDone(() => (finished = true));

    let destroyed = false;
    player.onDestroy(() => (destroyed = true));

    player.init();
    flushMicrotasks();
    expect(started).toBeFalsy();
    expect(finished).toBeFalsy();
    expect(destroyed).toBeFalsy();

    player.play();
    flushMicrotasks();
    expect(started).toBeTruthy();
    expect(finished).toBeFalsy();
    expect(destroyed).toBeFalsy();

    player.finish();
    flushMicrotasks();
    expect(started).toBeTruthy();
    expect(finished).toBeTruthy();
    expect(destroyed).toBeFalsy();

    player.destroy();
    flushMicrotasks();
    expect(started).toBeTruthy();
    expect(finished).toBeTruthy();
    expect(destroyed).toBeTruthy();
  }));

  it('should update `hasStarted()` on `play()` and `reset()`', fakeAsync(() => {
    @Component({
      selector: 'ani-another-cmp',
      template: '...',
      standalone: false,
    })
    class CmpAnother {
      @ViewChild('target') public target: any;

      constructor(public builder: AnimationBuilder) {}

      build() {
        const definition = this.builder.build([
          style({opacity: 0}),
          animate(1000, style({opacity: 1})),
        ]);

        return definition.create(this.target);
      }
    }

    TestBed.configureTestingModule({declarations: [CmpAnother]});

    const fixture = TestBed.createComponent(CmpAnother);
    const cmp = fixture.componentInstance;
    fixture.detectChanges();

    const player = cmp.build();

    expect(player.hasStarted()).toBeFalsy();
    flushMicrotasks();

    player.play();
    flushMicrotasks();
    expect(player.hasStarted()).toBeTruthy();

    player.reset();
    flushMicrotasks();
    expect(player.hasStarted()).toBeFalsy();
  }));

  describe('without Animations enabled', () => {
    beforeEach(() => {
      // We need to reset the test environment because
      // browser_tests.init.ts inits the environment with the NoopAnimationsModule
      TestBed.resetTestEnvironment();
      TestBed.initTestEnvironment([BrowserTestingModule], platformBrowserTesting());
    });

    it('should throw an error when injecting AnimationBuilder without animation providers set', () => {
      expect(() => TestBed.inject(AnimationBuilder)).toThrowError(
        /Angular detected that the `AnimationBuilder` was injected/,
      );
    });

    afterEach(() => {
      // We're reset the test environment to their default values, cf browser_tests.init.ts
      TestBed.resetTestEnvironment();
      TestBed.initTestEnvironment(
        [BrowserTestingModule, NoopAnimationsModule],
        platformBrowserTesting(),
      );
    });
  });

  describe('with Animations async', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          {
            provide: RendererFactory2,
            useFactory: (doc: Document, renderer: DomRendererFactory2, zone: NgZone) => {
              // Using a empty promise to prevent switching to the delegate to  AnimationRenderer
              return new AsyncAnimationRendererFactory(
                doc,
                renderer,
                zone,
                'noop',
                new Promise<any>(() => {}),
              );
            },
            deps: [DOCUMENT, DomRendererFactory2, NgZone],
          },
        ],
      });
    });

    it('should be able to build', () => {
      @Component({
        selector: 'ani-cmp',
        template: '...',
        standalone: false,
      })
      class Cmp {
        @ViewChild('target') public target: any;

        constructor(public builder: AnimationBuilder) {}

        build() {
          const definition = this.builder.build([style({'transform': `rotate(0deg)`})]);

          return definition.create(this.target);
        }
      }

      TestBed.configureTestingModule({declarations: [Cmp]});

      const fixture = TestBed.createComponent(Cmp);
      const cmp = fixture.componentInstance;
      fixture.detectChanges();
      cmp.build();
    });
  });
});
