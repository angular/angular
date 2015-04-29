import {Directive, ViewContainerRef, ProtoViewRef} from "angular2/angular2";

@Directive({selector: '[assign-local]', properties: ['localVariable: assignLocalTo']})
export class LocalVariable {
  viewContainer: ViewContainerRef;
  protoViewRef: ProtoViewRef;
  view: any;
  constructor(viewContainer: ViewContainerRef, protoViewRef: ProtoViewRef) {
    this.viewContainer = viewContainer;
    this.protoViewRef = protoViewRef;
  }

  set localVariable(exp) {
    if (!this.viewContainer.length) {
      this.view = this.viewContainer.create(this.protoViewRef);
    }

    this.view.setLocal("$implicit", exp);
  }
}
