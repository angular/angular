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


export function main() {
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

    it('should define a default value for the value attribute', (done: () => void) => {
      builder
        .overrideTemplate(TestApp, '<md-progress-circle></md-progress-circle>')
        .createAsync(TestApp)
        .then((fixture) => {
          fixture.detectChanges();
          let progressElement = getChildDebugElement(fixture.debugElement, 'md-progress-circle');
          expect(progressElement.componentInstance.value).toBe(0);
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
  });
}


/** Gets a child DebugElement by tag name. */
function getChildDebugElement(parent: DebugElement, selector: string): DebugElement {
  return parent.query(By.css(selector));
}



/** Test component that contains an MdButton. */
@Component({
    directives: [MdProgressCircle],
    template: '',
})
class TestApp {}
