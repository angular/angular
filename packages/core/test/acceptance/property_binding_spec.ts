/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Component, Input} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {By, DomSanitizer, SafeUrl} from '@angular/platform-browser';

describe('property bindings', () => {
  it('should update bindings when value changes', () => {
    @Component({
      template: `<a [title]="title"></a>`,
    })
    class Comp {
      title = 'Hello';
    }

    TestBed.configureTestingModule({declarations: [Comp]});
    const fixture = TestBed.createComponent(Comp);
    fixture.detectChanges();
    let a = fixture.debugElement.query(By.css('a')).nativeElement;
    expect(a.title).toBe('Hello');

    fixture.componentInstance.title = 'World';
    fixture.detectChanges();
    expect(a.title).toBe('World');
  });

  it('should not update bindings when value does not change', () => {
    @Component({
      template: `<a [title]="title"></a>`,
    })
    class Comp {
      title = 'Hello';
    }

    TestBed.configureTestingModule({declarations: [Comp]});
    const fixture = TestBed.createComponent(Comp);
    fixture.detectChanges();
    let a = fixture.debugElement.query(By.css('a')).nativeElement;
    expect(a.title).toBe('Hello');

    fixture.detectChanges();
    expect(a.title).toBe('Hello');
  });

  it('should bind to properties whose names do not correspond to their attribute names', () => {
    @Component({template: '<label [for]="forValue"></label>'})
    class MyComp {
      forValue?: string;
    }

    TestBed.configureTestingModule({declarations: [MyComp]});
    const fixture = TestBed.createComponent(MyComp);
    const labelNode = fixture.debugElement.query(By.css('label'));

    fixture.componentInstance.forValue = 'some-input';
    fixture.detectChanges();

    expect(labelNode.nativeElement.getAttribute('for')).toBe('some-input');

    fixture.componentInstance.forValue = 'some-textarea';
    fixture.detectChanges();

    expect(labelNode.nativeElement.getAttribute('for')).toBe('some-textarea');
  });

  it('should not map properties whose names do not correspond to their attribute names, ' +
         'if they correspond to inputs',
     () => {

       @Component({template: '', selector: 'my-comp'})
       class MyComp {
          @Input() for !:string;
       }

       @Component({template: '<my-comp [for]="forValue"></my-comp>'})
       class App {
         forValue?: string;
       }

       TestBed.configureTestingModule({declarations: [App, MyComp]});
       const fixture = TestBed.createComponent(App);
       const myCompNode = fixture.debugElement.query(By.directive(MyComp));
       fixture.componentInstance.forValue = 'hello';
       fixture.detectChanges();
       expect(myCompNode.nativeElement.getAttribute('for')).toBeFalsy();
       expect(myCompNode.componentInstance.for).toBe('hello');

       fixture.componentInstance.forValue = 'hej';
       fixture.detectChanges();
       expect(myCompNode.nativeElement.getAttribute('for')).toBeFalsy();
       expect(myCompNode.componentInstance.for).toBe('hej');
     });

  it('should use the sanitizer in bound properties', () => {
    @Component({
      template: `
        <a [href]="url">
      `
    })
    class App {
      url: string|SafeUrl = 'javascript:alert("haha, I am taking over your computer!!!");';
    }

    TestBed.configureTestingModule({declarations: [App]});
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const a = fixture.nativeElement.querySelector('a');

    expect(a.href.indexOf('unsafe:')).toBe(0);

    const domSanitzer: DomSanitizer = TestBed.get(DomSanitizer);
    fixture.componentInstance.url =
        domSanitzer.bypassSecurityTrustUrl('javascript:alert("the developer wanted this");');
    fixture.detectChanges();

    expect(a.href.indexOf('unsafe:')).toBe(-1);
  });

  it('should not stringify non-string values', () => {
    @Component({
      template: `<input [required]="isRequired"/>`,
    })
    class Comp {
      isRequired = false;
    }

    TestBed.configureTestingModule({declarations: [Comp]});
    const fixture = TestBed.createComponent(Comp);
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('input')).nativeElement.required).toBe(false);
  });
});
