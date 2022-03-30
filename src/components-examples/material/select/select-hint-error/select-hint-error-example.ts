import {Component} from '@angular/core';
import {UntypedFormControl, Validators} from '@angular/forms';

interface Animal {
  name: string;
  sound: string;
}

/** @title Select with form field features */
@Component({
  selector: 'select-hint-error-example',
  templateUrl: 'select-hint-error-example.html',
})
export class SelectHintErrorExample {
  animalControl = new UntypedFormControl('', Validators.required);
  selectFormControl = new UntypedFormControl('', Validators.required);
  animals: Animal[] = [
    {name: 'Dog', sound: 'Woof!'},
    {name: 'Cat', sound: 'Meow!'},
    {name: 'Cow', sound: 'Moo!'},
    {name: 'Fox', sound: 'Wa-pa-pa-pa-pa-pa-pow!'},
  ];
}
