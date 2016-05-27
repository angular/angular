import {beforeEach, describe, expect, inject, it} from '@angular/core/testing';
import {TestComponentBuilder} from '@angular/compiler/testing';
import {Component} from '@angular/core';
import {By} from '@angular/platform-browser';
import {MdProgressBar} from './progress-bar';


describe('MdProgressBar', () => {
  let builder: TestComponentBuilder;

  beforeEach(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
    builder = tcb;
  }));

  it('should apply a mode of "determinate" if no mode is provided.', (done: () => void) => {
    builder
      .overrideTemplate(TestApp, '<md-progress-bar></md-progress-bar>')
      .createAsync(TestApp)
      .then((fixture) => {
        fixture.detectChanges();
        let progressElement = fixture.debugElement.query(By.css('md-progress-bar'));
        expect(progressElement.componentInstance.mode).toBe('determinate');
        done();
      });
  });

  it('should not modify the mode if a valid mode is provided.', (done: () => void) => {
    builder
      .overrideTemplate(TestApp, '<md-progress-bar mode="buffer"></md-progress-bar>')
      .createAsync(TestApp)
      .then((fixture) => {
        fixture.detectChanges();
        let progressElement = fixture.debugElement.query(By.css('md-progress-bar'));
        expect(progressElement.componentInstance.mode).toBe('buffer');
        done();
      });
  });

  it('should define default values for value and bufferValue attributes', (done: () => void) => {
    builder
      .overrideTemplate(TestApp, '<md-progress-bar></md-progress-bar>')
      .createAsync(TestApp)
      .then((fixture) => {
        fixture.detectChanges();
        let progressElement = fixture.debugElement.query(By.css('md-progress-bar'));
        expect(progressElement.componentInstance.value).toBe(0);
        expect(progressElement.componentInstance.bufferValue).toBe(0);
        done();
      });
  });

  it('should clamp value and bufferValue between 0 and 100', (done: () => void) => {
    builder
      .overrideTemplate(TestApp, '<md-progress-bar></md-progress-bar>')
      .createAsync(TestApp)
      .then((fixture) => {
        fixture.detectChanges();
        let progressElement = fixture.debugElement.query(By.css('md-progress-bar'));
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
        done();
      });
  });

  it('should return the transform attribute for bufferValue and mode', (done: () => void) => {
    builder
      .overrideTemplate(TestApp, '<md-progress-bar></md-progress-bar>')
      .createAsync(TestApp)
      .then((fixture) => {
        fixture.detectChanges();
        let progressElement = fixture.debugElement.query(By.css('md-progress-bar'));
        let progressComponent = progressElement.componentInstance;

        expect(progressComponent.primaryTransform()).toEqual({ transform: 'scaleX(0)' });
        expect(progressComponent.bufferTransform()).toBe(undefined);

        progressComponent.value = 40;
        expect(progressComponent.primaryTransform()).toEqual({ transform: 'scaleX(0.4)' });
        expect(progressComponent.bufferTransform()).toBe(undefined);

        progressComponent.value = 35;
        progressComponent.bufferValue = 55;
        expect(progressComponent.primaryTransform()).toEqual({ transform: 'scaleX(0.35)' });
        expect(progressComponent.bufferTransform()).toBe(undefined);

        progressComponent.mode = 'buffer';
        expect(progressComponent.primaryTransform()).toEqual({ transform: 'scaleX(0.35)' });
        expect(progressComponent.bufferTransform()).toEqual({ transform: 'scaleX(0.55)' });


        progressComponent.value = 60;
        progressComponent.bufferValue = 60;
        expect(progressComponent.primaryTransform()).toEqual({ transform: 'scaleX(0.6)' });
        expect(progressComponent.bufferTransform()).toEqual({ transform: 'scaleX(0.6)' });
        done();
      });
  });
});


/** Test component that contains an MdButton. */
@Component({
  directives: [MdProgressBar],
  template: '',
})
class TestApp {
}
