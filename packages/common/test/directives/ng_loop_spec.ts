import {CommonModule, NgLoopTo, NgLoopToContext} from '@angular/common';
import {Component, Directive} from '@angular/core';
import {ComponentFixture, TestBed, async} from '@angular/core/testing';
import {By} from '@angular/platform-browser/src/dom/debug/by';
import {expect} from '@angular/platform-browser/testing/src/matchers';

let thisArg: any;

export function main() {
  describe('ngLoopFrom', () => {
    let fixture: ComponentFixture<any>;

    function getComponent(): TestComponent { return fixture.componentInstance; }

    function detectChangesAndExpectText(text: string): void {
      fixture.detectChanges();
      expect(fixture.nativeElement).toHaveText(text);
    }

    afterEach(() => { fixture = null; });

    beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [TestComponent, TestDirective],
        imports: [CommonModule],
      });
    });

    it('should loop from 0 and by 1 by default', async(() => {
         fixture = createTestComponent(undefined, 2);

         detectChangesAndExpectText('0;1;2;');
       }));

    it('should work with decimals', async(() => {
         fixture = createTestComponent(1.2, 1.4, 0.1);

         detectChangesAndExpectText('1.2;1.3;1.4;');
       }));

    it('should work with decimals and better precision', async(() => {
         fixture = createTestComponent(1.002, 1.004, 0.001, 4);

         detectChangesAndExpectText('1.002;1.003;1.004;');
       }));

    it('should work with negative by', async(() => {
         fixture = createTestComponent(2, 0, -1);

         detectChangesAndExpectText('2;1;0;');
       }));

    describe('should throw on wrong inputs', () => {
      it('from is not a number', async(() => {
           fixture = createTestComponent(<any>'a', 1);

           expect(() => fixture.detectChanges()).toThrowError();
         }));

      it('to is not a number', async(() => {
           fixture = createTestComponent(0, <any>'a');

           expect(() => fixture.detectChanges()).toThrowError();
         }));

      it('by is not a number', async(() => {
           fixture = createTestComponent(0, 1, <any>'a');

           expect(() => fixture.detectChanges()).toThrowError();
         }));

      it('precision is not a number', async(() => {
           fixture = createTestComponent(0, 1, 1, <any>'a');

           expect(() => fixture.detectChanges()).toThrowError();
         }));

      it('precision is negative', async(() => {
           fixture = createTestComponent(0, 1, 1, -2);

           expect(() => fixture.detectChanges()).toThrowError();
         }));

      it('precision is decimal', async(() => {
           fixture = createTestComponent(0, 1, 1, 1.2);

           expect(() => fixture.detectChanges()).toThrowError();
         }));
    })

    it('should throw on infinite loop', async(() => {
         fixture = createTestComponent(0, 1, -1);

         expect(() => fixture.detectChanges()).toThrowError();
       }));

    it('should reflect range change', async(() => {
         fixture = createTestComponent(1, 2, 1);
         detectChangesAndExpectText('1;2;');

         getComponent().end = 3;
         detectChangesAndExpectText('1;2;3;');

         getComponent().start = 0;
         detectChangesAndExpectText('0;1;2;3;');

         getComponent().step = 2;
         detectChangesAndExpectText('0;2;');
       }));

    it('should not replace elements with same value', async(() => {
         fixture = createTestComponent(0, 1);

         const getFirstElements = () => {
           fixture.detectChanges();
           return fixture.debugElement.queryAll(By.css('span')).slice(0, 2);
         };

         const firstEls = getFirstElements();
         getComponent().end = 5;
         const _firstEls = getFirstElements();

         expect(_firstEls).toEqual(firstEls);
       }));

    it('should reuse existing elements', async(() => {
         fixture = createTestComponent(0, 1);

         const getFirstElements = () => {
           fixture.detectChanges();
           return fixture.debugElement.queryAll(By.css('span')).slice(0, 2);
         };

         const firstEls = getFirstElements();
         getComponent().start = 5;
         getComponent().end = 7;
         const _firstEls = getFirstElements();

         expect(_firstEls).toEqual(firstEls);
       }));

    it('should support injecting `NgFor` and get an instance of `NgForOf`', async(() => {
         fixture =
             TestBed
                 .overrideComponent(TestComponent, {
                   set: {template: `<ng-template ngLoop [ngLoopTo]='2' let-i test></ng-template>`}
                 })
                 .createComponent(TestComponent);
         const testDirective = fixture.debugElement.childNodes[0].injector.get(TestDirective);
         const ngLoopTo = fixture.debugElement.childNodes[0].injector.get(NgLoopTo);

         expect(testDirective.ngLoop).toBe(ngLoopTo);
       }));

  });
}


@Component({selector: 'test-cmp', template: ''})
class TestComponent {
  start: number;
  end: number;
  step: number;
  precision: number;
}

@Directive({selector: '[test]'})
class TestDirective {
  constructor(public ngLoop: NgLoopTo) {}
}

function createTestComponent(from: number | undefined, to: number, by?: number, precision?: number):
    ComponentFixture<TestComponent> {
  let loopString = 'let idx';
  if (from !== undefined) loopString += ' from start';
  if (to !== undefined) loopString += ' to end';
  if (by !== undefined) loopString += ' by step';
  if (precision !== undefined) loopString += ' precision: precision';

  const cmp = TestBed
                  .overrideComponent(
                      TestComponent,
                      {set: {template: `<div><span *ngLoop="${loopString}">{{idx}};</span></div>`}})
                  .createComponent(TestComponent);

  cmp.componentInstance.start = from;
  cmp.componentInstance.end = to;
  cmp.componentInstance.step = by;
  cmp.componentInstance.precision = precision;

  return cmp;
}
