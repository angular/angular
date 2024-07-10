// NOTE The prov definition must be last so MyPipe.fac is defined
MyPipe.ɵfac = function MyPipe_Factory(t) { return new (t || MyPipe)(i0.ɵɵdirectiveInject(Service, 16)); };
MyPipe.ɵpipe = /*@__PURE__*/ i0.ɵɵdefinePipe({ name: "myPipe", type: MyPipe, pure: true });
MyPipe.ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: MyPipe, factory: MyPipe.ɵfac });
