/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Injector, OpaqueToken, Pipe, PipeTransform, Provider} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {beforeEach, describe, it} from '@angular/core/testing/testing_internal';
import {expect} from '@angular/platform-browser/testing/matchers';

export function main() {
  describe('jit', () => { declareTests({useJit: true}); });

  describe('no jit', () => { declareTests({useJit: false}); });
}

function declareTests({useJit}: {useJit: boolean}) {
  // Place to put reproductions for regressions
  describe('regressions', () => {

    beforeEach(() => { TestBed.configureTestingModule({declarations: [MyComp1, PlatformPipe]}); });

    describe('platform pipes', () => {
      beforeEach(() => { TestBed.configureCompiler({useJit: useJit}); });

      it('should overwrite them by custom pipes', () => {
        TestBed.configureTestingModule({declarations: [CustomPipe]});
        const template = '{{true | somePipe}}';
        TestBed.overrideComponent(MyComp1, {set: {template}});
        const fixture = TestBed.createComponent(MyComp1);

        fixture.detectChanges();
        expect(fixture.nativeElement).toHaveText('someCustomPipe');
      });
    });

    describe('expressions', () => {
      it('should evaluate conditional and boolean operators with right precedence - #8244', () => {
        const template = `{{'red' + (true ? ' border' : '')}}`;
        TestBed.overrideComponent(MyComp1, {set: {template}});
        const fixture = TestBed.createComponent(MyComp1);

        fixture.detectChanges();
        expect(fixture.nativeElement).toHaveText('red border');
      });

      it('should evaluate conditional and unary operators with right precedence - #8235', () => {
        const template = `{{!null?.length}}`;
        TestBed.overrideComponent(MyComp1, {set: {template}});
        const fixture = TestBed.createComponent(MyComp1);

        fixture.detectChanges();
        expect(fixture.nativeElement).toHaveText('true');
      });

      it('should only evaluate stateful pipes once - #10639', () => {
        TestBed.configureTestingModule({declarations: [CountingPipe]});
        const template = '{{(null|countingPipe)?.value}}';
        TestBed.overrideComponent(MyComp1, {set: {template}});
        const fixture = TestBed.createComponent(MyComp1);

        CountingPipe.reset();
        fixture.detectChanges(/* checkNoChanges */ false);
        expect(fixture.nativeElement).toHaveText('counting pipe value');
        expect(CountingPipe.calls).toBe(1);
      });

      it('should only evaluate methods once - #10639', () => {
        TestBed.configureTestingModule({declarations: [MyCountingComp]});
        const template = '{{method()?.value}}';
        TestBed.overrideComponent(MyCountingComp, {set: {template}});
        const fixture = TestBed.createComponent(MyCountingComp);

        MyCountingComp.reset();
        fixture.detectChanges(/* checkNoChanges */ false);
        expect(fixture.nativeElement).toHaveText('counting method value');
        expect(MyCountingComp.calls).toBe(1);
      });

      it('should evalute a conditional in a statement binding', () => {
        @Component({selector: 'some-comp', template: '<p (click)="nullValue?.click()"></p>'})
        class SomeComponent {
          nullValue: SomeReferencedClass;
        }

        class SomeReferencedClass {
          click() {}
        }

        expect(() => {
          const fixture = TestBed.configureTestingModule({declarations: [SomeComponent]})
                              .createComponent(SomeComponent);

          fixture.detectChanges(/* checkNoChanges */ false);
        }).not.toThrow();
      });
    });

    describe('providers', () => {
      function createInjector(providers: Provider[]): Injector {
        TestBed.overrideComponent(MyComp1, {add: {providers}});
        return TestBed.createComponent(MyComp1).componentInstance.injector;
      }

      it('should support providers with an OpaqueToken that contains a `.` in the name', () => {
        var token = new OpaqueToken('a.b');
        var tokenValue = 1;
        const injector = createInjector([{provide: token, useValue: tokenValue}]);
        expect(injector.get(token)).toEqual(tokenValue);
      });

      it('should support providers with string token with a `.` in it', () => {
        var token = 'a.b';
        var tokenValue = 1;
        const injector = createInjector([{provide: token, useValue: tokenValue}]);

        expect(injector.get(token)).toEqual(tokenValue);
      });

      it('should support providers with an anonymous function', () => {
        var token = () => true;
        var tokenValue = 1;
        const injector = createInjector([{provide: token, useValue: tokenValue}]);

        expect(injector.get(token)).toEqual(tokenValue);
      });

      it('should support providers with an OpaqueToken that has a StringMap as value', () => {
        var token1 = new OpaqueToken('someToken');
        var token2 = new OpaqueToken('someToken');
        var tokenValue1 = {'a': 1};
        var tokenValue2 = {'a': 1};
        const injector = createInjector(
            [{provide: token1, useValue: tokenValue1}, {provide: token2, useValue: tokenValue2}]);

        expect(injector.get(token1)).toEqual(tokenValue1);
        expect(injector.get(token2)).toEqual(tokenValue2);
      });
    });

    it('should allow logging a previous elements class binding via interpolation', () => {
      const template = `<div [class.a]="true" #el>Class: {{el.className}}</div>`;
      TestBed.overrideComponent(MyComp1, {set: {template}});
      const fixture = TestBed.createComponent(MyComp1);

      fixture.detectChanges();
      expect(fixture.nativeElement).toHaveText('Class: a');
    });

    it('should support ngClass before a component and content projection inside of an ngIf', () => {
      TestBed.configureTestingModule({declarations: [CmpWithNgContent]});
      const template = `A<cmp-content *ngIf="true" [ngClass]="'red'">B</cmp-content>C`;
      TestBed.overrideComponent(MyComp1, {set: {template}});
      const fixture = TestBed.createComponent(MyComp1);

      fixture.detectChanges();
      expect(fixture.nativeElement).toHaveText('ABC');
    });

    it('should handle mutual recursion entered from multiple sides - #7084', () => {
      TestBed.configureTestingModule({declarations: [FakeRecursiveComp, LeftComp, RightComp]});
      const fixture = TestBed.createComponent(FakeRecursiveComp);

      fixture.detectChanges();
      expect(fixture.nativeElement).toHaveText('[]');
    });

    it('should generate the correct output when constructors have the same name', () => {
      function ComponentFactory(selector: string, template: string) {
        @Component({selector, template})
        class MyComponent {
        }
        return MyComponent;
      }
      const HeroComponent = ComponentFactory('my-hero', 'my hero');
      const VillianComponent = ComponentFactory('a-villian', 'a villian');
      const MainComponent = ComponentFactory(
          'my-app', 'I was saved by <my-hero></my-hero> from <a-villian></a-villian>.');

      TestBed.configureTestingModule(
          {declarations: [HeroComponent, VillianComponent, MainComponent]});
      const fixture = TestBed.createComponent(MainComponent);
      expect(fixture.nativeElement).toHaveText('I was saved by my hero from a villian.');
    });
  });
}

@Component({selector: 'my-comp', template: ''})
class MyComp1 {
  constructor(public injector: Injector) {}
}

@Pipe({name: 'somePipe', pure: true})
class PlatformPipe implements PipeTransform {
  transform(value: any): any { return 'somePlatformPipe'; }
}

@Pipe({name: 'somePipe', pure: true})
class CustomPipe implements PipeTransform {
  transform(value: any): any { return 'someCustomPipe'; }
}

@Component({selector: 'cmp-content', template: `<ng-content></ng-content>`})
class CmpWithNgContent {
}

@Component({selector: 'counting-cmp', template: ''})
class MyCountingComp {
  method(): {value: string}|undefined {
    MyCountingComp.calls++;
    return {value: 'counting method value'};
  }

  static reset() { MyCountingComp.calls = 0; }
  static calls = 0;
}

@Pipe({name: 'countingPipe'})
class CountingPipe implements PipeTransform {
  transform(value: any): any {
    CountingPipe.calls++;
    return {value: 'counting pipe value'};
  }
  static reset() { CountingPipe.calls = 0; }
  static calls = 0;
}

@Component({
  selector: 'left',
  template: `L<right *ngIf="false"></right>`,
})
class LeftComp {
}

@Component({
  selector: 'right',
  template: `R<left *ngIf="false"></left>`,
})
class RightComp {
}

@Component({
  selector: 'fakeRecursiveComp',
  template: `[<left *ngIf="false"></left><right *ngIf="false"></right>]`,
})
export class FakeRecursiveComp {
}
