/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Component,
  EnvironmentInjector,
  ErrorHandler,
  Input,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  effect,
  signal,
} from '@angular/core';
import {DeferBlockBehavior, DeferBlockState, TestBed} from '@angular/core/testing';
import {ErrorBoundaryWrappedError, ErrorDetails} from '../../src/error_handler';
import {ɵɵdefineComponent} from '../../src/render3/definition';
import {
  BoundaryError,
  ɵɵboundaryCreate,
  ɵɵboundaryUpdate,
  ɵɵgetBoundary,
} from '../../src/render3/instructions/boundary';
import {ɵɵconditionalBranchCreate} from '../../src/render3/instructions/control_flow';
import {ɵɵtext} from '../../src/render3/instructions/text';

describe('Error Boundary Runtime Interception', () => {
  it('should intercept errors using createComponent onError', () => {
    let interceptedError: any;

    @Component({
      template: '{{ throwError() }}',
    })
    class ThrowingComponent {
      throwError() {
        throw new Error('Component Error');
      }
    }

    @Component({
      template: '<ng-container #vc></ng-container>',
    })
    class HostComponent {
      @ViewChild('vc', {read: ViewContainerRef, static: true}) vc!: ViewContainerRef;
    }

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const envInjector = TestBed.inject(EnvironmentInjector);

    fixture.componentInstance.vc.createComponent(ThrowingComponent, {
      environmentInjector: envInjector,
      onError: (e: any) => {
        interceptedError = e;
      },
    });

    // The inner component is created and attached, but it hasn't run CD yet?
    // Actually `createComponent` doesn't run CD by default, we need to call `detectChanges` on the HostComponent.
    expect(() => fixture.detectChanges()).not.toThrow();

    expect(interceptedError).toBeDefined();
    expect(interceptedError).toBeInstanceOf(Error);
    expect(interceptedError!.message).toBe('Component Error');
  });

  it('should intercept errors using createEmbeddedView onError', () => {
    let interceptedError: Error | null = null;

    @Component({
      template: `
        <ng-template #tpl>{{ throwError() }}</ng-template>
        <ng-container #vc></ng-container>
      `,
    })
    class HostComponent {
      @ViewChild('tpl', {static: true}) tpl!: TemplateRef<any>;
      @ViewChild('vc', {read: ViewContainerRef, static: true}) vc!: ViewContainerRef;

      throwError() {
        throw new Error('Template Error');
      }
    }

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    fixture.componentInstance.vc.createEmbeddedView(
      fixture.componentInstance.tpl,
      {},
      {
        onError: (e: Error) => {
          interceptedError = e;
        },
      },
    );

    expect(() => fixture.detectChanges()).not.toThrow();
    expect(interceptedError).toBeDefined();
    expect(interceptedError).toBeInstanceOf(Error);
    expect(interceptedError!.message).toBe('Template Error');
  });

  it('should intercept errors thrown during component creation (e.g. ngOnInit)', () => {
    let interceptedError: Error | null = null;

    @Component({
      template: '...',
    })
    class ThrowingInitComponent {
      ngOnInit() {
        throw new Error('Init Error');
      }
    }

    @Component({
      template: '<ng-container #vc></ng-container>',
    })
    class HostComponent {
      @ViewChild('vc', {read: ViewContainerRef, static: true}) vc!: ViewContainerRef;
    }

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const envInjector = TestBed.inject(EnvironmentInjector);

    fixture.componentInstance.vc.createComponent(ThrowingInitComponent, {
      environmentInjector: envInjector,
      onError: (e: Error) => {
        interceptedError = e;
      },
    });

    expect(() => fixture.detectChanges()).not.toThrow();

    expect(interceptedError).toBeDefined();
    expect(interceptedError).toBeInstanceOf(Error);
    expect(interceptedError!.message).toBe('Init Error');
  });

  it('should NOT intercept errors thrown during component constructor via createComponent', () => {
    let interceptedError: Error | null = null;

    @Component({
      template: '...',
    })
    class ThrowingConstructorComponent {
      constructor() {
        throw new Error('Constructor Error');
      }
    }

    @Component({
      template: '<ng-container #vc></ng-container>',
    })
    class HostComponent {
      @ViewChild('vc', {read: ViewContainerRef, static: true}) vc!: ViewContainerRef;
    }

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const envInjector = TestBed.inject(EnvironmentInjector);

    expect(() => {
      fixture.componentInstance.vc.createComponent(ThrowingConstructorComponent, {
        environmentInjector: envInjector,
        onError: (e: Error) => {
          interceptedError = e;
        },
      });
    }).toThrowError('Constructor Error');

    expect(interceptedError).toBeNull();
  });

  it('should propagate errors thrown by an onError handler up the tree', () => {
    let topError: Error | null = null;

    @Component({
      template: '<ng-container #vc></ng-container>',
    })
    class MiddleComponent {
      @ViewChild('vc', {read: ViewContainerRef, static: true}) vc!: ViewContainerRef;
    }

    @Component({
      template: '...',
    })
    class ThrowChild {
      ngOnInit() {
        throw new Error('Initial Error');
      }
    }

    @Component({
      template: '<ng-container #vc></ng-container>',
    })
    class HostComponent {
      @ViewChild('vc', {read: ViewContainerRef, static: true}) vc!: ViewContainerRef;
    }

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const middleRef = fixture.componentInstance.vc.createComponent(MiddleComponent, {
      onError: (e: Error) => {
        topError = e;
      },
    });
    fixture.detectChanges();

    middleRef.instance.vc.createComponent(ThrowChild, {
      onError: (e: Error) => {
        throw new Error('Secondary Error');
      },
    });

    expect(() => fixture.detectChanges()).not.toThrow();

    expect(topError).toBeDefined();
    expect(topError).toBeInstanceOf(Error);
    expect(topError!.message).toBe('Secondary Error');
  });

  it('should wrap non-Error exceptions in ErrorBoundaryWrappedError when used programmatically via createComponent', () => {
    let capturedError: Error | null = null;

    @Component({
      template: '{{ throwError() }}',
    })
    class ThrowingStringComponent {
      throwError() {
        throw 'This is a string error';
      }
    }

    @Component({
      template: '<ng-container #vc></ng-container>',
    })
    class HostComponent {
      @ViewChild('vc', {read: ViewContainerRef, static: true}) vc!: ViewContainerRef;
    }

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    fixture.componentInstance.vc.createComponent(ThrowingStringComponent, {
      onError: (e: Error) => {
        capturedError = e;
      },
    });

    expect(() => fixture.detectChanges()).not.toThrow();

    expect(capturedError).toBeInstanceOf(ErrorBoundaryWrappedError);
    expect(capturedError!.message).toContain(
      "Error boundary caught an error that's not an Error instance: This is a string error",
    );
  });

  it('should populate ErrorDetails correctly when caught by programmatic onError', () => {
    let capturedDetails: any;

    @Component({
      template: '{{ throwError() }}',
    })
    class ThrowingComponent {
      throwError() {
        throw new Error('Test Error');
      }
    }

    @Component({
      template: '<ng-container #vc></ng-container>',
    })
    class HostComponent {
      @ViewChild('vc', {read: ViewContainerRef, static: true}) vc!: ViewContainerRef;
    }

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const onErrorHandler = (e: Error, details: any) => {
      capturedDetails = details;
    };

    fixture.componentInstance.vc.createComponent(ThrowingComponent, {
      onError: onErrorHandler,
    });

    expect(() => fixture.detectChanges()).not.toThrow();

    expect(capturedDetails).toBeDefined();
    expect(capturedDetails.caught).toBe(true);
    expect(capturedDetails.declarationInstance).toBeInstanceOf(ThrowingComponent);
    expect(capturedDetails.declarationType).toBe(ThrowingComponent);
    expect(capturedDetails.caughtBy).toBe(onErrorHandler);
    expect(capturedDetails.boundary).toBeUndefined();
  });

  it('should catch errors from lazily loaded components', async () => {
    @Component({
      selector: 'child-cmp-defer',
      template: '<div>Child</div>',
    })
    class ChildCmpDefer {
      ngOnInit() {
        throw new Error('Child Error');
      }
    }

    @Component({
      selector: 'app-defer-test',
      template: `
        @defer (when isVisible) {
          @boundary {
            <child-cmp-defer></child-cmp-defer>
          } @error (let err) {
            <div id="fallback">Fallback: {{err.message}}</div>
          }
        } @loading {
          <div id="loading">Loading...</div>
        }
    `,
      imports: [ChildCmpDefer],
    })
    class AppDeferTest {
      isVisible = signal(false);
    }

    TestBed.configureTestingModule({deferBlockBehavior: DeferBlockBehavior.Manual});
    const fixture = TestBed.createComponent(AppDeferTest);
    await fixture.whenStable();

    fixture.componentInstance.isVisible.set(true);
    await fixture.whenStable();

    const deferBlocks = await fixture.getDeferBlocks();
    await deferBlocks[0].render(DeferBlockState.Complete);

    expect(fixture.nativeElement.textContent).toContain('Fallback: Child Error');
  });

  it('does not support catching errors from projected content', () => {
    @Component({
      selector: 'throws-error',
      template: '<div>Throws</div>',
    })
    class ThrowsError {
      ngOnInit() {
        throw new Error('Projected Error');
      }
    }

    @Component({
      selector: 'wrapper',
      template: `
        @boundary {
          <ng-content></ng-content>
        } @error {
          <div id="fallback">Fallback</div>
        }
      `,
    })
    class Wrapper {}

    @Component({
      selector: 'app',
      template: `
        <wrapper>
          <throws-error></throws-error>
        </wrapper>
      `,
      imports: [Wrapper, ThrowsError],
    })
    class App {}

    const fixture = TestBed.createComponent(App);
    // This will throw if the boundary doesn't catch it, because rethrowApplicationErrors: false
    // only prevents global throwing, but we want to see if the fallback renders.
    expect(() => fixture.detectChanges()).toThrow();
  });

  it('should support nested boundaries and fallback cascading', async () => {
    @Component({
      selector: 'nested-throwing-cmp',
      template: '{{ throwError() }}',
    })
    class NestedThrowingComponent {
      throwError() {
        throw new Error('Test Error');
      }
    }

    @Component({
      template: `
        @boundary {
          @boundary {
            @if (show()) {
              <nested-throwing-cmp />
            }
          } @error {
            Inner Fallback
            {{ maybeThrow() }}
          }
        } @error {
          Outer Fallback
        }
      `,
      imports: [NestedThrowingComponent],
    })
    class HostComponent {
      show = signal(false);
      shouldInnerThrow = signal(false);
      maybeThrow() {
        if (this.shouldInnerThrow()) {
          throw new Error('Inner Fallback Error');
        }
        return '';
      }
    }

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    // Trigger the inner component to throw
    fixture.componentInstance.show.set(true);
    await fixture.whenStable();

    // Inner boundary catches it
    expect(fixture.nativeElement.textContent).toContain('Inner Fallback');
    expect(fixture.nativeElement.textContent).not.toContain('Outer Fallback');

    // Now cause the inner boundary's error block to throw
    fixture.componentInstance.shouldInnerThrow.set(true);
    // Triggering CD will evaluate maybeThrow() in the inner error block and throw
    await fixture.whenStable();
    // Outer boundary should catch the error from the inner boundary's error block
    expect(fixture.nativeElement.textContent).toContain('Outer Fallback');
    expect(fixture.nativeElement.textContent).not.toContain('Inner Fallback');
  });

  it('should catch errors from dynamically inserted components (ViewContainerRef)', async () => {
    @Component({
      selector: 'dynamic-throw',
      template: '{{ throwError() }}',
    })
    class DynamicThrowComponent {
      throwError() {
        throw new Error('Dynamic Error');
      }
    }

    @Component({
      selector: 'vcr-host',
      template: `
        @boundary {
          <ng-container #vcr></ng-container>
        } @error {
          Fallback
        }
      `,
      imports: [DynamicThrowComponent],
    })
    class VcrHost {
      @ViewChild('vcr', {read: ViewContainerRef}) vcr!: ViewContainerRef;
    }

    const fixture = TestBed.createComponent(VcrHost);
    fixture.detectChanges();

    // Inject the dynamic component which will throw during its update phase
    fixture.componentInstance.vcr.createComponent(DynamicThrowComponent);
    // Since vcr.createComponent synchronously renders the new component, if it throws during
    // initialization or initial template evaluation, it should be caught.
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('Fallback');
  });

  it('should catch errors thrown during @for loop evaluation', async () => {
    @Component({
      selector: 'for-host',
      template: `
        @boundary {
          <ul>
            @for (item of items(); track trackFn(item)) {
              <li>{{item}}</li>
            }
          </ul>
        } @error {
          Fallback
        }
      `,
    })
    class ForHost {
      items = signal([1]);

      trackFn(item: number) {
        if (item === 2) {
          throw new Error('Track Error');
        }
        return item;
      }
    }

    const fixture = TestBed.createComponent(ForHost);
    await fixture.whenStable();

    // initially passes
    expect(fixture.nativeElement.textContent).toContain('1');

    // trigger the error in the track function
    fixture.componentInstance.items.set([1, 2, 3]);
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('Fallback');
  });
});

describe('@boundary runtime instructions (JIT)', () => {
  @Component({
    selector: 'throwing-ctor',
    template: '',
  })
  class ThrowingCtor {
    constructor() {
      throw new Error('Ctor Error');
    }
  }

  @Component({
    selector: 'throwing-hook',
    template: '',
  })
  class ThrowingHook {
    @Input() shouldThrow = false;
    ngOnChanges() {
      if (this.shouldThrow) {
        throw new Error('Hook Error');
      }
    }
  }

  it('should intercept errors thrown during component constructor', () => {
    @Component({
      template: `
        @boundary {
          <throwing-ctor></throwing-ctor>
          Main Content
        } @error (let err) {
          Error: {{err.message}}
        }
      `,
      imports: [ThrowingCtor],
    })
    class HostComponent {}

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Error: Ctor Error');
    expect(fixture.nativeElement.textContent).not.toContain('Main Content');
  });

  it('should intercept errors during the update phase (lifecycle hook)', async () => {
    @Component({
      template: `
        @boundary {
          <throwing-hook [shouldThrow]="triggerError()"></throwing-hook>
          Main Content
        } @error (let err) {
          Error: {{err.message}}
        }
      `,
      imports: [ThrowingHook],
    })
    class HostComponent {
      triggerError = signal(false);
    }

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Main Content');

    fixture.componentInstance.triggerError.set(true);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('Error: Hook Error');
  });

  it('should intercept errors during the update phase (template binding)', async () => {
    @Component({
      template: `
        @boundary {
          {{ throwInBinding() }}
          Main Content
        } @error (let err) {
          Error: {{err.message}}
        }
      `,
    })
    class HostComponent {
      doThrow = signal(false);
      throwInBinding() {
        if (this.doThrow()) {
          throw new Error('Binding Error');
        }
        return '';
      }
    }

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Main Content');

    fixture.componentInstance.doThrow.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Error: Binding Error');
  });

  it('should intercept errors from child view created during update', async () => {
    @Component({
      template: `
        @boundary {
          @if (showChild()) {
            <throwing-ctor></throwing-ctor>
          }
          Main Content
        } @error (let err) {
          Error: {{err.message}}
        }
      `,
      imports: [ThrowingCtor],
    })
    class HostComponent {
      showChild = signal(false);
    }

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Main Content');

    fixture.componentInstance.showChild.set(true);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('Error: Ctor Error');
  });

  it('should not intercept errors originating from the error block', async () => {
    let topError: any;
    const CustomErrorHandler = {
      handleError(error: any) {
        topError = error;
      },
    };

    @Component({
      template: `
        @boundary {
          {{ throwInBinding() }}
        } @error (let err) {
          {{ throwInErrorBlock() }}
        }
      `,
    })
    class HostComponent {
      doThrow = signal(false);
      throwInBinding() {
        if (this.doThrow()) {
          throw new Error('Primary Error');
        }
        return '';
      }
      throwInErrorBlock() {
        throw new Error('Secondary Error');
      }
    }

    TestBed.configureTestingModule({
      providers: [{provide: ErrorHandler, useValue: CustomErrorHandler}],
      rethrowApplicationErrors: false,
    });

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    fixture.componentInstance.doThrow.set(true);
    await fixture.whenStable();

    expect(topError).toBeDefined();
    expect((topError as any).message).toBe('Secondary Error');
  });

  it('should throw BoundaryError when no branch matches and an error exists', async () => {
    let topError: any;
    const CustomErrorHandler = {
      handleError(error: any) {
        topError = error;
      },
    };

    class TestComponent {
      doThrow = signal(false);
      static ɵfac = () => new TestComponent();
    }
    const emptyTemplate = function (rf: number, ctx: any) {};
    (TestComponent as any).ɵcmp = ɵɵdefineComponent({
      type: TestComponent,
      selectors: [['test-comp']],
      decls: 2,
      vars: 1,
      template: function (rf: number, ctx: TestComponent) {
        if (rf & 1) {
          ɵɵboundaryCreate(0);
          ɵɵconditionalBranchCreate(1, emptyTemplate, 0, 0);
        }
        if (rf & 2) {
          const boundary = ɵɵgetBoundary(0);
          if (ctx.doThrow()) {
            boundary.error = new Error('Original Error');
            ɵɵboundaryUpdate(0, -1, 1); // Force -1 (no match)
          } else {
            ɵɵboundaryUpdate(0, 1, 1); // Normal path
          }
        }
      },
    });

    TestBed.configureTestingModule({
      providers: [{provide: ErrorHandler, useValue: CustomErrorHandler}],
      rethrowApplicationErrors: false,
    });

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    fixture.componentInstance.doThrow.set(true);
    await fixture.whenStable();

    expect(topError).toBeDefined();
    expect(topError).toBeInstanceOf(BoundaryError);
    expect(topError.message).toBe('Unhandled error in @boundary fell through.');
    expect(topError.cause).toBeDefined();
    expect(topError.cause.message).toBe('Original Error');
  });

  it('should support retry() mechanics in @error block', async () => {
    let retryFn: (() => void) | undefined;

    class TestComponent {
      doThrow = signal(true);
      static ɵfac = () => new TestComponent();
    }

    (TestComponent as any).ɵcmp = ɵɵdefineComponent({
      type: TestComponent,
      selectors: [['test-comp']],
      decls: 3,
      vars: 1,
      template: function (rf: number, ctx: TestComponent) {
        if (rf & 1) {
          ɵɵboundaryCreate(0);
          ɵɵconditionalBranchCreate(
            1,
            function (rf: number, ctx: any) {
              if (rf & 1) {
                ɵɵtext(0, 'Main Content');
              }
            },
            1,
            0,
          );
          ɵɵconditionalBranchCreate(
            2,
            function (rf: number, ctx: any) {
              if (rf & 1) {
                ɵɵtext(0, 'Error Content');
              }
              if (rf & 2) {
                retryFn = ctx.$retry;
              }
            },
            1,
            0,
          );
        }
        if (rf & 2) {
          const boundary = ɵɵgetBoundary(0);
          if (ctx.doThrow()) {
            boundary.error = new Error('Original Error');
            ɵɵboundaryUpdate(0, 2, 1); // Render error branch (index 2)
          } else {
            ɵɵboundaryUpdate(0, 1, 1); // Render primary branch (index 1)
          }
        }
      },
    });

    TestBed.configureTestingModule({
      rethrowApplicationErrors: false,
    });

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    // Initially it should be in error state
    expect(fixture.nativeElement.textContent).toContain('Error Content');
    expect(retryFn).toBeDefined();

    // Now we "fix" the state that caused the error
    fixture.componentInstance.doThrow.set(false);

    // And call retry (which is tearable)
    retryFn!();

    // Wait for change detection triggered by markViewForRefresh
    await fixture.whenStable();

    // Now it should be in primary state
    expect(fixture.nativeElement.textContent).toContain('Main Content');
  });

  it('should support full aliasing in @error block via compiler', async () => {
    @Component({
      template: `
        @boundary {
          @if (doThrow()) {
            {{ throwError() }}
          } @else {
            Main Content
          }
        } @error (let err, r = $retry) {
          Error: {{err.message}}
          <button (click)="r()">Retry</button>
        }
      `,
    })
    class HostComponent {
      doThrow = signal(true);
      throwError() {
        throw new Error('Binding Error');
      }
      static ɵfac = () => new HostComponent();
    }

    TestBed.configureTestingModule({
      rethrowApplicationErrors: false,
    });

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('Error: Binding Error');

    // Fix state
    fixture.componentInstance.doThrow.set(false);

    // Click retry button
    const button = fixture.nativeElement.querySelector('button');
    button.click();

    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('Main Content');
  });

  it('should support calling referencing $retry', async () => {
    @Component({
      template: `
        @boundary {
          {{ throwError() }}
        } @error (let err) {
          Error: {{err.message}}
          <button (click)="$retry()">Retry</button>
        }
      `,
    })
    class HostComponent {
      doThrow = signal(true);
      throwError() {
        if (this.doThrow()) {
          throw new Error('Binding Error');
        }
        return 'Main Content';
      }
    }

    TestBed.configureTestingModule({
      rethrowApplicationErrors: false,
    });

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('Error: Binding Error');

    // Fix state
    fixture.componentInstance.doThrow.set(false);

    // Click retry button
    const button = fixture.nativeElement.querySelector('button');
    button.click();

    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('Main Content');
  });

  it('should support referencing $error directly', async () => {
    @Component({
      template: `
        @boundary {
          @if (doThrow()) {
            {{ throwError() }}
          } @else {
            Main Content
          }
        } @error {
          Error: {{$error.message}}
        }
      `,
    })
    class HostComponent {
      doThrow = signal(true);
      throwError() {
        throw new Error('Binding Error');
      }
    }

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('Error: Binding Error');
  });

  it('should support tearing $retry and calling it asynchronously', async () => {
    @Component({
      template: `
        @boundary {
          @if (doThrow()) {
            {{ throwError() }}
          } @else {
            Main Content
          }
        } @error (let err, r = $retry) {
          Error: {{err.message}}
          <button (click)="handleRetry(r)">Retry Later</button>
        }
      `,
    })
    class HostComponent {
      doThrow = signal(true);
      throwError() {
        throw new Error('Binding Error');
      }
      handleRetry(retryFn: Function) {
        setTimeout(() => retryFn(), 0);
      }
      static ɵfac = () => new HostComponent();
    }

    TestBed.configureTestingModule({
      rethrowApplicationErrors: false,
    });

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('Error: Binding Error');

    // Fix state
    fixture.componentInstance.doThrow.set(false);

    // Click retry button
    const button = fixture.nativeElement.querySelector('button');
    button.click();

    // Wait for setTimeout
    await new Promise((resolve) => setTimeout(resolve, 10));
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('Main Content');
  });

  it('should support multiple @error blocks with when conditions', async () => {
    class ChartError extends Error {
      constructor(message: string) {
        super(message);
        this.name = 'ChartError';
      }
    }

    @Component({
      template: `
        @boundary {
          @if (doThrow()) {
            {{ throwError() }}
          } @else {
            Main Content
          }
        } @error (let err; r = $retry; when isChartError(err)) {
          Chart Error: {{err.message}}
          <button id="retry-chart" (click)="r()">Retry</button>
        } @error (let error; r = $retry) {
          Generic Error: {{error.message}}
          <button id="retry-generic" (click)="r()">Retry</button>
        }
      `,
    })
    class HostComponent {
      doThrow = signal(true);
      errorToThrow: Error = new ChartError('Chart Failed');

      throwError() {
        throw this.errorToThrow;
      }

      isChartError(e: any) {
        return e instanceof ChartError;
      }
    }

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('Chart Error: Chart Failed');

    // Click retry button to clear error and reset state to allow throwing again
    const button = fixture.nativeElement.querySelector('#retry-chart');
    button.click();

    fixture.componentInstance.doThrow.set(false);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Main Content');

    // Change error type and throw again
    fixture.componentInstance.errorToThrow = new Error('Generic Failed');
    fixture.componentInstance.doThrow.set(true);

    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('Generic Error: Generic Failed');
  });

  it('should fall through and rethrow if no @error block matches', async () => {
    class ChartError extends Error {
      constructor(message: string) {
        super(message);
        this.name = 'ChartError';
      }
    }

    let topError: any;
    const CustomErrorHandler = {
      handleError(error: any) {
        topError = error;
      },
    };

    @Component({
      template: `
        @boundary {
          @if (doThrow()) {
            {{ throwError() }}
          }
        } @error (let err; when isChartError(err)) {
          Chart Error: {{err.message}}
        }
      `,
    })
    class HostComponent {
      doThrow = signal(true);
      errorToThrow: Error = new Error('Generic Failed');

      throwError() {
        throw this.errorToThrow;
      }

      isChartError(e: any) {
        return e instanceof ChartError;
      }
    }

    TestBed.configureTestingModule({
      rethrowApplicationErrors: true,
    });

    const fixture = TestBed.createComponent(HostComponent);

    expect(() => {
      fixture.detectChanges();
    }).toThrowError(/Unhandled error in @boundary fell through/);
  });

  it('should intercept errors thrown inside an effect', async () => {
    @Component({
      selector: 'throwing-effect',
      template: '',
    })
    class ThrowingEffectComponent {
      constructor() {
        effect(() => {
          throw new Error('Effect Error');
        });
      }
    }

    @Component({
      template: `
        @boundary {
          <throwing-effect></throwing-effect>
          Main Content
        } @error (let err) {
          Error: {{err.message}}
        }
      `,
      imports: [ThrowingEffectComponent],
    })
    class HostComponent {}

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    // Effects are scheduled and execute asynchronously or during change detection.
    // wait for them to run.
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('Error: Effect Error');
  });

  it('should populate ErrorDetails correctly when caught by @boundary and handled by ErrorHandler.onViewError', () => {
    let capturedDetails!: ErrorDetails;
    let capturedError: any;

    const CustomErrorHandler = {
      handleError: () => {},
      onViewError: (e: any, details: any) => {
        capturedError = e;
        capturedDetails = details;
      },
    };

    @Component({
      selector: 'throwing-cmp',
      template: '{{ throwError() }}',
    })
    class ThrowingComponent {
      throwError() {
        throw new Error('Test Error');
      }
    }

    @Component({
      template: `
        @boundary {
          <throwing-cmp />
        } @error {
          <p>Fallback</p>
        }
      `,
      imports: [ThrowingComponent],
    })
    class HostComponent {}

    TestBed.configureTestingModule({
      providers: [{provide: ErrorHandler, useValue: CustomErrorHandler}],
    });

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    expect(capturedDetails).toBeDefined();
    expect(capturedDetails.caught).toBe(true);
    expect(capturedDetails.declarationInstance).toBeInstanceOf(ThrowingComponent);
    expect(capturedDetails.declarationType).toBe(ThrowingComponent);
    expect(capturedDetails.boundary).toBeDefined();
    expect(capturedDetails.boundary!.type).toBe(HostComponent);
    expect(typeof capturedDetails.boundary!.reset).toBe('function');
  });
});
