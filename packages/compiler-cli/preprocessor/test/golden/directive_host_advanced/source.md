# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["resize-observer.directive.ts"]
}
```

# /resize-observer.directive.ts
```ts
import { Directive, HostBinding, HostListener } from '@angular/core';

@Directive({
  selector: '[appResizeObserver]',
  standalone: true,
  host: {
    '[class.resizing]': 'isResizing',
    '[style.min-width.px]': 'minWidth',
    '[style.min-height.px]': 'minHeight',
  },
})
export class ResizeObserverDirective {
  isResizing = false;
  minWidth = 100;
  minHeight = 50;
  width = 200;
  height = 100;

  @HostBinding('style.width.px')
  get widthPx() {
    return this.width;
  }

  @HostBinding('style.height.px')
  get heightPx() {
    return this.height;
  }

  @HostBinding('class.landscape')
  get isLandscape() {
    return this.width > this.height;
  }

  @HostBinding('class.portrait')
  get isPortrait() {
    return this.height > this.width;
  }

  @HostListener('window:resize', ['$event.target.innerWidth', '$event.target.innerHeight'])
  onWindowResize(windowWidth: number, windowHeight: number) {
    this.width = Math.min(this.width, windowWidth - 40);
    this.height = Math.min(this.height, windowHeight - 40);
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.isResizing = false;
  }

  @HostListener('mousedown')
  onMouseDown() {
    this.isResizing = true;
  }

  @HostListener('document:mouseup')
  onMouseUp() {
    this.isResizing = false;
  }
}
```
