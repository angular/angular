import {Directionality} from '@angular/cdk/bidi';
import {A, ESCAPE} from '@angular/cdk/keycodes';
import {OverlayContainer} from '@angular/cdk/overlay';
import {ViewportRuler} from '@angular/cdk/scrolling';
import {dispatchKeyboardEvent} from '@angular/cdk/testing';
import {
  Component,
  Directive,
  Inject,
  Injector,
  NgModule,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import {
  ComponentFixture,
  fakeAsync,
  flush,
  flushMicrotasks,
  inject,
  TestBed,
  tick,
} from '@angular/core/testing';
import {Location} from '@angular/common';
import {SpyLocation} from '@angular/common/testing';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MatBottomSheet, MAT_BOTTOM_SHEET_DEFAULT_OPTIONS} from './bottom-sheet';
import {MAT_BOTTOM_SHEET_DATA, MatBottomSheetConfig} from './bottom-sheet-config';
import {MatBottomSheetModule} from './bottom-sheet-module';
import {MatBottomSheetRef} from './bottom-sheet-ref';


describe('MatBottomSheet', () => {
  let bottomSheet: MatBottomSheet;
  let overlayContainer: OverlayContainer;
  let overlayContainerElement: HTMLElement;
  let viewportRuler: ViewportRuler;

  let testViewContainerRef: ViewContainerRef;
  let viewContainerFixture: ComponentFixture<ComponentWithChildViewContainer>;
  let mockLocation: SpyLocation;

  beforeEach(fakeAsync(() => {
    TestBed
      .configureTestingModule({
        imports: [MatBottomSheetModule, BottomSheetTestModule],
        providers: [{provide: Location, useClass: SpyLocation}]
      })
      .compileComponents();
  }));

  beforeEach(inject([MatBottomSheet, OverlayContainer, ViewportRuler, Location],
    (bs: MatBottomSheet, oc: OverlayContainer, vr: ViewportRuler, l: Location) => {
      bottomSheet = bs;
      overlayContainer = oc;
      viewportRuler = vr;
      overlayContainerElement = oc.getContainerElement();
      mockLocation = l as SpyLocation;
    }));

  afterEach(() => {
    overlayContainer.ngOnDestroy();
  });

  beforeEach(() => {
    viewContainerFixture = TestBed.createComponent(ComponentWithChildViewContainer);

    viewContainerFixture.detectChanges();
    testViewContainerRef = viewContainerFixture.componentInstance.childViewContainer;
  });

  it('should open a bottom sheet with a component', () => {
    const bottomSheetRef = bottomSheet.open(PizzaMsg, {viewContainerRef: testViewContainerRef});

    viewContainerFixture.detectChanges();

    expect(overlayContainerElement.textContent).toContain('Pizza');
    expect(bottomSheetRef.instance instanceof PizzaMsg).toBe(true);
    expect(bottomSheetRef.instance.bottomSheetRef).toBe(bottomSheetRef);
  });

  it('should open a bottom sheet with a template', () => {
    const templateRefFixture = TestBed.createComponent(ComponentWithTemplateRef);
    templateRefFixture.componentInstance.localValue = 'Bees';
    templateRefFixture.detectChanges();

    const bottomSheetRef = bottomSheet.open(templateRefFixture.componentInstance.templateRef, {
      data: {value: 'Knees'}
    });

    viewContainerFixture.detectChanges();

    expect(overlayContainerElement.textContent).toContain('Cheese Bees Knees');
    expect(templateRefFixture.componentInstance.bottomSheetRef).toBe(bottomSheetRef);
  });

  it('should position the bottom sheet at the bottom center of the screen', () => {
    bottomSheet.open(PizzaMsg, {viewContainerRef: testViewContainerRef});

    viewContainerFixture.detectChanges();

    const containerElement = overlayContainerElement.querySelector('mat-bottom-sheet-container')!;
    const containerRect = containerElement.getBoundingClientRect();
    const viewportSize = viewportRuler.getViewportSize();

    expect(Math.floor(containerRect.bottom)).toBe(Math.floor(viewportSize.height));
    expect(Math.floor(containerRect.left + containerRect.width / 2))
        .toBe(Math.floor(viewportSize.width / 2));
  });

  it('should emit when the bottom sheet opening animation is complete', fakeAsync(() => {
    const bottomSheetRef = bottomSheet.open(PizzaMsg, {viewContainerRef: testViewContainerRef});
    const spy = jasmine.createSpy('afterOpened spy');

    bottomSheetRef.afterOpened().subscribe(spy);
    viewContainerFixture.detectChanges();

    // callback should not be called before animation is complete
    expect(spy).not.toHaveBeenCalled();

    flushMicrotasks();
    expect(spy).toHaveBeenCalled();
  }));

  it('should use the correct injector', () => {
    const bottomSheetRef = bottomSheet.open(PizzaMsg, {viewContainerRef: testViewContainerRef});
    viewContainerFixture.detectChanges();
    const injector = bottomSheetRef.instance.injector;

    expect(bottomSheetRef.instance.bottomSheetRef).toBe(bottomSheetRef);
    expect(injector.get<DirectiveWithViewContainer>(DirectiveWithViewContainer)).toBeTruthy();
  });

  it('should open a bottom sheet with a component and no ViewContainerRef', () => {
    const bottomSheetRef = bottomSheet.open(PizzaMsg);

    viewContainerFixture.detectChanges();

    expect(overlayContainerElement.textContent).toContain('Pizza');
    expect(bottomSheetRef.instance instanceof PizzaMsg).toBe(true);
    expect(bottomSheetRef.instance.bottomSheetRef).toBe(bottomSheetRef);
  });

  it('should apply the correct role to the container element', () => {
    bottomSheet.open(PizzaMsg);

    viewContainerFixture.detectChanges();

    const containerElement = overlayContainerElement.querySelector('mat-bottom-sheet-container')!;
    expect(containerElement.getAttribute('role')).toBe('dialog');
  });

  it('should close a bottom sheet via the escape key', fakeAsync(() => {
    bottomSheet.open(PizzaMsg, {viewContainerRef: testViewContainerRef});

    dispatchKeyboardEvent(document.body, 'keydown', ESCAPE);
    viewContainerFixture.detectChanges();
    flush();

    expect(overlayContainerElement.querySelector('mat-bottom-sheet-container')).toBeNull();
  }));

  it('should close when clicking on the overlay backdrop', fakeAsync(() => {
    bottomSheet.open(PizzaMsg, {
      viewContainerRef: testViewContainerRef
    });

    viewContainerFixture.detectChanges();

    let backdrop = overlayContainerElement.querySelector('.cdk-overlay-backdrop') as HTMLElement;

    backdrop.click();
    viewContainerFixture.detectChanges();
    flush();

    expect(overlayContainerElement.querySelector('mat-bottom-sheet-container')).toBeFalsy();
  }));

  it('should emit the backdropClick stream when clicking on the overlay backdrop', fakeAsync(() => {
    const bottomSheetRef = bottomSheet.open(PizzaMsg, {viewContainerRef: testViewContainerRef});
    const spy = jasmine.createSpy('backdropClick spy');

    bottomSheetRef.backdropClick().subscribe(spy);
    viewContainerFixture.detectChanges();

    const backdrop = overlayContainerElement.querySelector('.cdk-overlay-backdrop') as HTMLElement;

    backdrop.click();
    expect(spy).toHaveBeenCalledTimes(1);

    viewContainerFixture.detectChanges();
    flush();

    // Additional clicks after the bottom sheet was closed should not be emitted
    backdrop.click();
    expect(spy).toHaveBeenCalledTimes(1);
  }));

  it('should emit the keyboardEvent stream when key events target the overlay', fakeAsync(() => {
    const bottomSheetRef = bottomSheet.open(PizzaMsg, {viewContainerRef: testViewContainerRef});
    const spy = jasmine.createSpy('keyboardEvent spy');

    bottomSheetRef.keydownEvents().subscribe(spy);
    viewContainerFixture.detectChanges();

    const backdrop = overlayContainerElement.querySelector('.cdk-overlay-backdrop') as HTMLElement;
    const container =
        overlayContainerElement.querySelector('mat-bottom-sheet-container') as HTMLElement;
    dispatchKeyboardEvent(document.body, 'keydown', A);
    dispatchKeyboardEvent(document.body, 'keydown', A, backdrop);
    dispatchKeyboardEvent(document.body, 'keydown', A, container);

    expect(spy).toHaveBeenCalledTimes(3);
  }));

  it('should allow setting the layout direction', () => {
    bottomSheet.open(PizzaMsg, {direction: 'rtl'});

    viewContainerFixture.detectChanges();

    let overlayPane = overlayContainerElement.querySelector('.cdk-global-overlay-wrapper')!;

    expect(overlayPane.getAttribute('dir')).toBe('rtl');
  });

  it('should inject the correct direction in the instantiated component', () => {
    const bottomSheetRef = bottomSheet.open(PizzaMsg, {direction: 'rtl'});

    viewContainerFixture.detectChanges();

    expect(bottomSheetRef.instance.directionality.value).toBe('rtl');
  });

  it('should fall back to injecting the global direction if none is passed by the config', () => {
    const bottomSheetRef = bottomSheet.open(PizzaMsg, {});

    viewContainerFixture.detectChanges();

    expect(bottomSheetRef.instance.directionality.value).toBe('ltr');
  });

  it('should be able to set a custom panel class', () => {
    bottomSheet.open(PizzaMsg, {
      panelClass: 'custom-panel-class',
      viewContainerRef: testViewContainerRef
    });

    viewContainerFixture.detectChanges();

    expect(overlayContainerElement.querySelector('.custom-panel-class')).toBeTruthy();
  });

  it('should be able to set a custom aria-label', () => {
    bottomSheet.open(PizzaMsg, {
      ariaLabel: 'Hello there',
      viewContainerRef: testViewContainerRef
    });
    viewContainerFixture.detectChanges();

    const container = overlayContainerElement.querySelector('mat-bottom-sheet-container')!;
    expect(container.getAttribute('aria-label')).toBe('Hello there');
  });

  it('should be able to get dismissed through the service', fakeAsync(() => {
    bottomSheet.open(PizzaMsg);
    viewContainerFixture.detectChanges();
    expect(overlayContainerElement.childElementCount).toBeGreaterThan(0);

    bottomSheet.dismiss();
    viewContainerFixture.detectChanges();
    flush();

    expect(overlayContainerElement.childElementCount).toBe(0);
  }));

  it('should dismiss the bottom sheet when the service is destroyed', fakeAsync(() => {
    bottomSheet.open(PizzaMsg);
    viewContainerFixture.detectChanges();
    expect(overlayContainerElement.childElementCount).toBeGreaterThan(0);

    bottomSheet.ngOnDestroy();
    viewContainerFixture.detectChanges();
    flush();

    expect(overlayContainerElement.childElementCount).toBe(0);
  }));

  it('should open a new bottom sheet after dismissing a previous sheet', fakeAsync(() => {
    let config: MatBottomSheetConfig = {viewContainerRef: testViewContainerRef};
    let bottomSheetRef: MatBottomSheetRef<any> = bottomSheet.open(PizzaMsg, config);

    viewContainerFixture.detectChanges();

    bottomSheetRef.dismiss();
    viewContainerFixture.detectChanges();

    // Wait for the dismiss animation to finish.
    flush();
    bottomSheetRef = bottomSheet.open(TacoMsg, config);
    viewContainerFixture.detectChanges();

    // Wait for the open animation to finish.
    flush();
    expect(bottomSheetRef.containerInstance._animationState)
        .toBe('visible', `Expected the animation state would be 'visible'.`);
  }));

  it('should remove past bottom sheets when opening new ones', fakeAsync(() => {
    bottomSheet.open(PizzaMsg);
    viewContainerFixture.detectChanges();

    bottomSheet.open(TacoMsg);
    viewContainerFixture.detectChanges();
    flush();

    expect(overlayContainerElement.textContent).toContain('Taco');
  }));

  it('should not throw when opening multiple bottom sheet in quick succession', fakeAsync(() => {
    expect(() => {
      for (let i = 0; i < 3; i++) {
        bottomSheet.open(PizzaMsg);
        viewContainerFixture.detectChanges();
      }

      flush();
    }).not.toThrow();
  }));

  it('should remove bottom sheet if another is shown while its still animating open',
    fakeAsync(() => {
      bottomSheet.open(PizzaMsg);
      viewContainerFixture.detectChanges();

      bottomSheet.open(TacoMsg);
      viewContainerFixture.detectChanges();

      tick();
      expect(overlayContainerElement.textContent).toContain('Taco');
      tick(500);
    }));

  it('should emit after being dismissed', fakeAsync(() => {
    const bottomSheetRef = bottomSheet.open(PizzaMsg);
    const spy = jasmine.createSpy('afterDismissed spy');

    bottomSheetRef.afterDismissed().subscribe(spy);
    viewContainerFixture.detectChanges();

    bottomSheetRef.dismiss();
    viewContainerFixture.detectChanges();
    flush();

    expect(spy).toHaveBeenCalledTimes(1);
  }));

  it('should be able to pass a result back to the dismissed stream', fakeAsync(() => {
    const bottomSheetRef = bottomSheet.open<PizzaMsg, any, number>(PizzaMsg);
    const spy = jasmine.createSpy('afterDismissed spy');

    bottomSheetRef.afterDismissed().subscribe(spy);
    viewContainerFixture.detectChanges();

    bottomSheetRef.dismiss(1337);
    viewContainerFixture.detectChanges();
    flush();

    expect(spy).toHaveBeenCalledWith(1337);
  }));

  it('should close the bottom sheet when going forwards/backwards in history', fakeAsync(() => {
    bottomSheet.open(PizzaMsg);

    expect(overlayContainerElement.querySelector('mat-bottom-sheet-container')).toBeTruthy();

    mockLocation.simulateUrlPop('');
    viewContainerFixture.detectChanges();
    flush();

    expect(overlayContainerElement.querySelector('mat-bottom-sheet-container')).toBeFalsy();
  }));

  it('should close the bottom sheet when the location hash changes', fakeAsync(() => {
    bottomSheet.open(PizzaMsg);

    expect(overlayContainerElement.querySelector('mat-bottom-sheet-container')).toBeTruthy();

    mockLocation.simulateHashChange('');
    viewContainerFixture.detectChanges();
    flush();

    expect(overlayContainerElement.querySelector('mat-bottom-sheet-container')).toBeFalsy();
  }));

  it('should allow the consumer to disable closing a bottom sheet on navigation', fakeAsync(() => {
    bottomSheet.open(PizzaMsg, {closeOnNavigation: false});

    expect(overlayContainerElement.querySelector('mat-bottom-sheet-container')).toBeTruthy();

    mockLocation.simulateUrlPop('');
    viewContainerFixture.detectChanges();
    flush();

    expect(overlayContainerElement.querySelector('mat-bottom-sheet-container')).toBeTruthy();
  }));

  describe('passing in data', () => {
    it('should be able to pass in data', () => {
      const config = {
        data: {
          stringParam: 'hello',
          dateParam: new Date()
        }
      };

      const instance = bottomSheet.open(BottomSheetWithInjectedData, config).instance;

      expect(instance.data.stringParam).toBe(config.data.stringParam);
      expect(instance.data.dateParam).toBe(config.data.dateParam);
    });

    it('should default to null if no data is passed', () => {
      expect(() => {
        const bottomSheetRef = bottomSheet.open(BottomSheetWithInjectedData);
        expect(bottomSheetRef.instance.data).toBeNull();
      }).not.toThrow();
    });
  });

  describe('disableClose option', () => {
    it('should prevent closing via clicks on the backdrop', fakeAsync(() => {
      bottomSheet.open(PizzaMsg, {
        disableClose: true,
        viewContainerRef: testViewContainerRef
      });

      viewContainerFixture.detectChanges();

      let backdrop = overlayContainerElement.querySelector('.cdk-overlay-backdrop') as HTMLElement;
      backdrop.click();
      viewContainerFixture.detectChanges();
      flush();

      expect(overlayContainerElement.querySelector('mat-bottom-sheet-container')).toBeTruthy();
    }));

    it('should prevent closing via the escape key', fakeAsync(() => {
      bottomSheet.open(PizzaMsg, {
        disableClose: true,
        viewContainerRef: testViewContainerRef
      });

      viewContainerFixture.detectChanges();
      dispatchKeyboardEvent(document.body, 'keydown', ESCAPE);
      viewContainerFixture.detectChanges();
      flush();

      expect(overlayContainerElement.querySelector('mat-bottom-sheet-container')).toBeTruthy();
    }));

    it('should allow for the disableClose option to be updated while open', fakeAsync(() => {
      let bottomSheetRef = bottomSheet.open(PizzaMsg, {
        disableClose: true,
        viewContainerRef: testViewContainerRef
      });

      viewContainerFixture.detectChanges();

      let backdrop = overlayContainerElement.querySelector('.cdk-overlay-backdrop') as HTMLElement;
      backdrop.click();

      expect(overlayContainerElement.querySelector('mat-bottom-sheet-container')).toBeTruthy();

      bottomSheetRef.disableClose = false;
      backdrop.click();
      viewContainerFixture.detectChanges();
      flush();

      expect(overlayContainerElement.querySelector('mat-bottom-sheet-container')).toBeFalsy();
    }));

  });

  describe('hasBackdrop option', () => {
    it('should have a backdrop', () => {
      bottomSheet.open(PizzaMsg, {
        hasBackdrop: true,
        viewContainerRef: testViewContainerRef
      });

      viewContainerFixture.detectChanges();

      expect(overlayContainerElement.querySelector('.cdk-overlay-backdrop')).toBeTruthy();
    });

    it('should not have a backdrop', () => {
      bottomSheet.open(PizzaMsg, {
        hasBackdrop: false,
        viewContainerRef: testViewContainerRef
      });

      viewContainerFixture.detectChanges();

      expect(overlayContainerElement.querySelector('.cdk-overlay-backdrop')).toBeFalsy();
    });
  });

  describe('backdropClass option', () => {
    it('should have default backdrop class', () => {
      bottomSheet.open(PizzaMsg, {
        backdropClass: '',
        viewContainerRef: testViewContainerRef
      });

      viewContainerFixture.detectChanges();

      expect(overlayContainerElement.querySelector('.cdk-overlay-dark-backdrop')).toBeTruthy();
    });

    it('should have custom backdrop class', () => {
      bottomSheet.open(PizzaMsg, {
        backdropClass: 'custom-backdrop-class',
        viewContainerRef: testViewContainerRef
      });

      viewContainerFixture.detectChanges();

      expect(overlayContainerElement.querySelector('.custom-backdrop-class')).toBeTruthy();
    });
  });

  describe('focus management', () => {
    // When testing focus, all of the elements must be in the DOM.
    beforeEach(() => document.body.appendChild(overlayContainerElement));
    afterEach(() => document.body.removeChild(overlayContainerElement));

    it('should focus the bottom sheet container by default', fakeAsync(() => {
      bottomSheet.open(PizzaMsg, {
        viewContainerRef: testViewContainerRef,
      });

      viewContainerFixture.detectChanges();
      flushMicrotasks();

      expect(document.activeElement!.tagName).toBe('MAT-BOTTOM-SHEET-CONTAINER',
          'Expected bottom sheet container to be focused.');
    }));

    it('should create a focus trap if autoFocus is disabled', fakeAsync(() => {
      bottomSheet.open(PizzaMsg, {
        viewContainerRef: testViewContainerRef,
        autoFocus: false
      });

      viewContainerFixture.detectChanges();
      flushMicrotasks();

      const focusTrapAnchors = overlayContainerElement.querySelectorAll('.cdk-focus-trap-anchor');

      expect(focusTrapAnchors.length).toBeGreaterThan(0);
    }));

    it('should focus the first tabbable element of the bottom sheet on open when' +
      'autoFocus is enabled', fakeAsync(() => {
        bottomSheet.open(PizzaMsg, {
          viewContainerRef: testViewContainerRef,
          autoFocus: true
        });

        viewContainerFixture.detectChanges();
        flushMicrotasks();

        expect(document.activeElement!.tagName).toBe('INPUT',
            'Expected first tabbable element (input) in the sheet to be focused.');
      }));

    it('should allow disabling focus of the first tabbable element', fakeAsync(() => {
      bottomSheet.open(PizzaMsg, {
        viewContainerRef: testViewContainerRef,
        autoFocus: false
      });

      viewContainerFixture.detectChanges();
      flushMicrotasks();

      expect(document.activeElement!.tagName).not.toBe('INPUT');
    }));

    it('should re-focus trigger element when bottom sheet closes', fakeAsync(() => {
      const button = document.createElement('button');
      button.id = 'bottom-sheet-trigger';
      document.body.appendChild(button);
      button.focus();

      const bottomSheetRef = bottomSheet.open(PizzaMsg, { viewContainerRef: testViewContainerRef });

      flushMicrotasks();
      viewContainerFixture.detectChanges();
      flushMicrotasks();

      expect(document.activeElement!.id)
          .not.toBe('bottom-sheet-trigger', 'Expected the focus to change when sheet was opened.');

      bottomSheetRef.dismiss();
      expect(document.activeElement!.id).not.toBe('bottom-sheet-trigger',
          'Expcted the focus not to have changed before the animation finishes.');

      flushMicrotasks();
      viewContainerFixture.detectChanges();
      tick(500);

      expect(document.activeElement!.id).toBe('bottom-sheet-trigger',
          'Expected that the trigger was refocused after the sheet is closed.');

      document.body.removeChild(button);
    }));

    it('should be able to disable focus restoration', fakeAsync(() => {
      const button = document.createElement('button');
      button.id = 'bottom-sheet-trigger';
      document.body.appendChild(button);
      button.focus();

      const bottomSheetRef = bottomSheet.open(PizzaMsg, {
        viewContainerRef: testViewContainerRef,
        restoreFocus: false
      });

      flushMicrotasks();
      viewContainerFixture.detectChanges();
      flushMicrotasks();

      expect(document.activeElement!.id)
          .not.toBe('bottom-sheet-trigger', 'Expected the focus to change when sheet was opened.');

      bottomSheetRef.dismiss();
      expect(document.activeElement!.id).not.toBe('bottom-sheet-trigger',
          'Expcted the focus not to have changed before the animation finishes.');

      flushMicrotasks();
      viewContainerFixture.detectChanges();
      tick(500);

      expect(document.activeElement!.id).not.toBe('bottom-sheet-trigger',
          'Expected the trigger not to be refocused on close.');

      document.body.removeChild(button);
    }));

  });

});

describe('MatBottomSheet with parent MatBottomSheet', () => {
  let parentBottomSheet: MatBottomSheet;
  let childBottomSheet: MatBottomSheet;
  let overlayContainer: OverlayContainer;
  let overlayContainerElement: HTMLElement;
  let fixture: ComponentFixture<ComponentThatProvidesMatBottomSheet>;

  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [MatBottomSheetModule, BottomSheetTestModule, NoopAnimationsModule],
      declarations: [ComponentThatProvidesMatBottomSheet],
    }).compileComponents();
  }));

  beforeEach(inject([MatBottomSheet, OverlayContainer],
    (bs: MatBottomSheet, oc: OverlayContainer) => {
    parentBottomSheet = bs;
    overlayContainer = oc;
    overlayContainerElement = oc.getContainerElement();
    fixture = TestBed.createComponent(ComponentThatProvidesMatBottomSheet);
    childBottomSheet = fixture.componentInstance.bottomSheet;
    fixture.detectChanges();
  }));

  afterEach(() => {
    overlayContainer.ngOnDestroy();
  });

  it('should close bottom sheets opened by parent when opening from child', fakeAsync(() => {
    parentBottomSheet.open(PizzaMsg);
    fixture.detectChanges();
    tick(1000);

    expect(overlayContainerElement.textContent)
        .toContain('Pizza', 'Expected a bottom sheet to be opened');

    childBottomSheet.open(TacoMsg);
    fixture.detectChanges();
    tick(1000);

    expect(overlayContainerElement.textContent)
        .toContain('Taco', 'Expected parent bottom sheet to be dismissed by opening from child');
  }));

  it('should close bottom sheets opened by child when opening from parent', fakeAsync(() => {
    childBottomSheet.open(PizzaMsg);
    fixture.detectChanges();
    tick(1000);

    expect(overlayContainerElement.textContent)
        .toContain('Pizza', 'Expected a bottom sheet to be opened');

    parentBottomSheet.open(TacoMsg);
    fixture.detectChanges();
    tick(1000);

    expect(overlayContainerElement.textContent)
        .toContain('Taco', 'Expected child bottom sheet to be dismissed by opening from parent');
  }));

  it('should not close parent bottom sheet when child is destroyed', fakeAsync(() => {
    parentBottomSheet.open(PizzaMsg);
    fixture.detectChanges();
    tick(1000);

    expect(overlayContainerElement.textContent)
        .toContain('Pizza', 'Expected a bottom sheet to be opened');

    childBottomSheet.ngOnDestroy();
    fixture.detectChanges();
    tick(1000);

    expect(overlayContainerElement.textContent)
        .toContain('Pizza', 'Expected a bottom sheet to stay open');
  }));

});

describe('MatBottomSheet with default options', () => {
  let bottomSheet: MatBottomSheet;
  let overlayContainer: OverlayContainer;
  let overlayContainerElement: HTMLElement;

  let testViewContainerRef: ViewContainerRef;
  let viewContainerFixture: ComponentFixture<ComponentWithChildViewContainer>;

  beforeEach(fakeAsync(() => {
    const defaultConfig: MatBottomSheetConfig = {
      hasBackdrop: false,
      disableClose: true,
      autoFocus: false
    };

    TestBed.configureTestingModule({
      imports: [MatBottomSheetModule, BottomSheetTestModule],
      providers: [
        {provide: MAT_BOTTOM_SHEET_DEFAULT_OPTIONS, useValue: defaultConfig},
      ],
    });

    TestBed.compileComponents();
  }));

  beforeEach(inject([MatBottomSheet, OverlayContainer],
    (b: MatBottomSheet, oc: OverlayContainer) => {
      bottomSheet = b;
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

  afterEach(() => {
    overlayContainer.ngOnDestroy();
  });

  beforeEach(() => {
    viewContainerFixture = TestBed.createComponent(ComponentWithChildViewContainer);

    viewContainerFixture.detectChanges();
    testViewContainerRef = viewContainerFixture.componentInstance.childViewContainer;
  });

  it('should use the provided defaults', () => {
    bottomSheet.open(PizzaMsg, {viewContainerRef: testViewContainerRef});

    viewContainerFixture.detectChanges();

    expect(overlayContainerElement.querySelector('.cdk-overlay-backdrop')).toBeFalsy();

    dispatchKeyboardEvent(document.body, 'keydown', ESCAPE);

    expect(overlayContainerElement.querySelector('mat-bottom-sheet-container')).toBeTruthy();
    expect(document.activeElement!.tagName).not.toBe('INPUT');
  });

  it('should be overridable by open() options', fakeAsync(() => {
    bottomSheet.open(PizzaMsg, {
      hasBackdrop: true,
      disableClose: false,
      viewContainerRef: testViewContainerRef
    });

    viewContainerFixture.detectChanges();

    expect(overlayContainerElement.querySelector('.cdk-overlay-backdrop')).toBeTruthy();

    dispatchKeyboardEvent(document.body, 'keydown', ESCAPE);
    viewContainerFixture.detectChanges();
    flush();

    expect(overlayContainerElement.querySelector('mat-bottom-sheet-container')).toBeFalsy();
  }));
});



@Directive({selector: 'dir-with-view-container'})
class DirectiveWithViewContainer {
  constructor(public viewContainerRef: ViewContainerRef) { }
}

@Component({template: `<dir-with-view-container></dir-with-view-container>`})
class ComponentWithChildViewContainer {
  @ViewChild(DirectiveWithViewContainer) childWithViewContainer: DirectiveWithViewContainer;

  get childViewContainer() {
    return this.childWithViewContainer.viewContainerRef;
  }
}

@Component({
  selector: 'arbitrary-component-with-template-ref',
  template: `<ng-template let-data let-bottomSheetRef="bottomSheetRef">
      Cheese {{localValue}} {{data?.value}}{{setRef(bottomSheetRef)}}</ng-template>`,
})
class ComponentWithTemplateRef {
  localValue: string;
  bottomSheetRef: MatBottomSheetRef<any>;

  @ViewChild(TemplateRef) templateRef: TemplateRef<any>;

  setRef(bottomSheetRef: MatBottomSheetRef<any>): string {
    this.bottomSheetRef = bottomSheetRef;
    return '';
  }
}

@Component({template: '<p>Pizza</p> <input> <button>Close</button>'})
class PizzaMsg {
  constructor(public bottomSheetRef: MatBottomSheetRef<PizzaMsg>,
              public injector: Injector,
              public directionality: Directionality) {}
}

@Component({template: '<p>Taco</p>'})
class TacoMsg {}

@Component({
  template: '',
  providers: [MatBottomSheet]
})
class ComponentThatProvidesMatBottomSheet {
  constructor(public bottomSheet: MatBottomSheet) {}
}

@Component({template: ''})
class BottomSheetWithInjectedData {
  constructor(@Inject(MAT_BOTTOM_SHEET_DATA) public data: any) { }
}

// Create a real (non-test) NgModule as a workaround for
// https://github.com/angular/angular/issues/10760
const TEST_DIRECTIVES = [
  ComponentWithChildViewContainer,
  ComponentWithTemplateRef,
  PizzaMsg,
  TacoMsg,
  DirectiveWithViewContainer,
  BottomSheetWithInjectedData,
];

@NgModule({
  imports: [MatBottomSheetModule, NoopAnimationsModule],
  exports: TEST_DIRECTIVES,
  declarations: TEST_DIRECTIVES,
  entryComponents: [
    ComponentWithChildViewContainer,
    ComponentWithTemplateRef,
    PizzaMsg,
    TacoMsg,
    BottomSheetWithInjectedData,
  ],
})
class BottomSheetTestModule { }
