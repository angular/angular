import {Component, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {TreeNode, emptyTree} from '../util';

@Component({
  selector: 'tree',
  inputs: ['data'],
  template:
      `<span [style.backgroundColor]="data.depth % 2 ? '' : 'grey'"> {{data.value}} </span><tree *ngIf='data.right != null' [data]='data.right'></tree><tree *ngIf='data.left != null' [data]='data.left'></tree>`
})
export class TreeComponent {
  data: TreeNode = emptyTree;
}

@NgModule({imports: [BrowserModule], bootstrap: [TreeComponent], declarations: [TreeComponent]})
export class AppModule {
}
