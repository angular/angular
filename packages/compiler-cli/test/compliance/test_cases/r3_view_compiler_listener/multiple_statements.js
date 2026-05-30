hostBindings: function MyComponent_HostBindings(rf, ctx) { 
  if (rf & 1) {
    $r3$.ɵɵlistener("click", function MyComponent_click_HostBindingHandler($event) { $event.preventDefault(); return $event.target; });
  }
}
…
template: function MyComponent_Template(rf, ctx) { 
  if (rf & 1) {
    $r3$.ɵɵdomElementStart(0, "div", 0);
    $r3$.ɵɵdomListener("click", function MyComponent_Template_div_click_0_listener($event) { $event.preventDefault(); return $event.target; });
    $r3$.ɵɵdomElementEnd();
  }
}
