import { Component, Input } from '@angular/core';
import { CurrentNode, NavigationNode } from 'app/navigation/navigation.service';

@Component({
  selector: 'aio-nav-menu',
  template: `
  <nav [attr.aria-label]="navLabel || null">
    <aio-nav-item *ngFor="let node of filteredNodes"
      [node]="node"
      [selectedNodes]="currentNode?.nodes"
      [isWide]="isWide">
    </aio-nav-item>
  </nav>`
})
export class NavMenuComponent {
  @Input() currentNode: CurrentNode | undefined;
  @Input() isWide = false;
  @Input() nodes: NavigationNode[];
  @Input() navLabel: string;
  get filteredNodes() { return this.nodes ? this.nodes.filter(n => !n.hidden) : []; }
}
