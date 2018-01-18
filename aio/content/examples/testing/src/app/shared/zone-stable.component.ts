import { Component, OnInit, NgZone } from '@angular/core';

@Component({
  selector: 'zone-stable',
  template: '<p><i>{{isStable}}</i></p>'
})
export class ZoneStableComponent implements OnInit {
  isStable = false;
  constructor(private ngZone: NgZone) {
    this.ngZone.onStable.subscribe(() => {
      this.isStable = true;
    });
  }

  ngOnInit(): void {
    setTimeout(() => {
      Promise.resolve(0).then(() => {});
    });
  }
}
