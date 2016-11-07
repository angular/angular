/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {Attribute, Component, Directive} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {expect} from '@angular/platform-browser/testing/matchers';

export function main() {
  describe('NgSwitch', () => {
    let fixture: ComponentFixture<any>;

    function getComponent(): TestComponent { return fixture.componentInstance; }

    function detectChangesAndExpectText(text: string): void {
      fixture.detectChanges();
      expect(fixture.nativeElement).toHaveText(text);
    }

    afterEach(() => { fixture = null; });

    beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [TestComponent],
        imports: [CommonModule],
      });
    });

    describe('switch value changes', () => {
      it('should switch amongst when values', () => {
        const template = '<div>' +
            '<ul [ngSwitch]="switchValue">' +
            '<template ngSwitchCase="a"><li>when a</li></template>' +
            '<template ngSwitchCase="b"><li>when b</li></template>' +
            '</ul></div>';

        fixture = createTestComponent(template);

        detectChangesAndExpectText('');

        getComponent().switchValue = 'a';
        detectChangesAndExpectText('when a');

        getComponent().switchValue = 'b';
        detectChangesAndExpectText('when b');
      });

      it('should switch amongst when values with fallback to default', () => {
        const template = '<div>' +
            '<ul [ngSwitch]="switchValue">' +
            '<li template="ngSwitchCase \'a\'">when a</li>' +
            '<li template="ngSwitchDefault">when default</li>' +
            '</ul></div>';

        fixture = createTestComponent(template);
        detectChangesAndExpectText('when default');

        getComponent().switchValue = 'a';
        detectChangesAndExpectText('when a');

        getComponent().switchValue = 'b';
        detectChangesAndExpectText('when default');

        getComponent().switchValue = 'c';
        detectChangesAndExpectText('when default');
      });

      it('should support multiple whens with the same value', () => {
        const template = '<div>' +
            '<ul [ngSwitch]="switchValue">' +
            '<template ngSwitchCase="a"><li>when a1;</li></template>' +
            '<template ngSwitchCase="b"><li>when b1;</li></template>' +
            '<template ngSwitchCase="a"><li>when a2;</li></template>' +
            '<template ngSwitchCase="b"><li>when b2;</li></template>' +
            '<template ngSwitchDefault><li>when default1;</li></template>' +
            '<template ngSwitchDefault><li>when default2;</li></template>' +
            '</ul></div>';

        fixture = createTestComponent(template);
        detectChangesAndExpectText('when default1;when default2;');

        getComponent().switchValue = 'a';
        detectChangesAndExpectText('when a1;when a2;');

        getComponent().switchValue = 'b';
        detectChangesAndExpectText('when b1;when b2;');
      });
    });

    describe('when values changes', () => {
      it('should switch amongst when values', () => {
        const template = '<div>' +
            '<ul [ngSwitch]="switchValue">' +
            '<template [ngSwitchCase]="when1"><li>when 1;</li></template>' +
            '<template [ngSwitchCase]="when2"><li>when 2;</li></template>' +
            '<template ngSwitchDefault><li>when default;</li></template>' +
            '</ul></div>';

        fixture = createTestComponent(template);
        getComponent().when1 = 'a';
        getComponent().when2 = 'b';
        getComponent().switchValue = 'a';
        detectChangesAndExpectText('when 1;');

        getComponent().switchValue = 'b';
        detectChangesAndExpectText('when 2;');

        getComponent().switchValue = 'c';
        detectChangesAndExpectText('when default;');

        getComponent().when1 = 'c';
        detectChangesAndExpectText('when 1;');

        getComponent().when1 = 'd';
        detectChangesAndExpectText('when default;');
      });
    });

    describe('corner cases', () => {

      it('should not create the default case if another case matches', () => {
        const log: string[] = [];

        @Directive({selector: '[test]'})
        class TestDirective {
          constructor(@Attribute('test') test: string) { log.push(test); }
        }

        const template = '<div [ngSwitch]="switchValue">' +
            '<div *ngSwitchCase="\'a\'" test="aCase"></div>' +
            '<div *ngSwitchDefault test="defaultCase"></div>' +
            '</div>';

        TestBed.configureTestingModule({declarations: [TestDirective]});
        TestBed.overrideComponent(TestComponent, {set: {template: template}})
            .createComponent(TestComponent);
        const fixture = TestBed.createComponent(TestComponent);
        fixture.componentInstance.switchValue = 'a';

        fixture.detectChanges();

        expect(log).toEqual(['aCase']);
      });

      it('should create the default case if there is no other case', () => {
        const template = '<div>' +
            '<ul [ngSwitch]="switchValue">' +
            '<template ngSwitchDefault><li>when default1;</li></template>' +
            '<template ngSwitchDefault><li>when default2;</li></template>' +
            '</ul></div>';

        fixture = createTestComponent(template);
        detectChangesAndExpectText('when default1;when default2;');

      });

      it('should allow defaults before cases', () => {
        const template = '<div>' +
            '<ul [ngSwitch]="switchValue">' +
            '<template ngSwitchDefault><li>when default1;</li></template>' +
            '<template ngSwitchDefault><li>when default2;</li></template>' +
            '<template ngSwitchCase="a"><li>when a1;</li></template>' +
            '<template ngSwitchCase="b"><li>when b1;</li></template>' +
            '<template ngSwitchCase="a"><li>when a2;</li></template>' +
            '<template ngSwitchCase="b"><li>when b2;</li></template>' +
            '</ul></div>';

        fixture = createTestComponent(template);
        detectChangesAndExpectText('when default1;when default2;');

        getComponent().switchValue = 'a';
        detectChangesAndExpectText('when a1;when a2;');

        getComponent().switchValue = 'b';
        detectChangesAndExpectText('when b1;when b2;');
      });
    });
  });
}

@Component({selector: 'test-cmp', template: ''})
class TestComponent {
  switchValue: any = null;
  when1: any = null;
  when2: any = null;
}

function createTestComponent(template: string): ComponentFixture<TestComponent> {
  return TestBed.overrideComponent(TestComponent, {set: {template: template}})
      .createComponent(TestComponent);
}
