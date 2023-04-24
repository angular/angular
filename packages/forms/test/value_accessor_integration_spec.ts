/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Directive, EventEmitter, Input, Output, Type, ViewChild} from '@angular/core';
import {ComponentFixture, fakeAsync, TestBed, tick, waitForAsync} from '@angular/core/testing';
import {AbstractControl, ControlValueAccessor, FormControl, FormGroup, FormsModule, NG_VALIDATORS, NG_VALUE_ACCESSOR, NgControl, NgForm, NgModel, ReactiveFormsModule, Validators} from '@angular/forms';
import {By} from '@angular/platform-browser/src/dom/debug/by';
import {dispatchEvent} from '@angular/platform-browser/testing/src/browser_util';

{
  describe('value accessors', () => {
    function initTest<T>(component: Type<T>, ...directives: Type<any>[]): ComponentFixture<T> {
      TestBed.configureTestingModule(
          {declarations: [component, ...directives], imports: [FormsModule, ReactiveFormsModule]});
      return TestBed.createComponent(component);
    }

    it('should support <input> without type', () => {
      TestBed.overrideComponent(
          FormControlComp, {set: {template: `<input [formControl]="control">`}});
      const fixture = initTest(FormControlComp);
      const control = new FormControl('old');
      fixture.componentInstance.control = control;
      fixture.detectChanges();

      // model -> view
      const input = fixture.debugElement.query(By.css('input'));
      expect(input.nativeElement.value).toEqual('old');

      input.nativeElement.value = 'new';
      dispatchEvent(input.nativeElement, 'input');

      // view -> model
      expect(control.value).toEqual('new');
    });

    it('should support <input type=text>', () => {
      const fixture = initTest(FormGroupComp);
      const form = new FormGroup({'login': new FormControl('old')});
      fixture.componentInstance.form = form;
      fixture.detectChanges();

      // model -> view
      const input = fixture.debugElement.query(By.css('input'));
      expect(input.nativeElement.value).toEqual('old');

      input.nativeElement.value = 'new';
      dispatchEvent(input.nativeElement, 'input');

      // view -> model
      expect(form.value).toEqual({'login': 'new'});
    });

    it('should ignore the change event for <input type=text>', () => {
      const fixture = initTest(FormGroupComp);
      const form = new FormGroup({'login': new FormControl('oldValue')});
      fixture.componentInstance.form = form;
      fixture.detectChanges();

      const input = fixture.debugElement.query(By.css('input'));
      form.valueChanges.subscribe({
        next: (value) => {
          throw 'Should not happen';
        }
      });
      input.nativeElement.value = 'updatedValue';

      dispatchEvent(input.nativeElement, 'change');
    });

    it('should support <textarea>', () => {
      TestBed.overrideComponent(
          FormControlComp, {set: {template: `<textarea [formControl]="control"></textarea>`}});
      const fixture = initTest(FormControlComp);
      const control = new FormControl('old');
      fixture.componentInstance.control = control;
      fixture.detectChanges();

      // model -> view
      const textarea = fixture.debugElement.query(By.css('textarea'));
      expect(textarea.nativeElement.value).toEqual('old');

      textarea.nativeElement.value = 'new';
      dispatchEvent(textarea.nativeElement, 'input');

      // view -> model
      expect(control.value).toEqual('new');
    });

    it('should support <type=checkbox>', () => {
      TestBed.overrideComponent(
          FormControlComp, {set: {template: `<input type="checkbox" [formControl]="control">`}});
      const fixture = initTest(FormControlComp);
      const control = new FormControl(true);
      fixture.componentInstance.control = control;
      fixture.detectChanges();

      // model -> view
      const input = fixture.debugElement.query(By.css('input'));
      expect(input.nativeElement.checked).toBe(true);

      input.nativeElement.checked = false;
      dispatchEvent(input.nativeElement, 'change');

      // view -> model
      expect(control.value).toBe(false);
    });

    describe('should support <type=number>', () => {
      it('with basic use case', () => {
        const fixture = initTest(FormControlNumberInput);
        const control = new FormControl(10);
        fixture.componentInstance.control = control;
        fixture.detectChanges();

        // model -> view
        const input = fixture.debugElement.query(By.css('input'));
        expect(input.nativeElement.value).toEqual('10');

        input.nativeElement.value = '20';
        dispatchEvent(input.nativeElement, 'input');

        // view -> model
        expect(control.value).toEqual(20);
      });

      it('when value is cleared in the UI', () => {
        const fixture = initTest(FormControlNumberInput);
        const control = new FormControl(10, Validators.required);
        fixture.componentInstance.control = control;
        fixture.detectChanges();

        const input = fixture.debugElement.query(By.css('input'));
        input.nativeElement.value = '';
        dispatchEvent(input.nativeElement, 'input');

        expect(control.valid).toBe(false);
        expect(control.value).toEqual(null);

        input.nativeElement.value = '0';
        dispatchEvent(input.nativeElement, 'input');

        expect(control.valid).toBe(true);
        expect(control.value).toEqual(0);
      });

      it('should ignore the change event', () => {
        const fixture = initTest(FormControlNumberInput);
        const control = new FormControl();
        fixture.componentInstance.control = control;
        fixture.detectChanges();

        control.valueChanges.subscribe({
          next: (value) => {
            throw 'Input[number] should not react to change event';
          }
        });
        const input = fixture.debugElement.query(By.css('input'));

        input.nativeElement.value = '5';
        dispatchEvent(input.nativeElement, 'change');
      });

      it('when value is cleared programmatically', () => {
        const fixture = initTest(FormControlNumberInput);
        const control = new FormControl(10);
        fixture.componentInstance.control = control;
        fixture.detectChanges();

        control.setValue(null);

        const input = fixture.debugElement.query(By.css('input'));
        expect(input.nativeElement.value).toEqual('');
      });
    });

    describe('select controls', () => {
      describe('in reactive forms', () => {
        it(`should support primitive values`, () => {
          if (isNode) return;
          const fixture = initTest(FormControlNameSelect);
          fixture.detectChanges();

          // model -> view
          const select = fixture.debugElement.query(By.css('select'));
          const sfOption = fixture.debugElement.query(By.css('option'));
          expect(select.nativeElement.value).toEqual('SF');
          expect(sfOption.nativeElement.selected).toBe(true);

          select.nativeElement.value = 'NY';
          dispatchEvent(select.nativeElement, 'change');
          fixture.detectChanges();

          // view -> model
          expect(sfOption.nativeElement.selected).toBe(false);
          expect(fixture.componentInstance.form.value).toEqual({'city': 'NY'});
        });

        it(`should support objects`, () => {
          if (isNode) return;
          const fixture = initTest(FormControlSelectNgValue);
          fixture.detectChanges();

          // model -> view
          const select = fixture.debugElement.query(By.css('select'));
          const sfOption = fixture.debugElement.query(By.css('option'));
          expect(select.nativeElement.value).toEqual('0: Object');
          expect(sfOption.nativeElement.selected).toBe(true);
        });

        it('should throw an error if compareWith is not a function', () => {
          const fixture = initTest(FormControlSelectWithCompareFn);
          fixture.componentInstance.compareFn = null!;
          expect(() => fixture.detectChanges())
              .toThrowError(/compareWith must be a function, but received null/);
        });

        it('should compare options using provided compareWith function', () => {
          if (isNode) return;
          const fixture = initTest(FormControlSelectWithCompareFn);
          fixture.detectChanges();

          const select = fixture.debugElement.query(By.css('select'));
          const sfOption = fixture.debugElement.query(By.css('option'));
          expect(select.nativeElement.value).toEqual('0: Object');
          expect(sfOption.nativeElement.selected).toBe(true);
        });

        it('should support re-assigning the options array with compareWith', () => {
          if (isNode) return;
          const fixture = initTest(FormControlSelectWithCompareFn);
          fixture.detectChanges();

          // Option IDs start out as 0 and 1, so setting the select value to "1: Object"
          // will select the second option (NY).
          const select = fixture.debugElement.query(By.css('select'));
          select.nativeElement.value = '1: Object';
          dispatchEvent(select.nativeElement, 'change');
          fixture.detectChanges();

          expect(fixture.componentInstance.form.value).toEqual({city: {id: 2, name: 'NY'}});

          fixture.componentInstance.cities = [{id: 1, name: 'SF'}, {id: 2, name: 'NY'}];
          fixture.detectChanges();

          // Now that the options array has been re-assigned, new option instances will
          // be created by ngFor. These instances will have different option IDs, subsequent
          // to the first: 2 and 3. For the second option to stay selected, the select
          // value will need to have the ID of the current second option: 3.
          const nyOption = fixture.debugElement.queryAll(By.css('option'))[1];
          expect(select.nativeElement.value).toEqual('3: Object');
          expect(nyOption.nativeElement.selected).toBe(true);
        });
      });

      describe('in template-driven forms', () => {
        it('with option values that are objects', fakeAsync(() => {
             if (isNode) return;
             const fixture = initTest(NgModelSelectForm);
             const comp = fixture.componentInstance;
             comp.cities = [{'name': 'SF'}, {'name': 'NYC'}, {'name': 'Buffalo'}];
             comp.selectedCity = comp.cities[1];
             fixture.detectChanges();
             tick();

             const select = fixture.debugElement.query(By.css('select'));
             const nycOption = fixture.debugElement.queryAll(By.css('option'))[1];

             // model -> view
             expect(select.nativeElement.value).toEqual('1: Object');
             expect(nycOption.nativeElement.selected).toBe(true);

             select.nativeElement.value = '2: Object';
             dispatchEvent(select.nativeElement, 'change');
             fixture.detectChanges();
             tick();

             // view -> model
             expect(comp.selectedCity['name']).toEqual('Buffalo');
           }));

        it('when new options are added', fakeAsync(() => {
             if (isNode) return;
             const fixture = initTest(NgModelSelectForm);
             const comp = fixture.componentInstance;
             comp.cities = [{'name': 'SF'}, {'name': 'NYC'}];
             comp.selectedCity = comp.cities[1];
             fixture.detectChanges();
             tick();

             comp.cities.push({'name': 'Buffalo'});
             comp.selectedCity = comp.cities[2];
             fixture.detectChanges();
             tick();

             const select = fixture.debugElement.query(By.css('select'));
             const buffalo = fixture.debugElement.queryAll(By.css('option'))[2];
             expect(select.nativeElement.value).toEqual('2: Object');
             expect(buffalo.nativeElement.selected).toBe(true);
           }));

        it('when options are removed', fakeAsync(() => {
             const fixture = initTest(NgModelSelectForm);
             const comp = fixture.componentInstance;
             comp.cities = [{'name': 'SF'}, {'name': 'NYC'}];
             comp.selectedCity = comp.cities[1];
             fixture.detectChanges();
             tick();

             const select = fixture.debugElement.query(By.css('select'));
             expect(select.nativeElement.value).toEqual('1: Object');

             comp.cities.pop();
             fixture.detectChanges();
             tick();

             expect(select.nativeElement.value).not.toEqual('1: Object');
           }));

        it('when option values have same content, but different identities', fakeAsync(() => {
             if (isNode) return;
             const fixture = initTest(NgModelSelectForm);
             const comp = fixture.componentInstance;
             comp.cities = [{'name': 'SF'}, {'name': 'NYC'}, {'name': 'NYC'}];
             comp.selectedCity = comp.cities[0];
             fixture.detectChanges();

             comp.selectedCity = comp.cities[2];
             fixture.detectChanges();
             tick();

             const select = fixture.debugElement.query(By.css('select'));
             const secondNYC = fixture.debugElement.queryAll(By.css('option'))[2];
             expect(select.nativeElement.value).toEqual('2: Object');
             expect(secondNYC.nativeElement.selected).toBe(true);
           }));

        it('should work with null option', fakeAsync(() => {
             const fixture = initTest(NgModelSelectWithNullForm);
             const comp = fixture.componentInstance;
             comp.cities = [{'name': 'SF'}, {'name': 'NYC'}];
             comp.selectedCity = null;
             fixture.detectChanges();

             const select = fixture.debugElement.query(By.css('select'));

             select.nativeElement.value = '2: Object';
             dispatchEvent(select.nativeElement, 'change');
             fixture.detectChanges();
             tick();
             expect(comp.selectedCity!['name']).toEqual('NYC');

             select.nativeElement.value = '0: null';
             dispatchEvent(select.nativeElement, 'change');
             fixture.detectChanges();
             tick();
             expect(comp.selectedCity).toEqual(null);
           }));

        it('should throw an error when compareWith is not a function', () => {
          const fixture = initTest(NgModelSelectWithCustomCompareFnForm);
          const comp = fixture.componentInstance;
          comp.compareFn = null!;
          expect(() => fixture.detectChanges())
              .toThrowError(/compareWith must be a function, but received null/);
        });

        it('should compare options using provided compareWith function', fakeAsync(() => {
             if (isNode) return;
             const fixture = initTest(NgModelSelectWithCustomCompareFnForm);
             const comp = fixture.componentInstance;
             comp.selectedCity = {id: 1, name: 'SF'};
             comp.cities = [{id: 1, name: 'SF'}, {id: 2, name: 'LA'}];
             fixture.detectChanges();
             tick();

             const select = fixture.debugElement.query(By.css('select'));
             const sfOption = fixture.debugElement.query(By.css('option'));
             expect(select.nativeElement.value).toEqual('0: Object');
             expect(sfOption.nativeElement.selected).toBe(true);
           }));

        it('should support re-assigning the options array with compareWith', fakeAsync(() => {
             if (isNode) return;
             const fixture = initTest(NgModelSelectWithCustomCompareFnForm);
             fixture.componentInstance.selectedCity = {id: 1, name: 'SF'};
             fixture.componentInstance.cities = [{id: 1, name: 'SF'}, {id: 2, name: 'NY'}];
             fixture.detectChanges();
             tick();

             // Option IDs start out as 0 and 1, so setting the select value to "1: Object"
             // will select the second option (NY).
             const select = fixture.debugElement.query(By.css('select'));
             select.nativeElement.value = '1: Object';
             dispatchEvent(select.nativeElement, 'change');
             fixture.detectChanges();

             const model = fixture.debugElement.children[0].injector.get(NgModel);
             expect(model.value).toEqual({id: 2, name: 'NY'});

             fixture.componentInstance.cities = [{id: 1, name: 'SF'}, {id: 2, name: 'NY'}];
             fixture.detectChanges();
             tick();

             // Now that the options array has been re-assigned, new option instances will
             // be created by ngFor. These instances will have different option IDs, subsequent
             // to the first: 2 and 3. For the second option to stay selected, the select
             // value will need to have the ID of the current second option: 3.
             const nyOption = fixture.debugElement.queryAll(By.css('option'))[1];
             expect(select.nativeElement.value).toEqual('3: Object');
             expect(nyOption.nativeElement.selected).toBe(true);
           }));
      });
    });

    describe('select multiple controls', () => {
      describe('in reactive forms', () => {
        it('should support primitive values', () => {
          if (isNode) return;
          const fixture = initTest(FormControlSelectMultiple);
          fixture.detectChanges();

          const select = fixture.debugElement.query(By.css('select'));
          const sfOption = fixture.debugElement.query(By.css('option'));
          expect(select.nativeElement.value).toEqual(`0: 'SF'`);
          expect(sfOption.nativeElement.selected).toBe(true);
        });

        it('should support objects', () => {
          if (isNode) return;
          const fixture = initTest(FormControlSelectMultipleNgValue);
          fixture.detectChanges();

          const select = fixture.debugElement.query(By.css('select'));
          const sfOption = fixture.debugElement.query(By.css('option'));
          expect(select.nativeElement.value).toEqual('0: Object');
          expect(sfOption.nativeElement.selected).toBe(true);
        });

        it('should throw an error when compareWith is not a function', () => {
          const fixture = initTest(FormControlSelectMultipleWithCompareFn);
          fixture.componentInstance.compareFn = null!;
          expect(() => fixture.detectChanges())
              .toThrowError(/compareWith must be a function, but received null/);
        });

        it('should compare options using provided compareWith function', fakeAsync(() => {
             if (isNode) return;
             const fixture = initTest(FormControlSelectMultipleWithCompareFn);
             fixture.detectChanges();
             tick();

             const select = fixture.debugElement.query(By.css('select'));
             const sfOption = fixture.debugElement.query(By.css('option'));
             expect(select.nativeElement.value).toEqual('0: Object');
             expect(sfOption.nativeElement.selected).toBe(true);
           }));
      });

      describe('in template-driven forms', () => {
        let fixture: ComponentFixture<NgModelSelectMultipleForm>;
        let comp: NgModelSelectMultipleForm;

        beforeEach(() => {
          fixture = initTest(NgModelSelectMultipleForm);
          comp = fixture.componentInstance;
          comp.cities = [{'name': 'SF'}, {'name': 'NYC'}, {'name': 'Buffalo'}];
        });

        const detectChangesAndTick = (): void => {
          fixture.detectChanges();
          tick();
        };

        const setSelectedCities = (selectedCities: any): void => {
          comp.selectedCities = selectedCities;
          detectChangesAndTick();
        };

        const selectOptionViaUI = (valueString: string): void => {
          const select = fixture.debugElement.query(By.css('select'));
          select.nativeElement.value = valueString;
          dispatchEvent(select.nativeElement, 'change');
          detectChangesAndTick();
        };

        const assertOptionElementSelectedState = (selectedStates: boolean[]): void => {
          const options = fixture.debugElement.queryAll(By.css('option'));
          if (options.length !== selectedStates.length) {
            throw 'the selected state values to assert does not match the number of options';
          }
          for (let i = 0; i < selectedStates.length; i++) {
            expect(options[i].nativeElement.selected).toBe(selectedStates[i]);
          }
        };

        it('verify that native `selectedOptions` field is used while detecting the list of selected options',
           fakeAsync(() => {
             if (isNode || !HTMLSelectElement.prototype.hasOwnProperty('selectedOptions')) return;
             const spy = spyOnProperty(HTMLSelectElement.prototype, 'selectedOptions', 'get')
                             .and.callThrough();
             setSelectedCities([]);

             selectOptionViaUI('1: Object');
             assertOptionElementSelectedState([false, true, false]);
             expect(spy).toHaveBeenCalled();
           }));

        it('should reflect state of model after option selected and new options subsequently added',
           fakeAsync(() => {
             if (isNode) return;
             setSelectedCities([]);

             selectOptionViaUI('1: Object');
             assertOptionElementSelectedState([false, true, false]);

             comp.cities.push({'name': 'Chicago'});
             detectChangesAndTick();

             assertOptionElementSelectedState([false, true, false, false]);
           }));

        it('should reflect state of model after option selected and then other options removed',
           fakeAsync(() => {
             if (isNode) return;
             setSelectedCities([]);

             selectOptionViaUI('1: Object');
             assertOptionElementSelectedState([false, true, false]);

             comp.cities.pop();
             detectChangesAndTick();

             assertOptionElementSelectedState([false, true]);
           }));
      });

      it('should throw an error when compareWith is not a function', () => {
        const fixture = initTest(NgModelSelectMultipleWithCustomCompareFnForm);
        const comp = fixture.componentInstance;
        comp.compareFn = null!;
        expect(() => fixture.detectChanges())
            .toThrowError(/compareWith must be a function, but received null/);
      });

      it('should compare options using provided compareWith function', fakeAsync(() => {
           if (isNode) return;
           const fixture = initTest(NgModelSelectMultipleWithCustomCompareFnForm);
           const comp = fixture.componentInstance;
           comp.cities = [{id: 1, name: 'SF'}, {id: 2, name: 'LA'}];
           comp.selectedCities = [comp.cities[0]];
           fixture.detectChanges();
           tick();

           const select = fixture.debugElement.query(By.css('select'));
           const sfOption = fixture.debugElement.query(By.css('option'));
           expect(select.nativeElement.value).toEqual('0: Object');
           expect(sfOption.nativeElement.selected).toBe(true);
         }));
    });

    describe('should support <type=radio>', () => {
      describe('in reactive forms', () => {
        it('should support basic functionality', () => {
          const fixture = initTest(FormControlRadioButtons);
          const form =
              new FormGroup({'food': new FormControl('fish'), 'drink': new FormControl('sprite')});
          fixture.componentInstance.form = form;
          fixture.detectChanges();

          // model -> view
          const inputs = fixture.debugElement.queryAll(By.css('input'));
          expect(inputs[0].nativeElement.checked).toEqual(false);
          expect(inputs[1].nativeElement.checked).toEqual(true);

          dispatchEvent(inputs[0].nativeElement, 'change');
          fixture.detectChanges();

          // view -> model
          expect(form.get('food')!.value).toEqual('chicken');
          expect(inputs[1].nativeElement.checked).toEqual(false);

          form.get('food')!.setValue('fish');
          fixture.detectChanges();

          // programmatic change -> view
          expect(inputs[0].nativeElement.checked).toEqual(false);
          expect(inputs[1].nativeElement.checked).toEqual(true);
        });

        it('should support an initial undefined value', () => {
          const fixture = initTest(FormControlRadioButtons);
          const form = new FormGroup({'food': new FormControl(), 'drink': new FormControl()});
          fixture.componentInstance.form = form;
          fixture.detectChanges();

          const inputs = fixture.debugElement.queryAll(By.css('input'));
          expect(inputs[0].nativeElement.checked).toEqual(false);
          expect(inputs[1].nativeElement.checked).toEqual(false);
        });

        it('should reset properly', () => {
          const fixture = initTest(FormControlRadioButtons);
          const form =
              new FormGroup({'food': new FormControl('fish'), 'drink': new FormControl('sprite')});
          fixture.componentInstance.form = form;
          fixture.detectChanges();

          form.reset();
          fixture.detectChanges();

          const inputs = fixture.debugElement.queryAll(By.css('input'));
          expect(inputs[0].nativeElement.checked).toEqual(false);
          expect(inputs[1].nativeElement.checked).toEqual(false);
        });

        it('should properly set value to null and undefined', () => {
          const fixture = initTest(FormControlRadioButtons);
          const form: FormGroup = new FormGroup(
              {'food': new FormControl('chicken'), 'drink': new FormControl('sprite')});
          fixture.componentInstance.form = form;
          fixture.detectChanges();

          form.get('food')!.setValue(null);
          fixture.detectChanges();

          const inputs = fixture.debugElement.queryAll(By.css('input'));
          expect(inputs[0].nativeElement.checked).toEqual(false);

          form.get('food')!.setValue('chicken');
          fixture.detectChanges();

          form.get('food')!.setValue(undefined);
          fixture.detectChanges();
          expect(inputs[0].nativeElement.checked).toEqual(false);
        });

        it('should use formControlName to group radio buttons when name is absent', () => {
          const fixture = initTest(FormControlRadioButtons);
          const foodCtrl = new FormControl('fish');
          const drinkCtrl = new FormControl('sprite');
          fixture.componentInstance.form = new FormGroup({'food': foodCtrl, 'drink': drinkCtrl});
          fixture.detectChanges();

          const inputs = fixture.debugElement.queryAll(By.css('input'));
          expect(inputs[0].nativeElement.checked).toEqual(false);
          expect(inputs[1].nativeElement.checked).toEqual(true);
          expect(inputs[2].nativeElement.checked).toEqual(false);
          expect(inputs[3].nativeElement.checked).toEqual(true);

          dispatchEvent(inputs[0].nativeElement, 'change');
          inputs[0].nativeElement.checked = true;
          fixture.detectChanges();

          const value = fixture.componentInstance.form.value;
          expect(value.food).toEqual('chicken');
          expect(inputs[1].nativeElement.checked).toEqual(false);
          expect(inputs[2].nativeElement.checked).toEqual(false);
          expect(inputs[3].nativeElement.checked).toEqual(true);

          drinkCtrl.setValue('cola');
          fixture.detectChanges();

          expect(inputs[0].nativeElement.checked).toEqual(true);
          expect(inputs[1].nativeElement.checked).toEqual(false);
          expect(inputs[2].nativeElement.checked).toEqual(true);
          expect(inputs[3].nativeElement.checked).toEqual(false);
        });

        it('should support removing controls from <type=radio>', () => {
          const fixture = initTest(FormControlRadioButtons);
          const showRadio = new FormControl('yes');
          const form: FormGroup =
              new FormGroup({'food': new FormControl('fish'), 'drink': new FormControl('sprite')});
          fixture.componentInstance.form = form;
          fixture.componentInstance.showRadio = showRadio;
          showRadio.valueChanges.subscribe((change) => {
            (change === 'yes') ? form.addControl('food', new FormControl('fish')) :
                                 form.removeControl('food');
          });
          fixture.detectChanges();

          const input = fixture.debugElement.query(By.css('[value="no"]'));
          dispatchEvent(input.nativeElement, 'change');

          fixture.detectChanges();
          expect(form.value).toEqual({drink: 'sprite'});
        });

        it('should differentiate controls on different levels with the same name', () => {
          TestBed.overrideComponent(FormControlRadioButtons, {
            set: {
              template: `
              <div [formGroup]="form">
                <input type="radio" formControlName="food" value="chicken">
                <input type="radio" formControlName="food" value="fish">
                <div formGroupName="nested">
                  <input type="radio" formControlName="food" value="chicken">
                  <input type="radio" formControlName="food" value="fish">
                </div>
              </div>
              `
            }
          });
          const fixture = initTest(FormControlRadioButtons);
          const form = new FormGroup({
            food: new FormControl('fish'),
            nested: new FormGroup({food: new FormControl('fish')})
          });
          fixture.componentInstance.form = form;
          fixture.detectChanges();

          // model -> view
          const inputs = fixture.debugElement.queryAll(By.css('input'));
          expect(inputs[0].nativeElement.checked).toEqual(false);
          expect(inputs[1].nativeElement.checked).toEqual(true);
          expect(inputs[2].nativeElement.checked).toEqual(false);
          expect(inputs[3].nativeElement.checked).toEqual(true);

          dispatchEvent(inputs[0].nativeElement, 'change');
          fixture.detectChanges();

          // view -> model
          expect(form.get('food')!.value).toEqual('chicken');
          expect(form.get('nested.food')!.value).toEqual('fish');

          expect(inputs[1].nativeElement.checked).toEqual(false);
          expect(inputs[2].nativeElement.checked).toEqual(false);
          expect(inputs[3].nativeElement.checked).toEqual(true);
        });

        it('should disable all radio buttons when disable() is called', () => {
          const fixture = initTest(FormControlRadioButtons);
          const form =
              new FormGroup({food: new FormControl('fish'), drink: new FormControl('cola')});
          fixture.componentInstance.form = form;
          fixture.detectChanges();

          const inputs = fixture.debugElement.queryAll(By.css('input'));
          expect(inputs[0].nativeElement.disabled).toEqual(false);
          expect(inputs[1].nativeElement.disabled).toEqual(false);
          expect(inputs[2].nativeElement.disabled).toEqual(false);
          expect(inputs[3].nativeElement.disabled).toEqual(false);

          form.get('food')!.disable();
          expect(inputs[0].nativeElement.disabled).toEqual(true);
          expect(inputs[1].nativeElement.disabled).toEqual(true);
          expect(inputs[2].nativeElement.disabled).toEqual(false);
          expect(inputs[3].nativeElement.disabled).toEqual(false);

          form.disable();
          expect(inputs[0].nativeElement.disabled).toEqual(true);
          expect(inputs[1].nativeElement.disabled).toEqual(true);
          expect(inputs[2].nativeElement.disabled).toEqual(true);
          expect(inputs[3].nativeElement.disabled).toEqual(true);

          form.enable();
          expect(inputs[0].nativeElement.disabled).toEqual(false);
          expect(inputs[1].nativeElement.disabled).toEqual(false);
          expect(inputs[2].nativeElement.disabled).toEqual(false);
          expect(inputs[3].nativeElement.disabled).toEqual(false);
        });

        it('should disable all radio buttons when initially disabled', () => {
          const fixture = initTest(FormControlRadioButtons);
          const form = new FormGroup({
            food: new FormControl({value: 'fish', disabled: true}),
            drink: new FormControl('cola')
          });
          fixture.componentInstance.form = form;
          fixture.detectChanges();

          const inputs = fixture.debugElement.queryAll(By.css('input'));
          expect(inputs[0].nativeElement.disabled).toEqual(true);
          expect(inputs[1].nativeElement.disabled).toEqual(true);
          expect(inputs[2].nativeElement.disabled).toEqual(false);
          expect(inputs[3].nativeElement.disabled).toEqual(false);
        });

        it('should work with reusing controls', () => {
          const fixture = initTest(FormControlRadioButtons);
          const food = new FormControl('chicken');
          fixture.componentInstance.form =
              new FormGroup({'food': food, 'drink': new FormControl('')});
          fixture.detectChanges();

          const newForm = new FormGroup({'food': food, 'drink': new FormControl('')});
          fixture.componentInstance.form = newForm;
          fixture.detectChanges();

          newForm.setValue({food: 'fish', drink: ''});
          fixture.detectChanges();
          const inputs = fixture.debugElement.queryAll(By.css('input'));
          expect(inputs[0].nativeElement.checked).toBe(false);
          expect(inputs[1].nativeElement.checked).toBe(true);
        });
      });

      describe('in template-driven forms', () => {
        it('should support basic functionality', fakeAsync(() => {
             const fixture = initTest(NgModelRadioForm);
             fixture.componentInstance.food = 'fish';
             fixture.detectChanges();
             tick();

             // model -> view
             const inputs = fixture.debugElement.queryAll(By.css('input'));
             expect(inputs[0].nativeElement.checked).toEqual(false);
             expect(inputs[1].nativeElement.checked).toEqual(true);

             dispatchEvent(inputs[0].nativeElement, 'change');
             tick();

             // view -> model
             expect(fixture.componentInstance.food).toEqual('chicken');
             expect(inputs[1].nativeElement.checked).toEqual(false);
           }));

        it('should support multiple named <type=radio> groups', fakeAsync(() => {
             const fixture = initTest(NgModelRadioForm);
             fixture.componentInstance.food = 'fish';
             fixture.componentInstance.drink = 'sprite';
             fixture.detectChanges();
             tick();

             const inputs = fixture.debugElement.queryAll(By.css('input'));
             expect(inputs[0].nativeElement.checked).toEqual(false);
             expect(inputs[1].nativeElement.checked).toEqual(true);
             expect(inputs[2].nativeElement.checked).toEqual(false);
             expect(inputs[3].nativeElement.checked).toEqual(true);

             dispatchEvent(inputs[0].nativeElement, 'change');
             tick();

             expect(fixture.componentInstance.food).toEqual('chicken');
             expect(fixture.componentInstance.drink).toEqual('sprite');
             expect(inputs[1].nativeElement.checked).toEqual(false);
             expect(inputs[2].nativeElement.checked).toEqual(false);
             expect(inputs[3].nativeElement.checked).toEqual(true);
           }));

        it('should support initial undefined value', fakeAsync(() => {
             const fixture = initTest(NgModelRadioForm);
             fixture.detectChanges();
             tick();

             const inputs = fixture.debugElement.queryAll(By.css('input'));
             expect(inputs[0].nativeElement.checked).toEqual(false);
             expect(inputs[1].nativeElement.checked).toEqual(false);
             expect(inputs[2].nativeElement.checked).toEqual(false);
             expect(inputs[3].nativeElement.checked).toEqual(false);
           }));

        it('should support resetting properly', fakeAsync(() => {
             const fixture = initTest(NgModelRadioForm);
             fixture.componentInstance.food = 'chicken';
             fixture.detectChanges();
             tick();

             const form = fixture.debugElement.query(By.css('form'));
             dispatchEvent(form.nativeElement, 'reset');
             fixture.detectChanges();
             tick();

             const inputs = fixture.debugElement.queryAll(By.css('input'));
             expect(inputs[0].nativeElement.checked).toEqual(false);
             expect(inputs[1].nativeElement.checked).toEqual(false);
           }));

        it('should support setting value to null and undefined', fakeAsync(() => {
             const fixture = initTest(NgModelRadioForm);
             fixture.componentInstance.food = 'chicken';
             fixture.detectChanges();
             tick();

             fixture.componentInstance.food = null!;
             fixture.detectChanges();
             tick();

             const inputs = fixture.debugElement.queryAll(By.css('input'));
             expect(inputs[0].nativeElement.checked).toEqual(false);
             expect(inputs[1].nativeElement.checked).toEqual(false);

             fixture.componentInstance.food = 'chicken';
             fixture.detectChanges();
             tick();

             fixture.componentInstance.food = undefined!;
             fixture.detectChanges();
             tick();
             expect(inputs[0].nativeElement.checked).toEqual(false);
             expect(inputs[1].nativeElement.checked).toEqual(false);
           }));

        it('should disable radio controls properly with programmatic call', fakeAsync(() => {
             const fixture = initTest(NgModelRadioForm);
             fixture.componentInstance.food = 'fish';
             fixture.detectChanges();
             tick();

             const form = fixture.debugElement.children[0].injector.get(NgForm);
             form.control.get('food')!.disable();
             tick();

             const inputs = fixture.debugElement.queryAll(By.css('input'));
             expect(inputs[0].nativeElement.disabled).toBe(true);
             expect(inputs[1].nativeElement.disabled).toBe(true);
             expect(inputs[2].nativeElement.disabled).toBe(false);
             expect(inputs[3].nativeElement.disabled).toBe(false);

             form.control.disable();
             tick();

             expect(inputs[0].nativeElement.disabled).toBe(true);
             expect(inputs[1].nativeElement.disabled).toBe(true);
             expect(inputs[2].nativeElement.disabled).toBe(true);
             expect(inputs[3].nativeElement.disabled).toBe(true);

             form.control.enable();
             tick();

             expect(inputs[0].nativeElement.disabled).toBe(false);
             expect(inputs[1].nativeElement.disabled).toBe(false);
             expect(inputs[2].nativeElement.disabled).toBe(false);
             expect(inputs[3].nativeElement.disabled).toBe(false);
           }));
      });
    });

    describe('should support <type=range>', () => {
      describe('in reactive forms', () => {
        it('with basic use case', () => {
          const fixture = initTest(FormControlRangeInput);
          const control = new FormControl(10);
          fixture.componentInstance.control = control;
          fixture.detectChanges();

          // model -> view
          const input = fixture.debugElement.query(By.css('input'));
          expect(input.nativeElement.value).toEqual('10');

          input.nativeElement.value = '20';
          dispatchEvent(input.nativeElement, 'input');

          // view -> model
          expect(control.value).toEqual(20);
        });

        it('when value is cleared in the UI', () => {
          const fixture = initTest(FormControlNumberInput);
          const control = new FormControl(10, Validators.required);
          fixture.componentInstance.control = control;
          fixture.detectChanges();

          const input = fixture.debugElement.query(By.css('input'));
          input.nativeElement.value = '';
          dispatchEvent(input.nativeElement, 'input');

          expect(control.valid).toBe(false);
          expect(control.value).toEqual(null);

          input.nativeElement.value = '0';
          dispatchEvent(input.nativeElement, 'input');

          expect(control.valid).toBe(true);
          expect(control.value).toEqual(0);
        });

        it('when value is cleared programmatically', () => {
          const fixture = initTest(FormControlNumberInput);
          const control = new FormControl(10);
          fixture.componentInstance.control = control;
          fixture.detectChanges();

          control.setValue(null);

          const input = fixture.debugElement.query(By.css('input'));
          expect(input.nativeElement.value).toEqual('');
        });
      });

      describe('in template-driven forms', () => {
        it('with basic use case', fakeAsync(() => {
             const fixture = initTest(NgModelRangeForm);
             // model -> view
             fixture.componentInstance.val = 4;
             fixture.detectChanges();
             tick();
             const input = fixture.debugElement.query(By.css('input'));
             expect(input.nativeElement.value).toBe('4');
             fixture.detectChanges();
             tick();
             const newVal = '4';
             input.triggerEventHandler('input', {target: {value: newVal}});
             tick();
             // view -> model
             fixture.detectChanges();
             expect(typeof (fixture.componentInstance.val)).toBe('number');
           }));
      });
    });

    describe('custom value accessors', () => {
      describe('in reactive forms', () => {
        it('should support basic functionality', () => {
          const fixture = initTest(WrappedValueForm, WrappedValue);
          const form = new FormGroup({'login': new FormControl('aa')});
          fixture.componentInstance.form = form;
          fixture.detectChanges();

          // model -> view
          const input = fixture.debugElement.query(By.css('input'));
          expect(input.nativeElement.value).toEqual('!aa!');

          input.nativeElement.value = '!bb!';
          dispatchEvent(input.nativeElement, 'input');

          // view -> model
          expect(form.value).toEqual({'login': 'bb'});

          // custom validator
          expect(form.get('login')!.errors).toEqual({'err': true});
          form.setValue({login: 'expected'});
          expect(form.get('login')!.errors).toEqual(null);
        });

        it('should support non builtin input elements that fire a change event without a \'target\' property',
           () => {
             const fixture = initTest(MyInputForm, MyInput);
             fixture.componentInstance.form = new FormGroup({'login': new FormControl('aa')});
             fixture.detectChanges();

             const input = fixture.debugElement.query(By.css('my-input'));
             expect(input.componentInstance.value).toEqual('!aa!');

             input.componentInstance.value = '!bb!';
             input.componentInstance.onInput.subscribe((value: any) => {
               expect(fixture.componentInstance.form.value).toEqual({'login': 'bb'});
             });
             input.componentInstance.dispatchChangeEvent();
           });

        it('should support custom accessors without setDisabledState - formControlName', () => {
          const fixture = initTest(WrappedValueForm, WrappedValue);
          fixture.componentInstance.form = new FormGroup({
            'login': new FormControl({value: 'aa', disabled: true}),
          });
          fixture.detectChanges();
          expect(fixture.componentInstance.form.status).toEqual('DISABLED');
          expect(fixture.componentInstance.form.get('login')!.status).toEqual('DISABLED');
        });

        it('should support custom accessors without setDisabledState - formControlDirective',
           () => {
             TestBed.overrideComponent(
                 FormControlComp,
                 {set: {template: `<input type="text" [formControl]="control" wrapped-value>`}});
             const fixture = initTest(FormControlComp);
             fixture.componentInstance.control = new FormControl({value: 'aa', disabled: true});
             fixture.detectChanges();
             expect(fixture.componentInstance.control.status).toEqual('DISABLED');
           });

        describe('should support custom accessors with setDisabledState - formControlName', () => {
          let fixture: ComponentFixture<CvaWithDisabledStateForm>;

          beforeEach(() => {
            fixture = initTest(CvaWithDisabledStateForm, CvaWithDisabledState);
          });

          it('sets the disabled state when the control is initally disabled', () => {
            fixture.componentInstance.form = new FormGroup({
              'login': new FormControl({value: 'aa', disabled: true}),
            });
            fixture.detectChanges();

            expect(fixture.componentInstance.form.status).toEqual('DISABLED');
            expect(fixture.componentInstance.form.get('login')!.status).toEqual('DISABLED');
            expect(fixture.debugElement.query(By.directive(CvaWithDisabledState))
                       .nativeElement.textContent)
                .toContain('DISABLED');
          });

          it('sets the enabled state when the control is initally enabled', () => {
            fixture.componentInstance.form = new FormGroup({
              'login': new FormControl({value: 'aa', disabled: false}),
            });
            fixture.detectChanges();

            expect(fixture.componentInstance.form.status).toEqual('VALID');
            expect(fixture.componentInstance.form.get('login')!.status).toEqual('VALID');
            expect(fixture.debugElement.query(By.directive(CvaWithDisabledState))
                       .nativeElement.textContent)
                .toContain('ENABLED');
          });
        });

        it('should populate control in ngOnInit when injecting NgControl', () => {
          const fixture = initTest(MyInputForm, MyInput);
          fixture.componentInstance.form = new FormGroup({'login': new FormControl('aa')});
          fixture.detectChanges();

          expect(fixture.componentInstance.myInput!.control).toBeDefined();
          expect(fixture.componentInstance.myInput!.control)
              .toEqual(fixture.componentInstance.myInput!.controlDir.control);
        });
      });

      describe('in template-driven forms', () => {
        it('should support standard writing to view and model', waitForAsync(() => {
             const fixture = initTest(NgModelCustomWrapper, NgModelCustomComp);
             fixture.componentInstance.name = 'Nancy';
             fixture.detectChanges();
             fixture.whenStable().then(() => {
               fixture.detectChanges();
               fixture.whenStable().then(() => {
                 // model -> view
                 const customInput = fixture.debugElement.query(By.css('[name="custom"]'));
                 expect(customInput.nativeElement.value).toEqual('Nancy');

                 customInput.nativeElement.value = 'Carson';
                 dispatchEvent(customInput.nativeElement, 'input');
                 fixture.detectChanges();

                 // view -> model
                 expect(fixture.componentInstance.name).toEqual('Carson');
               });
             });
           }));
      });

      describe('`ngModel` value accessor inside an OnPush component', () => {
        it('should run change detection and update the value', fakeAsync(async () => {
             @Component({
               selector: 'parent',
               template: '<child [ngModel]="value"></child>',
               changeDetection: ChangeDetectionStrategy.OnPush,
             })
             class Parent {
               value!: string;

               constructor(private ref: ChangeDetectorRef) {}

               setTimeoutAndChangeValue(): void {
                 setTimeout(() => {
                   this.value = 'Carson';
                   this.ref.detectChanges();
                 }, 50);
               }
             }

             @Component({
               selector: 'child',
               template: 'Value: {{ value }}',
               providers: [{provide: NG_VALUE_ACCESSOR, useExisting: Child, multi: true}]
             })
             class Child implements ControlValueAccessor {
               value!: string;

               writeValue(value: string): void {
                 this.value = value;
               }

               registerOnChange(): void {}

               registerOnTouched(): void {}
             }

             const fixture = initTest(Parent, Child);
             fixture.componentInstance.value = 'Nancy';
             fixture.detectChanges();

             await fixture.whenStable();
             fixture.detectChanges();
             await fixture.whenStable();

             const child = fixture.debugElement.query(By.css('child'));
             // Let's ensure that the initial value has been set, because previously
             // it wasn't set inside an `OnPush` component.
             expect(child.nativeElement.innerHTML).toEqual('Value: Nancy');

             fixture.componentInstance.setTimeoutAndChangeValue();
             tick(50);

             fixture.detectChanges();
             await fixture.whenStable();

             expect(child.nativeElement.innerHTML).toEqual('Value: Carson');
           }));
      });
    });
  });
}


describe('value accessors in reactive forms with custom options', () => {
  function initTest<T>(component: Type<T>, ...directives: Type<any>[]): ComponentFixture<T> {
    TestBed.configureTestingModule({
      declarations: [component, ...directives],
      imports: [ReactiveFormsModule.withConfig({callSetDisabledState: 'whenDisabledForLegacyCode'})]
    });
    return TestBed.createComponent(component);
  }

  describe('should support custom accessors with setDisabledState', () => {
    let fixture: ComponentFixture<CvaWithDisabledStateForm>;

    beforeEach(() => {
      fixture = initTest(CvaWithDisabledStateForm, CvaWithDisabledState);
    });

    it('does not set the enabled state when the control is initally enabled', () => {
      fixture.componentInstance.form = new FormGroup({
        'login': new FormControl({value: 'aa', disabled: false}),
      });
      fixture.detectChanges();

      expect(fixture.componentInstance.form.status).toEqual('VALID');
      expect(fixture.componentInstance.form.get('login')!.status).toEqual('VALID');
      expect(
          fixture.debugElement.query(By.directive(CvaWithDisabledState)).nativeElement.textContent)
          .toContain('UNSET');
    });
  });
});

@Component({selector: 'form-control-comp', template: `<input type="text" [formControl]="control">`})
export class FormControlComp {
  control!: FormControl;
}

@Component({
  selector: 'form-group-comp',
  template: `
    <form [formGroup]="form" (ngSubmit)="event=$event">
      <input type="text" formControlName="login">
    </form>`
})
export class FormGroupComp {
  control!: FormControl;
  form!: FormGroup;
  myGroup!: FormGroup;
  event!: Event;
}

@Component({
  selector: 'form-control-number-input',
  template: `<input type="number" [formControl]="control">`
})
class FormControlNumberInput {
  control!: FormControl;
}

@Component({
  selector: 'form-control-name-select',
  template: `
    <div [formGroup]="form">
      <select formControlName="city">
        <option *ngFor="let c of cities" [value]="c"></option>
      </select>
    </div>`
})
class FormControlNameSelect {
  cities = ['SF', 'NY'];
  form = new FormGroup({city: new FormControl('SF')});
}

@Component({
  selector: 'form-control-select-ngValue',
  template: `
    <div [formGroup]="form">
      <select formControlName="city">
        <option *ngFor="let c of cities" [ngValue]="c">{{c.name}}</option>
      </select>
    </div>`
})
class FormControlSelectNgValue {
  cities = [{id: 1, name: 'SF'}, {id: 2, name: 'NY'}];
  form = new FormGroup({city: new FormControl(this.cities[0])});
}

@Component({
  selector: 'form-control-select-compare-with',
  template: `
    <div [formGroup]="form">
      <select formControlName="city" [compareWith]="compareFn">
        <option *ngFor="let c of cities" [ngValue]="c">{{c.name}}</option>
      </select>
    </div>`
})
class FormControlSelectWithCompareFn {
  compareFn:
      (o1: any, o2: any) => boolean = (o1: any, o2: any) => o1 && o2 ? o1.id === o2.id : o1 === o2
  cities = [{id: 1, name: 'SF'}, {id: 2, name: 'NY'}];
  form = new FormGroup({city: new FormControl({id: 1, name: 'SF'})});
}

@Component({
  selector: 'form-control-select-multiple',
  template: `
    <div [formGroup]="form">
      <select multiple formControlName="city">
        <option *ngFor="let c of cities" [value]="c">{{c}}</option>
      </select>
    </div>`
})
class FormControlSelectMultiple {
  cities = ['SF', 'NY'];
  form = new FormGroup({city: new FormControl(['SF'])});
}

@Component({
  selector: 'form-control-select-multiple',
  template: `
    <div [formGroup]="form">
      <select multiple formControlName="city">
        <option *ngFor="let c of cities" [ngValue]="c">{{c.name}}</option>
      </select>
    </div>`
})
class FormControlSelectMultipleNgValue {
  cities = [{id: 1, name: 'SF'}, {id: 2, name: 'NY'}];
  form = new FormGroup({city: new FormControl([this.cities[0]])});
}

@Component({
  selector: 'form-control-select-multiple-compare-with',
  template: `
    <div [formGroup]="form">
      <select multiple formControlName="city" [compareWith]="compareFn">
        <option *ngFor="let c of cities" [ngValue]="c">{{c.name}}</option>
      </select>
    </div>`
})
class FormControlSelectMultipleWithCompareFn {
  compareFn:
      (o1: any, o2: any) => boolean = (o1: any, o2: any) => o1 && o2 ? o1.id === o2.id : o1 === o2
  cities = [{id: 1, name: 'SF'}, {id: 2, name: 'NY'}];
  form = new FormGroup({city: new FormControl([{id: 1, name: 'SF'}])});
}


@Component({
  selector: 'ng-model-select-form',
  template: `
    <select [(ngModel)]="selectedCity">
      <option *ngFor="let c of cities" [ngValue]="c"> {{c.name}} </option>
    </select>
  `
})
class NgModelSelectForm {
  selectedCity: {[k: string]: string} = {};
  cities: any[] = [];
}

@Component({
  selector: 'ng-model-select-null-form',
  template: `
    <select [(ngModel)]="selectedCity">
      <option *ngFor="let c of cities" [ngValue]="c"> {{c.name}} </option>
      <option [ngValue]="null">Unspecified</option>
    </select>
  `
})
class NgModelSelectWithNullForm {
  selectedCity: {[k: string]: string}|null = {};
  cities: any[] = [];
}

@Component({
  selector: 'ng-model-select-compare-with',
  template: `
    <select [(ngModel)]="selectedCity" [compareWith]="compareFn">
      <option *ngFor="let c of cities" [ngValue]="c"> {{c.name}} </option>
    </select>
  `
})
class NgModelSelectWithCustomCompareFnForm {
  compareFn:
      (o1: any, o2: any) => boolean = (o1: any, o2: any) => o1 && o2 ? o1.id === o2.id : o1 === o2
  selectedCity: any = {};
  cities: any[] = [];
}


@Component({
  selector: 'ng-model-select-multiple-compare-with',
  template: `
    <select multiple [(ngModel)]="selectedCities" [compareWith]="compareFn">
      <option *ngFor="let c of cities" [ngValue]="c"> {{c.name}} </option>
    </select>
  `
})
class NgModelSelectMultipleWithCustomCompareFnForm {
  compareFn:
      (o1: any, o2: any) => boolean = (o1: any, o2: any) => o1 && o2 ? o1.id === o2.id : o1 === o2
  selectedCities: any[] = [];
  cities: any[] = [];
}

@Component({
  selector: 'ng-model-select-multiple-form',
  template: `
    <select multiple [(ngModel)]="selectedCities">
      <option *ngFor="let c of cities" [ngValue]="c"> {{c.name}} </option>
    </select>
  `
})
class NgModelSelectMultipleForm {
  selectedCities!: any[];
  cities: any[] = [];
}

@Component({
  selector: 'form-control-range-input',
  template: `<input type="range" [formControl]="control">`
})
class FormControlRangeInput {
  control!: FormControl;
}

@Component({selector: 'ng-model-range-form', template: '<input type="range" [(ngModel)]="val">'})
class NgModelRangeForm {
  val: any;
}

@Component({
  selector: 'form-control-radio-buttons',
  template: `
    <form [formGroup]="form" *ngIf="showRadio.value === 'yes'">
      <input type="radio" formControlName="food" value="chicken">
      <input type="radio" formControlName="food" value="fish">
      <input type="radio" formControlName="drink" value="cola">
      <input type="radio" formControlName="drink" value="sprite">
    </form>
    <input type="radio" [formControl]="showRadio" value="yes">
    <input type="radio" [formControl]="showRadio" value="no">`
})
export class FormControlRadioButtons {
  form!: FormGroup;
  showRadio = new FormControl('yes');
}

@Component({
  selector: 'ng-model-radio-form',
  template: `
    <form>
      <input type="radio" name="food" [(ngModel)]="food" value="chicken">
      <input type="radio" name="food"  [(ngModel)]="food" value="fish">

      <input type="radio" name="drink" [(ngModel)]="drink" value="cola">
      <input type="radio" name="drink" [(ngModel)]="drink" value="sprite">
    </form>
  `
})
class NgModelRadioForm {
  food!: string;
  drink!: string;
}

@Directive({
  selector: '[wrapped-value]',
  host: {'(input)': 'handleOnInput($event.target.value)', '[value]': 'value'},
  providers: [
    {provide: NG_VALUE_ACCESSOR, multi: true, useExisting: WrappedValue},
    {provide: NG_VALIDATORS, multi: true, useExisting: WrappedValue}
  ]
})
class WrappedValue implements ControlValueAccessor {
  value: any;
  onChange!: Function;

  writeValue(value: any) {
    this.value = `!${value}!`;
  }

  registerOnChange(fn: (value: any) => void) {
    this.onChange = fn;
  }
  registerOnTouched(fn: any) {}

  handleOnInput(value: any) {
    this.onChange(value.substring(1, value.length - 1));
  }

  validate(c: AbstractControl) {
    return c.value === 'expected' ? null : {'err': true};
  }
}

@Component({
  selector: 'cva-with-disabled-state',
  template: `
    <div *ngIf="disabled !== undefined">CALLED WITH {{disabled ? 'DISABLED' : 'ENABLED'}}</div>
    <div *ngIf="disabled === undefined">UNSET</div>
  `,
  providers: [
    {provide: NG_VALUE_ACCESSOR, multi: true, useExisting: CvaWithDisabledState},
  ]
})
class CvaWithDisabledState implements ControlValueAccessor {
  disabled?: boolean;
  onChange!: Function;

  writeValue(value: any) {}

  registerOnChange(fn: (value: any) => void) {}
  registerOnTouched(fn: any) {}

  setDisabledState(disabled: boolean) {
    this.disabled = disabled;
  }
}

@Component({
  selector: 'wrapped-value-form',
  template: `
    <div [formGroup]="form">
      <cva-with-disabled-state formControlName="login"></cva-with-disabled-state>
    </div>`
})
class CvaWithDisabledStateForm {
  form!: FormGroup;
}

@Component({selector: 'my-input', template: ''})
export class MyInput implements ControlValueAccessor {
  @Output('input') onInput = new EventEmitter();
  value!: string;

  control: AbstractControl|null = null;

  constructor(public controlDir: NgControl) {
    controlDir.valueAccessor = this;
  }

  ngOnInit() {
    this.control = this.controlDir.control;
  }

  writeValue(value: any) {
    this.value = `!${value}!`;
  }

  registerOnChange(fn: (value: any) => void) {
    this.onInput.subscribe({next: fn});
  }

  registerOnTouched(fn: any) {}

  dispatchChangeEvent() {
    this.onInput.emit(this.value.substring(1, this.value.length - 1));
  }
}

@Component({
  selector: 'my-input-form',
  template: `
    <div [formGroup]="form">
      <my-input formControlName="login"></my-input>
    </div>`
})
export class MyInputForm {
  form!: FormGroup;
  @ViewChild(MyInput) myInput: MyInput|null = null;
}

@Component({
  selector: 'wrapped-value-form',
  template: `
    <div [formGroup]="form">
      <input type="text" formControlName="login" wrapped-value>
    </div>`
})
class WrappedValueForm {
  form!: FormGroup;
}

@Component({
  selector: 'ng-model-custom-comp',
  template: `
    <input name="custom" [(ngModel)]="model" (ngModelChange)="changeFn($event)" [disabled]="isDisabled">
  `,
  providers: [{provide: NG_VALUE_ACCESSOR, multi: true, useExisting: NgModelCustomComp}]
})
export class NgModelCustomComp implements ControlValueAccessor {
  model!: string;
  @Input('disabled') isDisabled: boolean = false;
  changeFn!: (value: any) => void;

  writeValue(value: any) {
    this.model = value;
  }

  registerOnChange(fn: (value: any) => void) {
    this.changeFn = fn;
  }

  registerOnTouched() {}

  setDisabledState(isDisabled: boolean) {
    this.isDisabled = isDisabled;
  }
}

@Component({
  selector: 'ng-model-custom-wrapper',
  template: `
    <form>
      <ng-model-custom-comp name="name" [(ngModel)]="name" [disabled]="isDisabled"></ng-model-custom-comp>
    </form>
  `
})
export class NgModelCustomWrapper {
  name!: string;
  isDisabled = false;
}
