import {TestBed, ComponentFixture} from '@angular/core/testing';
import {ApplicationRef, Component, DebugElement, Provider, Type} from '@angular/core';
import {By} from '@angular/platform-browser';
import {dispatchFakeEvent} from '../../cdk/testing/private';
import {
  MatLegacyProgressBarModule,
  MAT_LEGACY_PROGRESS_BAR_LOCATION,
  MAT_LEGACY_PROGRESS_BAR_DEFAULT_OPTIONS,
} from './index';
import {MatLegacyProgressBar} from './progress-bar';

describe('MatProgressBar', () => {
  let fakePath: string;

  function createComponent<T>(
    componentType: Type<T>,
    providers: Provider[] = [],
  ): ComponentFixture<T> {
    fakePath = '/fake-path';

    TestBed.configureTestingModule({
      imports: [MatLegacyProgressBarModule],
      declarations: [componentType],
      providers: [
        {
          provide: MAT_LEGACY_PROGRESS_BAR_LOCATION,
          useValue: {getPathname: () => fakePath},
        },
        ...providers,
      ],
    }).compileComponents();

    return TestBed.createComponent<T>(componentType);
  }

  // All children need to be hidden for screen readers in order to support ChromeVox.
  // More context in the issue: https://github.com/angular/components/issues/22165.
  it('should have elements wrapped in aria-hidden div', () => {
    const fixture = createComponent(BasicProgressBar);
    const host = fixture.nativeElement as Element;
    const element = host.children[0];
    expect(element.children.length).toBe(1);

    const div = element.querySelector('div')!;
    expect(div).toBeTruthy();
    expect(div.getAttribute('aria-hidden')).toBe('true');
  });

  describe('with animation', () => {
    describe('basic progress-bar', () => {
      it('should apply a mode of "determinate" if no mode is provided.', () => {
        const fixture = createComponent(BasicProgressBar);
        fixture.detectChanges();
        const progressElement = fixture.debugElement.query(By.css('mat-progress-bar'))!;
        expect(progressElement.componentInstance.mode).toBe('determinate');
      });

      it('should define default values for value and bufferValue attributes', () => {
        const fixture = createComponent(BasicProgressBar);
        fixture.detectChanges();
        const progressElement = fixture.debugElement.query(By.css('mat-progress-bar'))!;
        expect(progressElement.componentInstance.value).toBe(0);
        expect(progressElement.componentInstance.bufferValue).toBe(0);
      });

      it('should clamp value and bufferValue between 0 and 100', () => {
        const fixture = createComponent(BasicProgressBar);
        fixture.detectChanges();

        const progressElement = fixture.debugElement.query(By.css('mat-progress-bar'))!;
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

        const progressElement = fixture.debugElement.query(By.css('mat-progress-bar'))!;
        const progressComponent = progressElement.componentInstance;

        expect(progressComponent._primaryTransform()).toEqual({transform: 'scale3d(0, 1, 1)'});
        expect(progressComponent._bufferTransform()).toBe(null);

        progressComponent.value = 40;
        expect(progressComponent._primaryTransform()).toEqual({transform: 'scale3d(0.4, 1, 1)'});
        expect(progressComponent._bufferTransform()).toBe(null);

        progressComponent.value = 35;
        progressComponent.bufferValue = 55;
        expect(progressComponent._primaryTransform()).toEqual({transform: 'scale3d(0.35, 1, 1)'});
        expect(progressComponent._bufferTransform()).toBe(null);

        progressComponent.mode = 'buffer';
        expect(progressComponent._primaryTransform()).toEqual({transform: 'scale3d(0.35, 1, 1)'});
        expect(progressComponent._bufferTransform()).toEqual({transform: 'scale3d(0.55, 1, 1)'});

        progressComponent.value = 60;
        progressComponent.bufferValue = 60;
        expect(progressComponent._primaryTransform()).toEqual({transform: 'scale3d(0.6, 1, 1)'});
        expect(progressComponent._bufferTransform()).toEqual({transform: 'scale3d(0.6, 1, 1)'});
      });

      it('should prefix SVG references with the current path', () => {
        const fixture = createComponent(BasicProgressBar);
        fixture.detectChanges();

        const rect = fixture.debugElement.query(By.css('rect'))!.nativeElement;
        expect(rect.getAttribute('fill')).toMatch(/^url\(['"]?\/fake-path#.*['"]?\)$/);
      });

      it('should account for location hash when prefixing the SVG references', () => {
        fakePath = '/fake-path#anchor';

        const fixture = createComponent(BasicProgressBar);
        fixture.detectChanges();

        const rect = fixture.debugElement.query(By.css('rect'))!.nativeElement;
        expect(rect.getAttribute('fill')).not.toContain('#anchor#');
      });

      it('should not be able to tab into the underlying SVG element', () => {
        const fixture = createComponent(BasicProgressBar);
        fixture.detectChanges();

        const svg = fixture.debugElement.query(By.css('svg'))!.nativeElement;
        expect(svg.getAttribute('focusable')).toBe('false');
      });

      it('should use latest path when prefixing the SVG references', () => {
        let fixture = createComponent(BasicProgressBar);
        fixture.detectChanges();

        let rect = fixture.debugElement.query(By.css('rect'))!.nativeElement;
        expect(rect.getAttribute('fill')).toMatch(/^url\(['"]?\/fake-path#.*['"]?\)$/);

        fixture.destroy();
        fakePath = '/another-fake-path';

        fixture = TestBed.createComponent(BasicProgressBar);
        fixture.detectChanges();
        rect = fixture.debugElement.query(By.css('rect'))!.nativeElement;

        expect(rect.getAttribute('fill')).toMatch(/^url\(['"]?\/another-fake-path#.*['"]?\)$/);
      });

      it('should remove the `aria-valuenow` attribute in indeterminate mode', () => {
        const fixture = createComponent(BasicProgressBar);
        fixture.detectChanges();

        const progressElement = fixture.debugElement.query(By.css('mat-progress-bar'))!;
        const progressComponent = progressElement.componentInstance;

        progressComponent.mode = 'determinate';
        progressComponent.value = 50;
        fixture.detectChanges();

        expect(progressElement.nativeElement.getAttribute('aria-valuenow'))
          .withContext('Expected aria-valuenow to be set in determinate mode.')
          .toBe('50');

        progressComponent.mode = 'indeterminate';
        fixture.detectChanges();

        expect(progressElement.nativeElement.hasAttribute('aria-valuenow'))
          .withContext('Expect aria-valuenow to be cleared in indeterminate mode.')
          .toBe(false);
      });

      it('should remove the `aria-valuenow` attribute in query mode', () => {
        const fixture = createComponent(BasicProgressBar);
        fixture.detectChanges();

        const progressElement = fixture.debugElement.query(By.css('mat-progress-bar'))!;
        const progressComponent = progressElement.componentInstance;

        progressComponent.mode = 'determinate';
        progressComponent.value = 50;
        fixture.detectChanges();

        expect(progressElement.nativeElement.getAttribute('aria-valuenow'))
          .withContext('Expected aria-valuenow to be set in determinate mode.')
          .toBe('50');

        progressComponent.mode = 'query';
        fixture.detectChanges();

        expect(progressElement.nativeElement.hasAttribute('aria-valuenow'))
          .withContext('Expect aria-valuenow to be cleared in query mode.')
          .toBe(false);
      });

      it('should be able to configure the default progress bar options via DI', () => {
        const fixture = createComponent(BasicProgressBar, [
          {
            provide: MAT_LEGACY_PROGRESS_BAR_DEFAULT_OPTIONS,
            useValue: {
              mode: 'buffer',
              color: 'warn',
            },
          },
        ]);
        fixture.detectChanges();
        const progressElement = fixture.debugElement.query(By.css('mat-progress-bar'))!;
        expect(progressElement.componentInstance.mode).toBe('buffer');
        expect(progressElement.componentInstance.color).toBe('warn');
      });

      it('should update the DOM transform when the value has changed', () => {
        const fixture = createComponent(BasicProgressBar);
        fixture.detectChanges();

        const progressElement = fixture.debugElement.query(By.css('mat-progress-bar'))!;
        const progressComponent = progressElement.componentInstance;
        const primaryBar = progressElement.nativeElement.querySelector('.mat-progress-bar-primary');

        expect(primaryBar.style.transform).toBe('scale3d(0, 1, 1)');

        progressComponent.value = 40;
        fixture.detectChanges();

        expect(primaryBar.style.transform).toBe('scale3d(0.4, 1, 1)');
      });

      it('should update the DOM transform when the bufferValue has changed', () => {
        const fixture = createComponent(BasicProgressBar);
        fixture.detectChanges();

        const progressElement = fixture.debugElement.query(By.css('mat-progress-bar'))!;
        const progressComponent = progressElement.componentInstance;
        const bufferBar = progressElement.nativeElement.querySelector('.mat-progress-bar-buffer');

        progressComponent.mode = 'buffer';
        fixture.detectChanges();

        expect(bufferBar.style.transform).toBeFalsy();

        progressComponent.bufferValue = 40;
        fixture.detectChanges();

        expect(bufferBar.style.transform).toBe('scale3d(0.4, 1, 1)');
      });
    });

    describe('animation trigger on determinate setting', () => {
      let fixture: ComponentFixture<BasicProgressBar>;
      let progressComponent: MatLegacyProgressBar;
      let primaryValueBar: DebugElement;

      beforeEach(() => {
        fixture = createComponent(BasicProgressBar);

        const progressElement = fixture.debugElement.query(By.css('mat-progress-bar'))!;
        progressComponent = progressElement.componentInstance;
        primaryValueBar = progressElement.query(By.css('.mat-progress-bar-primary'))!;
      });

      it('should trigger output event on primary value bar animation end', () => {
        fixture.detectChanges();

        const animationEndSpy = jasmine.createSpy();
        progressComponent.animationEnd.subscribe(animationEndSpy);

        progressComponent.value = 40;
        expect(animationEndSpy).not.toHaveBeenCalled();

        // On animation end, output should be emitted.
        dispatchFakeEvent(primaryValueBar.nativeElement, 'transitionend');
        expect(animationEndSpy).toHaveBeenCalledWith({value: 40});
      });
    });

    describe('animation trigger on buffer setting', () => {
      let fixture: ComponentFixture<BufferProgressBar>;
      let progressComponent: MatLegacyProgressBar;
      let primaryValueBar: DebugElement;

      beforeEach(() => {
        fixture = createComponent(BufferProgressBar);

        const progressElement = fixture.debugElement.query(By.css('mat-progress-bar'))!;
        progressComponent = progressElement.componentInstance;
        primaryValueBar = progressElement.query(By.css('.mat-progress-bar-primary'))!;
      });

      it('should bind on transitionend eventListener on primaryBarValue', () => {
        spyOn(primaryValueBar.nativeElement, 'addEventListener');
        fixture.detectChanges();

        expect(primaryValueBar.nativeElement.addEventListener).toHaveBeenCalled();
        expect(primaryValueBar.nativeElement.addEventListener.calls.mostRecent().args[0]).toBe(
          'transitionend',
        );
      });

      it('should trigger output event on primary value bar animation end', () => {
        fixture.detectChanges();

        const animationEndSpy = jasmine.createSpy();
        progressComponent.animationEnd.subscribe(animationEndSpy);

        progressComponent.value = 40;
        expect(animationEndSpy).not.toHaveBeenCalled();

        // On animation end, output should be emitted.
        dispatchFakeEvent(primaryValueBar.nativeElement, 'transitionend');
        expect(animationEndSpy).toHaveBeenCalledWith({value: 40});
      });

      it('should trigger output event with value not bufferValue', () => {
        fixture.detectChanges();

        const animationEndSpy = jasmine.createSpy();
        progressComponent.animationEnd.subscribe(animationEndSpy);

        progressComponent.value = 40;
        progressComponent.bufferValue = 70;
        expect(animationEndSpy).not.toHaveBeenCalled();

        // On animation end, output should be emitted.
        dispatchFakeEvent(primaryValueBar.nativeElement, 'transitionend');
        expect(animationEndSpy).toHaveBeenCalledWith({value: 40});
      });

      it('should not run change detection if there are no `animationEnd` observers', () => {
        fixture.detectChanges();

        const animationEndSpy = jasmine.createSpy();
        const appRef = TestBed.inject(ApplicationRef);
        spyOn(appRef, 'tick');

        progressComponent.value = 30;
        progressComponent.bufferValue = 60;
        // On animation end, output should be emitted.
        dispatchFakeEvent(primaryValueBar.nativeElement, 'transitionend');

        expect(appRef.tick).not.toHaveBeenCalled();

        progressComponent.animationEnd.subscribe(animationEndSpy);

        progressComponent.value = 40;
        progressComponent.bufferValue = 70;
        // On animation end, output should be emitted.
        dispatchFakeEvent(primaryValueBar.nativeElement, 'transitionend');

        expect(appRef.tick).toHaveBeenCalled();
        expect(animationEndSpy).toHaveBeenCalledWith({value: 40});
      });
    });
  });
});

@Component({template: '<mat-progress-bar></mat-progress-bar>'})
class BasicProgressBar {}

@Component({template: '<mat-progress-bar mode="buffer"></mat-progress-bar>'})
class BufferProgressBar {}
