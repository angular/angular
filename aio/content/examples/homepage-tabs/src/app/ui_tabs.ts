// #docregion
import { Component, Directive, Input, QueryList,
        ViewContainerRef, TemplateRef, ContentChildren } from '@angular/core';

@Directive({
  selector: '[uiPane]'
})
export class UiPaneDirective {
  @Input() title: string;
  private _active: boolean = false;

  constructor(public viewContainer: ViewContainerRef,
              public templateRef: TemplateRef<any>) { }

  @Input() set active(active: boolean) {
    if (active === this._active) { return; }
    this._active = active;
    if (active) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.remove(0);
    }
  }

  get active(): boolean {
    return this._active;
  }
}

@Component({
  selector: 'ui-tabs',
  template: `
    <ul class="nav nav-tabs">
      <li *ngFor="let pane of panes"
          (click)="select(pane)"
          role="presentation" [class.active]="pane.active">
        <a>{{pane.title}}</a>
      </li>
    </ul>
    <ng-content></ng-content>
    `,
    styles: ['a { cursor: pointer; cursor: hand; }']
})
export class UiTabsComponent {
  @ContentChildren(UiPaneDirective) panes: QueryList<UiPaneDirective>;

  select(pane: UiPaneDirective) {
    this.panes.toArray().forEach((p: UiPaneDirective) => p.active = p === pane);
  }
}

