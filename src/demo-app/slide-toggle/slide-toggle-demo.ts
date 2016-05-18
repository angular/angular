import {Component} from '@angular/core';
import {MdSlideToggle} from '../../components/slide-toggle/slide-toggle';

@Component({
  selector: 'switch-demo',
  templateUrl: 'demo-app/slide-toggle/slide-toggle-demo.html',
  styleUrls: ['demo-app/slide-toggle/slide-toggle-demo.css'],
  directives: [MdSlideToggle]
})
export class SlideToggleDemo {}
