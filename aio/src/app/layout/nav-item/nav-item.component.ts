import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NavigationNode } from 'app/navigation/navigation.model';

@Component({
  selector: 'aio-nav-item',
  templateUrl: 'nav-item.component.html',
})
export class NavItemComponent implements OnChanges {
  @Input() isWide = false;
  @Input() level = 1;
  @Input() node: NavigationNode;
  @Input() selectedNodes: NavigationNode[];

  isExpanded = false;
  isSelected = false;
  classes: {[index: string]: boolean };

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedNodes'] || changes['node'] || changes['isWide']) {
      if (this.selectedNodes) {
        const ix = this.selectedNodes.indexOf(this.node);
        this.isSelected = ix !== -1; // this node is the selected node or its ancestor
        this.isExpanded = this.isSelected || // expand if selected or ...
          // preserve expanded state when display is wide; collapse in mobile.
          (this.isWide && this.isExpanded);
      } else {
        this.isSelected = false;
      }
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
