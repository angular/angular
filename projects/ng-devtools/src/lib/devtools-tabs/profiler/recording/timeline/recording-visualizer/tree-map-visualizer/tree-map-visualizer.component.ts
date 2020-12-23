import { AfterViewInit, Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import * as treemap from 'webtreemap/build/webtreemap';
import { TreeMapNode, TreeMapFormatter } from '../../record-formatter/tree-map-formatter';
import { Subject } from 'rxjs';
import { throttleTime } from 'rxjs/operators';
import { ProfilerFrame } from 'protocol';

@Component({
  selector: 'ng-tree-map-visualizer',
  templateUrl: './tree-map-visualizer.component.html',
  styleUrls: ['./tree-map-visualizer.component.scss'],
})
export class TreeMapVisualizerComponent implements AfterViewInit, OnInit {
  private _formatter = new TreeMapFormatter();

  @Input() set frame(frame: ProfilerFrame) {
    // first element in data is the Application node
    this.treeMapRecords = this._formatter.formatFrame(frame);
    if (this.tree) {
      this.updateTree();
    }
  }

  private resize$ = new Subject<void>();

  treeMapRecords: TreeMapNode;

  @ViewChild('webTree') tree: ElementRef;

  ngAfterViewInit(): void {
    this.updateTree();
  }

  ngOnInit(): void {
    this.resize$
      .asObservable()
      .pipe(throttleTime(100))
      .subscribe((_) => this.updateTree());
  }

  updateTree(): void {
    this.removeTree();
    this.createTree();
  }

  createTree(): void {
    treemap.render(this.tree.nativeElement, this.treeMapRecords as any, {
      padding: [20, 5, 5, 5],
      caption: (node) => `${node.id}: ${node.size.toFixed(3)} ms`,
      showNode: () => true,
    });
  }

  removeTree(): void {
    Array.from(this.tree.nativeElement.children).forEach((child: HTMLElement) => child.remove());
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.resize$.next();
  }
}
