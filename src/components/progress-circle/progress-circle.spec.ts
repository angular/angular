import {
  it,
  describe,
  expect,
  beforeEach,
  inject,
} from '@angular/core/testing';
import {TestComponentBuilder} from '@angular/compiler/testing';
import {Component, DebugElement} from '@angular/core';
import {By} from '@angular/platform-browser';
import {MdProgressCircle} from './progress-circle';


describe('MdProgressCircular', () => {
  let builder: TestComponentBuilder;

  beforeEach(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
    builder = tcb;
  }));

  it('should apply a mode of "determinate" if no mode is provided.', (done: () => void) => {
    builder
      .overrideTemplate(TestApp, '<md-progress-circle></md-progress-circle>')
      .createAsync(TestApp)
      .then((fixture) => {
        fixture.detectChanges();
        let progressElement = getChildDebugElement(fixture.debugElement, 'md-progress-circle');
        expect(progressElement.componentInstance.mode).toBe('determinate');
        done();
      });
  });

  it('should not modify the mode if a valid mode is provided.', (done: () => void) => {
    builder
      .overrideTemplate(TestApp, '<md-progress-circle mode="indeterminate"></md-progress-circle>')
      .createAsync(TestApp)
      .then((fixture) => {
        fixture.detectChanges();
        let progressElement = getChildDebugElement(fixture.debugElement, 'md-progress-circle');
        expect(progressElement.componentInstance.mode).toBe('indeterminate');
        done();
      });
  });

  it('should define a default value of undefined for the value attribute', (done: () => void) => {
    builder
      .overrideTemplate(TestApp, '<md-progress-circle></md-progress-circle>')
      .createAsync(TestApp)
      .then((fixture) => {
        fixture.detectChanges();
        let progressElement = getChildDebugElement(fixture.debugElement, 'md-progress-circle');
        expect(progressElement.componentInstance.value).toBeUndefined();
        done();
      });
  });

  it('should set the value to undefined when the mode is set to indeterminate',
    (done: () => void) => {
      builder
        .overrideTemplate(TestApp, `<md-progress-circle value="50"
                                                        [mode]="mode"></md-progress-circle>`)
        .createAsync(TestApp)
        .then((fixture) => {
          let progressElement = getChildDebugElement(fixture.debugElement, 'md-progress-circle');
          fixture.debugElement.componentInstance.mode = 'determinate';
          fixture.detectChanges();
          expect(progressElement.componentInstance.value).toBe(50);
          fixture.debugElement.componentInstance.mode = 'indeterminate';
          fixture.detectChanges();
          expect(progressElement.componentInstance.value).toBe(undefined);
          done();
        });
  });

  it('should clamp the value of the progress between 0 and 100', (done: () => void) => {
    builder
      .overrideTemplate(TestApp, '<md-progress-circle></md-progress-circle>')
      .createAsync(TestApp)
      .then((fixture) => {
        fixture.detectChanges();
        let progressElement = getChildDebugElement(fixture.debugElement, 'md-progress-circle');
        let progressComponent = progressElement.componentInstance;

        progressComponent.value = 50;
        expect(progressComponent.value).toBe(50);

        progressComponent.value = 999;
        expect(progressComponent.value).toBe(100);

        progressComponent.value = -10;
        expect(progressComponent.value).toBe(0);
        done();
      });
  });

  it('should clean up the indeterminate animation when the element is destroyed',
    (done: () => void) => {
      let template = `<md-progress-circle
                        mode="indeterminate"
                        *ngIf="!isHidden"></md-progress-circle>`;

      builder
        .overrideTemplate(TestApp, template)
        .createAsync(TestApp)
        .then((fixture) => {
          fixture.detectChanges();
          let progressElement = getChildDebugElement(fixture.debugElement, 'md-progress-circle');
          expect(progressElement.componentInstance.interdeterminateInterval).toBeTruthy();

          fixture.debugElement.componentInstance.isHidden = true;
          fixture.detectChanges();
          expect(progressElement.componentInstance.interdeterminateInterval).toBeFalsy();
          done();
        });
    });
});


/** Gets a child DebugElement by tag name. */
function getChildDebugElement(parent: DebugElement, selector: string): DebugElement {
  return parent.query(By.css(selector));
}


/** Test component that contains an MdButton. */
@Component({
  directives: [MdProgressCircle],
  template: '',
})
class TestApp {
}
