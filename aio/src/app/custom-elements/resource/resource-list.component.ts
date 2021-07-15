import { Component, OnInit } from '@angular/core';

import { Category } from './resource.model';
import { ResourceService } from './resource.service';
import { LocationService } from 'app/shared/location.service';

@Component({
  selector: 'aio-resource-list',
  templateUrl: 'resource-list.component.html'
})
export class ResourceListComponent implements OnInit {

  categories: Category[];
  selectedCategory: Category;

  constructor(
    private resourceService: ResourceService,
    private locationService: LocationService) {
  }

  ngOnInit() {
    const category =  this.locationService.search().category || '';
    // Not using async pipe because cats appear twice in template
    // No need to unsubscribe because categories observable completes.
    this.resourceService.categories.subscribe(cats => {
      this.categories = cats;
      this.selectCategory(category);
    });
  }

  selectCategory(id: string) {
    id = id.toLowerCase();
    this.selectedCategory =
      this.categories.find(category => category.id.toLowerCase() === id) || this.categories[0];
    this.locationService.setSearch('', {category: this.selectedCategory.id});
  }
}
