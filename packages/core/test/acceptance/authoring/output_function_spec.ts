/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Component,
  Directive,
  effect,
  ErrorHandler,
  EventEmitter,
  output,
  signal,
} from '@angular/core';
import {outputFromObservable} from '@angular/core/rxjs-interop';
import {TestBed} from '../../../testing';
import {BehaviorSubject, Observable, share, Subject} from 'rxjs';
import {setUseMicrotaskEffectsByDefault} from '../../../src/render3/reactivity/effect';

describe('output() function', () => {
  let prev: boolean;
  beforeEach(() => {
    prev = setUseMicrotaskEffectsByDefault(false);
  });
  afterEach(() => setUseMicrotaskEffectsByDefault(prev));

  it('should support emitting values', () => {
    @Directive({
      selector: '[dir]',
      standalone: true,
    })
    class Dir {
      onBla = output<number>();
    }

    @Component({
      template: '<div dir (onBla)="values.push($event)"></div>',
      standalone: true,
      imports: [Dir],
    })
    class App {
      values: number[] = [];
    }

    const fixture = TestBed.createComponent(App);
    const dir = fixture.debugElement.children[0].injector.get(Dir);

    fixture.detectChanges();

    expect(fixture.componentInstance.values).toEqual([]);
    dir.onBla.emit(1);
    dir.onBla.emit(2);

    expect(fixture.componentInstance.values).toEqual([1, 2]);
  });

  it('should support emitting void values', () => {
    @Directive({
      selector: '[dir]',
      standalone: true,
    })
    class Dir {
      onBla = output();
    }

    @Component({
      template: '<div dir (onBla)="count = count + 1"></div>',
      standalone: true,
      imports: [Dir],
    })
    class App {
      count = 0;
    }

    const fixture = TestBed.createComponent(App);
    const dir = fixture.debugElement.children[0].injector.get(Dir);

    fixture.detectChanges();

    expect(fixture.componentInstance.count).toEqual(0);
    dir.onBla.emit();
    dir.onBla.emit();

    expect(fixture.componentInstance.count).toEqual(2);
  });

  it('should error when emitting to a destroyed output', () => {
    @Directive({
      selector: '[dir]',
      standalone: true,
    })
    class Dir {
      onBla = output<number>();
    }

    @Component({
      template: `
        @if (show) {
          <div dir (onBla)="values.push($event)"></div>
        }
      `,
      standalone: true,
      imports: [Dir],
    })
    class App {
      show = true;
      values: number[] = [];
    }

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const dir = fixture.debugElement.children[0].injector.get(Dir);

    expect(fixture.componentInstance.values).toEqual([]);
    dir.onBla.emit(1);
    dir.onBla.emit(2);
    expect(fixture.componentInstance.values).toEqual([1, 2]);

    fixture.componentInstance.show = false;
    fixture.detectChanges();

    fixture.destroy();
    const warnSpy = spyOn(console, 'warn');
    dir.onBla.emit(3);
    expect(warnSpy.calls.mostRecent().args[0]).toMatch(/Unexpected emit for destroyed `OutputRef`/);
  });

  it('should error when subscribing to a destroyed output', () => {
    @Directive({
      selector: '[dir]',
      standalone: true,
    })
    class Dir {
      onBla = output<number>();
    }

    @Component({
      template: `
        @if (show) {
          <div dir (onBla)="values.push($event)"></div>
        }
      `,
      standalone: true,
      imports: [Dir],
    })
    class App {
      show = true;
      values: number[] = [];
    }

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const dir = fixture.debugElement.children[0].injector.get(Dir);

    expect(fixture.componentInstance.values).toEqual([]);
    dir.onBla.emit(1);
    dir.onBla.emit(2);
    expect(fixture.componentInstance.values).toEqual([1, 2]);

    fixture.componentInstance.show = false;
    fixture.detectChanges();

    expect(() => dir.onBla.subscribe(() => {})).toThrowError(
      /Unexpected subscription to destroyed `OutputRef`/,
    );
  });

  it('should run listeners outside of `emit` reactive context', () => {
    @Directive({
      selector: '[dir]',
      standalone: true,
    })
    class Dir {
      onBla = output();
      effectCount = 0;

      constructor() {
        effect(() => {
          this.onBla.emit();
          this.effectCount++;
        });
      }
    }

    @Component({
      template: '<div dir (onBla)="fnUsingSomeSignal()"></div>',
      standalone: true,
      imports: [Dir],
    })
    class App {
      signalUnrelatedToDir = signal(0);

      fnUsingSomeSignal() {
        // track this signal in this function.
        this.signalUnrelatedToDir();
      }
    }

    const fixture = TestBed.createComponent(App);
    const dir = fixture.debugElement.children[0].injector.get(Dir);

    fixture.detectChanges();

    expect(dir.effectCount).toEqual(1);
    fixture.componentInstance.signalUnrelatedToDir.update((v) => v + 1);
    fixture.detectChanges();

    expect(dir.effectCount).toEqual(1);
  });

  describe('outputFromObservable()', () => {
    it('should support using a `Subject` as source', () => {
      @Directive({
        selector: '[dir]',
        standalone: true,
      })
      class Dir {
        onBla$ = new Subject<number>();
        onBla = outputFromObservable(this.onBla$);
      }

      @Component({
        template: '<div dir (onBla)="values.push($event)"></div>',
        standalone: true,
        imports: [Dir],
      })
      class App {
        values: number[] = [];
      }

      const fixture = TestBed.createComponent(App);
      const dir = fixture.debugElement.children[0].injector.get(Dir);

      fixture.detectChanges();

      expect(fixture.componentInstance.values).toEqual([]);
      dir.onBla$.next(1);
      dir.onBla$.next(2);

      expect(fixture.componentInstance.values).toEqual([1, 2]);
    });

    it('should support using a `BehaviorSubject` as source', () => {
      @Directive({
        selector: '[dir]',
        standalone: true,
      })
      class Dir {
        onBla$ = new BehaviorSubject<number>(1);
        onBla = outputFromObservable(this.onBla$);
      }

      @Component({
        template: '<div dir (onBla)="values.push($event)"></div>',
        standalone: true,
        imports: [Dir],
      })
      class App {
        values: number[] = [];
      }

      const fixture = TestBed.createComponent(App);
      const dir = fixture.debugElement.children[0].injector.get(Dir);

      fixture.detectChanges();

      expect(fixture.componentInstance.values).toEqual([1]);
      dir.onBla$.next(2);
      dir.onBla$.next(3);

      expect(fixture.componentInstance.values).toEqual([1, 2, 3]);
    });

    it('should support using an `EventEmitter` as source', () => {
      @Directive({
        selector: '[dir]',
        standalone: true,
      })
      class Dir {
        onBla$ = new EventEmitter<number>();
        onBla = outputFromObservable(this.onBla$);
      }

      @Component({
        template: '<div dir (onBla)="values.push($event)"></div>',
        standalone: true,
        imports: [Dir],
      })
      class App {
        values: number[] = [];
      }

      const fixture = TestBed.createComponent(App);
      const dir = fixture.debugElement.children[0].injector.get(Dir);

      fixture.detectChanges();

      expect(fixture.componentInstance.values).toEqual([]);
      dir.onBla$.next(1);
      dir.onBla$.next(2);

      expect(fixture.componentInstance.values).toEqual([1, 2]);
    });

    it('should support lazily creating an observer upon subscription', () => {
      @Directive({
        selector: '[dir]',
        standalone: true,
      })
      class Dir {
        streamStarted = false;
        onBla$ = new Observable((obs) => {
          this.streamStarted = true;
          obs.next(1);
        }).pipe(share());

        onBla = outputFromObservable(this.onBla$);
      }

      @Component({
        template: `
          <div dir></div>
          <div dir (onBla)="true"></div>
        `,
        standalone: true,
        imports: [Dir],
      })
      class App {}

      const fixture = TestBed.createComponent(App);
      const dir = fixture.debugElement.children[0].injector.get(Dir);
      const dir2 = fixture.debugElement.children[1].injector.get(Dir);

      fixture.detectChanges();

      expect(dir.streamStarted).toBe(false);
      expect(dir2.streamStarted).toBe(true);
    });

    it('should report subscription listener errors to `ErrorHandler` and continue', () => {
      @Directive({
        selector: '[dir]',
        standalone: true,
      })
      class Dir {
        onBla = output();
      }

      @Component({
        template: `
          <div dir (onBla)="true"></div>
        `,
        standalone: true,
        imports: [Dir],
      })
      class App {}

      let handledErrors: unknown[] = [];
      TestBed.configureTestingModule({
        providers: [
          {
            provide: ErrorHandler,
            useClass: class Handler extends ErrorHandler {
              override handleError(error: unknown): void {
                handledErrors.push(error);
              }
            },
          },
        ],
      });

      const fixture = TestBed.createComponent(App);
      const dir = fixture.debugElement.children[0].injector.get(Dir);
      fixture.detectChanges();

      let triggered = 0;
      dir.onBla.subscribe(() => {
        throw new Error('first programmatic listener failure');
      });
      dir.onBla.subscribe(() => {
        triggered++;
      });

      dir.onBla.emit();

      expect(handledErrors.length).toBe(1);
      expect((handledErrors[0] as Error).message).toBe('first programmatic listener failure');
      expect(triggered).toBe(1);
    });
  });
});
