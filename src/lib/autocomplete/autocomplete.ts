import {
  Component,
  ContentChildren,
  ElementRef,
  Input,
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

export type AutocompletePositionY = 'above' | 'below';

@Component({
  moduleId: module.id,
  selector: 'md-autocomplete, mat-autocomplete',
  templateUrl: 'autocomplete.html',
  styleUrls: ['autocomplete.css'],
  encapsulation: ViewEncapsulation.None,
  exportAs: 'mdAutocomplete'
})
export class MdAutocomplete {

  /** Whether the autocomplete panel displays above or below its trigger. */
  positionY: AutocompletePositionY = 'below';

  @ViewChild(TemplateRef) template: TemplateRef<any>;
  @ViewChild('panel') panel: ElementRef;
  @ContentChildren(MdOption) options: QueryList<MdOption>;

  /** Function that maps an option's control value to its display value in the trigger. */
  @Input() displayWith: (value: any) => string;

  /** Unique ID to be used by autocomplete trigger's "aria-owns" property. */
  id: string = `md-autocomplete-${_uniqueAutocompleteIdCounter++}`;

  /**
   * Sets the panel scrollTop. This allows us to manually scroll to display
   * options below the fold, as they are not actually being focused when active.
   */
  _setScrollTop(scrollTop: number): void {
    if (this.panel) {
      this.panel.nativeElement.scrollTop = scrollTop;
    }
  }

  /** Sets a class on the panel based on its position (used to set y-offset). */
  _getPositionClass() {
    return {
      'md-autocomplete-panel-below': this.positionY === 'below',
      'md-autocomplete-panel-above': this.positionY === 'above'
    };
  }

}

