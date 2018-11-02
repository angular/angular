import { Component } from '@angular/core';
import { trigger, transition, state, animate, style, keyframes } from '@angular/animations';

@Component({
  selector: 'app-status-slider',
  templateUrl: 'status-slider.component.html',
  styleUrls: ['status-slider.component.css'],
  animations: [
    trigger('slideStatus', [
      state('inactive', style({ backgroundColor: 'blue' })),
      state('active', style({ backgroundColor: 'orange' })),

// #docregion keyframesWithOffsets
      transition('* => active', [
        animate('2s', keyframes([
          style({ backgroundColor: 'blue', offset: 0}),
          style({ backgroundColor: 'red', offset: 0.8}),
          style({ backgroundColor: 'orange', offset: 1.0})
        ])),
      ]),
      transition('* => inactive', [
        animate('2s', keyframes([
          style({ backgroundColor: 'orange', offset: 0}),
          style({ backgroundColor: 'red', offset: 0.2}),
          style({ backgroundColor: 'blue', offset: 1.0})
        ]))
      ]),
// #enddocregion keyframesWithOffsets

// #docregion keyframes
      transition('* => active', [
        animate('2s', keyframes([
          style({ backgroundColor: 'blue' }),
          style({ backgroundColor: 'red' }),
          style({ backgroundColor: 'orange' })
        ]))
// #enddocregion keyframes
      ]),
    ])
  ]
})
export class StatusSliderComponent {
  status: 'active' | 'inactive' = 'inactive';

  toggle() {
    if (this.status === 'active') {
      this.status = 'inactive';
    } else {
      this.status = 'active';
    }
  }
}
