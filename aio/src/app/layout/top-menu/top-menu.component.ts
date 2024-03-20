import { Component, Input } from '@angular/core';
import { CurrentNode, NavigationNode } from 'app/navigation/navigation.service';

@Component({
  selector: 'aio-top-menu',
  template: `
    <nav aria-label="primary">
      <ul>
        <li *ngFor="let node of nodes" [class.selected]="node.url === currentUrl">
          <a class="nav-link" [href]="node.url" [title]="node.tooltip">
            <span class="nav-link-inner">{{ node.title }}</span>
          </a>
        </li>
      </ul>
    </nav>`
})
export class TopMenuComponent {
  @Input() nodes: NavigationNode[];
  @Input() currentNode: CurrentNode | undefined;

  get currentUrl(): string | null { return this.currentNode ? this.currentNode.url : null; }
}
