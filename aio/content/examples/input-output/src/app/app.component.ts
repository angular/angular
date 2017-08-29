import { Component } from '@angular/core';
import { Item } from './items';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = '@Input/@Output Demo';

  items = ['item 1', 'item 2', 'item 3', 'item 4'];

  addItem(newItem: string) {
    console.log('addItem()');
    this.items.push(newItem);
  }

}
