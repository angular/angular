import {Component, OnInit} from '@angular/core';
// #docregion import-common-module
import {CommonModule} from '@angular/common';
// #enddocregion import-common-module
// #docregion import-forms-module
import {FormsModule} from '@angular/forms'; // <--- JavaScript import from Angular
// #enddocregion import-forms-module
import {Item} from './item';
import {ItemDetailComponent} from './item-detail/item-detail.component';
import {ItemSwitchComponents} from './item-switch.component';
import {StoutItemComponent} from './item-switch.component';

// #docregion import-common-module, import-forms-module
@Component({
  standalone: true,
  // #enddocregion import-common-module, import-forms-module
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],

  // #docregion import-common-module, import-forms-module
  imports: [
    CommonModule, // <-- import into the component
    // #enddocregion import-common-module
    FormsModule, // <--- import into the component
    // #enddocregion import-forms-module
    ItemDetailComponent,
    ItemSwitchComponents,
    StoutItemComponent,
    // #docregion import-common-module, import-forms-module
  ],
})
export class AppComponent implements OnInit {
  // #enddocregion import-common-module, import-forms-module
  canSave = true;
  isSpecial = true;
  isUnchanged = true;

  isActive = true;
  nullCustomer: string | null = null;
  currentCustomer = {
    name: 'Laura',
  };

  item!: Item; // defined to demonstrate template context precedence
  items: Item[] = [];

  // #docregion item
  currentItem!: Item;
  // #enddocregion item

  // trackBy change counting
  itemsNoTrackByCount = 0;
  itemsWithTrackByCount = 0;
  itemsWithTrackByCountReset = 0;
  itemIdIncrement = 1;

  // #docregion setClasses
  currentClasses: Record<string, boolean> = {};
  // #enddocregion setClasses

  // #docregion setStyles
  currentStyles: Record<string, string> = {};
  // #enddocregion setStyles

  ngOnInit() {
    this.resetItems();
    this.setCurrentClasses();
    this.setCurrentStyles();
    this.itemsNoTrackByCount = 0;
  }

  setUppercaseName(name: string) {
    this.currentItem.name = name.toUpperCase();
  }

  // #docregion setClasses
  setCurrentClasses() {
    // CSS classes: added/removed per current state of component properties
    this.currentClasses = {
      saveable: this.canSave,
      modified: !this.isUnchanged,
      special: this.isSpecial,
    };
  }
  // #enddocregion setClasses

  // #docregion setStyles
  setCurrentStyles() {
    // CSS styles: set per current state of component properties
    this.currentStyles = {
      'font-style': this.canSave ? 'italic' : 'normal',
      'font-weight': !this.isUnchanged ? 'bold' : 'normal',
      'font-size': this.isSpecial ? '24px' : '12px',
    };
  }
  // #enddocregion setStyles

  isActiveToggle() {
    this.isActive = !this.isActive;
  }

  giveNullCustomerValue() {
    this.nullCustomer = 'Kelly';
  }

  resetItems() {
    this.items = Item.items.map((item) => item.clone());
    this.currentItem = this.items[0];
    this.item = this.currentItem;
  }

  resetList() {
    this.resetItems();
    this.itemsWithTrackByCountReset = 0;
    this.itemsNoTrackByCount = ++this.itemsNoTrackByCount;
  }

  changeIds() {
    this.items.forEach((i) => (i.id += 1 * this.itemIdIncrement));
    this.itemsWithTrackByCountReset = -1;
    this.itemsNoTrackByCount = ++this.itemsNoTrackByCount;
    this.itemsWithTrackByCount = ++this.itemsWithTrackByCount;
  }

  clearTrackByCounts() {
    this.resetItems();
    this.itemsNoTrackByCount = 0;
    this.itemsWithTrackByCount = 0;
    this.itemIdIncrement = 1;
  }
  // #docregion trackByItems
  trackByItems(index: number, item: Item): number {
    return item.id;
  }
  // #enddocregion trackByItems

  trackById(index: number, item: any): number {
    return item.id;
  }

  getValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }
  // #docregion import-common-module, import-forms-module
}
// #enddocregion import-common-module, import-forms-module
