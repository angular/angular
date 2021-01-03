// NOTE The prov definition must be last so MyOtherPipe.fac is defined
MyOtherPipe.ɵfac = function MyOtherPipe_Factory(t) { return new (t || MyOtherPipe)($r3$.ɵɵdirectiveInject(Service)); };
MyOtherPipe.ɵpipe = i0.ɵɵdefinePipe({ name: "myOtherPipe", type: MyOtherPipe, pure: true });
MyOtherPipe.ɵprov = i0.ɵɵdefineInjectable({ token: MyOtherPipe, factory: MyOtherPipe.ɵfac });
