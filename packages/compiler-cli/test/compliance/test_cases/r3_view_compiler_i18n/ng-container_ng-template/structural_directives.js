// NOTE: applying structural directives to <ng-template> is typically user error, but it is technically allowed, so we need to support it.
function MyComponent_0_ng_template_0_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵi18n(0, 1);
  }
}
function MyComponent_0_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtemplate(0, MyComponent_0_ng_template_0_Template, 1, 0, "ng-template");
  }
}
…
function MyComponent_ng_container_1_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelementContainerStart(0);
    $r3$.ɵɵi18n(1, 2);
    $r3$.ɵɵelementContainerEnd();
  }
}
…
decls: 2,
vars: 2,
consts: function() {
  __i18nMsg__('Content A', [], {}, {})
  __i18nMsg__('Content B', [], {}, {})
  return [
    [__AttributeMarker.Template__, "ngIf"],
    $i18n_0$,
    $i18n_1$
  ];
},
template: function MyComponent_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtemplate(0, MyComponent_0_Template, 1, 0, null, 0);
    $r3$.ɵɵtemplate(1, MyComponent_ng_container_1_Template, 2, 0, "ng-container", 0);
  }
  if (rf & 2) {
    $r3$.ɵɵproperty("ngIf", ctx.someFlag);
    $r3$.ɵɵadvance(1);
    $r3$.ɵɵproperty("ngIf", ctx.someFlag);
  }
}
