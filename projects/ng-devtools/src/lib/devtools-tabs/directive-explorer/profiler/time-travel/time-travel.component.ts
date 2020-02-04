import { Component, Input, ViewChild, OnDestroy } from '@angular/core';

import uuid from 'uuid';
import { Options, Edge, DataSet, Data, Node, VisNetworkService } from 'ngx-vis';

import { ComponentRecord } from 'protocol';
import { Timeline, TimelineNode, buildTimeline, TimelineNodeState, TimelineFrame } from './time-travel-builder';
import { MatSlider } from '@angular/material/slider';

@Component({
  selector: 'ng-time-travel',
  templateUrl: './time-travel.component.html',
  styleUrls: ['./time-travel.component.css']
})
export class TimeTravelComponent implements OnDestroy {
  timeline: Timeline = [];

  visNetwork = 'timeline';

  visNetworkData: Data;
  nodes: DataSet<Node>;
  edges: DataSet<Edge>;
  visNetworkOptions: Options = {
    autoResize: true,
    height: '100%',
    width: '100%',
    physics: false,
    layout: {
      randomSeed: 1,
      hierarchical: {
        enabled: true,
        levelSeparation: 50,
        nodeSpacing: 200
      }
    },
    nodes: {
      shape: 'box',
      margin: {
        top: 8,
        bottom: 8,
        left: 10,
        right: 10
      },
      shapeProperties: {
        borderRadius: 2
      }
    },
  };

  selectedEntry: TimelineNode;
  currentFrame: TimelineFrame;

  @ViewChild(MatSlider) slider: MatSlider;

  private _nodeIdToNodes: Map<string, TimelineNode>;

  constructor(private _visNetworkService: VisNetworkService) {}

  @Input() set stream(stream: ComponentRecord[]) {
    this.timeline = buildTimeline(stream);
    this._showFrame(this.timeline[0]);
  }

  showSeparator() {
    return Object.keys(this.selectedEntry.instanceState.props).length > 0 && this.selectedEntry.duration;
  }

  move(direction: number) {
    const idx = this.slider.value + direction;
    if (idx >= this.timeline.length || idx < 0) {
      return;
    }
    this.slider.value = idx;
    this._showFrame(this.timeline[idx]);
    this._visNetworkService.setData(this.visNetwork, this.visNetworkData);
  }

  update() {
    const idx = this.slider.value;
    this._showFrame(this.timeline[idx]);
    this._visNetworkService.setData(this.visNetwork, this.visNetworkData);
  }

  onInitialize() {
    this._visNetworkService.on(this.visNetwork, 'click');
    this._visNetworkService.click.subscribe((eventData: any[]) => {
      if (eventData[0] === this.visNetwork) {
        this.selectedEntry = this._nodeIdToNodes.get(eventData[1].nodes[0]);
      }
    });
  }

  ngOnDestroy() {
    this._visNetworkService.off(this.visNetwork, 'click');
  }

  private _showFrame(frame: TimelineFrame | undefined) {
    if (!frame) {
      return;
    }

    this.currentFrame = frame;

    this.nodes = new DataSet<Node>([]);
    this.edges = new DataSet<Edge>([]);
    this._nodeIdToNodes = new Map<string, TimelineNode>();

    const initNodes = (roots: TimelineNode[], parentId?: string) => {
      roots.forEach(node => {
        if (!node) {
          return;
        }

        const id = uuid();

        this._nodeIdToNodes.set(id, node);

        this.nodes.add({
          id,
          color: node.state === TimelineNodeState.Check ? '#62D7C5' : '#5727E5',
          label: node.name,
          font: {
            color: node.state === TimelineNodeState.Check ? '#000000' : '#ffffff',
          },
        });

        if (parentId) {
          this.edges.add({
            from: parentId,
            to: id
          });
        }

        initNodes(node.children, id);
      });
    };

    initNodes(frame.roots);
    this.selectedEntry = null;
    this.visNetworkData = { nodes: this.nodes, edges: this.edges };
  }
}
