import {
  Component,
  ViewContainerRef,
  ViewChild,
  TemplateRef,
  EnvironmentInjector,
  Input,
  signal,
} from '@angular/core';
import {TestBed, ComponentFixture} from '@angular/core/testing';
import {ɵɵdefineComponent} from '../../src/render3/definition';
import {
  ɵɵboundaryCreate,
  ɵɵboundaryUpdate,
  ɵɵgetBoundary,
  BoundaryError,
} from '../../src/render3/instructions/boundary';
import {ɵɵconditionalBranchCreate} from '../../src/render3/instructions/control_flow';
import {ɵɵtext} from '../../src/render3/instructions/text';

describe('Error Boundary Runtime Interception', () => {
  it('should intercept errors using createComponent onError', () => {
    let interceptedError: any;

    @Component({
      template: '{{ throwError() }}',
      standalone: true,
    })
    class ThrowingComponent {
      throwError() {
        throw new Error('Component Error');
      }
    }

    @Component({
      template: '<ng-container #vc></ng-container>',
      standalone: true,
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
      standalone: true,
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
      standalone: true,
    })
    class ThrowingInitComponent {
      ngOnInit() {
        throw new Error('Init Error');
      }
    }

    @Component({
      template: '<ng-container #vc></ng-container>',
      standalone: true,
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
      standalone: true,
    })
    class ThrowingConstructorComponent {
      constructor() {
        throw new Error('Constructor Error');
      }
    }

    @Component({
      template: '<ng-container #vc></ng-container>',
      standalone: true,
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
      standalone: true,
    })
    class MiddleComponent {
      @ViewChild('vc', {read: ViewContainerRef, static: true}) vc!: ViewContainerRef;
    }

    @Component({
      template: '...',
      standalone: true,
    })
    class ThrowChild {
      ngOnInit() {
        throw new Error('Initial Error');
      }
    }

    @Component({
      template: '<ng-container #vc></ng-container>',
      standalone: true,
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
});

describe('@boundary runtime instructions (JIT)', () => {
  @Component({
    selector: 'throwing-ctor',
    template: '',
    standalone: true,
  })
  class ThrowingCtor {
    constructor() {
      throw new Error('Ctor Error');
    }
  }

  @Component({
    selector: 'throwing-hook',
    template: '',
    standalone: true,
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
      standalone: true,
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
      standalone: true,
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
      standalone: true,
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
      standalone: true,
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
      standalone: true,
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
      standalone: true,
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
      standalone: true,
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
      standalone: true,
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
      standalone: true,
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
});
