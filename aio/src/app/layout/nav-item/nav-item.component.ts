import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NavigationNode } from 'app/navigation/navigation.service';

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
      this.isSelected = this.selectedNodes.indexOf(this.node) !== -1;
      this.isExpanded = this.isExpanded || this.isSelected;
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

  itemClicked() {
    this.isExpanded = true;
    this.isSelected = !!this.node;
  }

  headerClicked() {
    this.isExpanded = !this.isExpanded;
    this.setClasses();
  }
}
