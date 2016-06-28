/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgFor, NgIf} from '@angular/common';
import {TestComponentBuilder} from '@angular/compiler/testing';
import {Component, Directive, EventEmitter, Output} from '@angular/core';
import {Input, Provider, forwardRef} from '@angular/core';
import {ComponentFixture} from '@angular/core/testing';
import {fakeAsync, flushMicrotasks, tick} from '@angular/core/testing';
import {afterEach, beforeEach, ddescribe, describe, expect, iit, inject, it, xdescribe, xit} from '@angular/core/testing/testing_internal';
import {AsyncTestCompleter} from '@angular/core/testing/testing_internal';
import {ControlValueAccessor, FORM_DIRECTIVES, FORM_PROVIDERS, FormArray, FormControl, FormGroup, NG_ASYNC_VALIDATORS, NG_VALIDATORS, NgControl, NgForm, NgModel, REACTIVE_FORM_DIRECTIVES, Validator, Validators, disableDeprecatedForms, provideForms} from '@angular/forms';
import {By} from '@angular/platform-browser/src/dom/debug/by';
import {getDOM} from '@angular/platform-browser/src/dom/dom_adapter';
import {dispatchEvent} from '@angular/platform-browser/testing/browser_util';

import {ObservableWrapper, TimerWrapper} from '../src/facade/async';
import {ListWrapper} from '../src/facade/collection';
import {PromiseWrapper} from '../src/facade/promise';

export function main() {
  describe('integration tests', () => {
    let providerArr: any[];
    beforeEach(() => { providerArr = [disableDeprecatedForms(), provideForms()]; });

    it('should initialize DOM elements with the given form object',
       inject(
           [TestComponentBuilder, AsyncTestCompleter],
           (tcb: TestComponentBuilder, async: AsyncTestCompleter) => {
             const t = `<div [formGroup]="form">
                <input type="text" formControlName="login">
               </div>`;

             tcb.overrideTemplate(MyComp8, t)
                 .overrideProviders(MyComp8, providerArr)
                 .createAsync(MyComp8)
                 .then((fixture) => {
                   fixture.debugElement.componentInstance.form =
                       new FormGroup({'login': new FormControl('loginValue')});
                   fixture.detectChanges();

                   var input = fixture.debugElement.query(By.css('input'));
                   expect(input.nativeElement.value).toEqual('loginValue');
                   async.done();
                 });
           }));

    it('should throw if a form isn\'t passed into formGroup',
       inject(
           [TestComponentBuilder, AsyncTestCompleter],
           (tcb: TestComponentBuilder, async: AsyncTestCompleter) => {
             const t = `<div [formGroup]="form">
                <input type="text" formControlName="login">
               </div>`;

             tcb.overrideTemplate(MyComp8, t)
                 .overrideProviders(MyComp8, providerArr)
                 .createAsync(MyComp8)
                 .then((fixture) => {
                   expect(() => fixture.detectChanges())
                       .toThrowError(new RegExp(`formGroup expects a FormGroup instance`));
                   async.done();
                 });
           }));

    it('should update the form group values on DOM change',
       inject(
           [TestComponentBuilder, AsyncTestCompleter],
           (tcb: TestComponentBuilder, async: AsyncTestCompleter) => {
             var form = new FormGroup({'login': new FormControl('oldValue')});

             const t = `<div [formGroup]="form">
                <input type="text" formControlName="login">
              </div>`;

             tcb.overrideTemplate(MyComp8, t)
                 .overrideProviders(MyComp8, providerArr)
                 .createAsync(MyComp8)
                 .then((fixture) => {
                   fixture.debugElement.componentInstance.form = form;
                   fixture.detectChanges();
                   var input = fixture.debugElement.query(By.css('input'));

                   input.nativeElement.value = 'updatedValue';
                   dispatchEvent(input.nativeElement, 'input');

                   expect(form.value).toEqual({'login': 'updatedValue'});
                   async.done();
                 });
           }));

    it('should ignore the change event for <input type=text>',
       inject(
           [TestComponentBuilder, AsyncTestCompleter],
           (tcb: TestComponentBuilder, async: AsyncTestCompleter) => {
             var form = new FormGroup({'login': new FormControl('oldValue')});

             const t = `<div [formGroup]="form">
                <input type="text" formControlName="login">
              </div>`;

             tcb.overrideTemplate(MyComp8, t)
                 .overrideProviders(MyComp8, providerArr)
                 .createAsync(MyComp8)
                 .then((fixture) => {
                   fixture.debugElement.componentInstance.form = form;
                   fixture.detectChanges();
                   var input = fixture.debugElement.query(By.css('input'));

                   input.nativeElement.value = 'updatedValue';

                   ObservableWrapper.subscribe(
                       form.valueChanges, (value) => { throw 'Should not happen'; });
                   dispatchEvent(input.nativeElement, 'change');

                   async.done();
                 });
           }));

    it('should emit ngSubmit event on submit',
       fakeAsync(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
         const t = `<div>
                      <form [formGroup]="form" (ngSubmit)="name='updated'"></form>
                      <span>{{name}}</span>
                    </div>`;

         let fixture = tcb.overrideTemplate(MyComp8, t).createFakeAsync(MyComp8);
         tick();

         fixture.debugElement.componentInstance.form = new FormGroup({});
         fixture.debugElement.componentInstance.name = 'old';

         tick();

         var form = fixture.debugElement.query(By.css('form'));
         dispatchEvent(form.nativeElement, 'submit');

         tick();
         expect(fixture.debugElement.componentInstance.name).toEqual('updated');
       })));

    it('should mark NgForm as submitted on submit event',
       inject([TestComponentBuilder], fakeAsync((tcb: TestComponentBuilder) => {
                const t = `<div>
                      <form #f="ngForm" (ngSubmit)="data=f.submitted"></form>
                      <span>{{data}}</span>
                    </div>`;

                var fixture: ComponentFixture<MyComp8>;

                tcb.overrideTemplate(MyComp8, t).createAsync(MyComp8).then((root) => {
                  fixture = root;
                });
                tick();

                fixture.debugElement.componentInstance.data = false;

                tick();

                var form = fixture.debugElement.query(By.css('form'));
                dispatchEvent(form.nativeElement, 'submit');

                tick();
                expect(fixture.debugElement.componentInstance.data).toEqual(true);
              })));

    it('should mark formGroup as submitted on submit event',
       inject([TestComponentBuilder], fakeAsync((tcb: TestComponentBuilder) => {
                const t = `<div>
                      <form #f="ngForm" [formGroup]="form" (ngSubmit)="data=f.submitted"></form>
                      <span>{{data}}</span>
                    </div>`;

                var fixture: ComponentFixture<MyComp8>;

                tcb.overrideTemplate(MyComp8, t).createAsync(MyComp8).then((root) => {
                  fixture = root;
                });
                tick();

                fixture.debugElement.componentInstance.form = new FormGroup({});
                fixture.debugElement.componentInstance.data = false;

                tick();

                var form = fixture.debugElement.query(By.css('form'));
                dispatchEvent(form.nativeElement, 'submit');

                tick();
                expect(fixture.debugElement.componentInstance.data).toEqual(true);
              })));

    it('should work with single controls',
       inject(
           [TestComponentBuilder, AsyncTestCompleter],
           (tcb: TestComponentBuilder, async: AsyncTestCompleter) => {
             var control = new FormControl('loginValue');

             const t = `<div><input type="text" [formControl]="form"></div>`;

             tcb.overrideTemplate(MyComp8, t)
                 .overrideProviders(MyComp8, providerArr)
                 .createAsync(MyComp8)
                 .then((fixture) => {
                   fixture.debugElement.componentInstance.form = control;
                   fixture.detectChanges();

                   var input = fixture.debugElement.query(By.css('input'));
                   expect(input.nativeElement.value).toEqual('loginValue');

                   input.nativeElement.value = 'updatedValue';
                   dispatchEvent(input.nativeElement, 'input');

                   expect(control.value).toEqual('updatedValue');
                   async.done();
                 });
           }));

    it('should update DOM elements when rebinding the form group',
       inject(
           [TestComponentBuilder, AsyncTestCompleter],
           (tcb: TestComponentBuilder, async: AsyncTestCompleter) => {
             const t = `<div [formGroup]="form">
                <input type="text" formControlName="login">
               </div>`;

             tcb.overrideTemplate(MyComp8, t)
                 .overrideProviders(MyComp8, providerArr)
                 .createAsync(MyComp8)
                 .then((fixture) => {
                   fixture.debugElement.componentInstance.form =
                       new FormGroup({'login': new FormControl('oldValue')});
                   fixture.detectChanges();

                   fixture.debugElement.componentInstance.form =
                       new FormGroup({'login': new FormControl('newValue')});
                   fixture.detectChanges();

                   var input = fixture.debugElement.query(By.css('input'));
                   expect(input.nativeElement.value).toEqual('newValue');
                   async.done();
                 });
           }));

    it('should update DOM elements when updating the value of a control',
       inject(
           [TestComponentBuilder, AsyncTestCompleter],
           (tcb: TestComponentBuilder, async: AsyncTestCompleter) => {
             var login = new FormControl('oldValue');
             var form = new FormGroup({'login': login});

             const t = `<div [formGroup]="form">
                <input type="text" formControlName="login">
               </div>`;

             tcb.overrideTemplate(MyComp8, t)
                 .overrideProviders(MyComp8, providerArr)
                 .createAsync(MyComp8)
                 .then((fixture) => {
                   fixture.debugElement.componentInstance.form = form;
                   fixture.detectChanges();

                   login.updateValue('newValue');

                   fixture.detectChanges();

                   var input = fixture.debugElement.query(By.css('input'));
                   expect(input.nativeElement.value).toEqual('newValue');
                   async.done();
                 });
           }));

    it('should mark controls as touched after interacting with the DOM control',
       inject(
           [TestComponentBuilder, AsyncTestCompleter],
           (tcb: TestComponentBuilder, async: AsyncTestCompleter) => {
             var login = new FormControl('oldValue');
             var form = new FormGroup({'login': login});

             const t = `<div [formGroup]="form">
                <input type="text" formControlName="login">
               </div>`;

             tcb.overrideTemplate(MyComp8, t)
                 .overrideProviders(MyComp8, providerArr)
                 .createAsync(MyComp8)
                 .then((fixture) => {
                   fixture.debugElement.componentInstance.form = form;
                   fixture.detectChanges();

                   var loginEl = fixture.debugElement.query(By.css('input'));
                   expect(login.touched).toBe(false);

                   dispatchEvent(loginEl.nativeElement, 'blur');

                   expect(login.touched).toBe(true);

                   async.done();
                 });
           }));

    it('should support form arrays',
       fakeAsync(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
         const cityArray = new FormArray([new FormControl('SF'), new FormControl('NY')]);
         const form = new FormGroup({cities: cityArray});

         const t = `<div [formGroup]="form">
                <div formArrayName="cities">
                  <div *ngFor="let city of cityArray.controls; let i=index">
                    <input [formControlName]="i">
                  </div>
                </div>
               </div>`;

         tcb.overrideTemplate(MyComp8, t)
             .overrideProviders(MyComp8, providerArr)
             .createAsync(MyComp8)
             .then((fixture) => {
               fixture.debugElement.componentInstance.form = form;
               fixture.debugElement.componentInstance.cityArray = cityArray;
               fixture.detectChanges();
               tick();

               const inputs = fixture.debugElement.queryAll(By.css('input'));
               expect(inputs[0].nativeElement.value).toEqual('SF');
               expect(inputs[1].nativeElement.value).toEqual('NY');
               expect(fixture.componentInstance.form.value).toEqual({cities: ['SF', 'NY']});

               inputs[0].nativeElement.value = 'LA';
               dispatchEvent(inputs[0].nativeElement, 'input');

               fixture.detectChanges();
               tick();

               expect(fixture.componentInstance.form.value).toEqual({cities: ['LA', 'NY']});

             });
       })));

    it('should support pushing new controls to form arrays',
       fakeAsync(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
         const cityArray = new FormArray([new FormControl('SF'), new FormControl('NY')]);
         const form = new FormGroup({cities: cityArray});

         const t = `<div [formGroup]="form">
                <div formArrayName="cities">
                  <div *ngFor="let city of cityArray.controls; let i=index">
                    <input [formControlName]="i">
                  </div>
                </div>
               </div>`;

         tcb.overrideTemplate(MyComp8, t)
             .overrideProviders(MyComp8, providerArr)
             .createAsync(MyComp8)
             .then((fixture) => {
               fixture.debugElement.componentInstance.form = form;
               fixture.debugElement.componentInstance.cityArray = cityArray;
               fixture.detectChanges();
               tick();

               cityArray.push(new FormControl('LA'));
               fixture.detectChanges();
               tick();

               const inputs = fixture.debugElement.queryAll(By.css('input'));
               expect(inputs[2].nativeElement.value).toEqual('LA');
               expect(fixture.componentInstance.form.value).toEqual({cities: ['SF', 'NY', 'LA']});

             });
       })));

    describe('different control types', () => {
      it('should support <input type=text>',
         inject(
             [TestComponentBuilder, AsyncTestCompleter],
             (tcb: TestComponentBuilder, async: AsyncTestCompleter) => {
               const t = `<div [formGroup]="form">
                  <input type="text" formControlName="text">
                </div>`;

               tcb.overrideTemplate(MyComp8, t)
                   .overrideProviders(MyComp8, providerArr)
                   .createAsync(MyComp8)
                   .then((fixture) => {
                     fixture.debugElement.componentInstance.form =
                         new FormGroup({'text': new FormControl('old')});
                     fixture.detectChanges();

                     var input = fixture.debugElement.query(By.css('input'));
                     expect(input.nativeElement.value).toEqual('old');

                     input.nativeElement.value = 'new';
                     dispatchEvent(input.nativeElement, 'input');

                     expect(fixture.debugElement.componentInstance.form.value).toEqual({
                       'text': 'new'
                     });
                     async.done();
                   });
             }));

      it('should support <input> without type',
         inject(
             [TestComponentBuilder, AsyncTestCompleter],
             (tcb: TestComponentBuilder, async: AsyncTestCompleter) => {
               const t = `<div [formGroup]="form">
                  <input formControlName="text">
                </div>`;

               tcb.overrideTemplate(MyComp8, t)
                   .overrideProviders(MyComp8, providerArr)
                   .createAsync(MyComp8)
                   .then((fixture) => {
                     fixture.debugElement.componentInstance.form =
                         new FormGroup({'text': new FormControl('old')});
                     fixture.detectChanges();
                     var input = fixture.debugElement.query(By.css('input'));
                     expect(input.nativeElement.value).toEqual('old');

                     input.nativeElement.value = 'new';
                     dispatchEvent(input.nativeElement, 'input');

                     expect(fixture.debugElement.componentInstance.form.value).toEqual({
                       'text': 'new'
                     });
                     async.done();
                   });
             }));

      it('should support <textarea>',
         inject(
             [TestComponentBuilder, AsyncTestCompleter],
             (tcb: TestComponentBuilder, async: AsyncTestCompleter) => {
               const t = `<div [formGroup]="form">
                  <textarea formControlName="text"></textarea>
                </div>`;

               tcb.overrideTemplate(MyComp8, t)
                   .overrideProviders(MyComp8, providerArr)
                   .createAsync(MyComp8)
                   .then((fixture) => {
                     fixture.debugElement.componentInstance.form =
                         new FormGroup({'text': new FormControl('old')});
                     fixture.detectChanges();

                     var textarea = fixture.debugElement.query(By.css('textarea'));
                     expect(textarea.nativeElement.value).toEqual('old');

                     textarea.nativeElement.value = 'new';
                     dispatchEvent(textarea.nativeElement, 'input');

                     expect(fixture.debugElement.componentInstance.form.value).toEqual({
                       'text': 'new'
                     });
                     async.done();
                   });
             }));

      it('should support <type=checkbox>',
         inject(
             [TestComponentBuilder, AsyncTestCompleter],
             (tcb: TestComponentBuilder, async: AsyncTestCompleter) => {
               const t = `<div [formGroup]="form">
                  <input type="checkbox" formControlName="checkbox">
                </div>`;

               tcb.overrideTemplate(MyComp8, t)
                   .overrideProviders(MyComp8, providerArr)
                   .createAsync(MyComp8)
                   .then((fixture) => {
                     fixture.debugElement.componentInstance.form =
                         new FormGroup({'checkbox': new FormControl(true)});
                     fixture.detectChanges();

                     var input = fixture.debugElement.query(By.css('input'));
                     expect(input.nativeElement.checked).toBe(true);

                     input.nativeElement.checked = false;
                     dispatchEvent(input.nativeElement, 'change');

                     expect(fixture.debugElement.componentInstance.form.value).toEqual({
                       'checkbox': false
                     });
                     async.done();
                   });
             }));

      it('should support <type=number>',
         inject(
             [TestComponentBuilder, AsyncTestCompleter],
             (tcb: TestComponentBuilder, async: AsyncTestCompleter) => {
               const t = `<div [formGroup]="form">
                  <input type="number" formControlName="num">
                </div>`;

               tcb.overrideTemplate(MyComp8, t)
                   .overrideProviders(MyComp8, providerArr)
                   .createAsync(MyComp8)
                   .then((fixture) => {
                     fixture.debugElement.componentInstance.form =
                         new FormGroup({'num': new FormControl(10)});
                     fixture.detectChanges();

                     var input = fixture.debugElement.query(By.css('input'));
                     expect(input.nativeElement.value).toEqual('10');

                     input.nativeElement.value = '20';
                     dispatchEvent(input.nativeElement, 'input');

                     expect(fixture.debugElement.componentInstance.form.value).toEqual({'num': 20});
                     async.done();
                   });
             }));

      it('should support <type=number> when value is cleared in the UI',
         inject(
             [TestComponentBuilder, AsyncTestCompleter],
             (tcb: TestComponentBuilder, async: AsyncTestCompleter) => {
               const t = `<div [formGroup]="form">
                  <input type="number" formControlName="num" required>
                </div>`;

               tcb.overrideTemplate(MyComp8, t)
                   .overrideProviders(MyComp8, providerArr)
                   .createAsync(MyComp8)
                   .then((fixture) => {
                     fixture.debugElement.componentInstance.form =
                         new FormGroup({'num': new FormControl(10)});
                     fixture.detectChanges();

                     var input = fixture.debugElement.query(By.css('input'));
                     input.nativeElement.value = '';
                     dispatchEvent(input.nativeElement, 'input');

                     expect(fixture.debugElement.componentInstance.form.valid).toBe(false);
                     expect(fixture.debugElement.componentInstance.form.value).toEqual({
                       'num': null
                     });

                     input.nativeElement.value = '0';
                     dispatchEvent(input.nativeElement, 'input');

                     expect(fixture.debugElement.componentInstance.form.valid).toBe(true);
                     expect(fixture.debugElement.componentInstance.form.value).toEqual({'num': 0});
                     async.done();
                   });
             }));


      it('should support <type=number> when value is cleared programmatically',
         inject(
             [TestComponentBuilder, AsyncTestCompleter],
             (tcb: TestComponentBuilder, async: AsyncTestCompleter) => {
               var form = new FormGroup({'num': new FormControl(10)});
               const t = `<div [formGroup]="form">
                  <input type="number" formControlName="num" [(ngModel)]="data">
                </div>`;

               tcb.overrideTemplate(MyComp8, t)
                   .overrideProviders(MyComp8, providerArr)
                   .createAsync(MyComp8)
                   .then((fixture) => {
                     fixture.debugElement.componentInstance.form = form;
                     fixture.debugElement.componentInstance.data = null;
                     fixture.detectChanges();

                     var input = fixture.debugElement.query(By.css('input'));
                     expect(input.nativeElement.value).toEqual('');

                     async.done();
                   });
             }));

      it('should support <type=radio>',
         inject(
             [TestComponentBuilder, AsyncTestCompleter],
             (tcb: TestComponentBuilder, async: AsyncTestCompleter) => {
               const t = `<form [formGroup]="form">
                  <input type="radio" formControlName="food" value="chicken">
                  <input type="radio" formControlName="food" value="fish">
                </form>`;

               const ctrl = new FormControl('fish');
               tcb.overrideTemplate(MyComp8, t)
                   .overrideProviders(MyComp8, providerArr)
                   .createAsync(MyComp8)
                   .then((fixture) => {
                     fixture.debugElement.componentInstance.form = new FormGroup({'food': ctrl});
                     fixture.detectChanges();

                     var inputs = fixture.debugElement.queryAll(By.css('input'));
                     expect(inputs[0].nativeElement.checked).toEqual(false);
                     expect(inputs[1].nativeElement.checked).toEqual(true);

                     dispatchEvent(inputs[0].nativeElement, 'change');
                     fixture.detectChanges();

                     let value = fixture.debugElement.componentInstance.form.value;
                     expect(value.food).toEqual('chicken');
                     expect(inputs[1].nativeElement.checked).toEqual(false);

                     ctrl.updateValue('fish');
                     fixture.detectChanges();

                     expect(inputs[0].nativeElement.checked).toEqual(false);
                     expect(inputs[1].nativeElement.checked).toEqual(true);

                     async.done();
                   });
             }));

      it('should use formControlName to group radio buttons when name is absent',
         inject(
             [TestComponentBuilder, AsyncTestCompleter],
             (tcb: TestComponentBuilder, async: AsyncTestCompleter) => {
               const t = `<form [formGroup]="form">
                  <input type="radio" formControlName="food" value="chicken">
                  <input type="radio" formControlName="food" value="fish">
                  <input type="radio" formControlName="drink" value="cola">
                  <input type="radio" formControlName="drink" value="sprite">
                </form>`;

               const foodCtrl = new FormControl('fish');
               const drinkCtrl = new FormControl('sprite');
               tcb.overrideTemplate(MyComp8, t)
                   .overrideProviders(MyComp8, providerArr)
                   .createAsync(MyComp8)
                   .then((fixture) => {
                     fixture.debugElement.componentInstance.form =
                         new FormGroup({'food': foodCtrl, 'drink': drinkCtrl});
                     fixture.detectChanges();

                     const inputs = fixture.debugElement.queryAll(By.css('input'));
                     expect(inputs[0].nativeElement.checked).toEqual(false);
                     expect(inputs[1].nativeElement.checked).toEqual(true);
                     expect(inputs[2].nativeElement.checked).toEqual(false);
                     expect(inputs[3].nativeElement.checked).toEqual(true);

                     dispatchEvent(inputs[0].nativeElement, 'change');
                     inputs[0].nativeElement.checked = true;
                     fixture.detectChanges();

                     const value = fixture.debugElement.componentInstance.form.value;
                     expect(value.food).toEqual('chicken');
                     expect(inputs[1].nativeElement.checked).toEqual(false);
                     expect(inputs[2].nativeElement.checked).toEqual(false);
                     expect(inputs[3].nativeElement.checked).toEqual(true);

                     drinkCtrl.updateValue('cola');
                     fixture.detectChanges();

                     expect(inputs[0].nativeElement.checked).toEqual(true);
                     expect(inputs[1].nativeElement.checked).toEqual(false);
                     expect(inputs[2].nativeElement.checked).toEqual(true);
                     expect(inputs[3].nativeElement.checked).toEqual(false);

                     async.done();
                   });
             }));

      it('should throw if radio button name does not match formControlName attr',
         inject(
             [TestComponentBuilder, AsyncTestCompleter],
             (tcb: TestComponentBuilder, async: AsyncTestCompleter) => {
               const t = `<form [formGroup]="form">
                  <input type="radio" formControlName="food" name="drink" value="chicken">
                </form>`;

               tcb.overrideTemplate(MyComp8, t)
                   .overrideProviders(MyComp8, providerArr)
                   .createAsync(MyComp8)
                   .then((fixture) => {
                     fixture.debugElement.componentInstance.form =
                         new FormGroup({'food': new FormControl('fish')});
                     expect(() => fixture.detectChanges())
                         .toThrowError(
                             new RegExp('If you define both a name and a formControlName'));
                     async.done();
                   });
             }));

      it('should support removing controls from <type=radio>',
         inject(
             [TestComponentBuilder, AsyncTestCompleter],
             (tcb: TestComponentBuilder, async: AsyncTestCompleter) => {
               const t = `
                <input type="radio" [formControl]="showRadio" value="yes">
                <input type="radio" [formControl]="showRadio" value="no">
                <form [formGroup]="form">
                  <div *ngIf="showRadio.value === 'yes'">
                    <input type="radio" formControlName="food" value="chicken">
                    <input type="radio" formControlName="food" value="fish">
                  </div>
                </form>`;

               const ctrl = new FormControl('fish');
               const showRadio = new FormControl('yes');
               const form = new FormGroup({'food': ctrl});

               tcb.overrideTemplate(MyComp8, t)
                   .overrideProviders(MyComp8, providerArr)
                   .createAsync(MyComp8)
                   .then((fixture) => {
                     fixture.debugElement.componentInstance.form = form;
                     fixture.debugElement.componentInstance.showRadio = showRadio;
                     showRadio.valueChanges.subscribe((change) => {
                       (change === 'yes') ? form.addControl('food', new FormControl('fish')) :
                                            form.removeControl('food');
                     });
                     fixture.detectChanges();

                     const input = fixture.debugElement.query(By.css('[value="no"]'));
                     dispatchEvent(input.nativeElement, 'change');

                     fixture.detectChanges();
                     expect(form.value).toEqual({});
                     async.done();
                   });
             }));

      describe('should support <select>', () => {
        it('with basic selection',
           inject(
               [TestComponentBuilder, AsyncTestCompleter],
               (tcb: TestComponentBuilder, async: AsyncTestCompleter) => {
                 const t = `<select>
                      <option value="SF"></option>
                      <option value="NYC"></option>
                    </select>`;

                 tcb.overrideTemplate(MyComp8, t)
                     .overrideProviders(MyComp8, providerArr)
                     .createAsync(MyComp8)
                     .then((fixture) => {
                       fixture.detectChanges();

                       var select = fixture.debugElement.query(By.css('select'));
                       var sfOption = fixture.debugElement.query(By.css('option'));

                       expect(select.nativeElement.value).toEqual('SF');
                       expect(sfOption.nativeElement.selected).toBe(true);
                       async.done();
                     });
               }));

        it('with basic selection and value bindings',
           inject(
               [TestComponentBuilder, AsyncTestCompleter],
               (tcb: TestComponentBuilder, async: AsyncTestCompleter) => {
                 const t = `<select>
                      <option *ngFor="let city of list" [value]="city['id']">
                        {{ city['name'] }}
                      </option>
                    </select>`;

                 tcb.overrideTemplate(MyComp8, t)
                     .overrideProviders(MyComp8, providerArr)
                     .createAsync(MyComp8)
                     .then((fixture) => {
                       var testComp = fixture.debugElement.componentInstance;
                       testComp.list = [{'id': '0', 'name': 'SF'}, {'id': '1', 'name': 'NYC'}];
                       fixture.detectChanges();

                       var sfOption = fixture.debugElement.query(By.css('option'));
                       expect(sfOption.nativeElement.value).toEqual('0');

                       testComp.list[0]['id'] = '2';
                       fixture.detectChanges();
                       expect(sfOption.nativeElement.value).toEqual('2');
                       async.done();
                     });
               }));

        it('with ngControl',
           inject(
               [TestComponentBuilder, AsyncTestCompleter],
               (tcb: TestComponentBuilder, async: AsyncTestCompleter) => {
                 const t = `<div [formGroup]="form">
                    <select formControlName="city">
                      <option value="SF"></option>
                      <option value="NYC"></option>
                    </select>
                  </div>`;

                 tcb.overrideTemplate(MyComp8, t)
                     .overrideProviders(MyComp8, providerArr)
                     .createAsync(MyComp8)
                     .then((fixture) => {
                       fixture.debugElement.componentInstance.form =
                           new FormGroup({'city': new FormControl('SF')});
                       fixture.detectChanges();

                       var select = fixture.debugElement.query(By.css('select'));
                       var sfOption = fixture.debugElement.query(By.css('option'));


                       expect(select.nativeElement.value).toEqual('SF');
                       expect(sfOption.nativeElement.selected).toBe(true);

                       select.nativeElement.value = 'NYC';
                       dispatchEvent(select.nativeElement, 'change');

                       expect(fixture.debugElement.componentInstance.form.value).toEqual({
                         'city': 'NYC'
                       });
                       expect(sfOption.nativeElement.selected).toBe(false);
                       async.done();
                     });
               }));

        it('with a dynamic list of options',
           fakeAsync(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
             const t = `<div [formGroup]="form">
                      <select formControlName="city">
                        <option *ngFor="let c of data" [value]="c"></option>
                      </select>
                  </div>`;

             var fixture: any /** TODO #9100 */;
             tcb.overrideTemplate(MyComp8, t)
                 .createAsync(MyComp8)
                 .then((compFixture) => fixture = compFixture);
             tick();

             fixture.debugElement.componentInstance.form =
                 new FormGroup({'city': new FormControl('NYC')});

             fixture.debugElement.componentInstance.data = ['SF', 'NYC'];
             fixture.detectChanges();
             tick();

             var select = fixture.debugElement.query(By.css('select'));
             expect(select.nativeElement.value).toEqual('NYC');
           })));

        it('with option values that are objects',
           fakeAsync(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
             const t = `<div>
                      <select [(ngModel)]="selectedCity">
                        <option *ngFor="let c of list" [ngValue]="c">{{c['name']}}</option>
                      </select>
                  </div>`;

             tcb.overrideTemplate(MyComp8, t)
                 .overrideProviders(MyComp8, providerArr)
                 .createAsync(MyComp8)
                 .then((fixture) => {

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

             tcb.overrideTemplate(MyComp8, t)
                 .overrideProviders(MyComp8, providerArr)
                 .createAsync(MyComp8)
                 .then((fixture) => {

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

                 tcb.overrideTemplate(MyComp8, t)
                     .overrideProviders(MyComp8, providerArr)
                     .createAsync(MyComp8)
                     .then((fixture) => {

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
             tcb.overrideTemplate(MyComp8, t)
                 .overrideProviders(MyComp8, providerArr)
                 .createAsync(MyComp8)
                 .then((fixture) => {

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

             tcb.overrideTemplate(MyComp8, t)
                 .overrideProviders(MyComp8, providerArr)
                 .createAsync(MyComp8)
                 .then((fixture) => {

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

             tcb.overrideTemplate(MyComp8, t)
                 .overrideProviders(MyComp8, providerArr)
                 .createAsync(MyComp8)
                 .then((fixture) => {

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
           inject(
               [TestComponentBuilder, AsyncTestCompleter],
               (tcb: TestComponentBuilder, async: AsyncTestCompleter) => {
                 const t = `<div>
                      <select [(ngModel)]="selectedCity">
                        <option *ngFor="let c of list" [ngValue]="c">{{c['name']}}</option>
                      </select>
                  </div>`;

                 tcb.overrideTemplate(MyComp8, t)
                     .overrideProviders(MyComp8, providerArr)
                     .createAsync(MyComp8)
                     .then((fixture) => {

                       var testComp = fixture.debugElement.componentInstance;
                       testComp.list = [{'name': 'SF'}, {'name': 'NYC'}, {'name': 'NYC'}];
                       testComp.selectedCity = testComp.list[0];
                       fixture.detectChanges();

                       testComp.selectedCity = testComp.list[2];
                       fixture.detectChanges();

                       var select = fixture.debugElement.query(By.css('select'));
                       var secondNYC = fixture.debugElement.queryAll(By.css('option'))[2];

                       expect(select.nativeElement.value).toEqual('2: Object');
                       expect(secondNYC.nativeElement.selected).toBe(true);
                       async.done();
                     });
               }));
      });

      it('should support custom value accessors',
         inject(
             [TestComponentBuilder, AsyncTestCompleter],
             (tcb: TestComponentBuilder, async: AsyncTestCompleter) => {
               const t = `<div [formGroup]="form">
                  <input type="text" formControlName="name" wrapped-value>
                </div>`;

               tcb.overrideTemplate(MyComp8, t)
                   .overrideProviders(MyComp8, providerArr)
                   .createAsync(MyComp8)
                   .then((fixture) => {
                     fixture.debugElement.componentInstance.form =
                         new FormGroup({'name': new FormControl('aa')});
                     fixture.detectChanges();
                     var input = fixture.debugElement.query(By.css('input'));
                     expect(input.nativeElement.value).toEqual('!aa!');

                     input.nativeElement.value = '!bb!';
                     dispatchEvent(input.nativeElement, 'input');

                     expect(fixture.debugElement.componentInstance.form.value).toEqual({
                       'name': 'bb'
                     });
                     async.done();
                   });
             }));

      it('should support custom value accessors on non builtin input elements that fire a change event without a \'target\' property',
         inject(
             [TestComponentBuilder, AsyncTestCompleter],
             (tcb: TestComponentBuilder, async: AsyncTestCompleter) => {
               const t = `<div [formGroup]="form">
                  <my-input formControlName="name"></my-input>
                </div>`;

               tcb.overrideTemplate(MyComp8, t)
                   .overrideProviders(MyComp8, providerArr)
                   .createAsync(MyComp8)
                   .then((fixture) => {
                     fixture.debugElement.componentInstance.form =
                         new FormGroup({'name': new FormControl('aa')});
                     fixture.detectChanges();
                     var input = fixture.debugElement.query(By.css('my-input'));
                     expect(input.componentInstance.value).toEqual('!aa!');

                     input.componentInstance.value = '!bb!';
                     ObservableWrapper.subscribe(input.componentInstance.onInput, (value) => {
                       expect(fixture.debugElement.componentInstance.form.value).toEqual({
                         'name': 'bb'
                       });
                       async.done();
                     });
                     input.componentInstance.dispatchChangeEvent();
                   });
             }));

    });

    describe('validations', () => {
      it('should use sync validators defined in html',
         inject(
             [TestComponentBuilder, AsyncTestCompleter],
             (tcb: TestComponentBuilder, async: AsyncTestCompleter) => {
               var form = new FormGroup({
                 'login': new FormControl(''),
                 'min': new FormControl(''),
                 'max': new FormControl('')
               });

               const t = `<div [formGroup]="form" login-is-empty-validator>
                    <input type="text" formControlName="login" required>
                    <input type="text" formControlName="min" minlength="3">
                    <input type="text" formControlName="max" maxlength="3">
                 </div>`;

               tcb.overrideTemplate(MyComp8, t)
                   .overrideProviders(MyComp8, providerArr)
                   .createAsync(MyComp8)
                   .then((fixture) => {
                     fixture.debugElement.componentInstance.form = form;
                     fixture.detectChanges();

                     var required = fixture.debugElement.query(By.css('[required]'));
                     var minLength = fixture.debugElement.query(By.css('[minlength]'));
                     var maxLength = fixture.debugElement.query(By.css('[maxlength]'));

                     required.nativeElement.value = '';
                     minLength.nativeElement.value = '1';
                     maxLength.nativeElement.value = '1234';
                     dispatchEvent(required.nativeElement, 'input');
                     dispatchEvent(minLength.nativeElement, 'input');
                     dispatchEvent(maxLength.nativeElement, 'input');

                     expect(form.hasError('required', ['login'])).toEqual(true);
                     expect(form.hasError('minlength', ['min'])).toEqual(true);
                     expect(form.hasError('maxlength', ['max'])).toEqual(true);

                     expect(form.hasError('loginIsEmpty')).toEqual(true);

                     required.nativeElement.value = '1';
                     minLength.nativeElement.value = '123';
                     maxLength.nativeElement.value = '123';
                     dispatchEvent(required.nativeElement, 'input');
                     dispatchEvent(minLength.nativeElement, 'input');
                     dispatchEvent(maxLength.nativeElement, 'input');

                     expect(form.valid).toEqual(true);

                     async.done();
                   });
             }));

      it('should use async validators defined in the html',
         fakeAsync(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
           var form = new FormGroup({'login': new FormControl('')});

           const t = `<div [formGroup]="form">
                    <input type="text" formControlName="login" uniq-login-validator="expected">
                 </div>`;

           var rootTC: any /** TODO #9100 */;
           tcb.overrideTemplate(MyComp8, t).createAsync(MyComp8).then((root) => rootTC = root);
           tick();

           rootTC.debugElement.componentInstance.form = form;
           rootTC.detectChanges();

           expect(form.pending).toEqual(true);

           tick(100);

           expect(form.hasError('uniqLogin', ['login'])).toEqual(true);

           var input = rootTC.debugElement.query(By.css('input'));
           input.nativeElement.value = 'expected';
           dispatchEvent(input.nativeElement, 'input');
           tick(100);

           expect(form.valid).toEqual(true);
         })));

      it('should use sync validators defined in the model',
         inject(
             [TestComponentBuilder, AsyncTestCompleter],
             (tcb: TestComponentBuilder, async: AsyncTestCompleter) => {
               var form = new FormGroup({'login': new FormControl('aa', Validators.required)});

               const t = `<div [formGroup]="form">
                  <input type="text" formControlName="login">
                 </div>`;

               tcb.overrideTemplate(MyComp8, t)
                   .overrideProviders(MyComp8, providerArr)
                   .createAsync(MyComp8)
                   .then((fixture) => {
                     fixture.debugElement.componentInstance.form = form;
                     fixture.detectChanges();
                     expect(form.valid).toEqual(true);

                     var input = fixture.debugElement.query(By.css('input'));

                     input.nativeElement.value = '';
                     dispatchEvent(input.nativeElement, 'input');

                     expect(form.valid).toEqual(false);
                     async.done();
                   });
             }));

      it('should use async validators defined in the model',
         fakeAsync(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
           var control =
               new FormControl('', Validators.required, uniqLoginAsyncValidator('expected'));
           var form = new FormGroup({'login': control});

           const t = `<div [formGroup]="form">
                  <input type="text" formControlName="login">
                 </div>`;

           var fixture: any /** TODO #9100 */;
           tcb.overrideTemplate(MyComp8, t).createAsync(MyComp8).then((root) => fixture = root);
           tick();

           fixture.debugElement.componentInstance.form = form;
           fixture.detectChanges();

           expect(form.hasError('required', ['login'])).toEqual(true);

           var input = fixture.debugElement.query(By.css('input'));
           input.nativeElement.value = 'wrong value';
           dispatchEvent(input.nativeElement, 'input');

           expect(form.pending).toEqual(true);
           tick();

           expect(form.hasError('uniqLogin', ['login'])).toEqual(true);

           input.nativeElement.value = 'expected';
           dispatchEvent(input.nativeElement, 'input');
           tick();

           expect(form.valid).toEqual(true);
         })));
    });

    describe('nested forms', () => {
      it('should init DOM with the given form object',
         inject(
             [TestComponentBuilder, AsyncTestCompleter],
             (tcb: TestComponentBuilder, async: AsyncTestCompleter) => {
               var form =
                   new FormGroup({'nested': new FormGroup({'login': new FormControl('value')})});

               const t = `<div [formGroup]="form">
                  <div formGroupName="nested">
                    <input type="text" formControlName="login">
                  </div>
              </div>`;

               tcb.overrideTemplate(MyComp8, t)
                   .overrideProviders(MyComp8, providerArr)
                   .createAsync(MyComp8)
                   .then((fixture) => {
                     fixture.debugElement.componentInstance.form = form;
                     fixture.detectChanges();

                     var input = fixture.debugElement.query(By.css('input'));
                     expect(input.nativeElement.value).toEqual('value');
                     async.done();
                   });
             }));

      it('should update the control group values on DOM change',
         inject(
             [TestComponentBuilder, AsyncTestCompleter],
             (tcb: TestComponentBuilder, async: AsyncTestCompleter) => {
               var form =
                   new FormGroup({'nested': new FormGroup({'login': new FormControl('value')})});

               const t = `<div [formGroup]="form">
                    <div formGroupName="nested">
                      <input type="text" formControlName="login">
                    </div>
                </div>`;

               tcb.overrideTemplate(MyComp8, t)
                   .overrideProviders(MyComp8, providerArr)
                   .createAsync(MyComp8)
                   .then((fixture) => {
                     fixture.debugElement.componentInstance.form = form;
                     fixture.detectChanges();
                     var input = fixture.debugElement.query(By.css('input'));

                     input.nativeElement.value = 'updatedValue';
                     dispatchEvent(input.nativeElement, 'input');

                     expect(form.value).toEqual({'nested': {'login': 'updatedValue'}});
                     async.done();
                   });
             }));
    });

    it('should support ngModel for complex forms',
       fakeAsync(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
         var form = new FormGroup({'name': new FormControl('')});

         const t =
             `<div [formGroup]="form"><input type="text" formControlName="name" [(ngModel)]="name"></div>`;

         let fixture = tcb.overrideTemplate(MyComp8, t).createFakeAsync(MyComp8);
         tick();

         fixture.debugElement.componentInstance.name = 'oldValue';
         fixture.debugElement.componentInstance.form = form;
         fixture.detectChanges();

         var input = fixture.debugElement.query(By.css('input')).nativeElement;
         expect(input.value).toEqual('oldValue');

         input.value = 'updatedValue';
         dispatchEvent(input, 'input');

         tick();
         expect(fixture.debugElement.componentInstance.name).toEqual('updatedValue');
       })));

    it('should support ngModel for single fields',
       fakeAsync(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
         var form = new FormControl('');

         const t = `<div><input type="text" [formControl]="form" [(ngModel)]="name"></div>`;

         let fixture = tcb.overrideTemplate(MyComp8, t).createFakeAsync(MyComp8);
         tick();
         fixture.debugElement.componentInstance.form = form;
         fixture.debugElement.componentInstance.name = 'oldValue';
         fixture.detectChanges();

         var input = fixture.debugElement.query(By.css('input')).nativeElement;
         expect(input.value).toEqual('oldValue');

         input.value = 'updatedValue';
         dispatchEvent(input, 'input');
         tick();

         expect(fixture.debugElement.componentInstance.name).toEqual('updatedValue');
       })));

    describe('template-driven forms', () => {
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

           ObservableWrapper.subscribe(
               form.valueChanges, (value: string) => { formValue = value; });

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

               tcb.overrideTemplate(MyComp8, t)
                   .overrideProviders(MyComp8, providerArr)
                   .createAsync(MyComp8)
                   .then((fixture) => {
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


      it('should throw if ngModel has a parent form but no name attr or standalone label',
         inject(
             [TestComponentBuilder, AsyncTestCompleter],
             (tcb: TestComponentBuilder, async: AsyncTestCompleter) => {
               const t = `<form>
                  <input [(ngModel)]="name">
                </form>`;

               tcb.overrideTemplate(MyComp8, t)
                   .overrideProviders(MyComp8, providerArr)
                   .createAsync(MyComp8)
                   .then((fixture) => {
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

               tcb.overrideTemplate(MyComp8, t)
                   .overrideProviders(MyComp8, providerArr)
                   .createAsync(MyComp8)
                   .then((fixture) => {
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


    describe('setting status classes', () => {
      it('should work with single fields',
         inject(
             [TestComponentBuilder, AsyncTestCompleter],
             (tcb: TestComponentBuilder, async: AsyncTestCompleter) => {
               var form = new FormControl('', Validators.required);

               const t = `<div><input type="text" [formControl]="form"></div>`;

               tcb.overrideTemplate(MyComp8, t)
                   .overrideProviders(MyComp8, providerArr)
                   .createAsync(MyComp8)
                   .then((fixture) => {
                     fixture.debugElement.componentInstance.form = form;
                     fixture.detectChanges();

                     var input = fixture.debugElement.query(By.css('input')).nativeElement;
                     expect(sortedClassList(input)).toEqual([
                       'ng-invalid', 'ng-pristine', 'ng-untouched'
                     ]);

                     dispatchEvent(input, 'blur');
                     fixture.detectChanges();

                     expect(sortedClassList(input)).toEqual([
                       'ng-invalid', 'ng-pristine', 'ng-touched'
                     ]);

                     input.value = 'updatedValue';
                     dispatchEvent(input, 'input');
                     fixture.detectChanges();

                     expect(sortedClassList(input)).toEqual(['ng-dirty', 'ng-touched', 'ng-valid']);
                     async.done();
                   });
             }));

      it('should work with complex model-driven forms',
         inject(
             [TestComponentBuilder, AsyncTestCompleter],
             (tcb: TestComponentBuilder, async: AsyncTestCompleter) => {
               var form = new FormGroup({'name': new FormControl('', Validators.required)});

               const t =
                   `<form [formGroup]="form"><input type="text" formControlName="name"></form>`;

               tcb.overrideTemplate(MyComp8, t)
                   .overrideProviders(MyComp8, providerArr)
                   .createAsync(MyComp8)
                   .then((fixture) => {
                     fixture.debugElement.componentInstance.form = form;
                     fixture.detectChanges();

                     var input = fixture.debugElement.query(By.css('input')).nativeElement;
                     expect(sortedClassList(input)).toEqual([
                       'ng-invalid', 'ng-pristine', 'ng-untouched'
                     ]);

                     dispatchEvent(input, 'blur');
                     fixture.detectChanges();

                     expect(sortedClassList(input)).toEqual([
                       'ng-invalid', 'ng-pristine', 'ng-touched'
                     ]);

                     input.value = 'updatedValue';
                     dispatchEvent(input, 'input');
                     fixture.detectChanges();

                     expect(sortedClassList(input)).toEqual(['ng-dirty', 'ng-touched', 'ng-valid']);
                     async.done();
                   });
             }));

      it('should work with ngModel',
         inject(
             [TestComponentBuilder, AsyncTestCompleter],
             (tcb: TestComponentBuilder, async: AsyncTestCompleter) => {
               const t = `<div><input [(ngModel)]="name" required></div>`;

               tcb.overrideTemplate(MyComp8, t)
                   .overrideProviders(MyComp8, providerArr)
                   .createAsync(MyComp8)
                   .then((fixture) => {
                     fixture.debugElement.componentInstance.name = '';
                     fixture.detectChanges();

                     var input = fixture.debugElement.query(By.css('input')).nativeElement;
                     expect(sortedClassList(input)).toEqual([
                       'ng-invalid', 'ng-pristine', 'ng-untouched'
                     ]);

                     dispatchEvent(input, 'blur');
                     fixture.detectChanges();

                     expect(sortedClassList(input)).toEqual([
                       'ng-invalid', 'ng-pristine', 'ng-touched'
                     ]);

                     input.value = 'updatedValue';
                     dispatchEvent(input, 'input');
                     fixture.detectChanges();

                     expect(sortedClassList(input)).toEqual(['ng-dirty', 'ng-touched', 'ng-valid']);
                     async.done();
                   });
             }));
    });

    describe('ngModel corner cases', () => {
      it('should not update the view when the value initially came from the view',
         fakeAsync(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
           var form = new FormControl('');

           const t = `<div><input type="text" [formControl]="form" [(ngModel)]="name"></div>`;
           let fixture = tcb.overrideTemplate(MyComp8, t).createFakeAsync(MyComp8);
           tick();
           fixture.debugElement.componentInstance.form = form;
           fixture.detectChanges();

           var input = fixture.debugElement.query(By.css('input')).nativeElement;
           input.value = 'aa';
           input.setSelectionRange(1, 2);
           dispatchEvent(input, 'input');

           tick();
           fixture.detectChanges();

           // selection start has not changed because we did not reset the value
           expect(input.selectionStart).toEqual(1);
         })));

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

           tick();
           fixture.detectChanges();
           expect(fixture.debugElement.componentInstance.name).toEqual('aa');

           // Programatically update the input value to be "bb".
           fixture.debugElement.componentInstance.name = 'bb';
           tick();
           fixture.detectChanges();
           expect(input.value).toEqual('bb');

           // Programatically set it back to "aa".
           fixture.debugElement.componentInstance.name = 'aa';
           tick();
           fixture.detectChanges();
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
}

@Directive({
  selector: '[wrapped-value]',
  host: {'(input)': 'handleOnInput($event.target.value)', '[value]': 'value'}
})
class WrappedValue implements ControlValueAccessor {
  value: any /** TODO #9100 */;
  onChange: Function;

  constructor(cd: NgControl) { cd.valueAccessor = this; }

  writeValue(value: any /** TODO #9100 */) { this.value = `!${value}!`; }

  registerOnChange(fn: any /** TODO #9100 */) { this.onChange = fn; }
  registerOnTouched(fn: any /** TODO #9100 */) {}

  handleOnInput(value: any /** TODO #9100 */) {
    this.onChange(value.substring(1, value.length - 1));
  }
}

@Component({selector: 'my-input', template: ''})
class MyInput implements ControlValueAccessor {
  @Output('input') onInput = new EventEmitter();
  value: string;

  constructor(cd: NgControl) { cd.valueAccessor = this; }

  writeValue(value: any /** TODO #9100 */) { this.value = `!${value}!`; }

  registerOnChange(fn: any /** TODO #9100 */) { ObservableWrapper.subscribe(this.onInput, fn); }

  registerOnTouched(fn: any /** TODO #9100 */) {}

  dispatchChangeEvent() {
    ObservableWrapper.callEmit(this.onInput, this.value.substring(1, this.value.length - 1));
  }
}

function uniqLoginAsyncValidator(expectedValue: string) {
  return (c: any /** TODO #9100 */) => {
    var completer = PromiseWrapper.completer();
    var res = (c.value == expectedValue) ? null : {'uniqLogin': true};
    completer.resolve(res);
    return completer.promise;
  };
}

function loginIsEmptyGroupValidator(c: FormGroup) {
  return c.controls['login'].value == '' ? {'loginIsEmpty': true} : null;
}

@Directive({
  selector: '[login-is-empty-validator]',
  providers: [
    /* @ts2dart_Provider */ {
      provide: NG_VALIDATORS,
      useValue: loginIsEmptyGroupValidator,
      multi: true
    }
  ]
})
class LoginIsEmptyValidator {
}

@Directive({
  selector: '[uniq-login-validator]',
  providers: [{
    provide: NG_ASYNC_VALIDATORS,
    useExisting: forwardRef(() => UniqLoginValidator),
    multi: true
  }]
})
class UniqLoginValidator implements Validator {
  @Input('uniq-login-validator') expected: any /** TODO #9100 */;

  validate(c: any /** TODO #9100 */) { return uniqLoginAsyncValidator(this.expected)(c); }
}

@Component({
  selector: 'my-comp',
  template: '',
  directives: [
    FORM_DIRECTIVES, WrappedValue, MyInput, NgIf, NgFor, LoginIsEmptyValidator, UniqLoginValidator,
    REACTIVE_FORM_DIRECTIVES
  ],
  providers: [FORM_PROVIDERS]
})
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
