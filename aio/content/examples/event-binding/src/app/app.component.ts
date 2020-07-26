import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, NgZone, ViewChild} from '@angular/core';

import {Item} from './item';

@Component(
    {selector: 'app-root', templateUrl: './app.component.html', styleUrls: ['./app.component.css']})
export class AppComponent implements AfterViewInit {
  @ViewChild('btnToggle') btnToggle: ElementRef;
  currentItem = {name: 'teapot'};
  clickMessage = '';
  zoneMessage = '';

  show = false;

  constructor(private ngZone: NgZone, private cdr: ChangeDetectorRef) {}

  ngAfterViewInit() {
    this.ngZone.runOutsideAngular(() => {
      const el = this.btnToggle.nativeElement as HTMLElement;
      el.addEventListener('click', e => {
        this.show = true;
        this.cdr.detectChanges();
      })
    })
  }

  onSave(event?: KeyboardEvent) {
    const evtMsg = event ? ' Event target is ' + (<HTMLElement>event.target).textContent : '';
    alert('Saved.' + evtMsg);
    if (event) {
      event.stopPropagation();
    }
  }

  deleteItem(item: Item) {
    alert(`Delete the ${item.name}.`);
  }

  onClickMe(event?: KeyboardEvent) {
    const evtMsg = event ? ' Event target class is ' + (<HTMLElement>event.target).className : '';
    alert('Click me.' + evtMsg);
  }

  handleClickOnParentDiv() {
    alert('clicked on parent');
  }

  handleClickOnChildDiv() {
    alert('clicked on child');
  }

  handleScroll(event?: Event) {
    event.preventDefault()
    alert(`preventDefault does not work in passive event handler, ${event.defaultPrevented}`)
  }

  handleOnceClick() {
    alert('this handle should only be called once');
  }

  handleClickWithMixedOptions() {}

  clickInNoopZone() {
    this.zoneMessage =
        NgZone.isInAngularZone() ? `inside the angular zone` : 'outside of the angular zone';
  }

  clickInNgZone() {
    this.zoneMessage =
        NgZone.isInAngularZone() ? `inside the angular zone` : 'outside of the angular zone';
  }
}
