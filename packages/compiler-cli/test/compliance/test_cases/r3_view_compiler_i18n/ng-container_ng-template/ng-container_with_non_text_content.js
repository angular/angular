decls: 4,
vars: 0,
consts: function() {
  __i18nMsg__(' Hello {$startTagNgContainer}there {$startTagStrong}!{$closeTagStrong}{$closeTagNgContainer}', [['startTagNgContainer', String.raw`\uFFFD#2\uFFFD`], ['startTagStrong', String.raw`\uFFFD#3\uFFFD`], ['closeTagStrong', String.raw`\uFFFD/#3\uFFFD`], ['closeTagNgContainer', String.raw`\uFFFD/#2\uFFFD`]], {original_code: {'startTagNgContainer': '<ng-container>', 'startTagStrong': '<strong>', 'closeTagStrong': '</strong>', 'closeTagNgContainer': '</ng-container>'}}, {})
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
