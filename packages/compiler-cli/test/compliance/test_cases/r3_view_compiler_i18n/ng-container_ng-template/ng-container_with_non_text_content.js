decls: 4,
vars: 0,
consts: () => {
  __i18nMsg__(' Hello {$startTagNgContainer}there {$startTagStrong}!{$closeTagStrong}{$closeTagNgContainer}', [['closeTagNgContainer', String.raw`\uFFFD/#2\uFFFD`], ['closeTagStrong', String.raw`\uFFFD/#3\uFFFD`], ['startTagNgContainer', String.raw`\uFFFD#2\uFFFD`], ['startTagStrong', String.raw`\uFFFD#3\uFFFD`]], {original_code: {'closeTagNgContainer': '</ng-container>', 'closeTagStrong': '</strong>', 'startTagNgContainer': '<ng-container>', 'startTagStrong': '<strong>'}}, {})
 return [
   $i18n_0$
 ];
},
template: function MyComponent_Template(rf, ctx) {
 if (rf & 1) {
   $r3$.ɵɵelementStart(0, "div");
   $r3$.ɵɵi18nStart(1, 0);
   $r3$.ɵɵelementContainerStart(2);
   $r3$.ɵɵelement(3, "strong");
   $r3$.ɵɵelementContainerEnd();
   $r3$.ɵɵi18nEnd();
   $r3$.ɵɵelementEnd();
 }
}
