import { Component, HostListener, OnInit } from '@angular/core';
import { PlatformLocation } from '@angular/common';

import { Category } from './resource.model';
import { ResourceService } from './resource.service';

@Component({
  selector: 'aio-resource-list',
  templateUrl: 'resource-list.component.html'
})
export class ResourceListComponent implements OnInit {

  categories: Category[];
  location: string;
  scrollPos = 0;

  constructor(
    location: PlatformLocation,
    private resourceService: ResourceService) {
    this.location = location.pathname.replace(/^\/+/, '');
  }

  href(cat: {id: string}) {
    return this.location + '#' + cat.id;
  }

  ngOnInit() {
    // Not using async pipe because cats appear twice in template
    // No need to unsubscribe because categories observable completes.
    this.resourceService.categories.subscribe(cats => this.categories = cats);
  }

  @HostListener('window:scroll', ['$event.target'])
  onScroll(target: any) {
    this.scrollPos = target ? target.scrollTop || target.body.scrollTop ||  0 : 0;
  }
}
