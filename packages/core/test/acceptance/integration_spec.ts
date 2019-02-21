/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Component, Directive, HostBinding, HostListener, QueryList, ViewChildren} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {expect} from '@angular/platform-browser/testing/src/matchers';
import {onlyInIvy} from '@angular/private/testing';

describe('acceptance integration tests', () => {
  onlyInIvy('[style] and [class] bindings are a new feature')
      .it('should render host bindings on the root component', () => {
        @Component({template: '...'})
        class MyApp {
          @HostBinding('style') public myStylesExp = {};
          @HostBinding('class') public myClassesExp = {};
        }

        TestBed.configureTestingModule({declarations: [MyApp]});
        const fixture = TestBed.createComponent(MyApp);
        const element = fixture.nativeElement;
        fixture.detectChanges();

        const component = fixture.componentInstance;
        component.myStylesExp = {width: '100px'};
        component.myClassesExp = 'foo';
        fixture.detectChanges();

        expect(element.style['width']).toEqual('100px');
        expect(element.classList.contains('foo')).toBeTruthy();

        component.myStylesExp = {width: '200px'};
        component.myClassesExp = 'bar';
        fixture.detectChanges();

        expect(element.style['width']).toEqual('200px');
        expect(element.classList.contains('foo')).toBeFalsy();
        expect(element.classList.contains('bar')).toBeTruthy();
      });

  it('should only call inherited host listeners once', () => {
    let clicks = 0;

    @Component({template: ''})
    class ButtonSuperClass {
      @HostListener('click')
      clicked() { clicks++; }
    }

    @Component({selector: 'button[custom-button]', template: ''})
    class ButtonSubClass extends ButtonSuperClass {
    }

    @Component({template: '<button custom-button></button>'})
    class MyApp {
    }

    TestBed.configureTestingModule({declarations: [MyApp, ButtonSuperClass, ButtonSubClass]});
    const fixture = TestBed.createComponent(MyApp);
    const button = fixture.debugElement.query(By.directive(ButtonSubClass));
    fixture.detectChanges();

    button.nativeElement.click();
    fixture.detectChanges();

    expect(clicks).toBe(1);
  });

  it('should support inherited view queries', () => {
    @Directive({selector: '[someDir]'})
    class SomeDir {
    }

    @Component({template: '<div someDir></div>'})
    class SuperComp {
      @ViewChildren(SomeDir) dirs !: QueryList<SomeDir>;
    }

    @Component({selector: 'button[custom-button]', template: '<div someDir></div>'})
    class SubComp extends SuperComp {
    }

    @Component({template: '<button custom-button></button>'})
    class MyApp {
    }

    TestBed.configureTestingModule({declarations: [MyApp, SuperComp, SubComp, SomeDir]});
    const fixture = TestBed.createComponent(MyApp);
    const subInstance = fixture.debugElement.query(By.directive(SubComp)).componentInstance;
    fixture.detectChanges();

    expect(subInstance.dirs.length).toBe(1);
    expect(subInstance.dirs.first).toBeAnInstanceOf(SomeDir);
  });

});
