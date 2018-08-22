import {TestBed, ComponentFixture} from '@angular/core/testing';
import {Component, Type} from '@angular/core';
import {By} from '@angular/platform-browser';
import {MatProgressBarModule, MAT_PROGRESS_BAR_LOCATION} from './index';


describe('MatProgressBar', () => {
  let fakePath = '/fake-path';

  function createComponent<T>(componentType: Type<T>): ComponentFixture<T> {
    TestBed.configureTestingModule({
      imports: [MatProgressBarModule],
      declarations: [componentType],
      providers: [{
        provide: MAT_PROGRESS_BAR_LOCATION,
        useValue: {pathname: fakePath}
      }]
    }).compileComponents();

    return TestBed.createComponent<T>(componentType);
  }

  describe('basic progress-bar', () => {
    it('should apply a mode of "determinate" if no mode is provided.', () => {
      const fixture = createComponent(BasicProgressBar);
      fixture.detectChanges();

      const progressElement = fixture.debugElement.query(By.css('mat-progress-bar'));
      expect(progressElement.componentInstance.mode).toBe('determinate');
    });

    it('should define default values for value and bufferValue attributes', () => {
      const fixture = createComponent(BasicProgressBar);
      fixture.detectChanges();

      const progressElement = fixture.debugElement.query(By.css('mat-progress-bar'));
      expect(progressElement.componentInstance.value).toBe(0);
      expect(progressElement.componentInstance.bufferValue).toBe(0);
    });

    it('should clamp value and bufferValue between 0 and 100', () => {
      const fixture = createComponent(BasicProgressBar);
      fixture.detectChanges();

      const progressElement = fixture.debugElement.query(By.css('mat-progress-bar'));
      const progressComponent = progressElement.componentInstance;

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
      const fixture = createComponent(BasicProgressBar);
      fixture.detectChanges();

      const progressElement = fixture.debugElement.query(By.css('mat-progress-bar'));
      const progressComponent = progressElement.componentInstance;

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

    it('should prefix SVG references with the current path', () => {
      const fixture = createComponent(BasicProgressBar);
      fixture.detectChanges();

      const rect = fixture.debugElement.query(By.css('rect')).nativeElement;
      expect(rect.getAttribute('fill')).toMatch(/^url\(['"]?\/fake-path#.*['"]?\)$/);
    });

    it('should account for location hash when prefixing the SVG references', () => {
      fakePath = '/fake-path#anchor';

      const fixture = createComponent(BasicProgressBar);
      fixture.detectChanges();

      const rect = fixture.debugElement.query(By.css('rect')).nativeElement;
      expect(rect.getAttribute('fill')).not.toContain('#anchor#');
    });

    it('should not be able to tab into the underlying SVG element', () => {
      const fixture = createComponent(BasicProgressBar);
      fixture.detectChanges();

      const svg = fixture.debugElement.query(By.css('svg')).nativeElement;
      expect(svg.getAttribute('focusable')).toBe('false');
    });
  });

  describe('buffer progress-bar', () => {
    it('should not modify the mode if a valid mode is provided.', () => {
      const fixture = createComponent(BufferProgressBar);
      fixture.detectChanges();

      const progressElement = fixture.debugElement.query(By.css('mat-progress-bar'));
      expect(progressElement.componentInstance.mode).toBe('buffer');
    });
  });
});


@Component({template: '<mat-progress-bar></mat-progress-bar>'})
class BasicProgressBar { }

@Component({template: '<mat-progress-bar mode="buffer"></mat-progress-bar>'})
class BufferProgressBar { }
