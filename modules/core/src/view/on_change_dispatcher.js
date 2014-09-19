
//TODO(tbosch): I don't like to have done be called from a different place than notify
// notify is called by change detection, but done is called by our wrapper on detect changes.
export class OnChangeDispatcher {
  
  @FIELD('_lastView:View')
  @FIELD('_lastTarget:ElementInjectorTarget')
  constructor() {
    
  }
  
  notify(view:View, eTarget:ElementInjectorTarget) {
    
  }
  
  done() {
    
  }
}