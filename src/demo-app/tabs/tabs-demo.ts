import {Component, ViewEncapsulation} from '@angular/core';
import {Router} from '@angular/router';
import {Observable} from 'rxjs/Observable';

@Component({
  moduleId: module.id,
  selector: 'tabs-demo',
  templateUrl: 'tabs-demo.html',
  styleUrls: ['tabs-demo.css'],
  encapsulation: ViewEncapsulation.None,
})
export class TabsDemo {
  tabLinks = [
    { label: 'Sun', link: 'sunny-tab'},
    { label: 'Rain', link: 'rainy-tab'},
    { label: 'Fog', link: 'foggy-tab'},
  ];
  activeLinkIndex = 0;

  tabs = [
    { label: 'Tab One', content: 'This is the body of the first tab' },
    { label: 'Tab Two', content: 'This is the body of the second tab' },
    { label: 'Tab Three', content: 'This is the body of the third tab' },
  ];

  asyncTabs: Observable<any>;

  constructor(private router: Router) {
    this.asyncTabs = Observable.create((observer: any) => {
      setTimeout(() => {
        observer.next(this.tabs);
      }, 1000);
    });

    // Initialize the index by checking if a tab link is contained in the url.
    // This is not an ideal check and can be removed if routerLink exposes if it is active.
    // https://github.com/angular/angular/pull/12525
    this.activeLinkIndex =
        this.tabLinks.indexOf(this.tabLinks.find(tab => router.url.indexOf(tab.link) != -1));
  }
}


@Component({
  moduleId: module.id,
  selector: 'sunny-routed-content',
  template: 'This is the routed body of the sunny tab.',
})
export class SunnyTabContent {}


@Component({
  moduleId: module.id,
  selector: 'rainy-routed-content',
  template: 'This is the routed body of the rainy tab.',
})
export class RainyTabContent {}


@Component({
  moduleId: module.id,
  selector: 'foggy-routed-content',
  template: 'This is the routed body of the foggy tab.',
})
export class FoggyTabContent {}
