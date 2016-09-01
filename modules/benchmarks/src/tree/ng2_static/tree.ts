import {Component, Input, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {TreeNode, emptyTree, maxDepth} from '../util';

function createTreeComponent(level: number, isLeaf: boolean) {
  const nextTreeEl = `tree${level+1}`;
  const template = isLeaf ?
      `<span> {{data.value}} </span>` :
      `<span> {{data.value}} <span><${nextTreeEl} [data]='data.right'></${nextTreeEl}></span><span><${nextTreeEl} [data]='data.left'></${nextTreeEl}></span></span>`;

  @Component({selector: `tree${level}`, template: template})
  class TreeComponent {
    @Input()
    data: TreeNode;
  }

  return TreeComponent;
}

@Component({selector: 'tree', template: `<tree0 *ngIf="data.left != null" [data]='data'></tree0>`})
export class RootTreeComponent {
  @Input()
  data: TreeNode = emptyTree;
}

function createModule(): any {
  const components: any[] = [RootTreeComponent];
  for (var i = 0; i <= maxDepth; i++) {
    components.push(createTreeComponent(i, i === maxDepth));
  }

  @NgModule({imports: [BrowserModule], bootstrap: [RootTreeComponent], declarations: [components]})
  class AppModule {
  }

  return AppModule;
}

export const AppModule = createModule();
