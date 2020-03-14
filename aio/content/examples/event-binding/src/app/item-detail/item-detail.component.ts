/* tslint:disable use-input-property-decorator use-output-property-decorator */
import { Component, EventEmitter, Input, Output } from '@angular/core';

import { Item } from '../item';

@Component({
  selector: 'app-item-detail',
  styleUrls: ['./item-detail.component.css'],
  templateUrl: './item-detail.component.html'
})
export class ItemDetailComponent {

  @Input() item;
  itemImageUrl = 'assets/teapot.svg';
  lineThrough = '';
  displayNone = '';
  @Input() prefix = '';

  // #docregion deleteRequest
  // 이 컴포넌트는 직접 히어로를 삭제하지 않고 히어로 삭제 요청을 보내기만 합니다.
  @Output() deleteRequest = new EventEmitter<Item>();

  delete() {
    this.deleteRequest.emit(this.item);
    this.displayNone = this.displayNone ? '' : 'none';
    this.lineThrough = this.lineThrough ? '' : 'line-through';
  }
  // #enddocregion deleteRequest

}
