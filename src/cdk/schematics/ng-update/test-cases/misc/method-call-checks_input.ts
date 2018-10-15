import {AfterViewInit, ElementRef, Renderer2} from '@angular/core';

class FocusMonitor {
  monitor(_htmlElement: any, _renderer: Renderer2, _checkChildren: boolean) {}
}

class A implements AfterViewInit {
  self = {a: this.focusMonitor};

  constructor(private focusMonitor: FocusMonitor,
              private elementRef: ElementRef,
              private renderer: Renderer2) {}

  ngAfterViewInit() {
    this.focusMonitor.monitor(this.elementRef.nativeElement, this.renderer, true);
    this.self.a.monitor(this.elementRef.nativeElement, this.renderer, true);
  }
}