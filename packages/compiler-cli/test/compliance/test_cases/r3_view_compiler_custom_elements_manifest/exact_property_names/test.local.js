function ManifestDomPropertyShapes_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelement(0, "my-button", 1);
  }
  if (rf & 2) {
    const $ctx_r0$ = $r3$.ɵɵnextContext();
    $r3$.ɵɵproperty("readonly", $ctx_r0$.readonly, null, true)("innerHTML", $ctx_r0$.html, $r3$.ɵɵsanitizeHtml);
  }
}

function ManifestPropertyShapes_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelement(0, "my-button", 2);
  }
  if (rf & 2) {
    const $ctx_r1$ = $r3$.ɵɵnextContext();
    $r3$.ɵɵproperty("innerHTML", $r3$.ɵɵinterpolate($ctx_r1$.html), $r3$.ɵɵsanitizeHtml);
  }
}

…

function ManifestDomProperties_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelementStart(0, "my-button", 0);
    $r3$.ɵɵtwoWayListener("formactionChange", function ManifestDomProperties_Template_my_button_formactionChange_0_listener($event) {
      $r3$.ɵɵtwoWayBindingSet(ctx.formaction, $event) || (ctx.formaction = $event);
      return $event;
    });
    $r3$.ɵɵelementEnd();
  }
  if (rf & 2) {
    $r3$.ɵɵproperty("readonly", ctx.readonly, null, true);
    $r3$.ɵɵtwoWayProperty("formaction", ctx.formaction, $r3$.ɵɵsanitizeUrl, true);
    $r3$.ɵɵproperty("innerHTML", ctx.html, $r3$.ɵɵsanitizeHtml)("tabindex", ctx.tabindex);
  }
}

…

function ManifestProperties_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelementStart(0, "my-button", 0);
    $r3$.ɵɵtwoWayListener("formactionChange", function ManifestProperties_Template_my_button_formactionChange_0_listener($event) {
      $r3$.ɵɵtwoWayBindingSet(ctx.formaction, $event) || (ctx.formaction = $event);
      return $event;
    });
    $r3$.ɵɵelementEnd();
  }
  if (rf & 2) {
    $r3$.ɵɵproperty("readonly", ctx.readonly, null, true);
    $r3$.ɵɵtwoWayProperty("formaction", ctx.formaction, $r3$.ɵɵsanitizeUrl, true);
    $r3$.ɵɵproperty("innerHTML", ctx.html, $r3$.ɵɵsanitizeHtml);
  }
}

…

function ManifestDomPropertyShapes_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelement(0, "my-button", 0)(1, "input", 0);
    $r3$.ɵɵconditionalCreate(2, ManifestDomPropertyShapes_Conditional_2_Template, 1, 2, "my-button", 1);
    $r3$.ɵɵelement(3, "my-button", 2);
  }
  if (rf & 2) {
    $r3$.ɵɵproperty("readonly", ctx.readonly, null, true);
    $r3$.ɵɵadvance();
    $r3$.ɵɵproperty("readonly", ctx.readonly);
    $r3$.ɵɵadvance();
    $r3$.ɵɵconditional(ctx.readonly ? 2 : -1);
    $r3$.ɵɵadvance();
    $r3$.ɵɵproperty("innerHTML", $r3$.ɵɵinterpolate(ctx.html), $r3$.ɵɵsanitizeHtml);
  }
}

…

function ManifestPropertyShapes_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelement(0, "my-button", 0)(1, "input", 1);
    $r3$.ɵɵconditionalCreate(2, ManifestPropertyShapes_Conditional_2_Template, 1, 2, "my-button", 2);
  }
  if (rf & 2) {
    $r3$.ɵɵproperty("readonly", ctx.readonly, null, true)("innerHTML", ctx.html, $r3$.ɵɵsanitizeHtml);
    $r3$.ɵɵadvance();
    $r3$.ɵɵproperty("readonly", ctx.readonly);
    $r3$.ɵɵadvance();
    $r3$.ɵɵconditional(ctx.readonly ? 2 : -1);
  }
}
