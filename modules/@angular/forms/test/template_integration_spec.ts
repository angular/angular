/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgFor, NgIf} from '@angular/common';
import {Component} from '@angular/core';
import {ComponentFixture, TestBed, TestComponentBuilder, fakeAsync, flushMicrotasks, tick} from '@angular/core/testing';
import {AsyncTestCompleter, afterEach, beforeEach, ddescribe, describe, expect, iit, inject, it, xdescribe, xit} from '@angular/core/testing/testing_internal';
import {FormsModule, NgForm} from '@angular/forms';
import {By} from '@angular/platform-browser/src/dom/debug/by';
import {getDOM} from '@angular/platform-browser/src/dom/dom_adapter';
import {dispatchEvent} from '@angular/platform-browser/testing/browser_util';

import {ObservableWrapper} from '../src/facade/async';
import {ListWrapper} from '../src/facade/collection';

export function main() {
  describe('template-driven forms integration tests', () => {

    beforeEach(() => { TestBed.configureTestingModule({imports: [FormsModule]}); });

    it('should support ngModel for single fields',
       fakeAsync(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
         const t = `<div><input type="text" [(ngModel)]="name"></div>`;

         let fixture = tcb.overrideTemplate(MyComp8, t).createFakeAsync(MyComp8);
         tick();
         fixture.debugElement.componentInstance.name = 'oldValue';
         fixture.detectChanges();

         var input = fixture.debugElement.query(By.css('input')).nativeElement;

         tick();
         expect(input.value).toEqual('oldValue');

         input.value = 'updatedValue';
         dispatchEvent(input, 'input');
         tick();

         expect(fixture.debugElement.componentInstance.name).toEqual('updatedValue');
       })));


    it('should support ngModel registration with a parent form',
       fakeAsync(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
         const t = `
                <form>
                  <input name="first" [(ngModel)]="name" maxlength="4">
                </form>
                `;

         let fixture = tcb.overrideTemplate(MyComp8, t).createFakeAsync(MyComp8);
         tick();
         fixture.debugElement.componentInstance.name = 'Nancy';
         fixture.detectChanges();
         var form = fixture.debugElement.children[0].injector.get(NgForm);

         tick();
         expect(form.value).toEqual({first: 'Nancy'});
         expect(form.valid).toBe(false);

       })));


    it('should add new controls and control groups',
       fakeAsync(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
         const t = `<form>
                         <div ngModelGroup="user">
                          <input type="text" name="login" ngModel>
                         </div>
                   </form>`;

         let fixture = tcb.overrideTemplate(MyComp8, t).createFakeAsync(MyComp8);
         tick();
         fixture.debugElement.componentInstance.name = null;
         fixture.detectChanges();

         var form = fixture.debugElement.children[0].injector.get(NgForm);
         expect(form.controls['user']).not.toBeDefined();

         tick();

         expect(form.controls['user']).toBeDefined();
         expect(form.controls['user'].controls['login']).toBeDefined();
       })));

    it('should emit ngSubmit event on submit',
       fakeAsync(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
         const t = `<div><form (ngSubmit)="name='updated'"></form></div>`;

         let fixture = tcb.overrideTemplate(MyComp8, t).createFakeAsync(MyComp8);
         tick();
         fixture.debugElement.componentInstance.name = 'old';
         var form = fixture.debugElement.query(By.css('form'));

         dispatchEvent(form.nativeElement, 'submit');
         tick();

         expect(fixture.debugElement.componentInstance.name).toEqual('updated');
       })));

    it('should mark NgForm as submitted on submit event',
       fakeAsync(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
         const t = `<div>
                      <form #f="ngForm" (ngSubmit)="data=f.submitted"></form>
                      <span>{{data}}</span>
                    </div>`;

         var fixture: ComponentFixture<MyComp8>;

         tcb.overrideTemplate(MyComp8, t).createAsync(MyComp8).then((root) => { fixture = root; });
         tick();

         fixture.debugElement.componentInstance.data = false;

         tick();

         var form = fixture.debugElement.query(By.css('form'));
         dispatchEvent(form.nativeElement, 'submit');

         tick();
         expect(fixture.debugElement.componentInstance.data).toEqual(true);
       })));


    it('should reset the form to empty when reset button is clicked',
       fakeAsync(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
         const t = `
                <form>
                  <input name="name" [(ngModel)]="name">
                </form>
               `;

         const fixture = tcb.overrideTemplate(MyComp8, t).createFakeAsync(MyComp8);
         tick();
         fixture.debugElement.componentInstance.name = 'should be cleared';
         fixture.detectChanges();
         tick();

         const form = fixture.debugElement.children[0].injector.get(NgForm);
         const formEl = fixture.debugElement.query(By.css('form'));

         dispatchEvent(formEl.nativeElement, 'reset');
         fixture.detectChanges();
         tick();

         expect(fixture.debugElement.componentInstance.name).toBe(null);
         expect(form.value.name).toEqual(null);
       })));


    it('should emit valueChanges and statusChanges on init',
       fakeAsync(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
         const t = `<form>
                      <input type="text" name="first" [ngModel]="name" minlength="3">
                    </form>`;

         const fixture = tcb.overrideTemplate(MyComp8, t).createFakeAsync(MyComp8);
         const form = fixture.debugElement.children[0].injector.get(NgForm);
         fixture.debugElement.componentInstance.name = 'aa';
         fixture.detectChanges();

         expect(form.valid).toEqual(true);
         expect(form.value).toEqual({});

         let formValidity: string;
         let formValue: Object;

         ObservableWrapper.subscribe(
             form.statusChanges, (status: string) => { formValidity = status; });

         ObservableWrapper.subscribe(form.valueChanges, (value: string) => { formValue = value; });

         tick();

         expect(formValidity).toEqual('INVALID');
         expect(formValue).toEqual({first: 'aa'});
       })));

    it('should not create a template-driven form when ngNoForm is used',
       inject(
           [TestComponentBuilder, AsyncTestCompleter],
           (tcb: TestComponentBuilder, async: AsyncTestCompleter) => {
             const t = `<form ngNoForm>
                   </form>`;

             tcb.overrideTemplate(MyComp8, t).createAsync(MyComp8).then((fixture) => {
               fixture.debugElement.componentInstance.name = null;
               fixture.detectChanges();

               expect(fixture.debugElement.children[0].providerTokens.length).toEqual(0);
               async.done();
             });
           }));

    it('should remove controls',
       fakeAsync(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
         const t = `<form>
                        <div *ngIf="name == 'show'">
                          <input type="text" name="login" ngModel>
                        </div>
                      </form>`;

         let fixture = tcb.overrideTemplate(MyComp8, t).createFakeAsync(MyComp8);
         tick();
         fixture.debugElement.componentInstance.name = 'show';
         fixture.detectChanges();
         tick();
         var form = fixture.debugElement.children[0].injector.get(NgForm);


         expect(form.controls['login']).toBeDefined();

         fixture.debugElement.componentInstance.name = 'hide';
         fixture.detectChanges();
         tick();

         expect(form.controls['login']).not.toBeDefined();
       })));

    it('should remove control groups',
       fakeAsync(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
         const t = `<form>
                         <div *ngIf="name=='show'" ngModelGroup="user">
                          <input type="text" name="login" ngModel>
                         </div>
                   </form>`;


         let fixture = tcb.overrideTemplate(MyComp8, t).createFakeAsync(MyComp8);
         tick();
         fixture.debugElement.componentInstance.name = 'show';
         fixture.detectChanges();
         tick();
         var form = fixture.debugElement.children[0].injector.get(NgForm);

         expect(form.controls['user']).toBeDefined();

         fixture.debugElement.componentInstance.name = 'hide';
         fixture.detectChanges();
         tick();

         expect(form.controls['user']).not.toBeDefined();
       })));

    it('should support ngModel for complex forms',
       fakeAsync(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
         const t = `<form>
                          <input type="text" name="name" [(ngModel)]="name">
                   </form>`;

         let fixture = tcb.overrideTemplate(MyComp8, t).createFakeAsync(MyComp8);
         tick();
         fixture.debugElement.componentInstance.name = 'oldValue';
         fixture.detectChanges();
         tick();

         var input = fixture.debugElement.query(By.css('input')).nativeElement;
         expect(input.value).toEqual('oldValue');

         input.value = 'updatedValue';
         dispatchEvent(input, 'input');
         tick();

         expect(fixture.debugElement.componentInstance.name).toEqual('updatedValue');
       })));


    it('should throw if ngModel has a parent form but no name attr or standalone label',
       inject(
           [TestComponentBuilder, AsyncTestCompleter],
           (tcb: TestComponentBuilder, async: AsyncTestCompleter) => {
             const t = `<form>
                      <input [(ngModel)]="name">
                    </form>`;

             tcb.overrideTemplate(MyComp8, t).createAsync(MyComp8).then((fixture) => {
               expect(() => fixture.detectChanges())
                   .toThrowError(new RegExp(`name attribute must be set`));
               async.done();
             });
           }));

    it('should not throw if ngModel has a parent form, no name attr, and a standalone label',
       inject(
           [TestComponentBuilder, AsyncTestCompleter],
           (tcb: TestComponentBuilder, async: AsyncTestCompleter) => {
             const t = `<form>
                      <input [(ngModel)]="name" [ngModelOptions]="{standalone: true}">
                    </form>`;

             tcb.overrideTemplate(MyComp8, t).createAsync(MyComp8).then((fixture) => {
               expect(() => fixture.detectChanges()).not.toThrow();
               async.done();
             });
           }));

    it('should override name attribute with ngModelOptions name if provided',
       fakeAsync(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
         const t = `
                <form>
                  <input name="one" [(ngModel)]="data" [ngModelOptions]="{name: 'two'}">
                </form>
                `;

         const fixture = tcb.overrideTemplate(MyComp8, t).createFakeAsync(MyComp8);
         tick();
         fixture.debugElement.componentInstance.data = 'some data';
         fixture.detectChanges();
         const form = fixture.debugElement.children[0].injector.get(NgForm);

         tick();
         expect(form.value).toEqual({two: 'some data'});
       })));

    it('should not register standalone ngModels with parent form',
       fakeAsync(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
         const t = `
                <form>
                  <input name="one" [(ngModel)]="data">
                  <input [(ngModel)]="list" [ngModelOptions]="{standalone: true}">
                </form>
                `;

         const fixture = tcb.overrideTemplate(MyComp8, t).createFakeAsync(MyComp8);
         tick();
         fixture.debugElement.componentInstance.data = 'some data';
         fixture.debugElement.componentInstance.list = 'should not show';
         fixture.detectChanges();
         const form = fixture.debugElement.children[0].injector.get(NgForm);
         const inputs = fixture.debugElement.queryAll(By.css('input'));

         tick();
         expect(form.value).toEqual({one: 'some data'});
         expect(inputs[1].nativeElement.value).toEqual('should not show');
       })));

    it('should set status classes with ngModel',
       inject(
           [TestComponentBuilder, AsyncTestCompleter],
           (tcb: TestComponentBuilder, async: AsyncTestCompleter) => {
             const t = `<div><input [(ngModel)]="name" required></div>`;

             tcb.overrideTemplate(MyComp8, t).createAsync(MyComp8).then((fixture) => {
               fixture.debugElement.componentInstance.name = '';
               fixture.detectChanges();

               var input = fixture.debugElement.query(By.css('input')).nativeElement;
               expect(sortedClassList(input)).toEqual([
                 'ng-invalid', 'ng-pristine', 'ng-untouched'
               ]);

               dispatchEvent(input, 'blur');
               fixture.detectChanges();

               expect(sortedClassList(input)).toEqual(['ng-invalid', 'ng-pristine', 'ng-touched']);

               input.value = 'updatedValue';
               dispatchEvent(input, 'input');
               fixture.detectChanges();

               expect(sortedClassList(input)).toEqual(['ng-dirty', 'ng-touched', 'ng-valid']);
               async.done();
             });
           }));

    it('should mark controls as dirty before emitting a value change event',
       fakeAsync(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {

         const t = `<form>
                <input type="text" name="login" ngModel>
               </form>`;

         tcb.overrideTemplate(MyComp8, t).createAsync(MyComp8).then((fixture) => {
           fixture.detectChanges();

           const form = fixture.debugElement.children[0].injector.get(NgForm).form;
           fixture.detectChanges();
           tick();

           form.find('login').valueChanges.subscribe(
               () => { expect(form.find('login').dirty).toBe(true); });

           const loginEl = fixture.debugElement.query(By.css('input')).nativeElement;
           loginEl.value = 'newValue';

           dispatchEvent(loginEl, 'input');
         });
       })));

    it('should mark control as pristine before emitting a value change event when resetting ',
       fakeAsync(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {

         const t = `<form>
                <input type="text" name="login" ngModel>
               </form>`;

         tcb.overrideTemplate(MyComp8, t).createAsync(MyComp8).then((fixture) => {
           fixture.detectChanges();

           const form = fixture.debugElement.children[0].injector.get(NgForm).form;
           const formEl = fixture.debugElement.query(By.css('form')).nativeElement;
           const loginEl = fixture.debugElement.query(By.css('input')).nativeElement;
           fixture.detectChanges();
           tick();

           loginEl.value = 'newValue';
           dispatchEvent(loginEl, 'input');

           expect(form.find('login').pristine).toBe(false);

           form.find('login').valueChanges.subscribe(
               () => { expect(form.find('login').pristine).toBe(true); });

           dispatchEvent(formEl, 'reset');
         });
       })));

    describe('radio value accessor', () => {
      it('should support <type=radio>',
         fakeAsync(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
           const t = `<form>
                      <input type="radio" name="food" [(ngModel)]="data.food" value="chicken">
                      <input type="radio" name="food" [(ngModel)]="data.food" value="fish">
                    </form>`;

           const fixture = tcb.overrideTemplate(MyComp8, t).createFakeAsync(MyComp8);
           tick();

           fixture.debugElement.componentInstance.data = {food: 'fish'};
           fixture.detectChanges();
           tick();

           const inputs = fixture.debugElement.queryAll(By.css('input'));
           expect(inputs[0].nativeElement.checked).toEqual(false);
           expect(inputs[1].nativeElement.checked).toEqual(true);

           dispatchEvent(inputs[0].nativeElement, 'change');
           tick();

           const data = fixture.debugElement.componentInstance.data;

           expect(data.food).toEqual('chicken');
           expect(inputs[1].nativeElement.checked).toEqual(false);
         })));

      it('should support multiple named <type=radio> groups',
         fakeAsync(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
           const t = `<form>
                      <input type="radio" name="food" [(ngModel)]="data.food" value="chicken">
                      <input type="radio" name="food"  [(ngModel)]="data.food" value="fish">
                      <input type="radio" name="drink" [(ngModel)]="data.drink" value="cola">
                      <input type="radio" name="drink" [(ngModel)]="data.drink" value="sprite">
                    </form>`;

           const fixture = tcb.overrideTemplate(MyComp8, t).createFakeAsync(MyComp8);
           tick();

           fixture.debugElement.componentInstance.data = {food: 'fish', drink: 'sprite'};
           fixture.detectChanges();
           tick();

           const inputs = fixture.debugElement.queryAll(By.css('input'));
           expect(inputs[0].nativeElement.checked).toEqual(false);
           expect(inputs[1].nativeElement.checked).toEqual(true);
           expect(inputs[2].nativeElement.checked).toEqual(false);
           expect(inputs[3].nativeElement.checked).toEqual(true);

           dispatchEvent(inputs[0].nativeElement, 'change');
           tick();

           const data = fixture.debugElement.componentInstance.data;

           expect(data.food).toEqual('chicken');
           expect(data.drink).toEqual('sprite');
           expect(inputs[1].nativeElement.checked).toEqual(false);
           expect(inputs[2].nativeElement.checked).toEqual(false);
           expect(inputs[3].nativeElement.checked).toEqual(true);

         })));
    });

    describe('select value accessor', () => {
      it('with option values that are objects',
         fakeAsync(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
           const t = `<div>
                      <select [(ngModel)]="selectedCity">
                        <option *ngFor="let c of list" [ngValue]="c">{{c['name']}}</option>
                      </select>
                  </div>`;

           tcb.overrideTemplate(MyComp8, t).createAsync(MyComp8).then((fixture) => {

             var testComp = fixture.debugElement.componentInstance;
             testComp.list = [{'name': 'SF'}, {'name': 'NYC'}, {'name': 'Buffalo'}];
             testComp.selectedCity = testComp.list[1];
             fixture.detectChanges();

             var select = fixture.debugElement.query(By.css('select'));
             var nycOption = fixture.debugElement.queryAll(By.css('option'))[1];

             tick();
             expect(select.nativeElement.value).toEqual('1: Object');
             expect(nycOption.nativeElement.selected).toBe(true);

             select.nativeElement.value = '2: Object';
             dispatchEvent(select.nativeElement, 'change');
             fixture.detectChanges();
             tick();
             expect(testComp.selectedCity['name']).toEqual('Buffalo');
           });
         })));

      it('when new options are added (selection through the model)',
         fakeAsync(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
           const t = `<div>
                      <select [(ngModel)]="selectedCity">
                        <option *ngFor="let c of list" [ngValue]="c">{{c['name']}}</option>
                      </select>
                  </div>`;

           tcb.overrideTemplate(MyComp8, t).createAsync(MyComp8).then((fixture) => {

             var testComp: MyComp8 = fixture.debugElement.componentInstance;
             testComp.list = [{'name': 'SF'}, {'name': 'NYC'}];
             testComp.selectedCity = testComp.list[1];
             fixture.detectChanges();

             testComp.list.push({'name': 'Buffalo'});
             testComp.selectedCity = testComp.list[2];
             fixture.detectChanges();
             tick();

             var select = fixture.debugElement.query(By.css('select'));
             var buffalo = fixture.debugElement.queryAll(By.css('option'))[2];
             expect(select.nativeElement.value).toEqual('2: Object');
             expect(buffalo.nativeElement.selected).toBe(true);
           });
         })));

      it('when new options are added (selection through the UI)',
         inject(
             [TestComponentBuilder, AsyncTestCompleter],
             (tcb: TestComponentBuilder, async: AsyncTestCompleter) => {
               const t = `<div>
                      <select [(ngModel)]="selectedCity">
                        <option *ngFor="let c of list" [ngValue]="c">{{c['name']}}</option>
                      </select>
                  </div>`;

               tcb.overrideTemplate(MyComp8, t).createAsync(MyComp8).then((fixture) => {

                 var testComp: MyComp8 = fixture.debugElement.componentInstance;
                 testComp.list = [{'name': 'SF'}, {'name': 'NYC'}];
                 testComp.selectedCity = testComp.list[0];
                 fixture.detectChanges();

                 var select = fixture.debugElement.query(By.css('select'));
                 var ny = fixture.debugElement.queryAll(By.css('option'))[1];

                 select.nativeElement.value = '1: Object';
                 dispatchEvent(select.nativeElement, 'change');
                 testComp.list.push({'name': 'Buffalo'});
                 fixture.detectChanges();

                 expect(select.nativeElement.value).toEqual('1: Object');
                 expect(ny.nativeElement.selected).toBe(true);
                 async.done();
               });
             }));


      it('when options are removed',
         fakeAsync(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
           const t = `<div>
                      <select [(ngModel)]="selectedCity">
                        <option *ngFor="let c of list" [ngValue]="c">{{c}}</option>
                      </select>
                  </div>`;
           tcb.overrideTemplate(MyComp8, t).createAsync(MyComp8).then((fixture) => {

             var testComp: MyComp8 = fixture.debugElement.componentInstance;
             testComp.list = [{'name': 'SF'}, {'name': 'NYC'}];
             testComp.selectedCity = testComp.list[1];
             fixture.detectChanges();
             tick();

             var select = fixture.debugElement.query(By.css('select'));
             expect(select.nativeElement.value).toEqual('1: Object');

             testComp.list.pop();
             fixture.detectChanges();
             tick();

             expect(select.nativeElement.value).not.toEqual('1: Object');
           });
         })));

      it('when option values change identity while tracking by index',
         fakeAsync(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
           const t = `<div>
                      <select [(ngModel)]="selectedCity">
                        <option *ngFor="let c of list; trackBy:customTrackBy" [ngValue]="c">{{c}}</option>
                      </select>
                  </div>`;

           tcb.overrideTemplate(MyComp8, t).createAsync(MyComp8).then((fixture) => {

             var testComp = fixture.debugElement.componentInstance;

             testComp.list = [{'name': 'SF'}, {'name': 'NYC'}];
             testComp.selectedCity = testComp.list[0];
             fixture.detectChanges();

             testComp.list[1] = 'Buffalo';
             testComp.selectedCity = testComp.list[1];
             fixture.detectChanges();
             tick();

             var select = fixture.debugElement.query(By.css('select'));
             var buffalo = fixture.debugElement.queryAll(By.css('option'))[1];

             expect(select.nativeElement.value).toEqual('1: Buffalo');
             expect(buffalo.nativeElement.selected).toBe(true);
           });
         })));

      it('with duplicate option values',
         fakeAsync(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
           const t = `<div>
                      <select [(ngModel)]="selectedCity">
                        <option *ngFor="let c of list" [ngValue]="c">{{c.name}}</option>
                      </select>
                  </div>`;

           tcb.overrideTemplate(MyComp8, t).createAsync(MyComp8).then((fixture) => {

             var testComp = fixture.debugElement.componentInstance;

             testComp.list = [{'name': 'NYC'}, {'name': 'SF'}, {'name': 'SF'}];
             testComp.selectedCity = testComp.list[0];
             fixture.detectChanges();

             testComp.selectedCity = testComp.list[1];
             fixture.detectChanges();
             tick();

             var select = fixture.debugElement.query(By.css('select'));
             var firstSF = fixture.debugElement.queryAll(By.css('option'))[1];

             expect(select.nativeElement.value).toEqual('1: Object');
             expect(firstSF.nativeElement.selected).toBe(true);
           });
         })));

      it('when option values have same content, but different identities',
         fakeAsync(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
           const t = `<div>
                      <select [(ngModel)]="selectedCity">
                        <option *ngFor="let c of list" [ngValue]="c">{{c['name']}}</option>
                      </select>
                  </div>`;

           tcb.overrideTemplate(MyComp8, t).createAsync(MyComp8).then((fixture) => {

             var testComp = fixture.debugElement.componentInstance;
             testComp.list = [{'name': 'SF'}, {'name': 'NYC'}, {'name': 'NYC'}];
             testComp.selectedCity = testComp.list[0];
             fixture.detectChanges();

             testComp.selectedCity = testComp.list[2];
             fixture.detectChanges();
             tick();

             var select = fixture.debugElement.query(By.css('select'));
             var secondNYC = fixture.debugElement.queryAll(By.css('option'))[2];

             expect(select.nativeElement.value).toEqual('2: Object');
             expect(secondNYC.nativeElement.selected).toBe(true);
           });
         })));
    });

    describe('ngModel corner cases', () => {
      it('should update the view when the model is set back to what used to be in the view',
         fakeAsync(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
           const t = `<input type="text" [(ngModel)]="name">`;
           let fixture = tcb.overrideTemplate(MyComp8, t).createFakeAsync(MyComp8);
           tick();
           fixture.debugElement.componentInstance.name = '';
           fixture.detectChanges();

           // Type "aa" into the input.
           var input = fixture.debugElement.query(By.css('input')).nativeElement;
           input.value = 'aa';
           input.selectionStart = 1;
           dispatchEvent(input, 'input');

           fixture.detectChanges();
           tick();
           expect(fixture.debugElement.componentInstance.name).toEqual('aa');

           // Programmatically update the input value to be "bb".
           fixture.debugElement.componentInstance.name = 'bb';
           fixture.detectChanges();
           tick();
           expect(input.value).toEqual('bb');

           // Programatically set it back to "aa".
           fixture.debugElement.componentInstance.name = 'aa';
           fixture.detectChanges();
           tick();
           expect(input.value).toEqual('aa');
         })));

      it('should not crash when validity is checked from a binding',
         fakeAsync(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
           // {{x.valid}} used to crash because valid() tried to read a property
           // from form.control before it was set. This test verifies this bug is
           // fixed.
           const t = `<form><div ngModelGroup="x" #x="ngModelGroup">
                    <input type="text" name="test" ngModel></div>{{x.valid}}</form>`;
           let fixture = tcb.overrideTemplate(MyComp8, t).createFakeAsync(MyComp8);
           tick();
           fixture.detectChanges();
         })));
    });

  });
};

@Component({selector: 'my-comp', template: '', directives: [NgIf, NgFor]})
class MyComp8 {
  form: any;
  name: string;
  data: any;
  list: any[];
  selectedCity: any;
  customTrackBy(index: number, obj: any): number { return index; };
}

function sortedClassList(el: any /** TODO #9100 */) {
  var l = getDOM().classList(el);
  ListWrapper.sort(l);
  return l;
}
