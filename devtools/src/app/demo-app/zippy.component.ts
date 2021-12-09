import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-zippy',
  templateUrl: './zippy.component.html',
  styleUrls: ['./zippy.component.scss'],
})
export class ZippyComponent {
  @Input() title: string;
  visible = false;
}
