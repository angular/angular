import {__esDecorate, __runInitializers} from 'tslib';
import {CdkDrag} from '@angular/cdk/drag-drop';
import {Overlay} from '@angular/cdk/overlay';
import {TemplatePortal} from '@angular/cdk/portal';
import {Component, TemplateRef, ViewChild, ViewContainerRef, inject} from '@angular/core';
/**
 * @title Drag&Drop with alternate root element
 */
let CdkDragDropRootElementExample = (() => {
  let _classDecorators = [
    Component({
      selector: 'cdk-drag-drop-root-element-example',
      templateUrl: 'app.component.html',
      styleUrl: 'app.component.css',
      standalone: true,
      imports: [CdkDrag],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  let __dialogTemplate_decorators;
  let __dialogTemplate_initializers = [];
  let __dialogTemplate_extraInitializers = [];
  var CdkDragDropRootElementExample = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __dialogTemplate_decorators = [ViewChild(TemplateRef)];
      __esDecorate(
        null,
        null,
        __dialogTemplate_decorators,
        {
          kind: 'field',
          name: '_dialogTemplate',
          static: false,
          private: false,
          access: {
            has: (obj) => '_dialogTemplate' in obj,
            get: (obj) => obj._dialogTemplate,
            set: (obj, value) => {
              obj._dialogTemplate = value;
            },
          },
          metadata: _metadata,
        },
        __dialogTemplate_initializers,
        __dialogTemplate_extraInitializers,
      );
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      CdkDragDropRootElementExample = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    _overlay = inject(Overlay);
    _viewContainerRef = inject(ViewContainerRef);
    _dialogTemplate = __runInitializers(this, __dialogTemplate_initializers, void 0);
    _overlayRef = __runInitializers(this, __dialogTemplate_extraInitializers);
    _portal;
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
  };
  return (CdkDragDropRootElementExample = _classThis);
})();
export {CdkDragDropRootElementExample};
//# sourceMappingURL=app.component.js.map
