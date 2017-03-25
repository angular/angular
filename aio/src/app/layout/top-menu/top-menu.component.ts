import { Component, Input } from '@angular/core';
import { NavigationNode } from 'app/navigation/navigation.service';

@Component({
  selector: 'aio-top-menu',
  template: `
    <ul role="navigation">
      <li><a class="nav-link" href="overview" title="Angular Documentation">Docs</a></li>
      <li *ngFor="let node of nodes"><a class="nav-link" [href]="node.path || node.url" [title]="node.title">{{ node.title }}</a></li>
    </ul>`,
  styleUrls: ['top-menu.component.scss']
})
export class TopMenuComponent {
  @Input() nodes: NavigationNode[];

}
