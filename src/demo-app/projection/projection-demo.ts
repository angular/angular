import {Component, ViewChild, ElementRef, OnInit, Input} from '@angular/core';
import {DomProjectionHost, DomProjection} from '@angular/material';


@Component({
  selector: '[projection-test]',
  template: `
    <div class="demo-outer {{cssClass}}">
      Before
      <cdk-dom-projection-host><ng-content></ng-content></cdk-dom-projection-host>
      After
    </div>
  `,
  styles: [`
    .demo-outer {
      background-color: #663399;
    }
  `]
})
export class ProjectionTestComponent implements OnInit {
  @ViewChild(DomProjectionHost) _host: DomProjectionHost;
  @Input('class') cssClass: any;

  constructor(private _projection: DomProjection, private _ref: ElementRef) {}

  ngOnInit() {
    this._projection.project(this._ref, this._host);
  }
}


@Component({
  selector: 'projection-app',
  template: `
    <div projection-test class="demo-inner">
      <div class="content">Content: {{binding}}</div>
    </div>
    <br/>
    <input projection-test [(ngModel)]="binding" [class]="binding" [ngClass]="{'blue': true}">
    <input [(ngModel)]="binding" class="my-class" [ngClass]="{'blue': true}">
  `,
  styles: [`
    .demo-inner {
      background-color: #DAA520;
    }
  `]
})
export class ProjectionDemo {
  binding: string = 'abc';
}
