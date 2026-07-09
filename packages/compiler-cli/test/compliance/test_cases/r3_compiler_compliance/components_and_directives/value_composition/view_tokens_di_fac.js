export class MyComponent {
  // ...
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    /* @ts-ignore */
    return new (__ngFactoryType__ || MyComponent)($r3$.ɵɵdirectiveInject($i$.ElementRef), $r3$.ɵɵdirectiveInject($i$.ViewContainerRef), $r3$.ɵɵdirectiveInject($i$.ChangeDetectorRef));
  };
  // ...
}
