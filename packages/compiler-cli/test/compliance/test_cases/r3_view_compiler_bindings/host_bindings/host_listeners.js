function MyComponent_HostBindings(rf, ctx) {
	if (rf & 1) {
		i0.ɵɵlistener("dragover", function MyComponent_dragover_HostBindingHandler($event) {
			return ctx.foo($event);
		}, i0.ɵɵresolveDocument);
	}
}