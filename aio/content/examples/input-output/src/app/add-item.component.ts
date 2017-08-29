import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Item } from './items';

@Component({
  selector: 'add-item',
  templateUrl: './add-item.component.html',
  styles: ['./add-item.component.css']
})
export class AddItemComponent implements OnInit {

  @Output()
  newItemEvent: EventEmitter<string> = new EventEmitter<string>();


  constructor() { }

  ngOnInit() {
  }

  addNewItem(value:string) {
    this.newItemEvent.emit(value);
    console.log(value);
  }

}
