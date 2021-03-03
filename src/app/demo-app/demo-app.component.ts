import { ComponentPortal, DomPortal, Portal, TemplatePortal } from '@angular/cdk/portal';
import { Component, ElementRef, TemplateRef, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { ZippyComponent } from './zippy/zippy.component';

@Component({
  templateUrl: './demo-app.component.html',
  styleUrls: ['./demo-app.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DemoAppComponent {
  @ViewChild(ZippyComponent) zippy: ZippyComponent;
  @ViewChild('elementReference') elementRef: ElementRef;

  getTitle(): '► Click to expand' | '▼ Click to collapse' {
    if (!this.zippy || !this.zippy.visible) {
      return '► Click to expand';
    }
    return '▼ Click to collapse';
  }

  @ViewChild('templatePortalContent') templatePortalContent: TemplateRef<unknown>;
  @ViewChild('domPortalContent') domPortalContent: ElementRef<HTMLElement>;

  selectedPortal: Portal<any>;
  componentPortal: ComponentPortal<ComponentPortalExample>;
  templatePortal: TemplatePortal<any>;
  domPortal: DomPortal<any>;

  constructor(private _viewContainerRef: ViewContainerRef) {}

  ngAfterViewInit() {
    this.componentPortal = new ComponentPortal(ComponentPortalExample);
    this.templatePortal = new TemplatePortal(this.templatePortalContent, this._viewContainerRef);
    this.domPortal = new DomPortal(this.domPortalContent);
  }
}

@Component({
  selector: 'component-portal-example',
  template: 'Hello, this is a component portal',
})
export class ComponentPortalExample {}
