import { Component } from '@angular/core';
import { NavigationService, NavigationViews, NavigationNode } from 'app/navigation/navigation.service';

import { Observable } from 'rxjs/Observable';
import 'rxjs/operator/map';

const topBar = 'TopBar';

@Component({
  selector: 'aio-top-menu',
  template: `
    <ul role="navigation">
      <li><a class="nav-link home" href="/"><img src="{{ homeImageUrl }}" title="Home" alt="Home"></a></li>
      <li *ngFor="let node of nodes | async"><a class="nav-link" [href]="node.path || node.url">{{ node.title }}</a></li>
    </ul>`,
  styleUrls: ['top-menu.component.scss']
})
export class TopMenuComponent {

  readonly homeImageUrl = 'assets/images/logos/standard/logo-nav.png';
  nodes: Observable<NavigationNode[]>;

  constructor(navigationService: NavigationService) {
    this.nodes = navigationService.navigationViews.map(views => views[topBar]);
  }
}
