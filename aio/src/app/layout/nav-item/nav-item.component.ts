import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NavigationNode } from 'app/navigation/navigation.model';

@Component({
  selector: 'aio-nav-item',
  templateUrl: 'nav-item.component.html',
})
export class NavItemComponent implements OnChanges {
  @Input() selectedNodes: NavigationNode[];
  @Input() node: NavigationNode;
  @Input() level = 1;

  isExpanded = false;
  isSelected = false;
  classes: {[index: string]: boolean };

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedNodes'] || changes['node']) {
      const ix = this.selectedNodes.indexOf(this.node);
      this.isSelected = ix !== -1;
      if (ix !== 0) { this.isExpanded = this.isSelected; }
    }
    this.setClasses();
  }

  setClasses() {
    this.classes = {
      ['level-' + this.level]: true,
      collapsed: !this.isExpanded,
      expanded: this.isExpanded,
      selected: this.isSelected
    };
  }

  headerClicked() {
    this.isExpanded = !this.isExpanded;
    this.setClasses();
  }
}
