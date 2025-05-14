import {
  Component,
  ViewChild,
  TemplateRef,
  AfterViewInit,
  ViewContainerRef,
  OnDestroy,
  inject,
} from '@angular/core';
import {Overlay, OverlayRef} from '@angular/cdk/overlay';
import {TemplatePortal} from '@angular/cdk/portal';
import {CdkDrag} from '@angular/cdk/drag-drop';

/**
 * @title Drag&Drop with alternate root element
 */
@Component({
  selector: 'cdk-drag-drop-root-element-example',
  templateUrl: 'cdk-drag-drop-root-element-example.html',
  styleUrl: 'cdk-drag-drop-root-element-example.css',
  standalone: true,
  imports: [CdkDrag],
})
export class CdkDragDropRootElementExample implements AfterViewInit, OnDestroy {
  private _overlay = inject(Overlay);
  private _viewContainerRef = inject(ViewContainerRef);

  @ViewChild(TemplateRef) _dialogTemplate: TemplateRef<any>;
  private _overlayRef: OverlayRef;
  private _portal: TemplatePortal;

  ngAfterViewInit() {
    this._portal = new TemplatePortal(this._dialogTemplate, this._viewContainerRef);
    this._overlayRef = this._overlay.create({
      positionStrategy: this._overlay.position().global().centerHorizontally().centerVertically(),
      hasBackdrop: true,
    });
    this._overlayRef.backdropClick().subscribe(() => this._overlayRef.detach());
  }

  ngOnDestroy() {
    this._overlayRef.dispose();
  }

  openDialog() {
    this._overlayRef.attach(this._portal);
  }
}
