import { Component, EventEmitter, Output, OnInit, OnChanges, ViewChild } from '@angular/core';
import { MdSidenav } from '@angular/material/sidenav';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/combineLatest';
import { Doc, NavMap, NavNode, DocService } from '../doc-manager';
import { NavEngine, NavMapService} from '../nav-engine'

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
  selectedNode:NavNode;
  sideBySideWidth = 600;
  windowWidth = 0;

  constructor(
    private navEngine: NavEngine,
    private docService: DocService,
    private navMapService: NavMapService )
  {
    this.nodes = this.navMapService.navMap.map( navMap => navMap.nodes );

    const currentDoc = this.navEngine.currentUrl
    .switchMap(url => this.docService.getDoc(url))
    .publishReplay(1);

    currentDoc.connect();

    this.currentDoc = currentDoc;
  }

  ngOnInit() {
    this.onResize(window.innerWidth);
  }
  onSelect(node:NavNode){
    console.log('selected', node)
    this.selectedNode = node;
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
