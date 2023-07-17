// #docplaster
// #docregion create-control
import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-name-editor',
  templateUrl: './name-editor.component.html',
  styleUrls: ['./name-editor.component.css']
})
export class NameEditorComponent {
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
