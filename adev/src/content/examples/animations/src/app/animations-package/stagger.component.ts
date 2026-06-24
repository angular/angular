// #docplaster
// #docregion
import {Component, HostBinding, signal} from '@angular/core';
import {trigger, transition, animate, style, query, stagger} from '@angular/animations';

@Component({
  selector: 'app-stagger',
  templateUrl: 'stagger.component.html',
  styleUrls: ['stagger.component.css'],
  animations: [
    trigger('pageAnimations', [
      transition(':enter', [
        query('.item', [
          style({opacity: 0, transform: 'translateY(-10px)'}),
          stagger(200, [animate('500ms ease-in', style({opacity: 1, transform: 'none'}))]),
        ]),
      ]),
    ]),
  ],
})
export class StaggerComponent {
  @HostBinding('@pageAnimations')
  items = [1, 2, 3];
}
