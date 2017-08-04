/* tslint:disable: member-ordering forin */
// #docplaster
// #docregion
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'hero-form-update-on',
  templateUrl: './hero-form-update-on.component.html'
})
export class HeroFormUpdateOnComponent implements OnInit, OnDestroy {
  // #docregion updateon
  form = new FormGroup({
    name:  new FormControl('', {
      validators: Validators.required,
      updateOn: 'blur'
    })
  });
  // #enddocregion updateon

  updateOnControl = new FormControl('blur');
  updateOnSub: any;

  ngOnInit() {
    // To support changing the updateOn configuration in the demo,
    // we set up a new FormControl when the updateOn value changes.
    this.updateOnSub = this.updateOnControl.valueChanges.subscribe(value => {
      this.form.setControl('name', new FormControl(this.name.value, {
        validators: Validators.required,
        updateOn: value
      }));
    });
  }

  ngOnDestroy() {
    this.updateOnSub.unsubscribe();
  }

  get name() { return this.form.get('name'); }

}
// #enddocregion
