import {TestBed, waitForAsync} from '@angular/core/testing';
import {Component, ViewEncapsulation, ViewChild, ElementRef} from '@angular/core';
import {By} from '@angular/platform-browser';
import {_getShadowRoot, _supportsShadowDom} from '@angular/cdk/platform';
import {CommonModule} from '@angular/common';
import {
  MatLegacyProgressSpinnerModule,
  MatLegacyProgressSpinner,
  MAT_LEGACY_PROGRESS_SPINNER_DEFAULT_OPTIONS,
} from './index';

describe('MatLegacyProgressSpinner', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [MatLegacyProgressSpinnerModule, CommonModule],
      declarations: [
        BasicProgressSpinner,
        IndeterminateProgressSpinner,
        IndeterminateSpinnerCustomDiameter,
        ProgressSpinnerWithValueAndBoundMode,
        ProgressSpinnerWithColor,
        ProgressSpinnerCustomStrokeWidth,
        ProgressSpinnerCustomDiameter,
        SpinnerWithColor,
        ProgressSpinnerWithStringValues,
        IndeterminateSpinnerInShadowDom,
        IndeterminateSpinnerInShadowDomWithNgIf,
        SpinnerWithMode,
      ],
    }).compileComponents();
  }));

  it('should apply a mode of "determinate" if no mode is provided.', () => {
    const fixture = TestBed.createComponent(BasicProgressSpinner);
    fixture.detectChanges();

    const progressElement = fixture.debugElement.query(By.css('mat-progress-spinner'))!;
    expect(progressElement.componentInstance.mode).toBe('determinate');
  });

  it('should not modify the mode if a valid mode is provided.', () => {
    const fixture = TestBed.createComponent(IndeterminateProgressSpinner);
    fixture.detectChanges();

    const progressElement = fixture.debugElement.query(By.css('mat-progress-spinner'))!;
    expect(progressElement.componentInstance.mode).toBe('indeterminate');
  });

  it('should define a default value of zero for the value attribute', () => {
    const fixture = TestBed.createComponent(BasicProgressSpinner);
    fixture.detectChanges();

    const progressElement = fixture.debugElement.query(By.css('mat-progress-spinner'))!;
    expect(progressElement.componentInstance.value).toBe(0);
  });

  it('should set the value to 0 when the mode is set to indeterminate', () => {
    const fixture = TestBed.createComponent(ProgressSpinnerWithValueAndBoundMode);
    const progressElement = fixture.debugElement.query(By.css('mat-progress-spinner'))!;
    fixture.componentInstance.mode = 'determinate';
    fixture.detectChanges();

    expect(progressElement.componentInstance.value).toBe(50);
    fixture.componentInstance.mode = 'indeterminate';
    fixture.detectChanges();
    expect(progressElement.componentInstance.value).toBe(0);
  });

  it('should retain the value if it updates while indeterminate', () => {
    const fixture = TestBed.createComponent(ProgressSpinnerWithValueAndBoundMode);
    const progressElement = fixture.debugElement.query(By.css('mat-progress-spinner'))!;

    fixture.componentInstance.mode = 'determinate';
    fixture.detectChanges();
    expect(progressElement.componentInstance.value).toBe(50);

    fixture.componentInstance.mode = 'indeterminate';
    fixture.detectChanges();
    expect(progressElement.componentInstance.value).toBe(0);

    fixture.componentInstance.value = 75;
    fixture.detectChanges();
    expect(progressElement.componentInstance.value).toBe(0);

    fixture.componentInstance.mode = 'determinate';
    fixture.detectChanges();
    expect(progressElement.componentInstance.value).toBe(75);
  });

  it('should use different `circle` elements depending on the mode', () => {
    const fixture = TestBed.createComponent(ProgressSpinnerWithValueAndBoundMode);

    fixture.componentInstance.mode = 'determinate';
    fixture.detectChanges();

    const determinateCircle = fixture.nativeElement.querySelector('circle');

    fixture.componentInstance.mode = 'indeterminate';
    fixture.detectChanges();

    const indeterminateCircle = fixture.nativeElement.querySelector('circle');

    expect(determinateCircle).toBeTruthy();
    expect(indeterminateCircle).toBeTruthy();
    expect(determinateCircle).not.toBe(indeterminateCircle);
  });

  it('should clamp the value of the progress between 0 and 100', () => {
    const fixture = TestBed.createComponent(BasicProgressSpinner);
    fixture.detectChanges();

    const progressElement = fixture.debugElement.query(By.css('mat-progress-spinner'))!;
    const progressComponent = progressElement.componentInstance;

    progressComponent.value = 50;
    expect(progressComponent.value).toBe(50);

    progressComponent.value = 0;
    expect(progressComponent.value).toBe(0);

    progressComponent.value = 100;
    expect(progressComponent.value).toBe(100);

    progressComponent.value = 999;
    expect(progressComponent.value).toBe(100);

    progressComponent.value = -10;
    expect(progressComponent.value).toBe(0);
  });

  it('should default to a stroke width that is 10% of the diameter', () => {
    const fixture = TestBed.createComponent(ProgressSpinnerCustomDiameter);
    const spinner = fixture.debugElement.query(By.directive(MatLegacyProgressSpinner))!;

    fixture.componentInstance.diameter = 67;
    fixture.detectChanges();

    expect(spinner.componentInstance.strokeWidth).toBe(6.7);
  });

  it('should allow a custom diameter', () => {
    const fixture = TestBed.createComponent(ProgressSpinnerCustomDiameter);
    const spinner = fixture.debugElement.query(By.css('mat-progress-spinner'))!.nativeElement;
    const svgElement = fixture.nativeElement.querySelector('svg');

    fixture.componentInstance.diameter = 32;
    fixture.detectChanges();

    expect(parseInt(spinner.style.width))
      .withContext('Expected the custom diameter to be applied to the host element width.')
      .toBe(32);
    expect(parseInt(spinner.style.height))
      .withContext('Expected the custom diameter to be applied to the host element height.')
      .toBe(32);
    expect(parseInt(svgElement.style.width))
      .withContext('Expected the custom diameter to be applied to the svg element width.')
      .toBe(32);
    expect(parseInt(svgElement.style.height))
      .withContext('Expected the custom diameter to be applied to the svg element height.')
      .toBe(32);
    expect(svgElement.getAttribute('viewBox'))
      .withContext('Expected the custom diameter to be applied to the svg viewBox.')
      .toBe('0 0 25.2 25.2');
  });

  it(
    'should add a style tag with the indeterminate animation to the document head when using a ' +
      'non-default diameter',
    () => {
      const fixture = TestBed.createComponent(ProgressSpinnerCustomDiameter);
      fixture.componentInstance.diameter = 32;
      fixture.detectChanges();

      expect(document.head.querySelectorAll('style[mat-spinner-animation="32"]').length).toBe(1);

      // Change to something different so we get another tag.
      fixture.componentInstance.diameter = 64;
      fixture.detectChanges();

      expect(document.head.querySelectorAll('style[mat-spinner-animation="32"]').length).toBe(1);
      expect(document.head.querySelectorAll('style[mat-spinner-animation="64"]').length).toBe(1);

      // Change back to the initial one.
      fixture.componentInstance.diameter = 32;
      fixture.detectChanges();

      expect(document.head.querySelectorAll('style[mat-spinner-animation="32"]').length).toBe(1);
      expect(document.head.querySelectorAll('style[mat-spinner-animation="64"]').length).toBe(1);
    },
  );

  it('should allow floating point values for custom diameter', () => {
    const fixture = TestBed.createComponent(ProgressSpinnerCustomDiameter);

    fixture.componentInstance.diameter = 32.5;
    fixture.detectChanges();

    const spinner = fixture.debugElement.query(By.css('mat-progress-spinner'))!.nativeElement;
    const svgElement = fixture.nativeElement.querySelector('svg');

    expect(parseFloat(spinner.style.width))
      .withContext('Expected the custom diameter to be applied to the host element width.')
      .toBe(32.5);
    expect(parseFloat(spinner.style.height))
      .withContext('Expected the custom diameter to be applied to the host element height.')
      .toBe(32.5);
    expect(parseFloat(svgElement.style.width))
      .withContext('Expected the custom diameter to be applied to the svg element width.')
      .toBe(32.5);
    expect(parseFloat(svgElement.style.height))
      .withContext('Expected the custom diameter to be applied to the svg element height.')
      .toBe(32.5);
    expect(svgElement.getAttribute('viewBox'))
      .withContext('Expected the custom diameter to be applied to the svg viewBox.')
      .toBe('0 0 25.75 25.75');
  });

  it('should handle creating animation style tags based on a floating point diameter', () => {
    const fixture = TestBed.createComponent(IndeterminateSpinnerCustomDiameter);

    fixture.componentInstance.diameter = 32.5;
    fixture.detectChanges();

    const circleElement = fixture.nativeElement.querySelector('circle');

    expect(circleElement.style.animationName)
      .withContext(
        'Expected the spinner circle element to have an animation name based on ' +
          'the custom diameter',
      )
      .toBe('mat-progress-spinner-stroke-rotate-32_5');
    expect(document.head.querySelectorAll('style[mat-spinner-animation="32_5"]').length)
      .withContext(
        'Expected a style tag with the indeterminate animation to be ' +
          'attached to the document head',
      )
      .toBe(1);
  });

  it('should allow a custom stroke width', () => {
    const fixture = TestBed.createComponent(ProgressSpinnerCustomStrokeWidth);

    fixture.componentInstance.strokeWidth = 40;
    fixture.detectChanges();

    const circleElement = fixture.nativeElement.querySelector('circle');
    const svgElement = fixture.nativeElement.querySelector('svg');

    expect(parseInt(circleElement.style.strokeWidth))
      .withContext(
        'Expected the custom stroke ' +
          'width to be applied to the circle element as a percentage of the element size.',
      )
      .toBe(40);
    expect(svgElement.getAttribute('viewBox'))
      .withContext('Expected the viewBox to be adjusted based on the stroke width.')
      .toBe('0 0 130 130');
  });

  it('should allow floating point values for custom stroke width', () => {
    const fixture = TestBed.createComponent(ProgressSpinnerCustomStrokeWidth);

    fixture.componentInstance.strokeWidth = 40.5;
    fixture.detectChanges();

    const circleElement = fixture.nativeElement.querySelector('circle');
    const svgElement = fixture.nativeElement.querySelector('svg');

    expect(parseFloat(circleElement.style.strokeWidth))
      .withContext(
        'Expected the custom stroke ' +
          'width to be applied to the circle element as a percentage of the element size.',
      )
      .toBe(40.5);
    expect(svgElement.getAttribute('viewBox'))
      .withContext('Expected the viewBox to be adjusted based on the stroke width.')
      .toBe('0 0 130.5 130.5');
  });

  it('should expand the host element if the stroke width is greater than the default', () => {
    const fixture = TestBed.createComponent(ProgressSpinnerCustomStrokeWidth);
    const element = fixture.debugElement.nativeElement.querySelector('.mat-progress-spinner');

    fixture.componentInstance.strokeWidth = 40;
    fixture.detectChanges();

    expect(element.style.width).toBe('100px');
    expect(element.style.height).toBe('100px');
  });

  it('should not collapse the host element if the stroke width is less than the default', () => {
    const fixture = TestBed.createComponent(ProgressSpinnerCustomStrokeWidth);
    const element = fixture.debugElement.nativeElement.querySelector('.mat-progress-spinner');

    fixture.componentInstance.strokeWidth = 5;
    fixture.detectChanges();

    expect(element.style.width).toBe('100px');
    expect(element.style.height).toBe('100px');
  });

  it('should set the color class on the mat-spinner', () => {
    const fixture = TestBed.createComponent(SpinnerWithColor);
    fixture.detectChanges();

    const progressElement = fixture.debugElement.query(By.css('mat-spinner'))!;

    expect(progressElement.nativeElement.classList).toContain('mat-primary');

    fixture.componentInstance.color = 'accent';
    fixture.detectChanges();

    expect(progressElement.nativeElement.classList).toContain('mat-accent');
    expect(progressElement.nativeElement.classList).not.toContain('mat-primary');
  });

  it('should set the color class on the mat-progress-spinner', () => {
    const fixture = TestBed.createComponent(ProgressSpinnerWithColor);
    fixture.detectChanges();

    const progressElement = fixture.debugElement.query(By.css('mat-progress-spinner'))!;

    expect(progressElement.nativeElement.classList).toContain('mat-primary');

    fixture.componentInstance.color = 'accent';
    fixture.detectChanges();

    expect(progressElement.nativeElement.classList).toContain('mat-accent');
    expect(progressElement.nativeElement.classList).not.toContain('mat-primary');
  });

  it('should remove the underlying SVG element from the tab order explicitly', () => {
    const fixture = TestBed.createComponent(BasicProgressSpinner);

    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('svg').getAttribute('focusable')).toBe('false');
  });

  it('should handle the number inputs being passed in as strings', () => {
    const fixture = TestBed.createComponent(ProgressSpinnerWithStringValues);
    const spinner = fixture.debugElement.query(By.directive(MatLegacyProgressSpinner))!;
    const svgElement = spinner.nativeElement.querySelector('svg');

    fixture.detectChanges();

    expect(spinner.componentInstance.diameter).toBe(37);
    expect(spinner.componentInstance.strokeWidth).toBe(11);
    expect(spinner.componentInstance.value).toBe(25);

    expect(spinner.nativeElement.style.width).toBe('37px');
    expect(spinner.nativeElement.style.height).toBe('37px');
    expect(svgElement.style.width).toBe('37px');
    expect(svgElement.style.height).toBe('37px');
    expect(svgElement.getAttribute('viewBox')).toBe('0 0 38 38');
  });

  it('should update the element size when changed dynamically', () => {
    const fixture = TestBed.createComponent(BasicProgressSpinner);
    const spinner = fixture.debugElement.query(By.directive(MatLegacyProgressSpinner))!;
    spinner.componentInstance.diameter = 32;
    fixture.detectChanges();
    expect(spinner.nativeElement.style.width).toBe('32px');
    expect(spinner.nativeElement.style.height).toBe('32px');
  });

  it('should be able to set a default diameter', () => {
    TestBed.resetTestingModule()
      .configureTestingModule({
        imports: [MatLegacyProgressSpinnerModule],
        declarations: [BasicProgressSpinner],
        providers: [
          {
            provide: MAT_LEGACY_PROGRESS_SPINNER_DEFAULT_OPTIONS,
            useValue: {diameter: 23},
          },
        ],
      })
      .compileComponents();

    const fixture = TestBed.createComponent(BasicProgressSpinner);
    fixture.detectChanges();

    const progressElement = fixture.debugElement.query(By.css('mat-progress-spinner'))!;
    expect(progressElement.componentInstance.diameter).toBe(23);
  });

  it('should be able to set a default stroke width', () => {
    TestBed.resetTestingModule()
      .configureTestingModule({
        imports: [MatLegacyProgressSpinnerModule],
        declarations: [BasicProgressSpinner],
        providers: [
          {
            provide: MAT_LEGACY_PROGRESS_SPINNER_DEFAULT_OPTIONS,
            useValue: {strokeWidth: 7},
          },
        ],
      })
      .compileComponents();

    const fixture = TestBed.createComponent(BasicProgressSpinner);
    fixture.detectChanges();

    const progressElement = fixture.debugElement.query(By.css('mat-progress-spinner'))!;
    expect(progressElement.componentInstance.strokeWidth).toBe(7);
  });

  it('should be able to set a default color', () => {
    TestBed.resetTestingModule()
      .configureTestingModule({
        imports: [MatLegacyProgressSpinnerModule],
        declarations: [BasicProgressSpinner],
        providers: [
          {
            provide: MAT_LEGACY_PROGRESS_SPINNER_DEFAULT_OPTIONS,
            useValue: {color: 'warn'},
          },
        ],
      })
      .compileComponents();

    const fixture = TestBed.createComponent(BasicProgressSpinner);
    fixture.detectChanges();

    const progressElement = fixture.debugElement.query(By.css('mat-progress-spinner'))!;
    expect(progressElement.componentInstance.color).toBe('warn');
    expect(progressElement.nativeElement.classList).toContain('mat-warn');
  });

  it('should set `aria-valuenow` to the current value in determinate mode', () => {
    const fixture = TestBed.createComponent(ProgressSpinnerWithValueAndBoundMode);
    const progressElement = fixture.debugElement.query(By.css('mat-progress-spinner'))!;
    fixture.componentInstance.mode = 'determinate';
    fixture.componentInstance.value = 37;
    fixture.detectChanges();

    expect(progressElement.nativeElement.getAttribute('aria-valuenow')).toBe('37');
  });

  it('should clear `aria-valuenow` in indeterminate mode', () => {
    const fixture = TestBed.createComponent(ProgressSpinnerWithValueAndBoundMode);
    const progressElement = fixture.debugElement.query(By.css('mat-progress-spinner'))!;
    fixture.componentInstance.mode = 'determinate';
    fixture.componentInstance.value = 89;
    fixture.detectChanges();

    expect(progressElement.nativeElement.hasAttribute('aria-valuenow')).toBe(true);

    fixture.componentInstance.mode = 'indeterminate';
    fixture.detectChanges();

    expect(progressElement.nativeElement.hasAttribute('aria-valuenow')).toBe(false);
  });

  it('should add the indeterminate animation style tag to the Shadow root', () => {
    // The test is only relevant in browsers that support Shadow DOM.
    if (!_supportsShadowDom()) {
      return;
    }

    const fixture = TestBed.createComponent(IndeterminateSpinnerInShadowDom);
    fixture.componentInstance.diameter = 27;
    fixture.detectChanges();

    const spinner = fixture.debugElement.query(By.css('mat-progress-spinner'))!.nativeElement;
    const shadowRoot = _getShadowRoot(spinner)!;

    expect(shadowRoot.querySelector('style[mat-spinner-animation="27"]')).toBeTruthy();

    fixture.componentInstance.diameter = 15;
    fixture.detectChanges();

    expect(shadowRoot.querySelector('style[mat-spinner-animation="27"]')).toBeTruthy();
  });

  it('should not duplicate style tags inside the Shadow root', () => {
    // The test is only relevant in browsers that support Shadow DOM.
    if (!_supportsShadowDom()) {
      return;
    }

    const fixture = TestBed.createComponent(IndeterminateSpinnerInShadowDom);
    fixture.componentInstance.diameter = 39;
    fixture.detectChanges();

    const spinner = fixture.debugElement.query(By.css('mat-progress-spinner'))!.nativeElement;
    const shadowRoot = _getShadowRoot(spinner)!;

    expect(shadowRoot.querySelectorAll('style[mat-spinner-animation="39"]').length).toBe(1);

    // Change to something different so we get another tag.
    fixture.componentInstance.diameter = 61;
    fixture.detectChanges();

    expect(shadowRoot.querySelectorAll('style[mat-spinner-animation="39"]').length).toBe(1);
    expect(shadowRoot.querySelectorAll('style[mat-spinner-animation="61"]').length).toBe(1);

    // Change back to the initial one.
    fixture.componentInstance.diameter = 39;
    fixture.detectChanges();

    expect(shadowRoot.querySelectorAll('style[mat-spinner-animation="39"]').length).toBe(1);
    expect(shadowRoot.querySelectorAll('style[mat-spinner-animation="61"]').length).toBe(1);
  });

  it(
    'should add the indeterminate animation style tag to the Shadow root if the element is ' +
      'inside an ngIf',
    () => {
      // The test is only relevant in browsers that support Shadow DOM.
      if (!_supportsShadowDom()) {
        return;
      }

      const fixture = TestBed.createComponent(IndeterminateSpinnerInShadowDomWithNgIf);
      fixture.componentInstance.diameter = 27;
      fixture.detectChanges();

      const spinner = fixture.componentInstance.spinner.nativeElement;
      const shadowRoot = _getShadowRoot(spinner)!;

      expect(shadowRoot.querySelector('style[mat-spinner-animation="27"]')).toBeTruthy();

      fixture.componentInstance.diameter = 15;
      fixture.detectChanges();

      expect(shadowRoot.querySelector('style[mat-spinner-animation="27"]')).toBeTruthy();
    },
  );

  it('should apply aria-hidden to child nodes', () => {
    const fixture = TestBed.createComponent(BasicProgressSpinner);
    fixture.detectChanges();

    const progressElement = fixture.nativeElement.querySelector('mat-progress-spinner');
    const children = Array.from<HTMLElement>(progressElement.children);

    expect(children.length).toBeGreaterThan(0);
    expect(children.every(child => child.getAttribute('aria-hidden') === 'true')).toBe(true);
  });

  it('should be able to change the mode on a mat-spinner', () => {
    const fixture = TestBed.createComponent(SpinnerWithMode);
    fixture.detectChanges();

    const progressElement = fixture.debugElement.query(By.css('mat-spinner')).nativeElement;
    expect(progressElement.getAttribute('mode')).toBe('determinate');
  });
});

@Component({template: '<mat-progress-spinner></mat-progress-spinner>'})
class BasicProgressSpinner {}

@Component({template: '<mat-progress-spinner [strokeWidth]="strokeWidth"></mat-progress-spinner>'})
class ProgressSpinnerCustomStrokeWidth {
  strokeWidth: number;
}

@Component({template: '<mat-progress-spinner [diameter]="diameter"></mat-progress-spinner>'})
class ProgressSpinnerCustomDiameter {
  diameter: number;
}

@Component({template: '<mat-progress-spinner mode="indeterminate"></mat-progress-spinner>'})
class IndeterminateProgressSpinner {}

@Component({
  template: `
    <mat-progress-spinner mode="indeterminate" [diameter]="diameter"></mat-progress-spinner>
  `,
})
class IndeterminateSpinnerCustomDiameter {
  diameter: number;
}

@Component({
  template: '<mat-progress-spinner [value]="value" [mode]="mode"></mat-progress-spinner>',
})
class ProgressSpinnerWithValueAndBoundMode {
  mode = 'indeterminate';
  value = 50;
}

@Component({template: `<mat-spinner [color]="color"></mat-spinner>`})
class SpinnerWithColor {
  color: string = 'primary';
}

@Component({template: `<mat-progress-spinner value="50" [color]="color"></mat-progress-spinner>`})
class ProgressSpinnerWithColor {
  color: string = 'primary';
}

@Component({
  template: `
    <mat-progress-spinner value="25" diameter="37" strokeWidth="11"></mat-progress-spinner>
  `,
})
class ProgressSpinnerWithStringValues {}

@Component({
  template: `
    <mat-progress-spinner mode="indeterminate" [diameter]="diameter"></mat-progress-spinner>
  `,
  encapsulation: ViewEncapsulation.ShadowDom,
})
class IndeterminateSpinnerInShadowDom {
  diameter: number;
}

@Component({
  template: `
    <div *ngIf="true">
      <mat-progress-spinner mode="indeterminate" [diameter]="diameter"></mat-progress-spinner>
    </div>
  `,
  encapsulation: ViewEncapsulation.ShadowDom,
})
class IndeterminateSpinnerInShadowDomWithNgIf {
  @ViewChild(MatLegacyProgressSpinner, {read: ElementRef})
  spinner: ElementRef<HTMLElement>;

  diameter: number;
}

@Component({template: '<mat-spinner mode="determinate"></mat-spinner>'})
class SpinnerWithMode {}
