import {Component} from '@angular/core';
import {FormArray, FormControl, ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'app-standalone-array',
  templateUrl: './standalone-array.component.html',
  imports: [ReactiveFormsModule],
})
export class StandaloneArrayComponent {
  hobbies = new FormArray([
    new FormControl('Reading'),
    new FormControl('Gaming'),
    new FormControl('Hiking'),
  ]);

  addHobby() {
    this.hobbies.push(new FormControl(''));
  }

  removeHobby(index: number) {
    this.hobbies.removeAt(index);
  }
}
