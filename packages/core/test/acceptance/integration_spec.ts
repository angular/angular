/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Component, ContentChild, Directive, HostBinding, HostListener, Input, QueryList, TemplateRef, ViewChildren} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {expect} from '@angular/platform-browser/testing/src/matchers';
import {ivyEnabled, onlyInIvy} from '@angular/private/testing';

describe('acceptance integration tests', () => {
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

  it('should not set inputs after destroy', () => {
    @Directive({
      selector: '[no-assign-after-destroy]',
    })
    class NoAssignAfterDestroy {
      private _isDestroyed = false;

      @Input()
      get value() { return this._value; }
      set value(newValue: any) {
        if (this._isDestroyed) {
          throw Error('Cannot assign to value after destroy.');
        }

        this._value = newValue;
      }
      private _value: any;

      ngOnDestroy() { this._isDestroyed = true; }
    }

    @Component({template: '<div no-assign-after-destroy [value]="directiveValue"></div>'})
    class App {
      directiveValue = 'initial-value';
    }

    TestBed.configureTestingModule({declarations: [NoAssignAfterDestroy, App]});
    let fixture = TestBed.createComponent(App);
    fixture.destroy();

    expect(() => {
      fixture = TestBed.createComponent(App);
      fixture.detectChanges();
    }).not.toThrow();
  });

  it('should support host attribute and @ContentChild on the same component', () => {
    @Component(
        {selector: 'test-component', template: `foo`, host: {'[attr.aria-disabled]': 'true'}})
    class TestComponent {
      @ContentChild(TemplateRef) tpl !: TemplateRef<any>;
    }

    TestBed.configureTestingModule({declarations: [TestComponent]});
    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.tpl).not.toBeNull();
    expect(fixture.debugElement.nativeElement.getAttribute('aria-disabled')).toBe('true');
  });
});
