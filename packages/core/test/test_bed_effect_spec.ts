/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ApplicationRef,
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  Injector,
  Input,
  NgZone,
  provideZoneChangeDetection,
  signal,
} from '../src/core';
import {TestBed} from '../testing';

describe('effects in TestBed', () => {
  let prev: boolean;

  it('created in the constructor should run with detectChanges()', () => {
    const log: string[] = [];
    @Component({
      selector: 'test-cmp',
      template: '',
    })
    class Cmp {
      constructor() {
        log.push('Ctor');

        effect(() => {
          log.push('Effect');
        });
      }

      ngDoCheck() {
        log.push('DoCheck');
      }
    }

    TestBed.createComponent(Cmp).detectChanges();

    expect(log).toEqual([
      // The component gets constructed, which creates the effect. Since the effect is created in a
      // component, it doesn't get scheduled until the component is first change detected.
      'Ctor',

      // Next, the first change detection (update pass) happens.
      'DoCheck',

      // Then the effect runs.
      'Effect',
    ]);
  });

  it('created in ngOnInit should run with detectChanges()', () => {
    const log: string[] = [];
    @Component({
      selector: 'test-cmp',
      template: '',
    })
    class Cmp {
      private injector = inject(Injector);

      constructor() {
        log.push('Ctor');
      }

      ngOnInit() {
        effect(
          () => {
            log.push('Effect');
          },
          {injector: this.injector},
        );
      }

      ngDoCheck() {
        log.push('DoCheck');
      }
    }

    TestBed.createComponent(Cmp).detectChanges();

    expect(log).toEqual([
      // The component gets constructed.
      'Ctor',

      // Next, the first change detection (update pass) happens, which creates the effect and
      // schedules it for execution.
      'DoCheck',

      // Then the effect runs.
      'Effect',
    ]);
  });

  it('will flush effects automatically when using autoDetectChanges', async () => {
    const val = signal('initial');
    let observed = '';
    @Component({
      selector: 'test-cmp',
      template: '',
    })
    class Cmp {
      constructor() {
        effect(() => {
          observed = val();
        });
      }
    }

    const fixture = TestBed.createComponent(Cmp);
    fixture.autoDetectChanges();

    expect(observed).toBe('initial');
    val.set('new');
    expect(observed).toBe('initial');
    await fixture.whenStable();
    expect(observed).toBe('new');
  });

  it('will run an effect with an input signal on the first CD', () => {
    let observed: string | null = null;

    @Component({
      template: '',
    })
    class Cmp {
      @Input() input!: string;
      constructor() {
        effect(() => {
          observed = this.input;
        });
      }
    }

    const fix = TestBed.createComponent(Cmp);
    fix.componentRef.setInput('input', 'hello');
    fix.detectChanges();

    expect(observed as string | null).toBe('hello');
  });

  it('should run root effects before detectChanges() when in zone mode', async () => {
    TestBed.configureTestingModule({
      providers: [provideZoneChangeDetection()],
    });
    const log: string[] = [];

    @Component({
      template: `{{ sentinel }}`,
    })
    class TestCmp {
      get sentinel(): string {
        log.push('CD');
        return '';
      }
    }

    // Instantiate the component and CD it once.
    const fix = TestBed.createComponent(TestCmp);
    fix.detectChanges();

    // Instantiate a root effect and run it once.
    const counter = signal(0);
    const appRef = TestBed.inject(ApplicationRef);
    effect(() => log.push(`effect: ${counter()}`), {injector: appRef.injector});
    await appRef.whenStable();

    log.length = 0;

    // Trigger the effect and call `detectChanges()` on the fixture.
    counter.set(1);
    fix.detectChanges(false);

    // The effect should run before the component CD.
    expect(log).toEqual(['effect: 1', 'CD']);
  });
});
