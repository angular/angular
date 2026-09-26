import {Component} from '@angular/core';
import {ControlContainer, FormGroupName, ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'app-address-editor',
  templateUrl: './address-editor.component.html',
  styleUrls: ['./address-editor.component.css'],
  imports: [ReactiveFormsModule],
  viewProviders: [{provide: ControlContainer, useExisting: FormGroupName}],
})
export class AddressEditorComponent {}
