import {Component} from '@angular/core';
import {ControlContainer, FormGroupDirective, ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'app-address-editor',
  templateUrl: './address-editor.component.html',
  imports: [ReactiveFormsModule],
  viewProviders: [{provide: ControlContainer, useExisting: FormGroupDirective}],
})
export class AddressEditorComponent {}
