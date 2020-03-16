import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import * as treemap from 'webtreemap/build/webtreemap';
import { WebtreegraphNode } from '../../record-formatter/webtreegraph-formatter';

@Component({
  selector: 'ng-webtreegraph-visualizer',
  templateUrl: './webtreegraph-visualizer.component.html',
  styleUrls: ['./webtreegraph-visualizer.component.css'],
})
export class WebtreegraphVisualizerComponent implements AfterViewInit {
  @Input() set records(data: WebtreegraphNode[]) {
    // first element in data is the Application node
    this.webTreeRecords = data[0];
    if (this.tree) {
      this.updateTree();
    }
  }

  webTreeRecords: any = {};

  @ViewChild('webTree') tree: ElementRef;

  ngAfterViewInit(): void {
    this.updateTree();
  }

  updateTree(): void {
    this.removeTree();
    this.createTree();
  }

  createTree(): void {
    treemap.render(this.tree.nativeElement, this.webTreeRecords as any, {
      caption: node => `${node.id}: ${node.size.toFixed(3)} ms`,
    });
  }

  removeTree(): void {
    Array.from(this.tree.nativeElement.children).forEach((child: HTMLElement) => child.remove());
  }
}
