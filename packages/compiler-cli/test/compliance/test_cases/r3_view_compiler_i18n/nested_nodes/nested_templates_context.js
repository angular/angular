function MyComponent_div_2_div_4_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵi18nStart(0, 0, 2);
    $r3$.ɵɵelementStart(1, "div");
    $r3$.ɵɵelement(2, "div");
    $r3$.ɵɵelementEnd();
    $r3$.ɵɵi18nEnd();
  }
  if (rf & 2) {
    const $ctx_r2$ = $r3$.ɵɵnextContext(2);
    $r3$.ɵɵadvance(2);
    $r3$.ɵɵi18nExp($ctx_r2$.valueC)($ctx_r2$.valueD);
    $r3$.ɵɵi18nApply(0);
  }
}
function MyComponent_div_2_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵi18nStart(0, 0, 1);
    $r3$.ɵɵelementStart(1, "div")(2, "div");
    $r3$.ɵɵpipe(3, "uppercase");
    $r3$.ɵɵtemplate(4, MyComponent_div_2_div_4_Template, 3, 2, "div", 1);
    $r3$.ɵɵelementEnd()();
    $r3$.ɵɵi18nEnd();
  }
  if (rf & 2) {
    const $ctx_r0$ = $r3$.ɵɵnextContext();
    $r3$.ɵɵadvance(4);
    $r3$.ɵɵproperty("ngIf", $ctx_r0$.exists);
    $r3$.ɵɵi18nExp($ctx_r0$.valueA)($r3$.ɵɵpipeBind1(3, 3, $ctx_r0$.valueB));
    $r3$.ɵɵi18nApply(0);
  }
}
…
function MyComponent_div_3_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵi18nStart(0, 0, 3);
    $r3$.ɵɵelementStart(1, "div");
    $r3$.ɵɵelement(2, "div");
    $r3$.ɵɵpipe(3, "uppercase");
    $r3$.ɵɵelementEnd();
    $r3$.ɵɵi18nEnd();
  }
  if (rf & 2) {
    const $ctx_r1$ = $r3$.ɵɵnextContext();
    $r3$.ɵɵadvance(3);
    $r3$.ɵɵi18nExp($ctx_r1$.valueE + $ctx_r1$.valueF)($r3$.ɵɵpipeBind1(3, 2, $ctx_r1$.valueG));
    $r3$.ɵɵi18nApply(0);
  }
}
…
decls: 4,
vars: 2,
consts: () => {
  __i18nMsgWithPostprocess__(' Some content {$startTagDiv_2} Some other content {$interpolation} {$startTagDiv} More nested levels with bindings {$interpolation_1} {$startTagDiv_1} Content inside sub-template {$interpolation_2} {$startTagDiv} Bottom level element {$interpolation_3} {$closeTagDiv}{$closeTagDiv}{$closeTagDiv}{$closeTagDiv}{$startTagDiv_3} Some other content {$interpolation_4} {$startTagDiv} More nested levels with bindings {$interpolation_5} {$closeTagDiv}{$closeTagDiv}', [['closeTagDiv', String.raw`[\uFFFD/#2:2\uFFFD|\uFFFD/#1:2\uFFFD\uFFFD/*4:2\uFFFD|\uFFFD/#2:1\uFFFD|\uFFFD/#1:1\uFFFD\uFFFD/*2:1\uFFFD|\uFFFD/#2:3\uFFFD|\uFFFD/#1:3\uFFFD\uFFFD/*3:3\uFFFD]`], ['interpolation', String.raw`\uFFFD0:1\uFFFD`], ['interpolation_1', String.raw`\uFFFD1:1\uFFFD`], ['interpolation_2', String.raw`\uFFFD0:2\uFFFD`], ['interpolation_3', String.raw`\uFFFD1:2\uFFFD`], ['interpolation_4', String.raw`\uFFFD0:3\uFFFD`], ['interpolation_5', String.raw`\uFFFD1:3\uFFFD`], ['startTagDiv', String.raw`[\uFFFD#2:1\uFFFD|\uFFFD#2:2\uFFFD|\uFFFD#2:3\uFFFD]`], ['startTagDiv_1', String.raw`\uFFFD*4:2\uFFFD\uFFFD#1:2\uFFFD`], ['startTagDiv_2', String.raw`\uFFFD*2:1\uFFFD\uFFFD#1:1\uFFFD`], ['startTagDiv_3', String.raw`\uFFFD*3:3\uFFFD\uFFFD#1:3\uFFFD`]], {original_code: {'closeTagDiv': '</div>', 'interpolation': '{{ valueA }}', 'interpolation_1': '{{ valueB | uppercase }}', 'interpolation_2': '{{ valueC }}', 'interpolation_3': '{{ valueD }}', 'interpolation_4': '{{ valueE + valueF }}', 'interpolation_5': '{{ valueG | uppercase }}', 'startTagDiv': '<div>', 'startTagDiv_1': '<div *ngIf="exists">', 'startTagDiv_2': '<div *ngIf="visible">', 'startTagDiv_3': '<div *ngIf="!visible">',}}, {}, [])
  return [
    $i18n_0$,
    [__AttributeMarker.Template__, "ngIf"]
  ];
},
template: function MyComponent_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelementStart(0, "div");
    $r3$.ɵɵi18nStart(1, 0);
    $r3$.ɵɵtemplate(2, MyComponent_div_2_Template, 5, 5, "div", 1)(3, MyComponent_div_3_Template, 4, 4, "div", 1);
    $r3$.ɵɵi18nEnd();
    $r3$.ɵɵelementEnd();
  }
  if (rf & 2) {
    $r3$.ɵɵadvance(2);
    $r3$.ɵɵproperty("ngIf", ctx.visible);
    $r3$.ɵɵadvance();
    $r3$.ɵɵproperty("ngIf", !ctx.visible);
  }
}
