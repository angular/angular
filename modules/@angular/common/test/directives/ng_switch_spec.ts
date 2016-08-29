/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {Component} from '@angular/core';
import {TestBed, async} from '@angular/core/testing';
import {expect} from '@angular/platform-browser/testing/matchers';

export function main() {
  describe('switch', () => {

    beforeEach(() => {
      TestBed.configureTestingModule({declarations: [TestComponent], imports: [CommonModule]});
    });

    describe('switch value changes', () => {
      it('should switch amongst when values', async(() => {
           var template = '<div>' +
               '<ul [ngSwitch]="switchValue">' +
               '<template ngSwitchCase="a"><li>when a</li></template>' +
               '<template ngSwitchCase="b"><li>when b</li></template>' +
               '</ul></div>';

           TestBed.overrideComponent(TestComponent, {set: {template: template}});
           let fixture = TestBed.createComponent(TestComponent);
           fixture.detectChanges();
           expect(fixture.debugElement.nativeElement).toHaveText('');

           fixture.debugElement.componentInstance.switchValue = 'a';
           fixture.detectChanges();
           expect(fixture.debugElement.nativeElement).toHaveText('when a');

           fixture.debugElement.componentInstance.switchValue = 'b';
           fixture.detectChanges();
           expect(fixture.debugElement.nativeElement).toHaveText('when b');
         }));

      // TODO(robwormald): deprecate and remove
      it('should switch amongst when values using switchCase', async(() => {
           var template = '<div>' +
               '<ul [ngSwitch]="switchValue">' +
               '<template ngSwitchCase="a"><li>when a</li></template>' +
               '<template ngSwitchCase="b"><li>when b</li></template>' +
               '</ul></div>';

           TestBed.overrideComponent(TestComponent, {set: {template: template}});
           let fixture = TestBed.createComponent(TestComponent);
           fixture.detectChanges();
           expect(fixture.debugElement.nativeElement).toHaveText('');

           fixture.debugElement.componentInstance.switchValue = 'a';
           fixture.detectChanges();
           expect(fixture.debugElement.nativeElement).toHaveText('when a');

           fixture.debugElement.componentInstance.switchValue = 'b';
           fixture.detectChanges();
           expect(fixture.debugElement.nativeElement).toHaveText('when b');
         }));

      it('should switch amongst when values with fallback to default', async(() => {
           var template = '<div>' +
               '<ul [ngSwitch]="switchValue">' +
               '<li template="ngSwitchCase \'a\'">when a</li>' +
               '<li template="ngSwitchDefault">when default</li>' +
               '</ul></div>';

           TestBed.overrideComponent(TestComponent, {set: {template: template}});
           let fixture = TestBed.createComponent(TestComponent);
           fixture.detectChanges();
           expect(fixture.debugElement.nativeElement).toHaveText('when default');

           fixture.debugElement.componentInstance.switchValue = 'a';
           fixture.detectChanges();
           expect(fixture.debugElement.nativeElement).toHaveText('when a');

           fixture.debugElement.componentInstance.switchValue = 'b';
           fixture.detectChanges();
           expect(fixture.debugElement.nativeElement).toHaveText('when default');
         }));

      it('should support multiple whens with the same value', async(() => {
           var template = '<div>' +
               '<ul [ngSwitch]="switchValue">' +
               '<template ngSwitchCase="a"><li>when a1;</li></template>' +
               '<template ngSwitchCase="b"><li>when b1;</li></template>' +
               '<template ngSwitchCase="a"><li>when a2;</li></template>' +
               '<template ngSwitchCase="b"><li>when b2;</li></template>' +
               '<template ngSwitchDefault><li>when default1;</li></template>' +
               '<template ngSwitchDefault><li>when default2;</li></template>' +
               '</ul></div>';

           TestBed.overrideComponent(TestComponent, {set: {template: template}});
           let fixture = TestBed.createComponent(TestComponent);
           fixture.detectChanges();
           expect(fixture.debugElement.nativeElement).toHaveText('when default1;when default2;');

           fixture.debugElement.componentInstance.switchValue = 'a';
           fixture.detectChanges();
           expect(fixture.debugElement.nativeElement).toHaveText('when a1;when a2;');

           fixture.debugElement.componentInstance.switchValue = 'b';
           fixture.detectChanges();
           expect(fixture.debugElement.nativeElement).toHaveText('when b1;when b2;');
         }));
    });

    describe('when values changes', () => {
      it('should switch amongst when values', async(() => {
           var template = '<div>' +
               '<ul [ngSwitch]="switchValue">' +
               '<template [ngSwitchCase]="when1"><li>when 1;</li></template>' +
               '<template [ngSwitchCase]="when2"><li>when 2;</li></template>' +
               '<template ngSwitchDefault><li>when default;</li></template>' +
               '</ul></div>';

           TestBed.overrideComponent(TestComponent, {set: {template: template}});
           let fixture = TestBed.createComponent(TestComponent);
           fixture.debugElement.componentInstance.when1 = 'a';
           fixture.debugElement.componentInstance.when2 = 'b';
           fixture.debugElement.componentInstance.switchValue = 'a';
           fixture.detectChanges();
           expect(fixture.debugElement.nativeElement).toHaveText('when 1;');

           fixture.debugElement.componentInstance.switchValue = 'b';
           fixture.detectChanges();
           expect(fixture.debugElement.nativeElement).toHaveText('when 2;');

           fixture.debugElement.componentInstance.switchValue = 'c';
           fixture.detectChanges();
           expect(fixture.debugElement.nativeElement).toHaveText('when default;');

           fixture.debugElement.componentInstance.when1 = 'c';
           fixture.detectChanges();
           expect(fixture.debugElement.nativeElement).toHaveText('when 1;');

           fixture.debugElement.componentInstance.when1 = 'd';
           fixture.detectChanges();
           expect(fixture.debugElement.nativeElement).toHaveText('when default;');
         }));
    });
  });
}

@Component({selector: 'test-cmp', template: ''})
class TestComponent {
  switchValue: any;
  when1: any;
  when2: any;

  constructor() {
    this.switchValue = null;
    this.when1 = null;
    this.when2 = null;
  }
}
