import {Component} from '@angular/core';
import {FormControl} from '@angular/forms';
import {MatLegacyChipInputEvent} from '@angular/material/legacy-chips';

/**
 * @title Chips with form control
 */
@Component({
  selector: 'chips-form-control-example',
  templateUrl: 'chips-form-control-example.html',
  styleUrls: ['chips-form-control-example.css'],
})
export class ChipsFormControlExample {
  keywords = new Set(['angular', 'how-to', 'tutorial']);
  formControl = new FormControl(['angular']);

  addKeywordFromInput(event: MatLegacyChipInputEvent) {
    if (event.value) {
      this.keywords.add(event.value);
      event.chipInput!.clear();
    }
  }

  removeKeyword(keyword: string) {
    this.keywords.delete(keyword);
  }
}
