import {Component, ViewEncapsulation} from '@angular/core';
import {MdSnackBar} from '@angular/material';

@Component({
  moduleId: module.id,
  selector: 'icon-a11y',
  templateUrl: 'icon-a11y.html',
  encapsulation: ViewEncapsulation.None,
})
export class IconAccessibilityDemo {
  constructor(private snackBar: MdSnackBar) {}

  deleteIcon() {
    this.snackBar.open('Item deleted', '', {duration: 2000});
  }
}
