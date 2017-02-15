import { Component, EventEmitter, Output, OnInit, OnChanges, ViewChild } from '@angular/core';
import { MdSidenav } from '@angular/material/sidenav';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/take';

import { Doc, NavEngine, NavMap, NavMapService, NavNode } from '../nav-engine';

@Component({
  selector: 'aio-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
  animations: []
})
export class SidenavComponent implements OnInit {

  @Output() isOverlayMode = new EventEmitter<boolean>();
  @ViewChild('sidenav') private sidenav: MdSidenav;

  currentDoc: Observable<Doc>;
  currentDocId: string;
  isSideBySide = false;
  nodes: Observable<NavNode[]>;
  selectedNode = new EventEmitter<NavNode>();
  sideBySideWidth = 600;
  windowWidth = 0;

  constructor(
    private navEngine: NavEngine,
    private navMapService: NavMapService ) {}

  ngOnInit() {
    this.onResize(window.innerWidth);

    this.nodes = this.navMapService.navMap.map( navMap => navMap.nodes );

    this.currentDoc = this.navEngine.currentDoc
      .do(doc => {
        // Side effect: when the current doc changes,
        // get its NavNode and alert the navigation panel
        this.currentDocId = doc.metadata.docId;
        this.navMapService.navMap.take(1) // take makes sure it completes!
        .map(navMap => navMap.docs.get(this.currentDocId))
        .subscribe( node => this.selectedNode.emit(node));
      });

    this.selectedNode.subscribe((node: NavNode) => {
      // Navigate when the user selects a doc other than the current doc
      const docId = node && node.docId;
      if (docId && docId !== this.currentDocId) {
        this.navEngine.navigate(docId);
      }
    });
  }

  onResize(width) {
    this.windowWidth = width;
    this.isSideBySide = width > this.sideBySideWidth;
    this.sidenav.mode = this.isSideBySide ? 'side' : 'over';
    this.isOverlayMode.emit(!this.isSideBySide);
  }

  toggle() {
    this.sidenav.toggle();
  }
}
