import {Component, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {TreeNode, emptyTree} from '../util';

@Component({
  selector: 'tree',
  inputs: ['data'],
  template:
      `<span> {{data.value}} <span template='ngIf data.right != null'><tree [data]='data.right'></tree></span><span template='ngIf data.left != null'><tree [data]='data.left'></tree></span></span>`
})
export class TreeComponent {
  data: TreeNode = emptyTree;
}

@NgModule({imports: [BrowserModule], bootstrap: [TreeComponent], declarations: [TreeComponent]})
export class AppModule {
}
