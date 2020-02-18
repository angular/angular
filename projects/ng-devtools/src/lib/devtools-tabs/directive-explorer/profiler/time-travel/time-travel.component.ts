import { Component, Input, ViewChild, OnDestroy } from '@angular/core';

import uuid from 'uuid';
import { Options, Edge, DataSet, Data, Node, VisNetworkService } from 'ngx-vis';

import { ComponentRecord } from 'protocol';
import {
  Timeline,
  TimelineNode,
  buildTimeline,
  TimelineNodeState,
  TimelineFrame,
  resetIdAutoIncrement,
} from './time-travel-builder';
import { MatSlider } from '@angular/material/slider';
import { interval, Observable, range, Subscription, zip } from 'rxjs';

@Component({
  selector: 'ng-time-travel',
  templateUrl: './time-travel.component.html',
  styleUrls: ['./time-travel.component.css'],
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
        nodeSpacing: 200,
      },
    },
    nodes: {
      shape: 'box',
      margin: {
        top: 8,
        bottom: 8,
        left: 10,
        right: 10,
      },
      shapeProperties: {
        borderRadius: 2,
      },
    },
  };

  selectedEntry: TimelineNode;
  currentFrame: TimelineFrame;

  @ViewChild(MatSlider) slider: MatSlider;

  private _nodeIdToNodes: Map<string, TimelineNode>;

  isPlaying = false;
  playLoopSubscription: Subscription;

  private _cachedFrames = new Map<number, { nodes: DataSet<Node>; edges: DataSet<Edge> }>();

  constructor(private _visNetworkService: VisNetworkService) {}

  @Input() set stream(stream: ComponentRecord[]) {
    if (stream.length === 0) {
      resetIdAutoIncrement();
      this._cachedFrames.clear();
    }
    this._initStream(stream);
  }

  showSeparator(): boolean {
    return Object.keys(this.selectedEntry.instanceState.props).length > 0 && !!this.selectedEntry.duration;
  }

  move(direction: number): void {
    const idx = this.slider.value + direction;
    if (this._invalidSliderIndex(idx)) {
      return;
    }
    this.slider.value = idx;
    this._showFrame(this.timeline[idx]);
    this._visNetworkService.setData(this.visNetwork, this.visNetworkData);
  }

  createPlayLoopObservable(): Observable<[number, number]> {
    return zip(range(0, this.timeline.length - this.slider.value), interval(300));
  }

  play(): void {
    this.isPlaying = true;
    this._clearPlayLoopSubscription();
    this._subscribeToPlayLoop();
  }

  pause(): void {
    this.isPlaying = false;
    this._clearPlayLoopSubscription();
  }

  moveToBeginningOfTimeline(): void {
    this.slider.value = 0;
    this._showFrame(this.timeline[0]);
    this._visNetworkService.setData(this.visNetwork, this.visNetworkData);
  }

  moveToEndOfTimeline(): void {
    const lastIndex = this.timeline.length - 1;
    this.slider.value = lastIndex;
    this._showFrame(this.timeline[lastIndex]);
    this._visNetworkService.setData(this.visNetwork, this.visNetworkData);
  }

  update(): void {
    const idx = this.slider.value;
    this._showFrame(this.timeline[idx]);
    this._visNetworkService.setData(this.visNetwork, this.visNetworkData);
  }

  onInitialize(): void {
    this._visNetworkService.on(this.visNetwork, 'click');
    this._visNetworkService.click.subscribe((eventData: any[]) => {
      if (eventData[0] === this.visNetwork) {
        this.selectedEntry = this._nodeIdToNodes.get(eventData[1].nodes[0]);
      }
    });
  }

  ngOnDestroy(): void {
    this._clearPlayLoopSubscription();
    this._visNetworkService.off(this.visNetwork, 'click');
  }

  private _initStream(stream: ComponentRecord[]): void {
    this.timeline = buildTimeline(stream);
    this._showFrame(this.timeline[0]);
  }

  private _showFrame(frame: TimelineFrame | undefined): void {
    if (!frame) {
      return;
    }
    this._prepareNodesAndEdgesForNewFrame(frame);
    this._setNodesAndEdges(frame.roots, frame.timeLineId);
    this._updateVisNetworkDataState();
  }

  private _prepareNodesAndEdgesForNewFrame(frame: TimelineFrame): void {
    this.currentFrame = frame;
    this._resetNodesAndEdges();
    this.selectedEntry = null;
  }

  private _resetNodesAndEdges(): void {
    this.nodes = new DataSet<Node>([]);
    this.edges = new DataSet<Edge>([]);
    this._nodeIdToNodes = new Map<string, TimelineNode>();
  }

  private _setNodesAndEdges(roots, cacheId): void {
    if (this._cachedFrames.has(cacheId)) {
      const { nodes, edges } = this._cachedFrames.get(cacheId);
      this.nodes = nodes;
      this.edges = edges;
    } else {
      this._initNodesAndEdges(roots);
      this._cachedFrames.set(cacheId, { nodes: this.nodes, edges: this.edges });
    }
  }

  private _initNodesAndEdges(roots: TimelineNode[], parentId?: string): void {
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
          to: id,
        });
      }

      this._initNodesAndEdges(node.children, id);
    });
  }

  private _updateVisNetworkDataState(): void {
    this.visNetworkData = { nodes: this.nodes, edges: this.edges };
  }

  private _invalidSliderIndex(index: number): boolean {
    return index >= this.timeline.length || index < 0;
  }

  private _clearPlayLoopSubscription(): void {
    if (this.playLoopSubscription) {
      this.playLoopSubscription.unsubscribe();
    }
  }

  private _subscribeToPlayLoop(): void {
    this.playLoopSubscription = this.createPlayLoopObservable().subscribe(snapshot => {
      if (this._reachedEndOfTimeLine()) {
        this.pause();
      } else {
        this.move(1);
      }
    });
  }

  private _reachedEndOfTimeLine(): boolean {
    return this.timeline.length - 1 - this.slider.value === 0;
  }
}
