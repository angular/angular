import {Component} from '@angular/core';

/** @title Listbox with aria-activedescendant. */
@Component({
  selector: 'cdk-listbox-activedescendant-example',
  exportAs: 'cdkListboxActivedescendantExample',
  templateUrl: 'cdk-listbox-activedescendant-example.html',
  styleUrls: ['cdk-listbox-activedescendant-example.css'],
})
export class CdkListboxActivedescendantExample {
  features = ['Hydrodynamic', 'Port & Starboard Attachments', 'Turbo Drive'];
}
