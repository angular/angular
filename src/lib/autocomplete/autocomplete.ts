import {
  Component,
  ContentChildren,
  QueryList,
  TemplateRef,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import {MdOption} from '../core';

/**
 * Autocomplete IDs need to be unique across components, so this counter exists outside of
 * the component definition.
 */
let _uniqueAutocompleteIdCounter = 0;

@Component({
  moduleId: module.id,
  selector: 'md-autocomplete, mat-autocomplete',
  templateUrl: 'autocomplete.html',
  styleUrls: ['autocomplete.css'],
  encapsulation: ViewEncapsulation.None,
  exportAs: 'mdAutocomplete'
})
export class MdAutocomplete {

  @ViewChild(TemplateRef) template: TemplateRef<any>;
  @ContentChildren(MdOption) options: QueryList<MdOption>;

  /** Unique ID to be used by autocomplete trigger's "aria-owns" property. */
  id: string = `md-autocomplete-${_uniqueAutocompleteIdCounter++}`;
}

