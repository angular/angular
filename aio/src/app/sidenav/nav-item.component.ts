import { Component, EventEmitter, Input, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { Doc, NavNode } from '../nav-engine';

@Component({
  selector: 'aio-navitem',
  templateUrl: 'nav-item.component.html',
  styleUrls: ['nav-item.component.scss']
})
export class NavItemComponent implements OnInit, OnDestroy {
  @Input() selectedNode: EventEmitter<NavNode>;
  @Input() node: NavNode;
  @Input() level = 1;

  isActive = false;
  isSelected = false;
  isItem = false;
  classes: {[index: string]: boolean };
  href = '';
  label = '';
  selectedNodeSubscription: Subscription;
  target = '';
  tooltip = '';

  ngOnInit() {
    this.label      = this.node.navTitle;
    this.tooltip    = this.node.tooltip;
    this.isItem     = this.node.children == null;
    this.href       = this.node.url || this.node.docPath ;
    this.target     = this.node.url ? '_blank' : '_self';
    this.setClasses();

    if (this.selectedNode) {
      this.selectedNodeSubscription = this.selectedNode.subscribe((n: NavNode) => {
        this.isSelected = n &&
        (  n === this.node ||
          (n.ancestorIds && n.ancestorIds.indexOf(this.node.id) > -1)
        );
        // this.isActive = this.isSelected; // disabled per meeting Feb 13
        this.setClasses();
      });
    }
  }

  ngOnDestroy() {
    if (this.selectedNodeSubscription) {
      this.selectedNodeSubscription.unsubscribe();
      this.selectedNodeSubscription = null;
    }
  }

  setClasses() {
    this.classes = {
      ['level-' + this.level]: true,
      active: this.isActive,
      selected: this.isSelected
    };
  }

  itemClicked() {
    this.isActive = true;
    this.isSelected = !!this.node.docId;
    this.setClasses();
    if (this.isSelected) {
      this.selectedNode.emit(this.node);
      return false;
    }
    return !!this.node.url; // let browser handle the external page request.
  }

  headerClicked() {
    this.isActive = !this.isActive;
    if (this.isActive && this.node.docId) {
      this.isSelected = true;
      if (this.selectedNode) {
        this.selectedNode.emit(this.node);
      }
    }
    this.setClasses();
    return false;
  }
}
