// tslint:disable

import {NgIf} from '@angular/common';
import {Component, input} from '@angular/core';
import {TestBed} from '@angular/core/testing';

import {AppComponent} from '.';

describe('bla', () => {
  it('should work', () => {
    @Component({
      template: `
        <app-component #ref />
        {{ref.input.ok}}
        `,
    })
    class TestCmp {}
    TestBed.configureTestingModule({
      imports: [AppComponent],
    });
    const fixture = TestBed.createComponent(TestCmp);
    fixture.detectChanges();
  });

  it('', () => {
    it('', () => {
      // Define `Ng2Component`
      @Component({
        selector: 'ng2',
        standalone: true,
        template: '<div *ngIf="show()"><ng1A></ng1A> | <ng1B></ng1B></div>',
        imports: [NgIf],
      })
      class Ng2Component {
        show = input<boolean>(false);
      }
    });
  });
});
