export class MyService {
  // ...
  static ɵfac = function MyService_Factory(__ngFactoryType__) {
    /* @ts-ignore */
    return new (__ngFactoryType__ || MyService)($r3$.ɵɵinject(MyDependency), $r3$.ɵɵinject(MyOptionalDependency, 8));
  }
  // ...
}
