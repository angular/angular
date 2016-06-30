import {Component} from '@angular/core';
import {FORM_DIRECTIVES} from '@angular/forms';
import {MdSlideToggle} from '@angular2-material/slide-toggle/slide-toggle';

@Component({
  moduleId: module.id,
  selector: 'switch-demo',
  templateUrl: 'slide-toggle-demo.html',
  styleUrls: ['slide-toggle-demo.css'],
  directives: [MdSlideToggle, FORM_DIRECTIVES]
})
export class SlideToggleDemo {}
