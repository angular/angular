// #docplaster
// #docregion create-control
import {Component} from '@angular/core';

// #docregion imports
import {FormControl, ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'app-name-editor',
  templateUrl: './name-editor.component.html',
  styleUrls: ['./name-editor.component.css'],
  imports: [ReactiveFormsModule],
})
export class NameEditorComponent {
  // #enddocregion imports
  name = new FormControl('');
  // #enddocregion create-control

  // #docregion update-value
  updateName() {
    this.name.setValue('Nancy');
  }
  // #enddocregion update-value
  // #docregion create-control
}
// #enddocregion create-control
