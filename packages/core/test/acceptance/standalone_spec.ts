/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {Component, Directive, Input, NgModule, Pipe, PipeTransform} from '@angular/core';
import {TestBed} from '@angular/core/testing';

describe('standalone components, directives and pipes', () => {
  it('should render a standalone component', () => {
    @Component({
      standalone: true,
      template: 'Look at me, no NgModule!',
    })
    class StandaloneCmp {
    }

    const fixture = TestBed.createComponent(StandaloneCmp);
    fixture.detectChanges();
    expect(fixture.nativeElement.innerHTML).toEqual('Look at me, no NgModule!');
  });

  it('should render a recursive standalone component', () => {
    @Component({
      selector: 'tree',
      standalone: true,
      template:
          `({{level}})<ng-template [ngIf]="level > 0"><tree [level]="level - 1"></tree></ng-template>`,
      imports: [CommonModule]
    })
    class TreeCmp {
      @Input() level = 0;
    }

    @Component({standalone: true, template: '<tree [level]="3"></tree>', imports: [TreeCmp]})
    class StandaloneCmp {
    }

    const fixture = TestBed.createComponent(StandaloneCmp);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe('(3)(2)(1)(0)');
  });

  it('should render a standalone component with a standalone dependency', () => {
    @Component({
      standalone: true,
      selector: 'inner-cmp',
      template: 'Look at me, no NgModule!',
    })
    class InnerCmp {
    }

    @Component({
      standalone: true,
      template: '<inner-cmp></inner-cmp>',
      imports: [InnerCmp],
    })
    class StandaloneCmp {
    }

    const fixture = TestBed.createComponent(StandaloneCmp);
    fixture.detectChanges();
    expect(fixture.nativeElement.innerHTML)
        .toEqual('<inner-cmp>Look at me, no NgModule!</inner-cmp>');
  });


  it('should render a standalone component with an NgModule-based dependency', () => {
    @Component({
      selector: 'inner-cmp',
      template: 'Look at me, no NgModule (kinda)!',
    })
    class InnerCmp {
    }

    @NgModule({
      declarations: [InnerCmp],
      exports: [InnerCmp],
    })
    class Module {
    }

    @Component({
      standalone: true,
      template: '<inner-cmp></inner-cmp>',
      imports: [Module],
    })
    class StandaloneCmp {
    }

    const fixture = TestBed.createComponent(StandaloneCmp);
    fixture.detectChanges();
    expect(fixture.nativeElement.innerHTML)
        .toEqual('<inner-cmp>Look at me, no NgModule (kinda)!</inner-cmp>');
  });

  it('should allow exporting standalone components, directives and pipes from NgModule', () => {
    @Component({
      selector: 'standalone-cmp',
      standalone: true,
      template: `standalone`,
    })
    class StandaloneCmp {
    }

    @Directive({
      selector: '[standalone-dir]',
      host: {
        '[attr.id]': '"standalone"',
      },
      standalone: true
    })
    class StandaloneDir {
    }

    @Pipe({name: 'standalonePipe', standalone: true})
    class StandalonePipe implements PipeTransform {
      transform(value: any) {
        return `|${value}`;
      }
    }

    @NgModule({
      imports: [StandaloneCmp, StandaloneDir, StandalonePipe],
      exports: [StandaloneCmp, StandaloneDir, StandalonePipe],
    })
    class LibModule {
    }

    @Component({
      selector: 'app-cmpt',
      template: `<standalone-cmp standalone-dir></standalone-cmp>{{'standalone' | standalonePipe}}`,
    })
    class AppComponent {
    }

    TestBed.configureTestingModule({
      imports: [LibModule],
      declarations: [AppComponent],
    });

    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toBe('standalone|standalone');
    expect(fixture.nativeElement.querySelector('standalone-cmp').getAttribute('id'))
        .toBe('standalone');
  });


  it('should render a standalone component with dependenices and ambient providers', () => {
    @Component({
      standalone: true,
      template: 'Inner',
      selector: 'inner-cmp',
    })
    class InnerCmp {
    }

    class Service {
      value = 'Service';
    }

    @NgModule({providers: [Service]})
    class ModuleWithAProvider {
    }

    @Component({
      standalone: true,
      template: 'Outer<inner-cmp></inner-cmp>{{service.value}}',
      imports: [InnerCmp, ModuleWithAProvider],
    })
    class OuterCmp {
      constructor(readonly service: Service) {}
    }

    const fixture = TestBed.createComponent(OuterCmp);
    fixture.detectChanges();
    expect(fixture.nativeElement.innerHTML).toEqual('Outer<inner-cmp>Inner</inner-cmp>Service');
  });

  it('should discover ambient providers from a standalone component', () => {
    class Service {
      value = 'Service';
    }

    @NgModule({providers: [Service]})
    class ModuleWithAProvider {
    }

    @Component({
      standalone: true,
      template: 'Inner({{service.value}})',
      selector: 'inner-cmp',
      imports: [ModuleWithAProvider],
    })
    class InnerCmp {
      constructor(readonly service: Service) {}
    }

    @Component({
      standalone: true,
      template: 'Outer<inner-cmp></inner-cmp>{{service.value}}',
      imports: [InnerCmp],
    })
    class OuterCmp {
      constructor(readonly service: Service) {}
    }

    const fixture = TestBed.createComponent(OuterCmp);
    fixture.detectChanges();
    expect(fixture.nativeElement.innerHTML)
        .toEqual('Outer<inner-cmp>Inner(Service)</inner-cmp>Service');
  });
});
