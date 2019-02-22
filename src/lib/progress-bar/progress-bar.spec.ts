import {TestBed, async, ComponentFixture} from '@angular/core/testing';
import {Component, DebugElement, Type} from '@angular/core';
import {By} from '@angular/platform-browser';
import {dispatchFakeEvent} from '@angular/cdk/testing';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MatProgressBarModule, MAT_PROGRESS_BAR_LOCATION} from './index';
import {MatProgressBar} from './progress-bar';


describe('MatProgressBar', () => {
  let fakePath: string;

  function createComponent<T>(componentType: Type<T>,
                              imports?: Array<Type<{}>>): ComponentFixture<T> {
    fakePath = '/fake-path';

    TestBed.configureTestingModule({
      imports: imports || [MatProgressBarModule],
      declarations: [componentType],
      providers: [{
        provide: MAT_PROGRESS_BAR_LOCATION,
        useValue: {getPathname: () => fakePath}
      }]
    }).compileComponents();

    return TestBed.createComponent<T>(componentType);
  }

  describe('with animation', () => {
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

      it('should use latest path when prefixing the SVG references', () => {
        let fixture = createComponent(BasicProgressBar);
        fixture.detectChanges();

        let rect = fixture.debugElement.query(By.css('rect')).nativeElement;
        expect(rect.getAttribute('fill')).toMatch(/^url\(['"]?\/fake-path#.*['"]?\)$/);

        fixture.destroy();
        fakePath = '/another-fake-path';

        fixture = TestBed.createComponent(BasicProgressBar);
        fixture.detectChanges();
        rect = fixture.debugElement.query(By.css('rect')).nativeElement;

        expect(rect.getAttribute('fill')).toMatch(/^url\(['"]?\/another-fake-path#.*['"]?\)$/);
      });

      it('should remove the `aria-valuenow` attribute in indeterminate mode', () => {
        const fixture = createComponent(BasicProgressBar);
        fixture.detectChanges();

        const progressElement = fixture.debugElement.query(By.css('mat-progress-bar'));
        const progressComponent = progressElement.componentInstance;

        progressComponent.mode = 'determinate';
        progressComponent.value = 50;
        fixture.detectChanges();

        expect(progressElement.nativeElement.getAttribute('aria-valuenow'))
            .toBe('50', 'Expected aria-valuenow to be set in determinate mode.');

        progressComponent.mode = 'indeterminate';
        fixture.detectChanges();

        expect(progressElement.nativeElement.hasAttribute('aria-valuenow'))
            .toBe(false, 'Expect aria-valuenow to be cleared in indeterminate mode.');
      });

      it('should remove the `aria-valuenow` attribute in query mode', () => {
        const fixture = createComponent(BasicProgressBar);
        fixture.detectChanges();

        const progressElement = fixture.debugElement.query(By.css('mat-progress-bar'));
        const progressComponent = progressElement.componentInstance;

        progressComponent.mode = 'determinate';
        progressComponent.value = 50;
        fixture.detectChanges();

        expect(progressElement.nativeElement.getAttribute('aria-valuenow'))
            .toBe('50', 'Expected aria-valuenow to be set in determinate mode.');

        progressComponent.mode = 'query';
        fixture.detectChanges();

        expect(progressElement.nativeElement.hasAttribute('aria-valuenow'))
            .toBe(false, 'Expect aria-valuenow to be cleared in query mode.');
      });

    });

    describe('animation trigger on determinate setting', () => {
      let fixture: ComponentFixture<BasicProgressBar>;
      let progressComponent: MatProgressBar;
      let primaryValueBar: DebugElement;

      beforeEach(() => {
        fixture = createComponent(BasicProgressBar);

        const progressElement = fixture.debugElement.query(By.css('mat-progress-bar'));
        progressComponent = progressElement.componentInstance;
        primaryValueBar = progressElement.query(By.css('.mat-progress-bar-primary'));
      });

      it('should trigger output event on primary value bar animation end', () => {
        fixture.detectChanges();
        spyOn(progressComponent.animationEnd, 'next');

        progressComponent.value = 40;
        expect(progressComponent.animationEnd.next).not.toHaveBeenCalled();

        // On animation end, output should be emitted.
        dispatchFakeEvent(primaryValueBar.nativeElement, 'transitionend');
        expect(progressComponent.animationEnd.next).toHaveBeenCalledWith({ value: 40 });
      });
    });

    describe('animation trigger on buffer setting', () => {
      let fixture: ComponentFixture<BufferProgressBar>;
      let progressComponent: MatProgressBar;
      let primaryValueBar: DebugElement;

      beforeEach(() => {
        fixture = createComponent(BufferProgressBar);

        const progressElement = fixture.debugElement.query(By.css('mat-progress-bar'));
        progressComponent = progressElement.componentInstance;
        primaryValueBar = progressElement.query(By.css('.mat-progress-bar-primary'));
      });

      it('should bind on transitionend eventListener on primaryBarValue', () => {
        spyOn(primaryValueBar.nativeElement, 'addEventListener');
        fixture.detectChanges();

        expect(primaryValueBar.nativeElement.addEventListener).toHaveBeenCalled();
        expect(primaryValueBar.nativeElement.addEventListener
               .calls.mostRecent().args[0]).toBe('transitionend');
      });

      it('should trigger output event on primary value bar animation end', () => {
        fixture.detectChanges();
        spyOn(progressComponent.animationEnd, 'next');

        progressComponent.value = 40;
        expect(progressComponent.animationEnd.next).not.toHaveBeenCalled();

        // On animation end, output should be emitted.
        dispatchFakeEvent(primaryValueBar.nativeElement, 'transitionend');
        expect(progressComponent.animationEnd.next).toHaveBeenCalledWith({ value: 40 });
      });

      it('should trigger output event with value not bufferValue', () => {
        fixture.detectChanges();
        spyOn(progressComponent.animationEnd, 'next');

        progressComponent.value = 40;
        progressComponent.bufferValue = 70;
        expect(progressComponent.animationEnd.next).not.toHaveBeenCalled();

        // On animation end, output should be emitted.
        dispatchFakeEvent(primaryValueBar.nativeElement, 'transitionend');
        expect(progressComponent.animationEnd.next).toHaveBeenCalledWith({ value: 40 });
      });
    });
  });

  describe('With NoopAnimations', () => {
    let progressComponent: MatProgressBar;
    let primaryValueBar: DebugElement;
    let fixture: ComponentFixture<BasicProgressBar>;

    beforeEach(async(() => {
      fixture = createComponent(BasicProgressBar, [MatProgressBarModule, NoopAnimationsModule]);
      const progressElement = fixture.debugElement.query(By.css('mat-progress-bar'));
      progressComponent = progressElement.componentInstance;
      primaryValueBar = progressElement.query(By.css('.mat-progress-bar-primary'));
    }));

    it('should not bind transition end listener', () => {
      spyOn(primaryValueBar.nativeElement, 'addEventListener');
      fixture.detectChanges();

      expect(primaryValueBar.nativeElement.addEventListener).not.toHaveBeenCalled();
    });

    it('should trigger the animationEnd output on value set', () => {
      fixture.detectChanges();
      spyOn(progressComponent.animationEnd, 'next');

      progressComponent.value = 40;
      expect(progressComponent.animationEnd.next).toHaveBeenCalledWith({ value: 40 });
    });
  });
});

@Component({template: '<mat-progress-bar></mat-progress-bar>'})
class BasicProgressBar { }

@Component({template: '<mat-progress-bar mode="buffer"></mat-progress-bar>'})
class BufferProgressBar { }
