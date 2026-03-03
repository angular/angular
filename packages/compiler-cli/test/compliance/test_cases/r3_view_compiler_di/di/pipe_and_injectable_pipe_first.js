// NOTE The prov definition must be last so MyOtherPipe.fac is defined
export class MyOtherPipe {
  // ...
  static ɵfac = function MyOtherPipe_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || MyOtherPipe)(i0.ɵɵdirectiveInject(Service, 16)); };
  static ɵpipe = /*@__PURE__*/ i0.ɵɵdefinePipe({ name: "myOtherPipe", type: MyOtherPipe, pure: true, standalone: false });
  static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: MyOtherPipe, factory: MyOtherPipe.ɵfac });
}
