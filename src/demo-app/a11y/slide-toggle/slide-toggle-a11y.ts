import {Component} from '@angular/core';
import {MdSnackBar} from '@angular/material';


@Component({
  moduleId: module.id,
  selector: 'slide-toggle-a11y',
  templateUrl: 'slide-toggle-a11y.html'
})
export class SlideToggleAccessibilityDemo {
  emailToggle: boolean = true;
  termsToggle: boolean = false;
  musicToggle: boolean = false;

  constructor(private snackBar: MdSnackBar) {}

  onFormSubmit() {
    this.snackBar.open('Terms and condistions accepted!', '', {duration: 2000});
  }
}
