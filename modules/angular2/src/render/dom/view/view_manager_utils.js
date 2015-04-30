import {RenderView} from './view';
import {RenderProtoView} from './view_ref';

export class RenderViewManagerUtils {

  createView(protoView:RenderProtoView): RenderView {
  }

  attachComponentView(hostView:RenderView, boundElementIndex:number,
      componentView:RenderView) {
  }

  detachComponentView(hostView:RenderView, boundElementIndex:number) {
  }

  hydrateComponentView(hostView:RenderView, boundElementIndex:number) {
  }

  attachAndHydrateInPlaceHostView(parentComponentHostView:RenderView, parentComponentBoundElementIndex:number,
      renderLocation:any, hostView:RenderView) {
  }

  detachInPlaceHostView(parentView:RenderView,
      hostView:RenderView) {
  }

  attachViewInContainer(parentView:RenderView, boundElementIndex:number,
      atIndex:number, view:RenderView) {
  }

  detachViewInContainer(parentView:RenderView, boundElementIndex:number, atIndex:number) {
  }

  hydrateViewInContainer(parentView:RenderView, boundElementIndex:number,
      atIndex:number) {
  }

  dehydrateView(view:RenderView) {
  }
}