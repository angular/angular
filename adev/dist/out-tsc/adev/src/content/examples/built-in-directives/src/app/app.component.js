import {__esDecorate, __runInitializers} from 'tslib';
import {Component} from '@angular/core';
import {JsonPipe} from '@angular/common';
// #docregion import-ng-if
import {NgIf} from '@angular/common';
// #enddocregion import-ng-if
// #docregion import-ng-for
import {NgFor} from '@angular/common';
// #enddocregion import-ng-for
// #docregion import-ng-switch
import {NgSwitch, NgSwitchCase, NgSwitchDefault} from '@angular/common';
// #enddocregion import-ng-switch
// #docregion import-ng-style
import {NgStyle} from '@angular/common';
// #enddocregion import-ng-style
// #docregion import-ng-class
import {NgClass} from '@angular/common';
// #enddocregion import-ng-class
// #docregion import-forms-module
import {FormsModule} from '@angular/forms';
// #enddocregion import-forms-module
import {Item} from './item';
import {ItemDetailComponent} from './item-detail/item-detail.component';
import {ItemSwitchComponents} from './item-switch.component';
import {StoutItemComponent} from './item-switch.component';
// #docregion import-ng-if, import-ng-for, import-ng-switch, import-ng-style, import-ng-class, import-forms-module
let AppComponent = (() => {
  let _classDecorators = [
    Component({
      // #enddocregion import-ng-if, import-ng-for, import-ng-switch, import-ng-style, import-ng-class, import-forms-module
      selector: 'app-root',
      templateUrl: './app.component.html',
      styleUrls: ['./app.component.css'],
      imports: [
        // #docregion import-ng-if
        NgIf, // <-- import into the component
        // #enddocregion import-ng-if
        // #docregion import-ng-for
        NgFor, // <-- import into the component
        // #enddocregion import-ng-for
        // #docregion import-ng-style
        NgStyle, // <-- import into the component
        // #enddocregion import-ng-style
        // #docregion import-ng-switch
        NgSwitch, // <-- import into the component
        NgSwitchCase,
        NgSwitchDefault,
        // #enddocregion import-ng-switch
        // #docregion import-ng-class
        NgClass, // <-- import into the component
        // #enddocregion import-ng-class
        // #docregion import-forms-module
        FormsModule, // <--- import into the component
        // #enddocregion import-forms-module
        JsonPipe,
        ItemDetailComponent,
        ItemSwitchComponents,
        StoutItemComponent,
        // #docregion import-ng-if, import-ng-for, import-ng-style, import-ng-switch, import-ng-class, import-forms-module
      ],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var AppComponent = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      AppComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    // #enddocregion import-ng-if, import-ng-for, import-ng-style, import-ng-switch, import-ng-class, import-forms-module
    canSave = true;
    isSpecial = true;
    isUnchanged = true;
    isActive = true;
    nullCustomer = null;
    currentCustomer = {
      name: 'Laura',
    };
    item; // defined to demonstrate template context precedence
    items = [];
    // #docregion item
    currentItem;
    // #enddocregion item
    // trackBy change counting
    itemsNoTrackByCount = 0;
    itemsWithTrackByCount = 0;
    itemsWithTrackByCountReset = 0;
    itemIdIncrement = 1;
    // #docregion setClasses
    currentClasses = {};
    // #enddocregion setClasses
    // #docregion setStyles
    currentStyles = {};
    // #enddocregion setStyles
    ngOnInit() {
      this.resetItems();
      this.setCurrentClasses();
      this.setCurrentStyles();
      this.itemsNoTrackByCount = 0;
    }
    setUppercaseName(name) {
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
    trackByItems(index, item) {
      return item.id;
    }
    // #enddocregion trackByItems
    trackById(index, item) {
      return item.id;
    }
    getValue(event) {
      return event.target.value;
    }
  };
  return (AppComponent = _classThis);
})();
export {AppComponent};
// #enddocregion import-ng-if, import-ng-for, import-ng-switch, import-ng-style, import-ng-class, import-forms-module
//# sourceMappingURL=app.component.js.map
