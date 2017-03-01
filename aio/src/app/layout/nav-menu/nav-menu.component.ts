import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { NavigationNode } from 'app/navigation/navigation.service';

@Component({
  selector: 'aio-nav-menu',
  template: `<aio-nav-item *ngFor="let node of nodes" [node]="node"></aio-nav-item>`,
  // we don't expect the inputs to change
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavMenuComponent {

  @Input()
  nodes: NavigationNode[];
}
