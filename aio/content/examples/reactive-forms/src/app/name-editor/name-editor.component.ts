// #docplaster
// #docregion create-control
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-name-editor',
  templateUrl: './name-editor.component.html',
  styleUrls: ['./name-editor.component.css']
})
export class NameEditorComponent implements OnInit {
  name = new FormControl('');
// #enddocregion create-control

  constructor() { }

  ngOnInit() {
  }

// #docregion update-value
  updateName() {
    this.name.setValue('Nancy');
  }
// #enddocregion update-value
// #docregion create-control
}
// #enddocregion create-control
