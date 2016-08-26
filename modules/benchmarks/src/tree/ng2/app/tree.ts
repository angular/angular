import {Component, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {TreeNode, emptyTree} from '../../app/util';

@Component({
  selector: 'tree',
  inputs: ['data'],
  template:
      `<span> {{data.value}} <span template='ngIf data.right != null'><tree [data]='data.right'></tree></span><span template='ngIf data.left != null'><tree [data]='data.left'></tree></span></span>`
})
class TreeComponent {
  data: TreeNode;
}

@Component({selector: 'app', template: `<tree [data]='initData'></tree>`})
export class AppComponent {
  initData: TreeNode;
  constructor() { this.initData = emptyTree(); }
}

@NgModule({
  imports: [BrowserModule],
  bootstrap: [AppComponent],
  declarations: [TreeComponent, AppComponent]
})
export class AppModule {
}
