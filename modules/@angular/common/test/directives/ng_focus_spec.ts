import {NgFocus} from '@angular/common';
import {Component} from '@angular/core';
import {TestBed, async} from '@angular/core/testing';
import {TestComponentBuilder} from '@angular/core/testing/test_component_builder';
import {describe, expect, iit, inject, it} from '@angular/core/testing/testing_internal';


export function main() {

  describe('Focus Directive', () => {

    it('Should set focus when the directive get truthy boolean',
      async(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
        var template = '<div><input class="test-input" [ngFocus]="inFocus" ></div>';
        tcb.overrideTemplate(TestComponent, template).createAsync(TestComponent).then((fixture) => {
          let el = fixture.nativeElement.querySelector('.test-input');
          let spy = spyOn(el, 'focus').and.callThrough();
          fixture.componentInstance.inFocus = true;
          fixture.detectChanges();
          fixture.whenStable().then(() => {
            expect(spy).toHaveBeenCalled();
          });


        });
      })));

    it('Should get out of focus when the directive get falsey boolean',
      async(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
        var template = '<div><input class="test-input" [ngFocus]="inFocus" ></div>';
        tcb.overrideTemplate(TestComponent, template).createAsync(TestComponent).then((fixture) => {
          let el = fixture.nativeElement.querySelector('.test-input');
          let spy = spyOn(el, 'blur').and.callThrough();
          fixture.componentInstance.inFocus = true;
          fixture.detectChanges();
          fixture.componentInstance.inFocus = false;
          fixture.detectChanges();
          fixture.whenStable().then(() => {
            expect(spy).toHaveBeenCalled();
          });

        });
      })));


  });
}



@Component({selector: 'test-cmp', directives: [NgFocus], template: ' '})
class TestComponent {
  inFocus: boolean;
}
