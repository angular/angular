import {
  AfterContentInit,
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
import {ActiveDescendantKeyManager} from '../core/a11y/activedescendant-key-manager';

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
  exportAs: 'mdAutocomplete',
  host: {
    '[class.mat-autocomplete]': 'true'
  }
})
export class MdAutocomplete implements AfterContentInit {

  /** Manages active item in option list based on key events. */
  _keyManager: ActiveDescendantKeyManager;

  /** Whether the autocomplete panel displays above or below its trigger. */
  positionY: AutocompletePositionY = 'below';

  /** Whether the autocomplete panel should be visible, depending on option length. */
  showPanel = false;

  @ViewChild(TemplateRef) template: TemplateRef<any>;
  @ViewChild('panel') panel: ElementRef;
  @ContentChildren(MdOption) options: QueryList<MdOption>;

  /** Function that maps an option's control value to its display value in the trigger. */
  @Input() displayWith: (value: any) => string;

  /** Unique ID to be used by autocomplete trigger's "aria-owns" property. */
  id: string = `md-autocomplete-${_uniqueAutocompleteIdCounter++}`;

  ngAfterContentInit() {
    this._keyManager = new ActiveDescendantKeyManager(this.options).withWrap();
  }

  /**
   * Sets the panel scrollTop. This allows us to manually scroll to display
   * options below the fold, as they are not actually being focused when active.
   */
  _setScrollTop(scrollTop: number): void {
    if (this.panel) {
      this.panel.nativeElement.scrollTop = scrollTop;
    }
  }

  /** Panel should hide itself when the option list is empty. */
  _setVisibility() {
    Promise.resolve().then(() => this.showPanel = !!this.options.length);
  }

  /** Sets a class on the panel based on its position (used to set y-offset). */
  _getClassList() {
    return {
      'mat-autocomplete-panel-below': this.positionY === 'below',
      'mat-autocomplete-panel-above': this.positionY === 'above',
      'mat-autocomplete-visible': this.showPanel,
      'mat-autocomplete-hidden': !this.showPanel
    };
  }

}

