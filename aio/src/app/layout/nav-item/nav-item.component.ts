import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { NavigationService, NavigationNode } from 'app/navigation/navigation.service';

@Component({
  selector: 'aio-nav-item',
  template: `
    <div>
      <a *ngIf="node.path || node.url"
          [href]="node.path || node.url"
          [ngClass]="classes"
          target={{node.target}}
          title={{node.title}}
          class="vertical-menu">
        {{node.title}}
        <template [ngIf]="node.children">
          <md-icon [class.active]="!isActive">keyboard_arrow_right</md-icon>
          <md-icon [class.active]="isActive">keyboard_arrow_down</md-icon>
        </template>
      </a>
      <div *ngIf="!(node.path || node.url)" [ngClass]="classes">{{node.title}}</div>
      <div class="TODO:heading-children" [ngClass]="classes" *ngIf="node.children">
        <aio-nav-item *ngFor="let node of node.children" [level]="level + 1" [node]="node"></aio-nav-item>
      </div>
    </div>`,
  styles: ['nav-item.component.scss'],
  // we don't expect the inputs to change
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavItemComponent implements OnInit {
  @Input() node: NavigationNode;
  @Input() level = 1;

  isActive: boolean;

  classes: {[index: string]: boolean };

  constructor(navigation: NavigationService) {
    navigation.activeNodes.subscribe(nodes => {
      this.classes['active'] = nodes.indexOf(this.node) !== -1;
    });
  }

  ngOnInit() {
    this.classes = {
      ['level-' + this.level]: true,
      active: false,
      heading: !!this.node.children
    };
  }
}
