hostBindings: function MyComponent_HostBindings(rf, ctx) { 
  if (rf & 1) {
    i0.ɵɵlistener("click", function MyComponent_click_HostBindingHandler($event) { $event.preventDefault(); return $event.target.blur(); });
  }
}
…
template: function MyComponent_Template(rf, ctx) { 
  if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 0);
    i0.ɵɵlistener("click", function MyComponent_Template_div_click_0_listener($event) { $event.preventDefault(); return $event.target.blur(); });
    i0.ɵɵelementEnd();
  }
}
