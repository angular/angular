import {TestBed, async} from '@angular/core/testing';
import {Component} from '@angular/core';
import {By} from '@angular/platform-browser';
import {MdProgressCircleModule} from './progress-circle';


describe('MdProgressCircular', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MdProgressCircleModule.forRoot()],
      declarations: [
        BasicProgressSpinner,
        IndeterminateProgressSpinner,
        ProgressSpinnerWithValueAndBoundMode,
        IndeterminateProgressSpinnerWithNgIf,
      ],
    });

    TestBed.compileComponents();
  }));

  it('should apply a mode of "determinate" if no mode is provided.', () => {
    let fixture = TestBed.createComponent(BasicProgressSpinner);
      fixture.detectChanges();

      let progressElement = fixture.debugElement.query(By.css('md-progress-circle'));
      expect(progressElement.componentInstance.mode).toBe('determinate');
  });

  it('should not modify the mode if a valid mode is provided.', () => {
    let fixture = TestBed.createComponent(IndeterminateProgressSpinner);
    fixture.detectChanges();

    let progressElement = fixture.debugElement.query(By.css('md-progress-circle'));
    expect(progressElement.componentInstance.mode).toBe('indeterminate');
  });

  it('should define a default value of undefined for the value attribute', () => {
    let fixture = TestBed.createComponent(BasicProgressSpinner);
    fixture.detectChanges();

    let progressElement = fixture.debugElement.query(By.css('md-progress-circle'));
    expect(progressElement.componentInstance.value).toBeUndefined();
  });

  it('should set the value to undefined when the mode is set to indeterminate', () => {
    let fixture = TestBed.createComponent(ProgressSpinnerWithValueAndBoundMode);
    let progressElement = fixture.debugElement.query(By.css('md-progress-circle'));
    fixture.debugElement.componentInstance.mode = 'determinate';
    fixture.detectChanges();

    expect(progressElement.componentInstance.value).toBe(50);
    fixture.debugElement.componentInstance.mode = 'indeterminate';
    fixture.detectChanges();
    expect(progressElement.componentInstance.value).toBe(undefined);
  });

  it('should clamp the value of the progress between 0 and 100', () => {
    let fixture = TestBed.createComponent(BasicProgressSpinner);
    fixture.detectChanges();

    let progressElement = fixture.debugElement.query(By.css('md-progress-circle'));
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

    let progressElement = fixture.debugElement.query(By.css('md-progress-circle'));
    expect(progressElement.componentInstance.interdeterminateInterval).toBeTruthy();

    fixture.debugElement.componentInstance.isHidden = true;
    fixture.detectChanges();
    expect(progressElement.componentInstance.interdeterminateInterval).toBeFalsy();
  });
});


@Component({template: '<md-progress-circle></md-progress-circle>'})
class BasicProgressSpinner { }

@Component({template: '<md-progress-circle mode="indeterminate"></md-progress-circle>'})
class IndeterminateProgressSpinner { }

@Component({template: '<md-progress-circle value="50" [mode]="mode"></md-progress-circle>'})
class ProgressSpinnerWithValueAndBoundMode { }

@Component({template: `
    <md-progress-circle mode="indeterminate" *ngIf="!isHidden"></md-progress-circle>`})
class IndeterminateProgressSpinnerWithNgIf { }
