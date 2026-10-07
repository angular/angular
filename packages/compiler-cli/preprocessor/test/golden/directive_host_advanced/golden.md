# /out/resize-observer.directive.ts
```ts
import { Directive, HostBinding, HostListener } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class ResizeObserverDirective {
  isResizing = false;
  minWidth = 100;
  minHeight = 50;
  width = 200;
  height = 100;

  get widthPx() {
    return this.width;
  }

  get heightPx() {
    return this.height;
  }

  get isLandscape() {
    return this.width > this.height;
  }

  get isPortrait() {
    return this.height > this.width;
  }

  onWindowResize(windowWidth: number, windowHeight: number) {
    this.width = Math.min(this.width, windowWidth - 40);
    this.height = Math.min(this.height, windowHeight - 40);
  }

  onEscape() {
    this.isResizing = false;
  }

  onMouseDown() {
    this.isResizing = true;
  }

  onMouseUp() {
    this.isResizing = false;
  }
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ResizeObserverDirective, never> =
    function ResizeObserverDirective_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || ResizeObserverDirective)();
    };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    ResizeObserverDirective,
    '[appResizeObserver]',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: ResizeObserverDirective,
    selectors: [['', 'appResizeObserver', '']],
    hostVars: 14,
    hostBindings: function ResizeObserverDirective_HostBindings(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵlistener(
          'resize',
          function ResizeObserverDirective_resize_HostBindingHandler($event: any): any {
            return ctx.onWindowResize($event.target.innerWidth, $event.target.innerHeight);
          },
          i0.ɵɵresolveWindow,
        )(
          'keydown.escape',
          function ResizeObserverDirective_keydown_escape_HostBindingHandler(): any {
            return ctx.onEscape();
          },
          i0.ɵɵresolveDocument,
        )('mousedown', function ResizeObserverDirective_mousedown_HostBindingHandler(): any {
          return ctx.onMouseDown();
        })(
          'mouseup',
          function ResizeObserverDirective_mouseup_HostBindingHandler(): any {
            return ctx.onMouseUp();
          },
          i0.ɵɵresolveDocument,
        );
      }
      if (rf & 2) {
        i0.ɵɵstyleProp('min-width', ctx.minWidth, 'px')('min-height', ctx.minHeight, 'px')(
          'width',
          ctx.widthPx,
          'px',
        )('height', ctx.heightPx, 'px');
        i0.ɵɵclassProp('resizing', ctx.isResizing)('landscape', ctx.isLandscape)(
          'portrait',
          ctx.isPortrait,
        );
      }
    },
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ResizeObserverDirective,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[appResizeObserver]',
                standalone: true,
                host: {
                  '[class.resizing]': 'isResizing',
                  '[style.min-width.px]': 'minWidth',
                  '[style.min-height.px]': 'minHeight',
                },
              },
            ],
          },
        ],
        null,
        {
          widthPx: [{ type: HostBinding, args: ['style.width.px'] }],
          heightPx: [{ type: HostBinding, args: ['style.height.px'] }],
          isLandscape: [{ type: HostBinding, args: ['class.landscape'] }],
          isPortrait: [{ type: HostBinding, args: ['class.portrait'] }],
          onWindowResize: [
            {
              type: HostListener,
              args: ['window:resize', ['$event.target.innerWidth', '$event.target.innerHeight']],
            },
          ],
          onEscape: [{ type: HostListener, args: ['document:keydown.escape'] }],
          onMouseDown: [{ type: HostListener, args: ['mousedown'] }],
          onMouseUp: [{ type: HostListener, args: ['document:mouseup'] }],
        },
      );
  }
}

```