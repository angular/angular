import {TestBed, async} from '@angular/core/testing';
import {Component} from '@angular/core';
import {By} from '@angular/platform-browser';
import {MdProgressSpinnerModule} from './index';
import {PROGRESS_SPINNER_STROKE_WIDTH} from './progress-spinner';


describe('MdProgressSpinner', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MdProgressSpinnerModule],
      declarations: [
        BasicProgressSpinner,
        IndeterminateProgressSpinner,
        ProgressSpinnerWithValueAndBoundMode,
        ProgressSpinnerWithColor,
        ProgressSpinnerCustomStrokeWidth,
        IndeterminateProgressSpinnerWithNgIf,
        SpinnerWithNgIf,
        SpinnerWithColor
      ],
    });

    TestBed.compileComponents();
  }));

  it('should apply a mode of "determinate" if no mode is provided.', () => {
    let fixture = TestBed.createComponent(BasicProgressSpinner);
      fixture.detectChanges();

      let progressElement = fixture.debugElement.query(By.css('md-progress-spinner'));
      expect(progressElement.componentInstance.mode).toBe('determinate');
  });

  it('should not modify the mode if a valid mode is provided.', () => {
    let fixture = TestBed.createComponent(IndeterminateProgressSpinner);
    fixture.detectChanges();

    let progressElement = fixture.debugElement.query(By.css('md-progress-spinner'));
    expect(progressElement.componentInstance.mode).toBe('indeterminate');
  });

  it('should define a default value of undefined for the value attribute', () => {
    let fixture = TestBed.createComponent(BasicProgressSpinner);
    fixture.detectChanges();

    let progressElement = fixture.debugElement.query(By.css('md-progress-spinner'));
    expect(progressElement.componentInstance.value).toBeUndefined();
  });

  it('should set the value to undefined when the mode is set to indeterminate', () => {
    let fixture = TestBed.createComponent(ProgressSpinnerWithValueAndBoundMode);
    let progressElement = fixture.debugElement.query(By.css('md-progress-spinner'));
    fixture.componentInstance.mode = 'determinate';
    fixture.detectChanges();

    expect(progressElement.componentInstance.value).toBe(50);
    fixture.componentInstance.mode = 'indeterminate';
    fixture.detectChanges();
    expect(progressElement.componentInstance.value).toBe(undefined);
  });

  it('should clamp the value of the progress between 0 and 100', () => {
    let fixture = TestBed.createComponent(BasicProgressSpinner);
    fixture.detectChanges();

    let progressElement = fixture.debugElement.query(By.css('md-progress-spinner'));
    let progressComponent = progressElement.componentInstance;

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

  it('should clean up the indeterminate animation when the element is destroyed', () => {
    let fixture = TestBed.createComponent(IndeterminateProgressSpinnerWithNgIf);
    fixture.detectChanges();

    let progressElement = fixture.debugElement.query(By.css('md-progress-spinner'));
    expect(progressElement.componentInstance.interdeterminateInterval).toBeTruthy();

    fixture.componentInstance.isHidden = true;
    fixture.detectChanges();
    expect(progressElement.componentInstance.interdeterminateInterval).toBeFalsy();
  });

  it('should clean up the animation when a spinner is destroyed', () => {
    let fixture = TestBed.createComponent(SpinnerWithNgIf);
    fixture.detectChanges();

    let progressElement = fixture.debugElement.query(By.css('md-spinner'));

    expect(progressElement.componentInstance.interdeterminateInterval).toBeTruthy();

    fixture.componentInstance.isHidden = true;
    fixture.detectChanges();

    expect(progressElement.componentInstance.interdeterminateInterval).toBeFalsy();
  });

  it('should set a default stroke width', () => {
    let fixture = TestBed.createComponent(BasicProgressSpinner);
    let pathElement = fixture.nativeElement.querySelector('path');

    fixture.detectChanges();

    expect(parseInt(pathElement.style.strokeWidth))
      .toBe(PROGRESS_SPINNER_STROKE_WIDTH, 'Expected the default stroke-width to be applied.');
  });

  it('should allow a custom stroke width', () => {
    let fixture = TestBed.createComponent(ProgressSpinnerCustomStrokeWidth);
    let pathElement = fixture.nativeElement.querySelector('path');

    fixture.componentInstance.strokeWidth = 40;
    fixture.detectChanges();

    expect(parseInt(pathElement.style.strokeWidth))
      .toBe(40, 'Expected the custom stroke width to be applied to the path element.');
  });

  it('should set the color class on the md-spinner', () => {
    let fixture = TestBed.createComponent(SpinnerWithColor);
    fixture.detectChanges();

    let progressElement = fixture.debugElement.query(By.css('md-spinner'));

    expect(progressElement.nativeElement.classList).toContain('mat-primary');

    fixture.componentInstance.color = 'accent';
    fixture.detectChanges();

    expect(progressElement.nativeElement.classList).toContain('mat-accent');
    expect(progressElement.nativeElement.classList).not.toContain('mat-primary');
  });

  it('should set the color class on the md-progress-spinner', () => {
    let fixture = TestBed.createComponent(ProgressSpinnerWithColor);
    fixture.detectChanges();

    let progressElement = fixture.debugElement.query(By.css('md-progress-spinner'));

    expect(progressElement.nativeElement.classList).toContain('mat-primary');

    fixture.componentInstance.color = 'accent';
    fixture.detectChanges();

    expect(progressElement.nativeElement.classList).toContain('mat-accent');
    expect(progressElement.nativeElement.classList).not.toContain('mat-primary');
  });

  it('should re-render the circle when switching from indeterminate to determinate mode', () => {
    let fixture = TestBed.createComponent(ProgressSpinnerWithValueAndBoundMode);
    let progressElement = fixture.debugElement.query(By.css('md-progress-spinner')).nativeElement;

    fixture.componentInstance.mode = 'indeterminate';
    fixture.detectChanges();

    let path = progressElement.querySelector('path');
    let oldDimesions = path.getAttribute('d');

    fixture.componentInstance.mode = 'determinate';
    fixture.detectChanges();

    expect(path.getAttribute('d')).not
        .toBe(oldDimesions, 'Expected circle dimensions to have changed.');
  });

});


@Component({template: '<md-progress-spinner></md-progress-spinner>'})
class BasicProgressSpinner {}

@Component({template: '<md-progress-spinner [strokeWidth]="strokeWidth"></md-progress-spinner>'})
class ProgressSpinnerCustomStrokeWidth {
  strokeWidth: number;
}

@Component({template: '<md-progress-spinner mode="indeterminate"></md-progress-spinner>'})
class IndeterminateProgressSpinner { }

@Component({template: '<md-progress-spinner value="50" [mode]="mode"></md-progress-spinner>'})
class ProgressSpinnerWithValueAndBoundMode { mode = 'indeterminate'; }

@Component({template: `
    <md-progress-spinner mode="indeterminate" *ngIf="!isHidden"></md-progress-spinner>`})
class IndeterminateProgressSpinnerWithNgIf { isHidden = false; }

@Component({template: `<md-spinner *ngIf="!isHidden"></md-spinner>`})
class SpinnerWithNgIf { isHidden = false; }

@Component({template: `<md-spinner [color]="color"></md-spinner>`})
class SpinnerWithColor { color: string = 'primary'; }

@Component({template: `<md-progress-spinner value="50" [color]="color"></md-progress-spinner>`})
class ProgressSpinnerWithColor { color: string = 'primary'; }
