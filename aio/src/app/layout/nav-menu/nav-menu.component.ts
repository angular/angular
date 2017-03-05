import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { NavigationNode } from 'app/navigation/navigation.service';

@Component({
  selector: 'aio-nav-menu',
  template: `<aio-nav-item *ngFor="let node of nodes" [selectedNodes]="selectedNodes" [node]="node"></aio-nav-item>`
})
export class NavMenuComponent {

  @Input()
  selectedNodes: NavigationNode[];

  @Input()
  nodes: NavigationNode[];
}
