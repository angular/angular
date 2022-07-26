/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {ChangeDetectionStrategy, ChangeDetectorRef, Component, DoCheck, Input, TemplateRef, Type, ViewChild, ViewContainerRef} from '@angular/core';
import {AfterViewChecked} from '@angular/core/src/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {expect} from '@angular/platform-browser/testing/src/matchers';

describe('change detection for transplanted views', () => {
  describe('when declaration appears before insertion', () => {
    const insertCompTemplate = `
        InsertComp({{greeting}})
        <div *ngIf="true">
          <!-- Add extra level of embedded view to ensure we can handle nesting -->
          <ng-container
              [ngTemplateOutlet]="template"
              [ngTemplateOutletContext]="{$implicit: greeting}">
          </ng-container>
        </div>
      `;
    @Component({
      selector: 'insert-comp',
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: insertCompTemplate,
    })
    class InsertComp implements DoCheck, AfterViewChecked {
      get template(): TemplateRef<any> {
        return declareComp.myTmpl;
      }
      greeting: string = 'Hello';
      constructor(public changeDetectorRef: ChangeDetectorRef) {
        if (!(this instanceof InsertForOnPushDeclareComp)) {
          insertComp = this;
        }
      }
      ngDoCheck(): void {
        logValue = 'Insert';
      }
      ngAfterViewChecked(): void {
        logValue = null;
      }
    }

    @Component({
      selector: 'insert-for-onpush-declare-comp',
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: insertCompTemplate,
    })
    class InsertForOnPushDeclareComp extends InsertComp {
      constructor(changeDetectorRef: ChangeDetectorRef) {
        super(changeDetectorRef);
        insertForOnPushDeclareComp = this;
      }
      override get template(): TemplateRef<any> {
        return onPushDeclareComp.myTmpl;
      }
    }

    @Component({
      selector: `declare-comp`,
      template: `
        DeclareComp({{name}})
        <ng-template #myTmpl let-greeting>
          {{greeting}} {{logName()}}!
        </ng-template>
      `
    })
    class DeclareComp implements DoCheck, AfterViewChecked {
      @ViewChild('myTmpl') myTmpl!: TemplateRef<any>;
      name: string = 'world';
      constructor(readonly changeDetector: ChangeDetectorRef) {
        if (!(this instanceof OnPushDeclareComp)) {
          declareComp = this;
        }
      }
      ngDoCheck(): void {
        logValue = 'Declare';
      }
      logName() {
        // This will log when the embedded view gets CD. The `logValue` will show if the CD was
        // from `Insert` or from `Declare` component.
        log.push(logValue!);
        return this.name;
      }
      ngAfterViewChecked(): void {
        logValue = null;
      }
    }

    @Component({
      selector: `onpush-declare-comp`,
      template: `
        OnPushDeclareComp({{name}})
        <ng-template #myTmpl let-greeting>
          {{greeting}} {{logName()}}!
        </ng-template>
      `,
      changeDetection: ChangeDetectionStrategy.OnPush
    })
    class OnPushDeclareComp extends DeclareComp {
      constructor(changeDetector: ChangeDetectorRef) {
        super(changeDetector);
        onPushDeclareComp = this;
      }
    }


    @Component({
      template: `
      <declare-comp *ngIf="showDeclare"></declare-comp>
      <onpush-declare-comp *ngIf="showOnPushDeclare"></onpush-declare-comp>
      <insert-comp *ngIf="showInsert"></insert-comp>
      <insert-for-onpush-declare-comp *ngIf="showInsertForOnPushDeclare"></insert-for-onpush-declare-comp>
      `
    })
    class AppComp {
      showDeclare: boolean = false;
      showOnPushDeclare: boolean = false;
      showInsert: boolean = false;
      showInsertForOnPushDeclare: boolean = false;
      constructor() {
        appComp = this;
      }
    }

    let log!: Array<string|null>;
    let logValue!: string|null;
    let fixture!: ComponentFixture<AppComp>;
    let appComp!: AppComp;
    let insertComp!: InsertComp;
    let insertForOnPushDeclareComp!: InsertForOnPushDeclareComp;
    let declareComp!: DeclareComp;
    let onPushDeclareComp!: OnPushDeclareComp;

    beforeEach(() => {
      TestBed.configureTestingModule({
        declarations:
            [InsertComp, DeclareComp, OnPushDeclareComp, InsertForOnPushDeclareComp, AppComp],
        imports: [CommonModule],
      });
      log = [];
      fixture = TestBed.createComponent(AppComp);
    });

    describe('and declaration component is CheckAlways', () => {
      beforeEach(() => {
        fixture.componentInstance.showDeclare = true;
        fixture.componentInstance.showInsert = true;
        fixture.detectChanges(false);
        log.length = 0;
      });

      it('should set up the component under test correctly', () => {
        expect(log.length).toEqual(0);
        expect(trim(fixture.nativeElement.textContent))
            .toEqual('DeclareComp(world) InsertComp(Hello) Hello world!');
      });

      it('should CD at insertion point only', () => {
        declareComp.name = 'Angular';
        fixture.detectChanges(false);
        expect(log).toEqual(['Insert']);
        log.length = 0;
        expect(trim(fixture.nativeElement.textContent))
            .toEqual(
                'DeclareComp(Angular) InsertComp(Hello) Hello Angular!',
                'Expect transplanted LView to be CD because the declaration is CD.');

        insertComp.greeting = 'Hi';
        fixture.detectChanges(false);
        expect(log).toEqual(['Insert']);
        log.length = 0;
        expect(trim(fixture.nativeElement.textContent))
            .toEqual(
                'DeclareComp(Angular) InsertComp(Hello) Hello Angular!',
                'expect no change because it is on push.');

        insertComp.changeDetectorRef.markForCheck();
        fixture.detectChanges(false);
        expect(log).toEqual(['Insert']);
        log.length = 0;
        expect(trim(fixture.nativeElement.textContent))
            .toEqual('DeclareComp(Angular) InsertComp(Hi) Hi Angular!');

        // Destroy insertion should also destroy declaration
        appComp.showInsert = false;
        fixture.detectChanges(false);
        expect(log).toEqual([]);
        log.length = 0;
        expect(trim(fixture.nativeElement.textContent)).toEqual('DeclareComp(Angular)');

        // Restore both
        appComp.showInsert = true;
        fixture.detectChanges(false);
        expect(log).toEqual(['Insert']);
        log.length = 0;
        expect(trim(fixture.nativeElement.textContent))
            .toEqual('DeclareComp(Angular) InsertComp(Hello) Hello Angular!');

        // Destroy declaration, But we should still be able to see updates in insertion
        appComp.showDeclare = false;
        insertComp.greeting = 'Hello';
        insertComp.changeDetectorRef.markForCheck();
        fixture.detectChanges(false);
        expect(log).toEqual(['Insert']);
        log.length = 0;
        expect(trim(fixture.nativeElement.textContent)).toEqual('InsertComp(Hello) Hello Angular!');
      });

      it('is not checked if detectChanges is called in declaration component', () => {
        declareComp.name = 'Angular';
        declareComp.changeDetector.detectChanges();
        expect(log).toEqual([]);
        log.length = 0;
        expect(trim(fixture.nativeElement.textContent))
            .toEqual('DeclareComp(Angular) InsertComp(Hello) Hello world!');
      });

      it('is checked as part of CheckNoChanges pass', () => {
        fixture.detectChanges(true);
        expect(log).toEqual(['Insert', null /* logName set to null afterViewChecked */]);
        log.length = 0;
        expect(trim(fixture.nativeElement.textContent))
            .toEqual('DeclareComp(world) InsertComp(Hello) Hello world!');
      });
    });

    describe('and declaration component is OnPush', () => {
      beforeEach(() => {
        fixture.componentInstance.showOnPushDeclare = true;
        fixture.componentInstance.showInsertForOnPushDeclare = true;
        fixture.detectChanges(false);
        log.length = 0;
      });

      it('should set up component under test correctly', () => {
        expect(log.length).toEqual(0);
        expect(trim(fixture.nativeElement.textContent))
            .toEqual('OnPushDeclareComp(world) InsertComp(Hello) Hello world!');
      });

      it('should not check anything no views are dirty', () => {
        fixture.detectChanges(false);
        expect(log).toEqual([]);
      });

      it('should CD at insertion point only', () => {
        onPushDeclareComp.name = 'Angular';
        insertForOnPushDeclareComp.greeting = 'Hi';
        // mark declaration point dirty
        onPushDeclareComp.changeDetector.markForCheck();
        fixture.detectChanges(false);
        expect(log).toEqual(['Insert']);
        log.length = 0;
        expect(trim(fixture.nativeElement.textContent))
            .toEqual('OnPushDeclareComp(Angular) InsertComp(Hello) Hello Angular!');

        // mark insertion point dirty
        insertForOnPushDeclareComp.changeDetectorRef.markForCheck();
        fixture.detectChanges(false);
        expect(log).toEqual(['Insert']);
        log.length = 0;
        expect(trim(fixture.nativeElement.textContent))
            .toEqual('OnPushDeclareComp(Angular) InsertComp(Hi) Hi Angular!');

        // mark both insertion and declaration point dirty
        insertForOnPushDeclareComp.changeDetectorRef.markForCheck();
        onPushDeclareComp.changeDetector.markForCheck();
        fixture.detectChanges(false);
        expect(log).toEqual(['Insert']);
        log.length = 0;
      });

      it('is not checked if detectChanges is called in declaration component', () => {
        onPushDeclareComp.name = 'Angular';
        onPushDeclareComp.changeDetector.detectChanges();
        expect(log).toEqual([]);
        log.length = 0;
        expect(trim(fixture.nativeElement.textContent))
            .toEqual('OnPushDeclareComp(Angular) InsertComp(Hello) Hello world!');
      });

      // TODO(FW-1774): blocked by https://github.com/angular/angular/pull/34443
      xit('is checked as part of CheckNoChanges pass', () => {
        // mark declaration point dirty
        onPushDeclareComp.changeDetector.markForCheck();
        fixture.detectChanges(false);
        expect(log).toEqual(['Insert', null /* logName set to null in afterViewChecked */]);
        log.length = 0;

        // mark insertion point dirty
        insertForOnPushDeclareComp.changeDetectorRef.markForCheck();
        fixture.detectChanges(false);
        expect(log).toEqual(['Insert', null]);
        log.length = 0;

        // mark both insertion and declaration point dirty
        insertForOnPushDeclareComp.changeDetectorRef.markForCheck();
        onPushDeclareComp.changeDetector.markForCheck();
        fixture.detectChanges(false);
        expect(log).toEqual(['Insert', null]);
        log.length = 0;
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
