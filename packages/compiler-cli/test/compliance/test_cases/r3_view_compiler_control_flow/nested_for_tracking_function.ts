import {Component} from '@angular/core';

@Component({
    template: `
    @for (grandparent of items; track trackByGrandparent(grandparent, $index)) {
      @for (parent of grandparent.items; track trackByParent(parent, $index)) {
        @for (child of parent.items; track trackByChild(child, $index)) {

        }
      }
    }
  `,
    standalone: false
})
export class MyApp {
  items: any[] = [];
  trackByGrandparent = (item: any, index: number) => index;
  trackByParent = (item: any, index: number) => index;
  trackByChild = (item: any, index: number) => index;
}
