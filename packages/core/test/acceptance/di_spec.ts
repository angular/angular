/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {Attribute, ChangeDetectorRef, Component, Directive, Inject, LOCALE_ID, Optional, Pipe, PipeTransform, SkipSelf, ViewChild} from '@angular/core';
import {ViewRef} from '@angular/core/src/render3/view_ref';
import {TestBed} from '@angular/core/testing';


describe('di', () => {
  describe('ChangeDetectorRef', () => {
    it('should inject host component ChangeDetectorRef into directives on templates', () => {
      let pipeInstance: MyPipe;

      @Pipe({name: 'pipe'})
      class MyPipe implements PipeTransform {
        constructor(public cdr: ChangeDetectorRef) { pipeInstance = this; }

        transform(value: any): any { return value; }
      }

      @Component({
        selector: 'my-app',
        template: `<div *ngIf="showing | pipe">Visible</div>`,
      })
      class MyApp {
        showing = true;

        constructor(public cdr: ChangeDetectorRef) {}
      }

      TestBed.configureTestingModule({declarations: [MyApp, MyPipe], imports: [CommonModule]});
      const fixture = TestBed.createComponent(MyApp);
      fixture.detectChanges();
      expect((pipeInstance !.cdr as ViewRef<MyApp>).context).toBe(fixture.componentInstance);
    });

    it('should inject host component ChangeDetectorRef into directives on ng-container', () => {
      let dirInstance: MyDirective;

      @Directive({selector: '[getCDR]'})
      class MyDirective {
        constructor(public cdr: ChangeDetectorRef) { dirInstance = this; }
      }

      @Component({
        selector: 'my-app',
        template: `<ng-container getCDR>Visible</ng-container>`,
      })
      class MyApp {
        constructor(public cdr: ChangeDetectorRef) {}
      }

      TestBed.configureTestingModule({declarations: [MyApp, MyDirective]});
      const fixture = TestBed.createComponent(MyApp);
      fixture.detectChanges();
      expect((dirInstance !.cdr as ViewRef<MyApp>).context).toBe(fixture.componentInstance);
    });
  });

  it('should not cause cyclic dependency if same token is requested in deps with @SkipSelf', () => {
    @Component({
      selector: 'my-comp',
      template: '...',
      providers: [{
        provide: LOCALE_ID,
        useFactory: () => 'ja-JP',
        // Note: `LOCALE_ID` is also provided within APPLICATION_MODULE_PROVIDERS, so we use it here
        // as a dep and making sure it doesn't cause cyclic dependency (since @SkipSelf is present)
        deps: [[new Inject(LOCALE_ID), new Optional(), new SkipSelf()]]
      }]
    })
    class MyComp {
      constructor(@Inject(LOCALE_ID) public localeId: string) {}
    }

    TestBed.configureTestingModule({declarations: [MyComp]});
    const fixture = TestBed.createComponent(MyComp);
    fixture.detectChanges();
    expect(fixture.componentInstance.localeId).toBe('ja-JP');
  });

  it('module-level deps should not access Component/Directive providers', () => {
    @Component({
      selector: 'my-comp',
      template: '...',
      providers: [{
        provide: 'LOCALE_ID_DEP',  //
        useValue: 'LOCALE_ID_DEP_VALUE'
      }]
    })
    class MyComp {
      constructor(@Inject(LOCALE_ID) public localeId: string) {}
    }

    TestBed.configureTestingModule({
      declarations: [MyComp],
      providers: [{
        provide: LOCALE_ID,
        // we expect `localeDepValue` to be undefined, since it's not provided at a module level
        useFactory: (localeDepValue: any) => localeDepValue || 'en-GB',
        deps: [[new Inject('LOCALE_ID_DEP'), new Optional()]]
      }]
    });
    const fixture = TestBed.createComponent(MyComp);
    fixture.detectChanges();
    expect(fixture.componentInstance.localeId).toBe('en-GB');
  });

  it('should skip current level while retrieving tokens if @SkipSelf is defined', () => {
    @Component({
      selector: 'my-comp',
      template: '...',
      providers: [{provide: LOCALE_ID, useFactory: () => 'en-GB'}]
    })
    class MyComp {
      constructor(@SkipSelf() @Inject(LOCALE_ID) public localeId: string) {}
    }

    TestBed.configureTestingModule({declarations: [MyComp]});
    const fixture = TestBed.createComponent(MyComp);
    fixture.detectChanges();
    // takes `LOCALE_ID` from module injector, since we skip Component level with @SkipSelf
    expect(fixture.componentInstance.localeId).toBe('en-US');
  });

  it('should work when injecting dependency in Directives', () => {
    @Directive({
      selector: '[dir]',  //
      providers: [{provide: LOCALE_ID, useValue: 'ja-JP'}]
    })
    class MyDir {
      constructor(@SkipSelf() @Inject(LOCALE_ID) public localeId: string) {}
    }
    @Component({
      selector: 'my-comp',
      template: '<div dir></div>',
      providers: [{provide: LOCALE_ID, useValue: 'en-GB'}]
    })
    class MyComp {
      @ViewChild(MyDir) myDir !: MyDir;
      constructor(@Inject(LOCALE_ID) public localeId: string) {}
    }

    TestBed.configureTestingModule({declarations: [MyDir, MyComp, MyComp]});
    const fixture = TestBed.createComponent(MyComp);
    fixture.detectChanges();
    expect(fixture.componentInstance.myDir.localeId).toBe('en-GB');
  });

  describe('@Attribute', () => {

    it('should be able to inject different kinds of attributes', () => {
      @Directive({selector: '[dir]'})
      class MyDir {
        constructor(
            @Attribute('class') public className: string,
            @Attribute('style') public inlineStyles: string,
            @Attribute('other-attr') public otherAttr: string) {}
      }

      @Component({
        template:
            '<div dir style="margin: 1px; color: red;" class="hello there" other-attr="value"></div>'
      })
      class MyComp {
        @ViewChild(MyDir) directiveInstance !: MyDir;
      }

      TestBed.configureTestingModule({declarations: [MyDir, MyComp]});
      const fixture = TestBed.createComponent(MyComp);
      fixture.detectChanges();

      const directive = fixture.componentInstance.directiveInstance;

      expect(directive.otherAttr).toBe('value');
      expect(directive.className).toBe('hello there');
      expect(directive.inlineStyles).toBe('margin: 1px; color: red;');

    });

    it('should not inject attributes with namespace', () => {
      @Directive({selector: '[dir]'})
      class MyDir {
        constructor(
            @Attribute('exist') public exist: string,
            @Attribute('svg:exist') public namespacedExist: string,
            @Attribute('other') public other: string) {}
      }

      @Component({
        template: '<div dir exist="existValue" svg:exist="testExistValue" other="otherValue"></div>'
      })
      class MyComp {
        @ViewChild(MyDir) directiveInstance !: MyDir;
      }

      TestBed.configureTestingModule({declarations: [MyDir, MyComp]});
      const fixture = TestBed.createComponent(MyComp);
      fixture.detectChanges();

      const directive = fixture.componentInstance.directiveInstance;

      expect(directive.exist).toBe('existValue');
      expect(directive.namespacedExist).toBeNull();
      expect(directive.other).toBe('otherValue');
    });
  });
});
