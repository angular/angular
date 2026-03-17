import {
  Component,
  ViewContainerRef,
  ViewChild,
  TemplateRef,
  EnvironmentInjector,
} from '@angular/core';
import {TestBed} from '@angular/core/testing';

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

  it('should intercept errors thrown during component constructor via createComponent', () => {
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
