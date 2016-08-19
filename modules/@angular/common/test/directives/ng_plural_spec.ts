/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule, NgLocalization} from '@angular/common';
import {Component, Injectable} from '@angular/core';
import {TestBed, async} from '@angular/core/testing';
import {expect} from '@angular/platform-browser/testing/matchers';

export function main() {
  describe('switch', () => {

    beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [TestComponent],
        providers: [{provide: NgLocalization, useClass: TestLocalization}],
        imports: [CommonModule]
      });
    });

    it('should display the template according to the exact value', async(() => {
         var template = '<div>' +
             '<ul [ngPlural]="switchValue">' +
             '<template ngPluralCase="=0"><li>you have no messages.</li></template>' +
             '<template ngPluralCase="=1"><li>you have one message.</li></template>' +
             '</ul></div>';

         TestBed.overrideComponent(TestComponent, {set: {template: template}});
         let fixture = TestBed.createComponent(TestComponent);
         fixture.debugElement.componentInstance.switchValue = 0;
         fixture.detectChanges();
         expect(fixture.debugElement.nativeElement).toHaveText('you have no messages.');

         fixture.debugElement.componentInstance.switchValue = 1;
         fixture.detectChanges();
         expect(fixture.debugElement.nativeElement).toHaveText('you have one message.');
       }));

    // https://github.com/angular/angular/issues/9868
    // https://github.com/angular/angular/issues/9882
    it('should not throw when ngPluralCase contains expressions', async(() => {
         var template = '<div>' +
             '<ul [ngPlural]="switchValue">' +
             '<template ngPluralCase="=0"><li>{{ switchValue }}</li></template>' +
             '</ul></div>';

         TestBed.overrideComponent(TestComponent, {set: {template: template}});
         let fixture = TestBed.createComponent(TestComponent);
         fixture.debugElement.componentInstance.switchValue = 0;
         expect(() => fixture.detectChanges()).not.toThrow();
       }));


    it('should be applicable to <ng-container> elements', async(() => {
         var template = '<div>' +
             '<ng-container [ngPlural]="switchValue">' +
             '<template ngPluralCase="=0">you have no messages.</template>' +
             '<template ngPluralCase="=1">you have one message.</template>' +
             '</ng-container></div>';

         TestBed.overrideComponent(TestComponent, {set: {template: template}});
         let fixture = TestBed.createComponent(TestComponent);
         fixture.debugElement.componentInstance.switchValue = 0;
         fixture.detectChanges();
         expect(fixture.debugElement.nativeElement).toHaveText('you have no messages.');

         fixture.debugElement.componentInstance.switchValue = 1;
         fixture.detectChanges();
         expect(fixture.debugElement.nativeElement).toHaveText('you have one message.');
       }));

    it('should display the template according to the category', async(() => {
         var template = '<div>' +
             '<ul [ngPlural]="switchValue">' +
             '<template ngPluralCase="few"><li>you have a few messages.</li></template>' +
             '<template ngPluralCase="many"><li>you have many messages.</li></template>' +
             '</ul></div>';

         TestBed.overrideComponent(TestComponent, {set: {template: template}});
         let fixture = TestBed.createComponent(TestComponent);
         fixture.debugElement.componentInstance.switchValue = 2;
         fixture.detectChanges();
         expect(fixture.debugElement.nativeElement).toHaveText('you have a few messages.');

         fixture.debugElement.componentInstance.switchValue = 8;
         fixture.detectChanges();
         expect(fixture.debugElement.nativeElement).toHaveText('you have many messages.');
       }));

    it('should default to other when no matches are found', async(() => {
         var template = '<div>' +
             '<ul [ngPlural]="switchValue">' +
             '<template ngPluralCase="few"><li>you have a few messages.</li></template>' +
             '<template ngPluralCase="other"><li>default message.</li></template>' +
             '</ul></div>';

         TestBed.overrideComponent(TestComponent, {set: {template: template}});
         let fixture = TestBed.createComponent(TestComponent);
         fixture.debugElement.componentInstance.switchValue = 100;
         fixture.detectChanges();
         expect(fixture.debugElement.nativeElement).toHaveText('default message.');
       }));

    it('should prioritize value matches over category matches', async(() => {
         var template = '<div>' +
             '<ul [ngPlural]="switchValue">' +
             '<template ngPluralCase="few"><li>you have a few messages.</li></template>' +
             '<template ngPluralCase="=2">you have two messages.</template>' +
             '</ul></div>';

         TestBed.overrideComponent(TestComponent, {set: {template: template}});
         let fixture = TestBed.createComponent(TestComponent);
         fixture.debugElement.componentInstance.switchValue = 2;
         fixture.detectChanges();
         expect(fixture.debugElement.nativeElement).toHaveText('you have two messages.');

         fixture.debugElement.componentInstance.switchValue = 3;
         fixture.detectChanges();
         expect(fixture.debugElement.nativeElement).toHaveText('you have a few messages.');
       }));
  });
}

@Injectable()
class TestLocalization extends NgLocalization {
  getPluralCategory(value: number): string {
    if (value > 1 && value < 4) {
      return 'few';
    }
    if (value >= 4 && value < 10) {
      return 'many';
    }

    return 'other';
  }
}

@Component({selector: 'test-cmp', template: ''})
class TestComponent {
  switchValue: number = null;
}
