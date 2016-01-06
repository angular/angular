var nodeDebugInfos_MyComp1 = [
  new jit_StaticNodeDebugInfo0([],null,{}),
  new jit_StaticNodeDebugInfo0([],null,{})
]
;
function _View_MyComp1(viewManager,renderer,parentInjector,declarationEl,projectableNodes) {
  var self = this;
  jit_AppView1.call(this, './MyComp',_View_MyComp1,jit_ViewType_EMBEDDED2,{'some-tmpl': null},renderer,viewManager,parentInjector,projectableNodes,declarationEl,jit_ChangeDetectionStrategy_Default3,nodeDebugInfos_MyComp1);
}
_View_MyComp1.prototype = Object.create(jit_AppView1.prototype);
_View_MyComp1.prototype.createInternal = function(rootSelector) {
  var self = this;
  self._el_0 = self.renderer.createElement(null,'copy-me',self.debug(0,0,49));
  self._text_1 = self.renderer.createText(self._el_0,'',self.debug(1,0,58));
  self._expr_0 = jit_uninitialized4;
  self.init([].concat([self._el_0]),[
    self._el_0,
    self._text_1
  ]
  ,{},[],[]);
};
_View_MyComp1.prototype.detectChangesInternal = function(throwOnChange) {
  var self = this;
  var currVal = null;
  self.debug(1,0,58);
  currVal = jit_interpolate5(1,'',self.locals['some-tmpl'],'');
  if (jit_checkBinding6(throwOnChange,self._expr_0,currVal)) {
    self.renderer.setText(self._text_1,currVal);
    self._expr_0 = currVal;
  }
  self.detectContentChildrenChanges(throwOnChange); }
  self.detectViewChildrenChanges(throwOnChange); }
};
function viewFactory_MyComp1(viewManager,parentInjector,declarationEl,projectableNodes,rootSelector) {
  projectableNodes = jit_ensureSlotCount7(projectableNodes,0);
  var renderer = declarationEl.parentView.renderer;
  var view = new _View_MyComp1(viewManager,renderer,parentInjector,declarationEl,projectableNodes);
  view.create(rootSelector);
  return view;
}
  var nodeDebugInfos_MyComp0 = [new jit_StaticNodeDebugInfo0([
    jit_TemplateRef8,
    jit_SomeViewport9
  ]
,null,{})];
var renderType_MyComp = null;
function _View_MyComp0(viewManager,renderer,parentInjector,declarationEl,projectableNodes) {
  var self = this;
  jit_AppView1.call(this, './MyComp',_View_MyComp0,jit_ViewType_COMPONENT10,{},renderer,viewManager,parentInjector,projectableNodes,declarationEl,jit_ChangeDetectionStrategy_Default3,nodeDebugInfos_MyComp0);
}
_View_MyComp0.prototype = Object.create(jit_AppView1.prototype);
_View_MyComp0.prototype.createInternal = function(rootSelector) {
  var self = this;
  var parentRenderNode = self.renderer.createViewRoot(self.declarationAppElement.nativeElement);
  self._anchor_0 = self.renderer.createTemplateAnchor(parentRenderNode,self.debug(0,0,0));
  self.debug(null,null,null);
  self._appEl_0 = new jit_AppElement11(0,null,self,self._anchor_0);
  self._TemplateRef_0_0 = new jit_TemplateRef_12(self._appEl_0,viewFactory_MyComp1);
  self._SomeViewport_0_1 = new jit_SomeViewport9(self._appEl_0.vcRef,self._TemplateRef_0_0);
  self.init([],[self._anchor_0],{},[],[]);
};
_View_MyComp0.prototype.injectorGetInternal = function(token,requestNodeIndex,notFoundResult) {
  var self = this;
  if (((token === jit_TemplateRef8) && (0 === requestNodeIndex))) { return self._TemplateRef_0_0; }
  if (((token === jit_SomeViewport9) && (0 === requestNodeIndex))) { return self._SomeViewport_0_1; }
  return notFoundResult;
};
function viewFactory_MyComp0(viewManager,parentInjector,declarationEl,projectableNodes,rootSelector) {
  if ((renderType_MyComp === null)) { (renderType_MyComp = viewManager.createRenderComponentType(jit_ViewType_EMBEDDED2,jit_undefined13)); }
  projectableNodes = jit_ensureSlotCount7(projectableNodes,0);
  var renderer = viewManager.renderComponent(renderType_MyComp);
  var view = new _View_MyComp0(viewManager,renderer,parentInjector,declarationEl,projectableNodes);
  view.create(rootSelector);
  return view;
}
return viewFactory_MyComp0
//# sourceURL=MyComp.template.js