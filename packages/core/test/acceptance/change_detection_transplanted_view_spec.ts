/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, Directive, DoCheck, Input, signal, TemplateRef, Type, ViewChild, ViewContainerRef} from '@angular/core';
import {AfterViewChecked} from '@angular/core/src/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {expect} from '@angular/platform-browser/testing/src/matchers';

describe('change detection for transplanted views', () => {
  describe('when declaration appears before insertion', () => {
    @Component({
      selector: 'onpush-insert-comp',
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        OnPushInsertComp({{greeting}})
        <div *ngIf="true">
          <!-- Add extra level of embedded view to ensure we can handle nesting -->
          <ng-container
              [ngTemplateOutlet]="template"
              [ngTemplateOutletContext]="{$implicit: greeting}">
          </ng-container>
        </div>
      `,
    })
    abstract class OnPushInsertComp implements DoCheck, AfterViewChecked {
      get template(): TemplateRef<any> {
        return templateRef;
      }
      greeting: string = 'Hello';
      constructor(public changeDetectorRef: ChangeDetectorRef) {
        onPushInsertComp = this;
      }
      ngDoCheck(): void {
        logValue = 'Insert';
      }
      ngAfterViewChecked(): void {
        logValue = null;
      }
    }

    @Component({
      selector: 'signal-insert-comp',
      signals: true,
      template: `SignalInsertComp({{greeting()}})
      {{markTemplateAsExecuted()}}
      <div *ngIf="true">
        <!-- Add extra level of embedded view to ensure we can handle nesting -->
        <ng-container
            [ngTemplateOutlet]="template"
            [ngTemplateOutletContext]="{$implicit: templateGreeting()}">
        </ng-container>
      </div>`,
    } as any)
    class SignalInsertComp {
      templateExecuted = false;

      constructor(readonly changeDetectorRef: ChangeDetectorRef) {
        signalInsert = this;
      }
      get template(): TemplateRef<any> {
        return templateRef;
      }
      greeting = signal('Hello');
      templateGreeting = signal('templateGreeting');

      ngDoCheck(): void {
        logValue = 'Insert';
      }
      ngAfterViewChecked(): void {
        logValue = null;
      }
      markTemplateAsExecuted() {
        this.templateExecuted = true;
        return '';
      }
    }

    @Directive({})
    abstract class DeclareComp implements DoCheck, AfterViewChecked {
      @ViewChild('myTmpl') myTmpl!: TemplateRef<any>;
      name: string = 'world';
      constructor(readonly changeDetector: ChangeDetectorRef) {}
      ngDoCheck(): void {
        logValue = 'Declare';
      }
      logName() {
        // This will log when the embedded view gets CD. The `logValue` will show if the CD was
        // from `Insert` or from `Declare` component.
        viewExecutionLog.push(logValue!);
        return this.name;
      }
      ngAfterViewChecked(): void {
        logValue = null;
      }
      ngAfterViewInit() {
        templateRef = this.myTmpl;
      }
    }

    @Component({
      selector: `check-always-declare-comp`,
      template: `
        DeclareComp({{name}})
        <ng-template #myTmpl let-greeting>
          {{greeting}} {{logName()}}!
        </ng-template>
      `
    })
    class CheckAlwaysDeclareComp extends DeclareComp {
      constructor(changeDetector: ChangeDetectorRef) {
        super(changeDetector);
        declareComp = this;
      }
    }

    @Component({
      selector: `onpush-declare-comp`,
      template: `
        OnPushDeclareComp({{name}})
        <ng-template #myTmpl let-greeting>
          {{greeting}} {{logName()}}!
        </ng-template>`,
      changeDetection: ChangeDetectionStrategy.OnPush
    })
    class OnPushDeclareComp extends DeclareComp {
      constructor(changeDetector: ChangeDetectorRef) {
        super(changeDetector);
        onPushDeclareComp = this;
      }
    }

    @Component({
      selector: `signal-declare-comp`,
      template: `
        SignalDeclareComp({{name()}})
        <ng-template #myTmpl let-greeting>
          {{greeting}} {{surname()}}{{logExecutionContext()}}!
        </ng-template>
      `,
      changeDetection: ChangeDetectionStrategy.OnPush
    })
    class SignalDeclareComp {
      @ViewChild('myTmpl') myTmpl!: TemplateRef<any>;

      name = signal('world');
      templateName = signal('templateName');

      surname = computed(() => {
        const name = this.templateName();
        return name;
      });

      logExecutionContext() {
        viewExecutionLog.push(logValue);
        return '';
      }

      constructor() {
        signalDeclareComp = this;
      }

      ngAfterViewChecked() {
        logValue = null;
      }
      ngAfterViewInit() {
        templateRef = this.myTmpl;
      }
    }

    @Component({
      template: `
      <check-always-declare-comp *ngIf="showCheckAlwaysDeclare" />
      <onpush-declare-comp *ngIf="showOnPushDeclare" />
      <signal-declare-comp *ngIf="showSignalDeclare" />

      <onpush-insert-comp *ngIf="showOnPushInsert" />
      <signal-insert-comp *ngIf="showSignalInsert" />
      `
    })
    class AppComp {
      showCheckAlwaysDeclare = false;
      showSignalDeclare = false;
      showOnPushDeclare = false;
      showOnPushInsert = false;
      showSignalInsert = false;
      constructor() {
        appComp = this;
      }
    }

    let viewExecutionLog!: Array<string|null>;
    let logValue!: string|null;
    let fixture!: ComponentFixture<AppComp>;
    let appComp!: AppComp;
    let onPushInsertComp!: OnPushInsertComp;
    let signalInsert!: SignalInsertComp;
    let declareComp!: CheckAlwaysDeclareComp;
    let templateRef: TemplateRef<any>;
    let onPushDeclareComp!: OnPushDeclareComp;
    let signalDeclareComp!: SignalDeclareComp;

    beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [
          OnPushInsertComp, SignalDeclareComp, CheckAlwaysDeclareComp, OnPushDeclareComp,
          SignalInsertComp, AppComp
        ],
        imports: [CommonModule],
      });
      viewExecutionLog = [];
      fixture = TestBed.createComponent(AppComp);
    });

    xdescribe('and declaration component is Signal and insertion is OnPush', () => {
      beforeEach(() => {
        fixture.componentInstance.showSignalDeclare = true;
        fixture.componentInstance.showOnPushInsert = true;
        fixture.detectChanges(false);
        viewExecutionLog.length = 0;
      });

      it('should set up the component under test correctly', () => {
        expect(viewExecutionLog.length).toEqual(0);
        expect(trim(fixture.nativeElement.textContent))
            .toEqual('SignalDeclareComp(world) OnPushInsertComp(Hello) Hello templateName!');
      });

      it('should CD at insertion point only', () => {
        signalDeclareComp.name.set('Angular');
        fixture.detectChanges(false);
        expect(viewExecutionLog).toEqual([
          'Insert'
        ]);  // TODO: this is wrong. The transplanted view never changed and insertion
             // point is not dirty either but it still got executed
        viewExecutionLog.length = 0;
        expect(trim(fixture.nativeElement.textContent))
            .withContext(
                'CD did not run on the transplanted template because it is inside an OnPush component and no signal changed')
            .toEqual('SignalDeclareComp(Angular) OnPushInsertComp(Hello) Hello templateName!');

        onPushInsertComp.greeting = 'Hi';
        fixture.detectChanges(false);
        expect(viewExecutionLog).toEqual([]);
        viewExecutionLog.length = 0;
        expect(trim(fixture.nativeElement.textContent))
            .withContext('Insertion component is OnPush.')
            .toEqual('SignalDeclareComp(Angular) OnPushInsertComp(Hello) Hello templateName!');

        onPushInsertComp.changeDetectorRef.markForCheck();
        fixture.detectChanges(false);
        expect(viewExecutionLog).toEqual(['Insert']);
        viewExecutionLog.length = 0;
        expect(trim(fixture.nativeElement.textContent))
            .toEqual('SignalDeclareComp(Angular) OnPushInsertComp(Hi) Hi templateName!');

        // Destroy insertion should also destroy declaration
        appComp.showOnPushInsert = false;
        fixture.detectChanges(false);
        expect(viewExecutionLog).toEqual([]);
        viewExecutionLog.length = 0;
        expect(trim(fixture.nativeElement.textContent)).toEqual('SignalDeclareComp(Angular)');

        // Restore both
        appComp.showOnPushInsert = true;
        fixture.detectChanges(false);
        expect(viewExecutionLog).toEqual(['Insert']);
        viewExecutionLog.length = 0;
        expect(trim(fixture.nativeElement.textContent))
            .toEqual('SignalDeclareComp(Angular) OnPushInsertComp(Hello) Hello templateName!');

        // Destroy declaration, But we should still be able to see updates in insertion
        appComp.showSignalDeclare = false;
        onPushInsertComp.greeting = 'Hola';
        onPushInsertComp.changeDetectorRef.markForCheck();
        fixture.detectChanges(false);
        expect(viewExecutionLog).toEqual(['Insert']);
        viewExecutionLog.length = 0;
        expect(trim(fixture.nativeElement.textContent))
            .toEqual('OnPushInsertComp(Hola) Hola templateName!');

        // Setting a signal should CD the inserted component
        signalDeclareComp.templateName.set('real boy');
        fixture.detectChanges(false);
        expect(viewExecutionLog).toEqual(['Insert']);
        viewExecutionLog.length = 0;
        expect(trim(fixture.nativeElement.textContent))
            .toEqual('OnPushInsertComp(Hola) Hola real boy!');
      });
    });

    xdescribe('declaration is OnPush and insert is Signal', () => {
      beforeEach(() => {
        fixture.componentInstance.showOnPushDeclare = true;
        fixture.componentInstance.showSignalInsert = true;
        fixture.detectChanges(false);
        viewExecutionLog.length = 0;
      });

      it('should set up the component under test correctly', () => {
        expect(viewExecutionLog.length).toEqual(0);
        expect(trim(fixture.nativeElement.textContent))
            .toEqual('OnPushDeclareComp(world) SignalInsertComp(Hello) templateGreeting world!');
      });

      it('should CD at insertion point only', () => {
        onPushDeclareComp.name = 'Angular';
        fixture.detectChanges(false);
        expect(viewExecutionLog)
            .withContext('Should not update because OnPush was not marked for check')
            .toEqual([]);
        expect(trim(fixture.nativeElement.textContent))
            .toEqual('OnPushDeclareComp(world) SignalInsertComp(Hello) templateGreeting world!');

        onPushDeclareComp.changeDetector.markForCheck();
        fixture.detectChanges(false);
        expect(viewExecutionLog).toEqual([null]);
        viewExecutionLog.length = 0;
        expect(trim(fixture.nativeElement.textContent))
            .toEqual(
                'OnPushDeclareComp(Angular) SignalInsertComp(Hello) templateGreeting Angular!');

        signalInsert.greeting.set('Hi');
        fixture.detectChanges(false);
        expect(viewExecutionLog)
            .withContext('Signals in the embedded view did not change and it is not dirty')
            .toEqual([]);
        viewExecutionLog.length = 0;
        expect(trim(fixture.nativeElement.textContent))
            .toEqual('OnPushDeclareComp(Angular) SignalInsertComp(Hi) templateGreeting Angular!');

        // Destroy insertion should also destroy declaration
        appComp.showSignalInsert = false;
        fixture.detectChanges(false);
        expect(viewExecutionLog).toEqual([]);
        viewExecutionLog.length = 0;
        expect(trim(fixture.nativeElement.textContent)).toEqual('OnPushDeclareComp(Angular)');

        // Restore both
        appComp.showSignalInsert = true;
        fixture.detectChanges(false);
        expect(viewExecutionLog).toEqual(['Insert']);
        viewExecutionLog.length = 0;
        expect(trim(fixture.nativeElement.textContent))
            .toEqual(
                'OnPushDeclareComp(Angular) SignalInsertComp(Hello) templateGreeting Angular!');

        // Destroy declaration, But we should still be able to see updates in insertion
        appComp.showOnPushDeclare = false;
        signalInsert.greeting.set('Hola');
        fixture.detectChanges(false);
        expect(viewExecutionLog)
            .withContext('Signals in the embedded view did not change and declaration not dirty')
            .toEqual([]);
        viewExecutionLog.length = 0;
        expect(trim(fixture.nativeElement.textContent))
            .toEqual('SignalInsertComp(Hola) templateGreeting Angular!');

        signalInsert.templateExecuted = false;
        signalInsert.templateGreeting.set('new template greeting');
        fixture.detectChanges(false);
        expect(viewExecutionLog).toEqual(['Insert']);
        viewExecutionLog.length = 0;
        expect(trim(fixture.nativeElement.textContent))
            .toEqual('SignalInsertComp(Hola) new template greeting Angular!');
        // The embedded view is executed but the component view is not because we do not read the
        // signal for the templateContext until we are already running change detection on the
        // embedded view. This means that the "consumer" of the signal is already set to the
        // embedded view.
        expect(signalInsert.templateExecuted)
            .withContext(
                'Only the signal in the template context was updated. Should not execute component template')
            .toEqual(false);
      });
    });

    describe('and declaration component is CheckAlways', () => {
      beforeEach(() => {
        fixture.componentInstance.showCheckAlwaysDeclare = true;
        fixture.componentInstance.showOnPushInsert = true;
        fixture.detectChanges(false);
        viewExecutionLog.length = 0;
      });

      it('should set up the component under test correctly', () => {
        expect(viewExecutionLog.length).toEqual(0);
        expect(trim(fixture.nativeElement.textContent))
            .toEqual('DeclareComp(world) OnPushInsertComp(Hello) Hello world!');
      });

      it('should CD at insertion point only', () => {
        declareComp.name = 'Angular';
        fixture.detectChanges(false);
        expect(viewExecutionLog).toEqual(['Insert']);
        viewExecutionLog.length = 0;
        expect(trim(fixture.nativeElement.textContent))
            .toEqual(
                'DeclareComp(Angular) OnPushInsertComp(Hello) Hello Angular!',
                'Expect transplanted LView to be CD because the declaration is CD.');

        onPushInsertComp.greeting = 'Hi';
        fixture.detectChanges(false);
        expect(viewExecutionLog).toEqual(['Insert']);
        viewExecutionLog.length = 0;
        expect(trim(fixture.nativeElement.textContent))
            .toEqual(
                'DeclareComp(Angular) OnPushInsertComp(Hello) Hello Angular!',
                'expect no change because it is on push.');

        onPushInsertComp.changeDetectorRef.markForCheck();
        fixture.detectChanges(false);
        expect(viewExecutionLog).toEqual(['Insert']);
        viewExecutionLog.length = 0;
        expect(trim(fixture.nativeElement.textContent))
            .toEqual('DeclareComp(Angular) OnPushInsertComp(Hi) Hi Angular!');

        // Destroy insertion should also destroy declaration
        appComp.showOnPushInsert = false;
        fixture.detectChanges(false);
        expect(viewExecutionLog).toEqual([]);
        viewExecutionLog.length = 0;
        expect(trim(fixture.nativeElement.textContent)).toEqual('DeclareComp(Angular)');

        // Restore both
        appComp.showOnPushInsert = true;
        fixture.detectChanges(false);
        expect(viewExecutionLog).toEqual(['Insert']);
        viewExecutionLog.length = 0;
        expect(trim(fixture.nativeElement.textContent))
            .toEqual('DeclareComp(Angular) OnPushInsertComp(Hello) Hello Angular!');

        // Destroy declaration, But we should still be able to see updates in insertion
        appComp.showCheckAlwaysDeclare = false;
        onPushInsertComp.greeting = 'Hello';
        onPushInsertComp.changeDetectorRef.markForCheck();
        fixture.detectChanges(false);
        expect(viewExecutionLog).toEqual(['Insert']);
        viewExecutionLog.length = 0;
        expect(trim(fixture.nativeElement.textContent))
            .toEqual('OnPushInsertComp(Hello) Hello Angular!');
      });

      it('is not checked if detectChanges is called in declaration component', () => {
        declareComp.name = 'Angular';
        declareComp.changeDetector.detectChanges();
        expect(viewExecutionLog).toEqual([]);
        viewExecutionLog.length = 0;
        expect(trim(fixture.nativeElement.textContent))
            .toEqual('DeclareComp(Angular) OnPushInsertComp(Hello) Hello world!');
      });

      it('is checked as part of CheckNoChanges pass', () => {
        fixture.detectChanges(true);
        expect(viewExecutionLog)
            .toEqual(['Insert', null /* logName set to null afterViewChecked */]);
        viewExecutionLog.length = 0;
        expect(trim(fixture.nativeElement.textContent))
            .toEqual('DeclareComp(world) OnPushInsertComp(Hello) Hello world!');
      });
    });

    describe('and declaration and insertion components are OnPush', () => {
      beforeEach(() => {
        fixture.componentInstance.showOnPushDeclare = true;
        fixture.componentInstance.showOnPushInsert = true;
        fixture.detectChanges(false);
        viewExecutionLog.length = 0;
      });

      it('should set up component under test correctly', () => {
        expect(viewExecutionLog.length).toEqual(0);
        expect(trim(fixture.nativeElement.textContent))
            .toEqual('OnPushDeclareComp(world) OnPushInsertComp(Hello) Hello world!');
      });

      it('should not check anything when no views are dirty', () => {
        fixture.detectChanges(false);
        expect(viewExecutionLog).toEqual([]);
      });

      it('should CD at insertion point only', () => {
        onPushDeclareComp.name = 'Angular';
        onPushInsertComp.greeting = 'Hi';
        // mark declaration point dirty
        onPushDeclareComp.changeDetector.markForCheck();
        fixture.detectChanges(false);
        expect(viewExecutionLog).toEqual(['Insert']);
        viewExecutionLog.length = 0;
        expect(trim(fixture.nativeElement.textContent))
            .toEqual('OnPushDeclareComp(Angular) OnPushInsertComp(Hello) Hello Angular!');

        // mark insertion point dirty
        onPushInsertComp.changeDetectorRef.markForCheck();
        fixture.detectChanges(false);
        expect(viewExecutionLog).toEqual(['Insert']);
        viewExecutionLog.length = 0;
        expect(trim(fixture.nativeElement.textContent))
            .toEqual('OnPushDeclareComp(Angular) OnPushInsertComp(Hi) Hi Angular!');

        // mark both insertion and declaration point dirty
        onPushInsertComp.changeDetectorRef.markForCheck();
        onPushDeclareComp.changeDetector.markForCheck();
        fixture.detectChanges(false);
        expect(viewExecutionLog).toEqual(['Insert']);
        viewExecutionLog.length = 0;
      });

      it('is checked if detectChanges is called in declaration component', () => {
        onPushDeclareComp.name = 'Angular';
        onPushDeclareComp.changeDetector.detectChanges();
        expect(trim(fixture.nativeElement.textContent))
            .toEqual('OnPushDeclareComp(Angular) OnPushInsertComp(Hello) Hello world!');
      });

      // TODO(FW-1774): blocked by https://github.com/angular/angular/pull/34443
      xit('is checked as part of CheckNoChanges pass', () => {
        // mark declaration point dirty
        onPushDeclareComp.changeDetector.markForCheck();
        fixture.detectChanges(false);
        expect(viewExecutionLog)
            .toEqual(['Insert', null /* logName set to null in afterViewChecked */]);
        viewExecutionLog.length = 0;

        // mark insertion point dirty
        onPushInsertComp.changeDetectorRef.markForCheck();
        fixture.detectChanges(false);
        expect(viewExecutionLog).toEqual(['Insert', null]);
        viewExecutionLog.length = 0;

        // mark both insertion and declaration point dirty
        onPushInsertComp.changeDetectorRef.markForCheck();
        onPushDeclareComp.changeDetector.markForCheck();
        fixture.detectChanges(false);
        expect(viewExecutionLog).toEqual(['Insert', null]);
        viewExecutionLog.length = 0;
      });
    });
  });

  // Note that backwards references are not handled well in VE or Ivy at the moment.
  // These tests assert the current behavior. Some of these would need to be updated
  // if future work refreshes backwards referenced transplanted views.
  describe('backwards references', () => {
    @Component({
      selector: 'insertion',
      template: `
            <div>Insertion({{name}})</div>
            <ng-container [ngTemplateOutlet]="template" [ngTemplateOutletContext]="{$implicit: name}">
            </ng-container>`,
      changeDetection: ChangeDetectionStrategy.OnPush
    })
    class Insertion {
      @Input() template!: TemplateRef<{}>;
      name = 'initial';
      constructor(readonly changeDetectorRef: ChangeDetectorRef) {}
    }

    @Component({
      selector: 'declaration',
      template: `
          <div>Declaration({{name}})</div>
          <ng-template #template let-contextName>
            <div>{{incrementChecks()}}</div>
            <div>TemplateDeclaration({{name}})</div>
            <div>TemplateContext({{contextName}})</div>
          </ng-template>
        `,
      changeDetection: ChangeDetectionStrategy.OnPush
    })
    class Declaration {
      @ViewChild('template') template?: TemplateRef<{}>;
      name = 'initial';
      transplantedViewRefreshCount = 0;
      constructor(readonly changeDetectorRef: ChangeDetectorRef) {}
      incrementChecks() {
        this.transplantedViewRefreshCount++;
      }
    }
    let fixture: ComponentFixture<App>;
    let appComponent: App;

    @Component({
      template: `
        <insertion *ngIf="showInsertion" [template]="declaration?.template">
        </insertion>
        <declaration></declaration>
        `
    })
    class App {
      @ViewChild(Declaration) declaration!: Declaration;
      @ViewChild(Insertion) insertion!: Insertion;
      template?: TemplateRef<{}>;
      showInsertion = false;
    }

    beforeEach(() => {
      fixture = TestBed.configureTestingModule({declarations: [App, Declaration, Insertion]})
                    .createComponent(App);
      appComponent = fixture.componentInstance;
      fixture.detectChanges(false);
      appComponent.showInsertion = true;
      fixture.detectChanges(false);
      appComponent.declaration.transplantedViewRefreshCount = 0;
    });

    it('should set up component under test correctly', () => {
      expect(fixture.nativeElement.textContent)
          .toEqual(
              'Insertion(initial)TemplateDeclaration(initial)TemplateContext(initial)Declaration(initial)');
      expect(appComponent.declaration.transplantedViewRefreshCount).toEqual(0);
    });


    it('should not update declaration view when there is a change in the declaration and insertion is marked dirty',
       () => {
         appComponent.declaration.name = 'new name';
         appComponent.insertion.changeDetectorRef.markForCheck();
         fixture.detectChanges(false);
         expect(fixture.nativeElement.textContent)
             .toEqual(
                 'Insertion(initial)TemplateDeclaration(new name)TemplateContext(initial)Declaration(initial)',
                 'Name should not update in declaration view because only insertion was marked dirty');
         expect(appComponent.declaration.transplantedViewRefreshCount).toEqual(1);
       });

    it('updates only the declaration view when there is a change to declaration and declaration is marked dirty',
       () => {
         appComponent.declaration.name = 'new name';
         appComponent.declaration.changeDetectorRef.markForCheck();
         fixture.detectChanges(false);

         const expectedContent =
             'Insertion(initial)TemplateDeclaration(initial)TemplateContext(initial)Declaration(new name)';
         expect(fixture.nativeElement.textContent).toEqual(expectedContent);
         expect(appComponent.declaration.transplantedViewRefreshCount).toEqual(0);

         // Note here that this second change detection should not be necessary, but is because of
         // the backwards reference not being fully supported. The assertions below should be true
         // after the first CD.
         fixture.detectChanges(false);
         expect(fixture.nativeElement.textContent)
             .toEqual(
                 'Insertion(initial)TemplateDeclaration(new name)TemplateContext(initial)Declaration(new name)');
         expect(appComponent.declaration.transplantedViewRefreshCount).toEqual(1);
       });

    it('should not update anything when there is a change to insertion and declaration is marked dirty',
       () => {
         appComponent.insertion.name = 'new name';
         appComponent.declaration.changeDetectorRef.markForCheck();
         fixture.detectChanges(false);
         // Name should not update in insertion view because only declaration was marked dirty
         // Context name also does not update in the template because the insertion view needs to be
         // checked to update the `ngTemplateOutletContext` input.
         expect(fixture.nativeElement.textContent)
             .toEqual(
                 'Insertion(initial)TemplateDeclaration(initial)TemplateContext(initial)Declaration(initial)',
                 'Name should not update in insertion view because only declaration was marked dirty\n' +
                     'Context name also does not update in the template because the insertion view needs to be' +
                     'checked to update the `ngTemplateOutletContext` input.');
         // Note here that if backwards references were better supported, we would be able to
         // refresh the transplanted view in the first `detectChanges` call but because the
         // insertion point was already checked, we need to call detectChanges again to refresh it.
         expect(appComponent.declaration.transplantedViewRefreshCount).toEqual(0);

         fixture.detectChanges(false);
         expect(fixture.nativeElement.textContent)
             .toEqual(
                 'Insertion(initial)TemplateDeclaration(initial)TemplateContext(initial)Declaration(initial)',
                 'Expected bindings to still be initial values. Again, TemplateContext can only update if ' +
                     'insertion point is dirty and updates the ngTemplateOutletContext input.');
         expect(appComponent.declaration.transplantedViewRefreshCount).toEqual(1);
       });

    it('should update insertion view and template when there is a change to insertion and insertion marked dirty',
       () => {
         appComponent.insertion.name = 'new name';
         appComponent.insertion.changeDetectorRef.markForCheck();
         fixture.detectChanges(false);
         expect(fixture.nativeElement.textContent)
             .toEqual(
                 'Insertion(new name)TemplateDeclaration(initial)TemplateContext(new name)Declaration(initial)');
         expect(appComponent.declaration.transplantedViewRefreshCount).toEqual(1);
       });

    it('should not refresh the template if nothing is marked dirty', () => {
      fixture.detectChanges(false);
      expect(appComponent.declaration.transplantedViewRefreshCount).toEqual(0);
    });

    it('should only refresh template once when declaration and insertion are marked dirty', () => {
      appComponent.declaration.changeDetectorRef.markForCheck();
      appComponent.insertion.changeDetectorRef.markForCheck();
      fixture.detectChanges(false);
      expect(appComponent.declaration.transplantedViewRefreshCount)
          .toEqual(
              1,
              'Expected transplanted view to only be refreshed when insertion component is refreshed');
    });
  });

  describe('transplanted views shielded by OnPush', () => {
    @Component({
      selector: 'check-always-insertion',
      template: `<ng-container [ngTemplateOutlet]="template"></ng-container>`
    })
    class CheckAlwaysInsertion {
      @Input() template!: TemplateRef<{}>;
    }

    @Component({
      selector: 'on-push-insertion-host',
      template: `<check-always-insertion [template]="template"></check-always-insertion>`,
      changeDetection: ChangeDetectionStrategy.OnPush
    })
    class OnPushInsertionHost {
      @Input() template!: TemplateRef<{}>;
      constructor(readonly cdr: ChangeDetectorRef) {}
    }
    @Component({
      template: `
      <ng-template #template>{{value}}</ng-template>
      <on-push-insertion-host [template]="template"></on-push-insertion-host>
      `,
      changeDetection: ChangeDetectionStrategy.OnPush
    })
    class OnPushDeclaration {
      @ViewChild(OnPushInsertionHost) onPushInsertionHost?: OnPushInsertionHost;
      value = 'initial';

      constructor(readonly cdr: ChangeDetectorRef) {}
    }
    @Component({
      template: `
      <ng-template #template>{{value}}</ng-template>
      <on-push-insertion-host [template]="template"></on-push-insertion-host>
      `
    })
    class CheckAlwaysDeclaration {
      @ViewChild(OnPushInsertionHost) onPushInsertionHost?: OnPushInsertionHost;
      value = 'initial';
    }

    function getFixture<T>(componentUnderTest: Type<T>): ComponentFixture<T> {
      return TestBed
          .configureTestingModule({
            declarations: [
              CheckAlwaysDeclaration, OnPushDeclaration, CheckAlwaysInsertion, OnPushInsertionHost
            ]
          })
          .createComponent(componentUnderTest);
    }

    it('refresh when transplanted view is declared in CheckAlways component', () => {
      const fixture = getFixture(CheckAlwaysDeclaration);
      fixture.detectChanges();
      fixture.componentInstance.value = 'new';
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toEqual('new');
    });

    it('refresh when transplanted view is declared in OnPush component', () => {
      const fixture = getFixture(OnPushDeclaration);
      fixture.detectChanges();
      fixture.componentInstance.value = 'new';
      fixture.componentInstance.cdr.markForCheck();
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toEqual('new');
    });

    describe('when insertion is detached', () => {
      it('does not refresh CheckAlways transplants', () => {
        const fixture = getFixture(CheckAlwaysDeclaration);
        fixture.detectChanges();
        fixture.componentInstance.onPushInsertionHost!.cdr.detach();
        fixture.componentInstance.value = 'new';
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toEqual('initial');
      });

      it('does not refresh OnPush transplants', () => {
        const fixture = getFixture(OnPushDeclaration);
        fixture.detectChanges();
        fixture.componentInstance.onPushInsertionHost!.cdr.detach();
        fixture.componentInstance.value = 'new';
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toEqual('initial');
      });
    });
  });

  it('refreshes transplanted views used as template in ngForTemplate', () => {
    @Component({
      selector: 'triple',
      template: '<div *ngFor="let unused of [1,2,3]; template: template"></div>',
      changeDetection: ChangeDetectionStrategy.OnPush
    })
    class TripleTemplate {
      @Input() template!: TemplateRef<{}>;
    }

    @Component({
      template: `
        <ng-template #template>{{name}}</ng-template>
        <triple [template]="template"></triple>
      `
    })
    class App {
      name = 'Penny';
    }

    const fixture =
        TestBed.configureTestingModule({declarations: [App, TripleTemplate]}).createComponent(App);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toEqual('PennyPennyPenny');
    fixture.componentInstance.name = 'Sheldon';
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent)
        .toEqual(
            'SheldonSheldonSheldon',
            'Expected transplanted view to be refreshed even when insertion is not dirty');
  });

  it('should not fail when change detecting detached transplanted view', () => {
    @Component({template: '<ng-template>{{incrementChecks()}}</ng-template>'})
    class AppComponent {
      @ViewChild(TemplateRef) templateRef!: TemplateRef<{}>;

      constructor(readonly rootVref: ViewContainerRef, readonly cdr: ChangeDetectorRef) {}

      checks = 0;
      incrementChecks() {
        this.checks++;
      }
    }

    const fixture = TestBed.configureTestingModule({declarations: [AppComponent]})
                        .createComponent(AppComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    const viewRef = component.templateRef.createEmbeddedView({});
    // This `ViewContainerRef` is for the root view
    component.rootVref.insert(viewRef);
    // `detectChanges` on this `ChangeDetectorRef` will refresh this view and children, not the root
    // view that has the transplanted `viewRef` inserted.
    component.cdr.detectChanges();
    // The template should not have been refreshed because it was inserted "above" the component so
    // `detectChanges` will not refresh it.
    expect(component.checks).toEqual(0);

    // Detach view, manually call `detectChanges`, and verify the template was refreshed
    component.rootVref.detach();
    viewRef.detectChanges();
    expect(component.checks).toEqual(1);
  });

  describe('when detached', () => {
    @Component({
      selector: 'on-push-component',
      template: `
          <ng-container #vc></ng-container>
        `,
      changeDetection: ChangeDetectionStrategy.OnPush
    })
    class OnPushComponent {
      @ViewChild('vc', {read: ViewContainerRef}) viewContainer!: ViewContainerRef;
      @Input() template!: TemplateRef<{}>;

      createTemplate() {
        return this.viewContainer.createEmbeddedView(this.template);
      }
    }

    @Component({
      selector: 'check-always-component',
      template: `
          <ng-container #vc></ng-container>
        `,
    })
    class CheckAlwaysComponent {
      @ViewChild('vc', {read: ViewContainerRef}) viewContainer!: ViewContainerRef;
      @Input() template!: TemplateRef<{}>;

      createTemplate() {
        return this.viewContainer.createEmbeddedView(this.template);
      }
    }
    let fixture: ComponentFixture<App>;
    let appComponent: App;
    let onPushComponent: OnPushComponent;
    let checkAlwaysComponent: CheckAlwaysComponent;

    @Component({
      template: `
      <ng-template #transplantedTemplate>{{ incrementChecks() }}</ng-template>
      <on-push-component [template]="transplantedTemplate"></on-push-component>
      <check-always-component [template]="transplantedTemplate"></check-always-component>
        `
    })
    class App {
      @ViewChild(OnPushComponent) onPushComponent!: OnPushComponent;
      @ViewChild(CheckAlwaysComponent) checkAlwaysComponent!: CheckAlwaysComponent;
      transplantedViewRefreshCount = 0;
      incrementChecks() {
        this.transplantedViewRefreshCount++;
      }
    }
    beforeEach(() => {
      TestBed.configureTestingModule({declarations: [App, OnPushComponent, CheckAlwaysComponent]});
      fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      appComponent = fixture.componentInstance;
      onPushComponent = appComponent.onPushComponent;
      checkAlwaysComponent = appComponent.checkAlwaysComponent;
    });
    describe('inside OnPush components', () => {
      it('should detect changes when attached', () => {
        onPushComponent.createTemplate();
        fixture.detectChanges(false);
        expect(appComponent.transplantedViewRefreshCount).toEqual(1);
      });

      it('should not detect changes', () => {
        const viewRef = onPushComponent.createTemplate();
        viewRef.detach();
        fixture.detectChanges(false);
        expect(appComponent.transplantedViewRefreshCount).toEqual(0);
        viewRef.reattach();
        fixture.detectChanges(false);
        expect(appComponent.transplantedViewRefreshCount).toEqual(1);
      });

      it('should not detect changes on mixed detached/attached refs', () => {
        onPushComponent.createTemplate();
        const viewRef = onPushComponent.createTemplate();
        viewRef.detach();
        fixture.detectChanges(false);
        expect(appComponent.transplantedViewRefreshCount).toEqual(1);
        viewRef.reattach();
        fixture.detectChanges(false);
        expect(appComponent.transplantedViewRefreshCount).toEqual(3);
      });
    });

    describe('inside CheckAlways component', () => {
      it('should detect changes when attached', () => {
        checkAlwaysComponent.createTemplate();
        fixture.detectChanges(false);
        expect(appComponent.transplantedViewRefreshCount).toEqual(1);
      });

      it('should not detect changes', () => {
        const viewRef = checkAlwaysComponent.createTemplate();
        viewRef.detach();
        fixture.detectChanges(false);
        expect(appComponent.transplantedViewRefreshCount).toEqual(0);
        viewRef.reattach();
        fixture.detectChanges(false);
        expect(appComponent.transplantedViewRefreshCount).toEqual(1);
      });

      it('should not detect changes on mixed detached/attached refs', () => {
        checkAlwaysComponent.createTemplate();
        const viewRef = checkAlwaysComponent.createTemplate();
        viewRef.detach();
        fixture.detectChanges(false);
        expect(appComponent.transplantedViewRefreshCount).toEqual(1);
        viewRef.reattach();
        fixture.detectChanges(false);
        expect(appComponent.transplantedViewRefreshCount).toEqual(3);
      });
    });
  });
});

function trim(text: string|null): string {
  return text ? text.replace(/[\s\n]+/gm, ' ').trim() : '';
}
