import { Component, Input } from '@angular/core';
import { NavigationNode } from 'app/navigation/navigation.service';

@Component({
  selector: 'aio-top-menu',
  template: `
    <ul role="navigation">
      <li *ngFor="let node of nodes"><a class="nav-link" [href]="node.url" [title]="node.title">{{ node.title }}</a></li>
    </ul>`
})
export class TopMenuComponent {
  @Input() nodes: NavigationNode[];

}
