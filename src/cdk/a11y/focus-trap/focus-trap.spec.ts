import {Platform, _supportsShadowDom} from '@angular/cdk/platform';
import {
  Component,
  ViewChild,
  TemplateRef,
  ViewContainerRef,
  ViewEncapsulation,
} from '@angular/core';
import {waitForAsync, ComponentFixture, TestBed} from '@angular/core/testing';
import {PortalModule, CdkPortalOutlet, TemplatePortal} from '@angular/cdk/portal';
import {A11yModule, FocusTrap, CdkTrapFocus} from '../index';
import {By} from '@angular/platform-browser';

describe('FocusTrap', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [A11yModule, PortalModule],
      declarations: [
        FocusTrapWithBindings,
        SimpleFocusTrap,
        FocusTrapTargets,
        FocusTrapWithSvg,
        FocusTrapWithoutFocusableElements,
        FocusTrapWithAutoCapture,
        FocusTrapUnfocusableTarget,
        FocusTrapInsidePortal,
        FocusTrapWithAutoCaptureInShadowDom,
      ],
    });

    TestBed.compileComponents();
  }));

  describe('with default element', () => {
    let fixture: ComponentFixture<SimpleFocusTrap>;
    let focusTrapInstance: FocusTrap;

    beforeEach(() => {
      fixture = TestBed.createComponent(SimpleFocusTrap);
      fixture.detectChanges();
      focusTrapInstance = fixture.componentInstance.focusTrapDirective.focusTrap;
    });

    it('wrap focus from end to start', () => {
      // Because we can't mimic a real tab press focus change in a unit test, just call the
      // focus event handler directly.
      const result = focusTrapInstance.focusFirstTabbableElement();

      expect(getActiveElement().nodeName.toLowerCase())
        .withContext('Expected input element to be focused')
        .toBe('input');
      expect(result)
        .withContext('Expected return value to be true if focus was shifted.')
        .toBe(true);
    });

    it('should wrap focus from start to end', () => {
      // Because we can't mimic a real tab press focus change in a unit test, just call the
      // focus event handler directly.
      const result = focusTrapInstance.focusLastTabbableElement();

      const platform = TestBed.inject(Platform);
      // In iOS button elements are never tabbable, so the last element will be the input.
      const lastElement = platform.IOS ? 'input' : 'button';

      expect(getActiveElement().nodeName.toLowerCase())
        .withContext(`Expected ${lastElement} element to be focused`)
        .toBe(lastElement);

      expect(result)
        .withContext('Expected return value to be true if focus was shifted.')
        .toBe(true);
    });

    it('should return false if it did not manage to find a focusable element', () => {
      fixture.destroy();

      const newFixture = TestBed.createComponent(FocusTrapWithoutFocusableElements);
      newFixture.detectChanges();

      const focusTrap = newFixture.componentInstance.focusTrapDirective.focusTrap;
      const result = focusTrap.focusFirstTabbableElement();

      expect(result).toBe(false);
    });

    it('should be enabled by default', () => {
      expect(focusTrapInstance.enabled).toBe(true);
    });
  });

  describe('with bindings', () => {
    let fixture: ComponentFixture<FocusTrapWithBindings>;

    beforeEach(() => {
      fixture = TestBed.createComponent(FocusTrapWithBindings);
      fixture.detectChanges();
    });

    it('should clean up its anchor sibling elements on destroy', () => {
      const rootElement = fixture.debugElement.nativeElement as HTMLElement;

      expect(rootElement.querySelectorAll('div.cdk-visually-hidden').length).toBe(2);

      fixture.componentInstance.renderFocusTrap = false;
      fixture.detectChanges();

      expect(rootElement.querySelectorAll('div.cdk-visually-hidden').length).toBe(0);
    });

    it('should set the appropriate tabindex on the anchors, based on the disabled state', () => {
      const anchors = Array.from(
        fixture.debugElement.nativeElement.querySelectorAll('div.cdk-visually-hidden'),
      ) as HTMLElement[];

      expect(anchors.every(current => current.getAttribute('tabindex') === '0')).toBe(true);
      expect(anchors.every(current => current.getAttribute('aria-hidden') === 'true')).toBe(true);

      fixture.componentInstance._isFocusTrapEnabled = false;
      fixture.detectChanges();

      expect(anchors.every(current => !current.hasAttribute('tabindex'))).toBe(true);
    });
  });

  describe('with focus targets', () => {
    let fixture: ComponentFixture<FocusTrapTargets>;
    let focusTrapInstance: FocusTrap;

    beforeEach(() => {
      fixture = TestBed.createComponent(FocusTrapTargets);
      fixture.detectChanges();
      focusTrapInstance = fixture.componentInstance.focusTrapDirective.focusTrap;
    });

    it('should be able to set initial focus target', () => {
      // Because we can't mimic a real tab press focus change in a unit test, just call the
      // focus event handler directly.
      focusTrapInstance.focusInitialElement();
      expect(getActiveElement().id).toBe('middle');
    });

    it('should be able to pass in focus options to initial focusable element', () => {
      const options = {preventScroll: true};
      const spy = spyOn(fixture.nativeElement.querySelector('#middle'), 'focus').and.callThrough();

      focusTrapInstance.focusInitialElement(options);
      expect(spy).toHaveBeenCalledWith(options);
    });

    it('should be able to prioritize the first focus target', () => {
      // Because we can't mimic a real tab press focus change in a unit test, just call the
      // focus event handler directly.
      focusTrapInstance.focusFirstTabbableElement();
      expect(getActiveElement().id).toBe('first');
    });

    it('should be able to pass in focus options to first focusable element', () => {
      const options = {preventScroll: true};
      const spy = spyOn(fixture.nativeElement.querySelector('#first'), 'focus').and.callThrough();

      focusTrapInstance.focusFirstTabbableElement(options);
      expect(spy).toHaveBeenCalledWith(options);
    });

    it('should be able to prioritize the last focus target', () => {
      // Because we can't mimic a real tab press focus change in a unit test, just call the
      // focus event handler directly.
      focusTrapInstance.focusLastTabbableElement();
      expect(getActiveElement().id).toBe('last');
    });

    it('should be able to pass in focus options to last focusable element', () => {
      const options = {preventScroll: true};
      const spy = spyOn(fixture.nativeElement.querySelector('#last'), 'focus').and.callThrough();

      focusTrapInstance.focusLastTabbableElement(options);
      expect(spy).toHaveBeenCalledWith(options);
    });

    it('should warn if the initial focus target is not focusable', () => {
      const alternateFixture = TestBed.createComponent(FocusTrapUnfocusableTarget);
      alternateFixture.detectChanges();
      focusTrapInstance = fixture.componentInstance.focusTrapDirective.focusTrap;

      spyOn(console, 'warn');
      focusTrapInstance.focusInitialElement();

      expect(console.warn).toHaveBeenCalled();
    });
  });

  describe('special cases', () => {
    it('should not throw when it has a SVG child', () => {
      let fixture = TestBed.createComponent(FocusTrapWithSvg);

      fixture.detectChanges();

      let focusTrapInstance = fixture.componentInstance.focusTrapDirective.focusTrap;

      expect(() => focusTrapInstance.focusFirstTabbableElement()).not.toThrow();
      expect(() => focusTrapInstance.focusLastTabbableElement()).not.toThrow();
    });
  });

  describe('with autoCapture', () => {
    it('should automatically capture and return focus on init / destroy', waitForAsync(() => {
      const fixture = TestBed.createComponent(FocusTrapWithAutoCapture);
      fixture.detectChanges();

      const buttonOutsideTrappedRegion = fixture.nativeElement.querySelector('button');
      buttonOutsideTrappedRegion.focus();
      expect(getActiveElement()).toBe(buttonOutsideTrappedRegion);

      fixture.componentInstance.showTrappedRegion = true;
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        expect(getActiveElement().id).toBe('auto-capture-target');

        fixture.destroy();
        expect(getActiveElement()).toBe(buttonOutsideTrappedRegion);
      });
    }));

    it('should capture focus if auto capture is enabled later on', waitForAsync(() => {
      const fixture = TestBed.createComponent(FocusTrapWithAutoCapture);
      fixture.componentInstance.autoCaptureEnabled = false;
      fixture.componentInstance.showTrappedRegion = true;
      fixture.detectChanges();

      const buttonOutsideTrappedRegion = fixture.nativeElement.querySelector('button');
      buttonOutsideTrappedRegion.focus();
      expect(getActiveElement()).toBe(buttonOutsideTrappedRegion);

      fixture.componentInstance.autoCaptureEnabled = true;
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        expect(getActiveElement().id).toBe('auto-capture-target');

        fixture.destroy();
        expect(getActiveElement()).toBe(buttonOutsideTrappedRegion);
      });
    }));

    it('should automatically capture and return focus on init / destroy inside the shadow DOM', waitForAsync(() => {
      if (!_supportsShadowDom()) {
        return;
      }

      const fixture = TestBed.createComponent(FocusTrapWithAutoCaptureInShadowDom);
      fixture.detectChanges();

      const buttonOutsideTrappedRegion = fixture.debugElement.query(By.css('button')).nativeElement;
      buttonOutsideTrappedRegion.focus();
      expect(getActiveElement()).toBe(buttonOutsideTrappedRegion);

      fixture.componentInstance.showTrappedRegion = true;
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        expect(getActiveElement().id).toBe('auto-capture-target');

        fixture.destroy();
        expect(getActiveElement()).toBe(buttonOutsideTrappedRegion);
      });
    }));

    it('should capture focus if auto capture is enabled later on inside the shadow DOM', waitForAsync(() => {
      if (!_supportsShadowDom()) {
        return;
      }

      const fixture = TestBed.createComponent(FocusTrapWithAutoCaptureInShadowDom);
      fixture.componentInstance.autoCaptureEnabled = false;
      fixture.componentInstance.showTrappedRegion = true;
      fixture.detectChanges();

      const buttonOutsideTrappedRegion = fixture.debugElement.query(By.css('button')).nativeElement;
      buttonOutsideTrappedRegion.focus();
      expect(getActiveElement()).toBe(buttonOutsideTrappedRegion);

      fixture.componentInstance.autoCaptureEnabled = true;
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        expect(getActiveElement().id).toBe('auto-capture-target');

        fixture.destroy();
        expect(getActiveElement()).toBe(buttonOutsideTrappedRegion);
      });
    }));
  });

  it('should put anchors inside the outlet when set at the root of a template portal', () => {
    const fixture = TestBed.createComponent(FocusTrapInsidePortal);
    const instance = fixture.componentInstance;
    fixture.detectChanges();
    const outlet: HTMLElement = fixture.nativeElement.querySelector('.portal-outlet');

    expect(outlet.querySelectorAll('button').length)
      .withContext('Expected no buttons inside the outlet on init.')
      .toBe(0);
    expect(outlet.querySelectorAll('.cdk-focus-trap-anchor').length)
      .withContext('Expected no focus trap anchors inside the outlet on init.')
      .toBe(0);

    const portal = new TemplatePortal(instance.template, instance.viewContainerRef);
    instance.portalOutlet.attachTemplatePortal(portal);
    fixture.detectChanges();

    expect(outlet.querySelectorAll('button').length)
      .withContext('Expected one button inside the outlet after attaching.')
      .toBe(1);
    expect(outlet.querySelectorAll('.cdk-focus-trap-anchor').length)
      .withContext('Expected two focus trap anchors in the outlet after attaching.')
      .toBe(2);
  });
});

/** Gets the currently-focused element while accounting for the shadow DOM. */
function getActiveElement() {
  const activeElement = document.activeElement as HTMLElement | null;
  return (activeElement?.shadowRoot?.activeElement as HTMLElement) || activeElement;
}

@Component({
  template: `
    <div cdkTrapFocus>
      <input>
      <button>SAVE</button>
    </div>
    `,
})
class SimpleFocusTrap {
  @ViewChild(CdkTrapFocus) focusTrapDirective: CdkTrapFocus;
}

const AUTO_FOCUS_TEMPLATE = `
  <button type="button">Toggle</button>
  <div *ngIf="showTrappedRegion" cdkTrapFocus [cdkTrapFocusAutoCapture]="autoCaptureEnabled">
    <input id="auto-capture-target">
    <button>SAVE</button>
  </div>
`;

@Component({template: AUTO_FOCUS_TEMPLATE})
class FocusTrapWithAutoCapture {
  @ViewChild(CdkTrapFocus) focusTrapDirective: CdkTrapFocus;
  showTrappedRegion = false;
  autoCaptureEnabled = true;
}

@Component({
  template: AUTO_FOCUS_TEMPLATE,
  encapsulation: ViewEncapsulation.ShadowDom,
})
class FocusTrapWithAutoCaptureInShadowDom extends FocusTrapWithAutoCapture {}

@Component({
  template: `
    <div *ngIf="renderFocusTrap" [cdkTrapFocus]="_isFocusTrapEnabled">
      <input>
      <button>SAVE</button>
    </div>
    `,
})
class FocusTrapWithBindings {
  @ViewChild(CdkTrapFocus) focusTrapDirective: CdkTrapFocus;
  renderFocusTrap = true;
  _isFocusTrapEnabled = true;
}

@Component({
  template: `
    <div cdkTrapFocus>
      <input>
      <button>before</button>
      <button id="first" cdkFocusRegionStart></button>
      <button id="middle" cdkFocusInitial></button>
      <button id="last" cdkFocusRegionEnd></button>
      <button>after</button>
      <input>
    </div>
    `,
})
class FocusTrapTargets {
  @ViewChild(CdkTrapFocus) focusTrapDirective: CdkTrapFocus;
}

@Component({
  template: `
    <div cdkTrapFocus>
      <div cdkFocusInitial></div>
    </div>
    `,
})
class FocusTrapUnfocusableTarget {
  @ViewChild(CdkTrapFocus) focusTrapDirective: CdkTrapFocus;
}

@Component({
  template: `
    <div cdkTrapFocus>
      <svg xmlns="http://www.w3.org/2000/svg">
        <circle cx="100" cy="100" r="100"/>
      </svg>
    </div>
    `,
})
class FocusTrapWithSvg {
  @ViewChild(CdkTrapFocus) focusTrapDirective: CdkTrapFocus;
}

@Component({
  template: `
    <div cdkTrapFocus>
      <p>Hello</p>
    </div>
    `,
})
class FocusTrapWithoutFocusableElements {
  @ViewChild(CdkTrapFocus) focusTrapDirective: CdkTrapFocus;
}

@Component({
  template: `
  <div class="portal-outlet">
    <ng-template cdkPortalOutlet></ng-template>
  </div>

  <ng-template #template>
    <div cdkTrapFocus>
      <button>Click me</button>
    </div>
  </ng-template>
  `,
})
class FocusTrapInsidePortal {
  @ViewChild('template') template: TemplateRef<any>;
  @ViewChild(CdkPortalOutlet) portalOutlet: CdkPortalOutlet;

  constructor(public viewContainerRef: ViewContainerRef) {}
}
