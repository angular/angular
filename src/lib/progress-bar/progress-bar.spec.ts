import {TestBed, async, ComponentFixture} from '@angular/core/testing';
import {Component} from '@angular/core';
import {By} from '@angular/platform-browser';
import {MatProgressBarModule} from './index';


describe('MatProgressBar', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MatProgressBarModule],
      declarations: [
        BasicProgressBar,
        BufferProgressBar,
      ],
    });

    TestBed.compileComponents();
  }));


  describe('basic progress-bar', () => {
    let fixture: ComponentFixture<BasicProgressBar>;

    beforeEach(() => {
      fixture = TestBed.createComponent(BasicProgressBar);
      fixture.detectChanges();
    });

    it('should apply a mode of "determinate" if no mode is provided.', () => {
      let progressElement = fixture.debugElement.query(By.css('mat-progress-bar'));
      expect(progressElement.componentInstance.mode).toBe('determinate');
    });

    it('should define default values for value and bufferValue attributes', () => {
      let progressElement = fixture.debugElement.query(By.css('mat-progress-bar'));
      expect(progressElement.componentInstance.value).toBe(0);
      expect(progressElement.componentInstance.bufferValue).toBe(0);
    });

    it('should clamp value and bufferValue between 0 and 100', () => {
      let progressElement = fixture.debugElement.query(By.css('mat-progress-bar'));
      let progressComponent = progressElement.componentInstance;

      progressComponent.value = 50;
      expect(progressComponent.value).toBe(50);

      progressComponent.value = 999;
      expect(progressComponent.value).toBe(100);

      progressComponent.value = -10;
      expect(progressComponent.value).toBe(0);

      progressComponent.bufferValue = -29;
      expect(progressComponent.bufferValue).toBe(0);

      progressComponent.bufferValue = 9;
      expect(progressComponent.bufferValue).toBe(9);

      progressComponent.bufferValue = 1320;
      expect(progressComponent.bufferValue).toBe(100);
    });

    it('should return the transform attribute for bufferValue and mode', () => {
      let progressElement = fixture.debugElement.query(By.css('mat-progress-bar'));
      let progressComponent = progressElement.componentInstance;

      expect(progressComponent._primaryTransform()).toEqual({transform: 'scaleX(0)'});
      expect(progressComponent._bufferTransform()).toBe(undefined);

      progressComponent.value = 40;
      expect(progressComponent._primaryTransform()).toEqual({transform: 'scaleX(0.4)'});
      expect(progressComponent._bufferTransform()).toBe(undefined);

      progressComponent.value = 35;
      progressComponent.bufferValue = 55;
      expect(progressComponent._primaryTransform()).toEqual({transform: 'scaleX(0.35)'});
      expect(progressComponent._bufferTransform()).toBe(undefined);

      progressComponent.mode = 'buffer';
      expect(progressComponent._primaryTransform()).toEqual({transform: 'scaleX(0.35)'});
      expect(progressComponent._bufferTransform()).toEqual({transform: 'scaleX(0.55)'});


      progressComponent.value = 60;
      progressComponent.bufferValue = 60;
      expect(progressComponent._primaryTransform()).toEqual({transform: 'scaleX(0.6)'});
      expect(progressComponent._bufferTransform()).toEqual({transform: 'scaleX(0.6)'});
    });
  });

  describe('buffer progress-bar', () => {
    let fixture: ComponentFixture<BufferProgressBar>;

    beforeEach(() => {
      fixture = TestBed.createComponent(BufferProgressBar);
      fixture.detectChanges();
    });

    it('should not modify the mode if a valid mode is provided.', () => {
      let progressElement = fixture.debugElement.query(By.css('mat-progress-bar'));
      expect(progressElement.componentInstance.mode).toBe('buffer');
    });
  });
});


@Component({template: '<mat-progress-bar></mat-progress-bar>'})
class BasicProgressBar { }

@Component({template: '<mat-progress-bar mode="buffer"></mat-progress-bar>'})
class BufferProgressBar { }
