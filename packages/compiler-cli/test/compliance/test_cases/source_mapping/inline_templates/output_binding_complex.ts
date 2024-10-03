import {Component} from '@angular/core';

@Component({
    selector: 'test-cmp',
    template: `<button (click)="items.push('item' + items.length)">Add Item</button>`,
    standalone: false
})
export class TestCmp {
  items: string[] = [];
}
