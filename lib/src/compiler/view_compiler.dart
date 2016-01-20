library angular2.src.compiler.view_compiler;

import "package:angular2/src/facade/lang.dart"
    show
        isPresent,
        isBlank,
        Type,
        isString,
        StringWrapper,
        IS_DART,
        assertionsEnabled;
import "package:angular2/src/facade/collection.dart"
    show SetWrapper, StringMapWrapper, ListWrapper;
import "template_ast.dart"
    show
        TemplateAst,
        TemplateAstVisitor,
        NgContentAst,
        EmbeddedTemplateAst,
        ElementAst,
        VariableAst,
        BoundEventAst,
        BoundElementPropertyAst,
        AttrAst,
        BoundTextAst,
        TextAst,
        DirectiveAst,
        BoundDirectivePropertyAst,
        templateVisitAll;
import "directive_metadata.dart"
    show CompileTypeMetadata, CompileDirectiveMetadata;
import "source_module.dart" show SourceExpressions, SourceExpression, moduleRef;
import "package:angular2/src/core/linker/view.dart"
    show AppProtoView, AppView, flattenNestedViewRenderNodes, checkSlotCount;
import "package:angular2/src/core/linker/view_type.dart" show ViewType;
import "package:angular2/src/core/linker/view_manager.dart"
    show AppViewManager_;
import "package:angular2/src/core/linker/element.dart"
    show AppProtoElement, AppElement;
import "package:angular2/src/core/render/api.dart"
    show Renderer, ParentRenderer;
import "package:angular2/src/core/metadata/view.dart" show ViewEncapsulation;
import "util.dart"
    show
        escapeSingleQuoteString,
        codeGenConstConstructorCall,
        codeGenValueFn,
        codeGenFnHeader,
        MODULE_SUFFIX,
        Statement,
        escapeValue,
        codeGenArray,
        codeGenFlatArray,
        Expression,
        flattenArray,
        CONST_VAR;
import "package:angular2/src/core/di.dart"
    show ResolvedProvider, Injectable, Injector;
import "proto_view_compiler.dart"
    show
        APP_VIEW_MODULE_REF,
        APP_EL_MODULE_REF,
        METADATA_MODULE_REF,
        CompileProtoView,
        CompileProtoElement,
        codeGenType;

const VIEW_JIT_IMPORTS = const {
  "AppView": AppView,
  "AppElement": AppElement,
  "flattenNestedViewRenderNodes": flattenNestedViewRenderNodes,
  "checkSlotCount": checkSlotCount
};

@Injectable()
class ViewCompiler {
  ViewCompiler() {}
  Function compileComponentRuntime(
      CompileDirectiveMetadata component,
      List<TemplateAst> template,
      List<dynamic /* String | List < dynamic > */ > styles,
      List<CompileProtoView<AppProtoView, AppProtoElement>> protoViews,
      List<Function> changeDetectorFactories,
      Function componentViewFactory) {
    var viewFactory = new RuntimeViewFactory(component, styles, protoViews,
        changeDetectorFactories, componentViewFactory);
    return viewFactory.createViewFactory(template, 0, []);
  }

  SourceExpression compileComponentCodeGen(
      CompileDirectiveMetadata component,
      List<TemplateAst> template,
      SourceExpression styles,
      List<CompileProtoView<Expression, Expression>> protoViews,
      SourceExpressions changeDetectorFactoryExpressions,
      Function componentViewFactory) {
    var viewFactory = new CodeGenViewFactory(component, styles, protoViews,
        changeDetectorFactoryExpressions, componentViewFactory);
    List<Statement> targetStatements = [];
    var viewFactoryExpression =
        viewFactory.createViewFactory(template, 0, targetStatements);
    return new SourceExpression(
        targetStatements.map((stmt) => stmt.statement).toList(),
        viewFactoryExpression.expression);
  }
}

abstract class ViewFactory<EXPRESSION, STATEMENT> {
  EXPRESSION createText(EXPRESSION renderer, EXPRESSION parent, String text,
      List<STATEMENT> targetStatements);
  EXPRESSION createElement(EXPRESSION renderer, EXPRESSION parent, String name,
      EXPRESSION rootSelector, List<STATEMENT> targetStatements);
  EXPRESSION createTemplateAnchor(
      EXPRESSION renderer, EXPRESSION parent, List<STATEMENT> targetStatements);
  EXPRESSION createGlobalEventListener(
      EXPRESSION renderer,
      EXPRESSION view,
      num boundElementIndex,
      BoundEventAst eventAst,
      List<STATEMENT> targetStatements);
  createElementEventListener(
      EXPRESSION renderer,
      EXPRESSION view,
      num boundElementIndex,
      EXPRESSION renderNode,
      BoundEventAst eventAst,
      List<STATEMENT> targetStatements);
  setElementAttribute(EXPRESSION renderer, EXPRESSION renderNode,
      String attrName, String attrValue, List<STATEMENT> targetStatements);
  EXPRESSION createAppElement(
      EXPRESSION appProtoEl,
      EXPRESSION view,
      EXPRESSION renderNode,
      EXPRESSION parentAppEl,
      EXPRESSION embeddedViewFactory,
      List<STATEMENT> targetStatements);
  createAndSetComponentView(
      EXPRESSION renderer,
      EXPRESSION viewManager,
      EXPRESSION view,
      EXPRESSION appEl,
      CompileDirectiveMetadata component,
      List<List<EXPRESSION>> contentNodesByNgContentIndex,
      List<STATEMENT> targetStatements);
  EXPRESSION getProjectedNodes(EXPRESSION projectableNodes, num ngContentIndex);
  appendProjectedNodes(EXPRESSION renderer, EXPRESSION parent, EXPRESSION nodes,
      List<STATEMENT> targetStatements);
  EXPRESSION createViewFactory(List<TemplateAst> asts,
      num embeddedTemplateIndex, List<STATEMENT> targetStatements);
}

class CodeGenViewFactory implements ViewFactory<Expression, Statement> {
  CompileDirectiveMetadata component;
  SourceExpression styles;
  List<CompileProtoView<Expression, Expression>> protoViews;
  SourceExpressions changeDetectorExpressions;
  Function componentViewFactory;
  num _nextVarId = 0;
  CodeGenViewFactory(this.component, this.styles, this.protoViews,
      this.changeDetectorExpressions, this.componentViewFactory) {}
  String _nextVar(String prefix) {
    return '''${ prefix}${ this . _nextVarId ++}_${ this . component . type . name}''';
  }

  String _nextRenderVar() {
    return this._nextVar("render");
  }

  String _nextAppVar() {
    return this._nextVar("app");
  }

  String _nextDisposableVar() {
    return '''disposable${ this . _nextVarId ++}_${ this . component . type . name}''';
  }

  Expression createText(Expression renderer, Expression parent, String text,
      List<Statement> targetStatements) {
    var varName = this._nextRenderVar();
    var statement =
        '''var ${ varName} = ${ renderer . expression}.createText(${ isPresent ( parent ) ? parent . expression : null}, ${ escapeSingleQuoteString ( text )});''';
    targetStatements.add(new Statement(statement));
    return new Expression(varName);
  }

  Expression createElement(Expression renderer, Expression parentRenderNode,
      String name, Expression rootSelector, List<Statement> targetStatements) {
    var varName = this._nextRenderVar();
    var valueExpr;
    if (isPresent(rootSelector)) {
      valueExpr = '''${ rootSelector . expression} == null ?
        ${ renderer . expression}.createElement(${ isPresent ( parentRenderNode ) ? parentRenderNode . expression : null}, ${ escapeSingleQuoteString ( name )}) :
        ${ renderer . expression}.selectRootElement(${ rootSelector . expression});''';
    } else {
      valueExpr =
          '''${ renderer . expression}.createElement(${ isPresent ( parentRenderNode ) ? parentRenderNode . expression : null}, ${ escapeSingleQuoteString ( name )})''';
    }
    var statement = '''var ${ varName} = ${ valueExpr};''';
    targetStatements.add(new Statement(statement));
    return new Expression(varName);
  }

  Expression createTemplateAnchor(Expression renderer,
      Expression parentRenderNode, List<Statement> targetStatements) {
    var varName = this._nextRenderVar();
    var valueExpr =
        '''${ renderer . expression}.createTemplateAnchor(${ isPresent ( parentRenderNode ) ? parentRenderNode . expression : null});''';
    targetStatements.add(new Statement('''var ${ varName} = ${ valueExpr}'''));
    return new Expression(varName);
  }

  Expression createGlobalEventListener(
      Expression renderer,
      Expression appView,
      num boundElementIndex,
      BoundEventAst eventAst,
      List<Statement> targetStatements) {
    var disposableVar = this._nextDisposableVar();
    var eventHandlerExpr =
        codeGenEventHandler(appView, boundElementIndex, eventAst.fullName);
    targetStatements.add(new Statement(
        '''var ${ disposableVar} = ${ renderer . expression}.listenGlobal(${ escapeValue ( eventAst . target )}, ${ escapeValue ( eventAst . name )}, ${ eventHandlerExpr});'''));
    return new Expression(disposableVar);
  }

  createElementEventListener(
      Expression renderer,
      Expression appView,
      num boundElementIndex,
      Expression renderNode,
      BoundEventAst eventAst,
      List<Statement> targetStatements) {
    var eventHandlerExpr =
        codeGenEventHandler(appView, boundElementIndex, eventAst.fullName);
    targetStatements.add(new Statement(
        '''${ renderer . expression}.listen(${ renderNode . expression}, ${ escapeValue ( eventAst . name )}, ${ eventHandlerExpr});'''));
  }

  setElementAttribute(Expression renderer, Expression renderNode,
      String attrName, String attrValue, List<Statement> targetStatements) {
    targetStatements.add(new Statement(
        '''${ renderer . expression}.setElementAttribute(${ renderNode . expression}, ${ escapeSingleQuoteString ( attrName )}, ${ escapeSingleQuoteString ( attrValue )});'''));
  }

  Expression createAppElement(
      Expression appProtoEl,
      Expression appView,
      Expression renderNode,
      Expression parentAppEl,
      Expression embeddedViewFactory,
      List<Statement> targetStatements) {
    var appVar = this._nextAppVar();
    var varValue =
        '''new ${ APP_EL_MODULE_REF}AppElement(${ appProtoEl . expression}, ${ appView . expression},
      ${ isPresent ( parentAppEl ) ? parentAppEl . expression : null}, ${ renderNode . expression}, ${ isPresent ( embeddedViewFactory ) ? embeddedViewFactory . expression : null})''';
    targetStatements.add(new Statement('''var ${ appVar} = ${ varValue};'''));
    return new Expression(appVar);
  }

  createAndSetComponentView(
      Expression renderer,
      Expression viewManager,
      Expression view,
      Expression appEl,
      CompileDirectiveMetadata component,
      List<List<Expression>> contentNodesByNgContentIndex,
      List<Statement> targetStatements) {
    var viewFactoryExpr = this.componentViewFactory(component);
    var codeGenContentNodes;
    if (this.component.type.isHost) {
      codeGenContentNodes = '''${ view . expression}.projectableNodes''';
    } else {
      codeGenContentNodes =
          '''[${ contentNodesByNgContentIndex . map ( ( nodes ) => codeGenFlatArray ( nodes ) ) . toList ( ) . join ( "," )}]''';
      if (assertionsEnabled()) {
        viewFactoryExpr =
            '''viewManager.getComponentViewFactory(${ codeGenType ( component . type )}, ${ viewFactoryExpr})''';
      }
    }
    targetStatements.add(new Statement(
        '''${ viewFactoryExpr}(${ renderer . expression}, ${ viewManager . expression}, ${ appEl . expression}, ${ codeGenContentNodes}, null, null, null);'''));
  }

  Expression getProjectedNodes(
      Expression projectableNodes, num ngContentIndex) {
    return new Expression(
        '''${ projectableNodes . expression}[${ ngContentIndex}]''', true);
  }

  appendProjectedNodes(Expression renderer, Expression parent, Expression nodes,
      List<Statement> targetStatements) {
    targetStatements.add(new Statement(
        '''${ renderer . expression}.projectNodes(${ parent . expression}, ${ APP_VIEW_MODULE_REF}flattenNestedViewRenderNodes(${ nodes . expression}));'''));
  }

  Expression createViewFactory(List<TemplateAst> asts,
      num embeddedTemplateIndex, List<Statement> targetStatements) {
    var compileProtoView = this.protoViews[embeddedTemplateIndex];
    var isHostView = this.component.type.isHost;
    var isComponentView = identical(embeddedTemplateIndex, 0) && !isHostView;
    var visitor = new ViewBuilderVisitor<Expression, Statement>(
        new Expression("renderer"),
        new Expression("viewManager"),
        new Expression("projectableNodes"),
        isHostView ? new Expression("rootSelector") : null,
        new Expression("view"),
        compileProtoView,
        targetStatements,
        this);
    templateVisitAll(
        visitor,
        asts,
        new ParentElement(
            isComponentView ? new Expression("parentRenderNode") : null,
            null,
            null));
    var appProtoView = compileProtoView.protoView.expression;
    var viewFactoryName =
        codeGenViewFactoryName(this.component, embeddedTemplateIndex);
    var changeDetectorFactory =
        this.changeDetectorExpressions.expressions[embeddedTemplateIndex];
    var factoryArgs = [
      "parentRenderer",
      "viewManager",
      "containerEl",
      "projectableNodes",
      "rootSelector",
      "dynamicallyCreatedProviders",
      "rootInjector"
    ];
    var initRendererStmts = [];
    var rendererExpr = '''parentRenderer''';
    if (identical(embeddedTemplateIndex, 0)) {
      var renderCompTypeVar = this._nextVar("renderType");
      targetStatements
          .add(new Statement('''var ${ renderCompTypeVar} = null;'''));
      var stylesVar = this._nextVar("styles");
      targetStatements.add(new Statement(
          '''${ CONST_VAR} ${ stylesVar} = ${ this . styles . expression};'''));
      var encapsulation = this.component.template.encapsulation;
      initRendererStmts.add('''if (${ renderCompTypeVar} == null) {
        ${ renderCompTypeVar} = viewManager.createRenderComponentType(${ codeGenViewEncapsulation ( encapsulation )}, ${ stylesVar});
      }''');
      rendererExpr =
          '''parentRenderer.renderComponent(${ renderCompTypeVar})''';
    }
    var statement = '''
${ codeGenFnHeader ( factoryArgs , viewFactoryName )}{
  ${ initRendererStmts . join ( "\n" )}
  var renderer = ${ rendererExpr};
  var view = new ${ APP_VIEW_MODULE_REF}AppView(
    ${ appProtoView}, renderer, viewManager,
    projectableNodes,
    containerEl,
    dynamicallyCreatedProviders, rootInjector,
    ${ changeDetectorFactory}()
  );
  ${ APP_VIEW_MODULE_REF}checkSlotCount(${ escapeValue ( this . component . type . name )}, ${ this . component . template . ngContentSelectors . length}, projectableNodes);
  ${ isComponentView ? "var parentRenderNode = renderer.createViewRoot(view.containerAppElement.nativeElement);" : ""}
  ${ visitor . renderStmts . map ( ( stmt ) => stmt . statement ) . toList ( ) . join ( "\n" )}
  ${ visitor . appStmts . map ( ( stmt ) => stmt . statement ) . toList ( ) . join ( "\n" )}

  view.init(${ codeGenFlatArray ( visitor . rootNodesOrAppElements )}, ${ codeGenArray ( visitor . renderNodes )}, ${ codeGenArray ( visitor . appDisposables )},
            ${ codeGenArray ( visitor . appElements )});
  return view;
}''';
    targetStatements.add(new Statement(statement));
    return new Expression(viewFactoryName);
  }
}

class RuntimeViewFactory implements ViewFactory<dynamic, dynamic> {
  CompileDirectiveMetadata component;
  List<dynamic /* String | List < dynamic > */ > styles;
  List<CompileProtoView<AppProtoView, AppProtoElement>> protoViews;
  List<Function> changeDetectorFactories;
  Function componentViewFactory;
  RuntimeViewFactory(this.component, this.styles, this.protoViews,
      this.changeDetectorFactories, this.componentViewFactory) {}
  dynamic createText(Renderer renderer, dynamic parent, String text,
      List<dynamic> targetStatements) {
    return renderer.createText(parent, text);
  }

  dynamic createElement(Renderer renderer, dynamic parent, String name,
      String rootSelector, List<dynamic> targetStatements) {
    var el;
    if (isPresent(rootSelector)) {
      el = renderer.selectRootElement(rootSelector);
    } else {
      el = renderer.createElement(parent, name);
    }
    return el;
  }

  dynamic createTemplateAnchor(
      Renderer renderer, dynamic parent, List<dynamic> targetStatements) {
    return renderer.createTemplateAnchor(parent);
  }

  dynamic createGlobalEventListener(
      Renderer renderer,
      AppView appView,
      num boundElementIndex,
      BoundEventAst eventAst,
      List<dynamic> targetStatements) {
    return renderer.listenGlobal(
        eventAst.target,
        eventAst.name,
        (event) => appView.triggerEventHandlers(
            eventAst.fullName, event, boundElementIndex));
  }

  createElementEventListener(
      Renderer renderer,
      AppView appView,
      num boundElementIndex,
      dynamic renderNode,
      BoundEventAst eventAst,
      List<dynamic> targetStatements) {
    renderer.listen(
        renderNode,
        eventAst.name,
        (event) => appView.triggerEventHandlers(
            eventAst.fullName, event, boundElementIndex));
  }

  setElementAttribute(Renderer renderer, dynamic renderNode, String attrName,
      String attrValue, List<dynamic> targetStatements) {
    renderer.setElementAttribute(renderNode, attrName, attrValue);
  }

  dynamic createAppElement(
      AppProtoElement appProtoEl,
      AppView appView,
      dynamic renderNode,
      AppElement parentAppEl,
      Function embeddedViewFactory,
      List<dynamic> targetStatements) {
    return new AppElement(
        appProtoEl, appView, parentAppEl, renderNode, embeddedViewFactory);
  }

  createAndSetComponentView(
      Renderer renderer,
      AppViewManager_ viewManager,
      AppView appView,
      AppElement appEl,
      CompileDirectiveMetadata component,
      List<
          List<
              dynamic /* dynamic | List < dynamic > */ >> contentNodesByNgContentIndex,
      List<dynamic> targetStatements) {
    var flattenedContentNodes;
    var viewFactory = this.componentViewFactory(component);
    if (this.component.type.isHost) {
      flattenedContentNodes = appView.projectableNodes;
    } else {
      flattenedContentNodes =
          ListWrapper.createFixedSize(contentNodesByNgContentIndex.length);
      for (var i = 0; i < contentNodesByNgContentIndex.length; i++) {
        flattenedContentNodes[i] =
            flattenArray(contentNodesByNgContentIndex[i], []);
      }
      if (assertionsEnabled()) {
        viewFactory = viewManager.getComponentViewFactory(
            component.type.runtime, viewFactory);
      }
    }
    viewFactory(renderer, viewManager, appEl, flattenedContentNodes);
  }

  List<dynamic> getProjectedNodes(
      List<List<dynamic>> projectableNodes, num ngContentIndex) {
    return projectableNodes[ngContentIndex];
  }

  appendProjectedNodes(Renderer renderer, dynamic parent, List<dynamic> nodes,
      List<dynamic> targetStatements) {
    renderer.projectNodes(parent, flattenNestedViewRenderNodes(nodes));
  }

  Function createViewFactory(List<TemplateAst> asts, num embeddedTemplateIndex,
      List<dynamic> targetStatements) {
    var compileProtoView = this.protoViews[embeddedTemplateIndex];
    var isComponentView =
        identical(compileProtoView.protoView.type, ViewType.COMPONENT);
    var renderComponentType = null;
    return (ParentRenderer parentRenderer, AppViewManager_ viewManager,
        AppElement containerEl, List<List<dynamic>> projectableNodes,
        [String rootSelector = null,
        List<ResolvedProvider> dynamicallyCreatedProviders = null,
        Injector rootInjector = null]) {
      checkSlotCount(this.component.type.name,
          this.component.template.ngContentSelectors.length, projectableNodes);
      var renderer;
      if (identical(embeddedTemplateIndex, 0)) {
        if (isBlank(renderComponentType)) {
          renderComponentType = viewManager.createRenderComponentType(
              this.component.template.encapsulation, this.styles);
        }
        renderer = parentRenderer.renderComponent(renderComponentType);
      } else {
        renderer = (parentRenderer as Renderer);
      }
      var changeDetector =
          this.changeDetectorFactories[embeddedTemplateIndex]();
      var view = new AppView(
          compileProtoView.protoView,
          renderer,
          viewManager,
          projectableNodes,
          containerEl,
          dynamicallyCreatedProviders,
          rootInjector,
          changeDetector);
      var visitor = new ViewBuilderVisitor<dynamic, dynamic>(
          renderer,
          viewManager,
          projectableNodes,
          rootSelector,
          view,
          compileProtoView,
          [],
          this);
      var parentRenderNode = isComponentView
          ? renderer.createViewRoot(containerEl.nativeElement)
          : null;
      templateVisitAll(
          visitor, asts, new ParentElement(parentRenderNode, null, null));
      view.init(flattenArray(visitor.rootNodesOrAppElements, []),
          visitor.renderNodes, visitor.appDisposables, visitor.appElements);
      return view;
    };
  }
}

class ParentElement<EXPRESSION> {
  EXPRESSION renderNode;
  EXPRESSION appEl;
  CompileDirectiveMetadata component;
  List<List<EXPRESSION>> contentNodesByNgContentIndex;
  ParentElement(this.renderNode, this.appEl, this.component) {
    if (isPresent(component)) {
      this.contentNodesByNgContentIndex = ListWrapper
          .createFixedSize(component.template.ngContentSelectors.length);
      for (var i = 0; i < this.contentNodesByNgContentIndex.length; i++) {
        this.contentNodesByNgContentIndex[i] = [];
      }
    } else {
      this.contentNodesByNgContentIndex = null;
    }
  }
  addContentNode(num ngContentIndex, EXPRESSION nodeExpr) {
    this.contentNodesByNgContentIndex[ngContentIndex].add(nodeExpr);
  }
}

class ViewBuilderVisitor<EXPRESSION, STATEMENT> implements TemplateAstVisitor {
  EXPRESSION renderer;
  EXPRESSION viewManager;
  EXPRESSION projectableNodes;
  EXPRESSION rootSelector;
  EXPRESSION view;
  CompileProtoView<EXPRESSION, EXPRESSION> protoView;
  List<STATEMENT> targetStatements;
  ViewFactory<EXPRESSION, STATEMENT> factory;
  List<STATEMENT> renderStmts = [];
  List<EXPRESSION> renderNodes = [];
  List<STATEMENT> appStmts = [];
  List<EXPRESSION> appElements = [];
  List<EXPRESSION> appDisposables = [];
  List<EXPRESSION> rootNodesOrAppElements = [];
  num elementCount = 0;
  ViewBuilderVisitor(
      this.renderer,
      this.viewManager,
      this.projectableNodes,
      this.rootSelector,
      this.view,
      this.protoView,
      this.targetStatements,
      this.factory) {}
  _addRenderNode(EXPRESSION renderNode, EXPRESSION appEl, num ngContentIndex,
      ParentElement<EXPRESSION> parent) {
    this.renderNodes.add(renderNode);
    if (isPresent(parent.component)) {
      if (isPresent(ngContentIndex)) {
        parent.addContentNode(
            ngContentIndex, isPresent(appEl) ? appEl : renderNode);
      }
    } else if (isBlank(parent.renderNode)) {
      this.rootNodesOrAppElements.add(isPresent(appEl) ? appEl : renderNode);
    }
  }

  EXPRESSION _getParentRenderNode(
      num ngContentIndex, ParentElement<EXPRESSION> parent) {
    return isPresent(parent.component) &&
        !identical(parent.component.template.encapsulation,
            ViewEncapsulation.Native) ? null : parent.renderNode;
  }

  dynamic visitBoundText(BoundTextAst ast, ParentElement<EXPRESSION> parent) {
    return this._visitText("", ast.ngContentIndex, parent);
  }

  dynamic visitText(TextAst ast, ParentElement<EXPRESSION> parent) {
    return this._visitText(ast.value, ast.ngContentIndex, parent);
  }

  _visitText(
      String value, num ngContentIndex, ParentElement<EXPRESSION> parent) {
    var renderNode = this.factory.createText(
        this.renderer,
        this._getParentRenderNode(ngContentIndex, parent),
        value,
        this.renderStmts);
    this._addRenderNode(renderNode, null, ngContentIndex, parent);
    return null;
  }

  dynamic visitNgContent(NgContentAst ast, ParentElement<EXPRESSION> parent) {
    var nodesExpression =
        this.factory.getProjectedNodes(this.projectableNodes, ast.index);
    if (isPresent(parent.component)) {
      if (isPresent(ast.ngContentIndex)) {
        parent.addContentNode(ast.ngContentIndex, nodesExpression);
      }
    } else {
      if (isPresent(parent.renderNode)) {
        this.factory.appendProjectedNodes(this.renderer, parent.renderNode,
            nodesExpression, this.renderStmts);
      } else {
        this.rootNodesOrAppElements.add(nodesExpression);
      }
    }
    return null;
  }

  dynamic visitElement(ElementAst ast, ParentElement<EXPRESSION> parent) {
    var renderNode = this.factory.createElement(
        this.renderer,
        this._getParentRenderNode(ast.ngContentIndex, parent),
        ast.name,
        this.rootSelector,
        this.renderStmts);
    var component = ast.getComponent();
    var elementIndex = this.elementCount++;
    var protoEl = this.protoView.protoElements[elementIndex];
    protoEl.renderEvents.forEach((eventAst) {
      if (isPresent(eventAst.target)) {
        var disposable = this.factory.createGlobalEventListener(this.renderer,
            this.view, protoEl.boundElementIndex, eventAst, this.renderStmts);
        this.appDisposables.add(disposable);
      } else {
        this.factory.createElementEventListener(this.renderer, this.view,
            protoEl.boundElementIndex, renderNode, eventAst, this.renderStmts);
      }
    });
    for (var i = 0; i < protoEl.attrNameAndValues.length; i++) {
      var attrName = protoEl.attrNameAndValues[i][0];
      var attrValue = protoEl.attrNameAndValues[i][1];
      this.factory.setElementAttribute(
          this.renderer, renderNode, attrName, attrValue, this.renderStmts);
    }
    var appEl = null;
    if (isPresent(protoEl.appProtoEl)) {
      appEl = this.factory.createAppElement(protoEl.appProtoEl, this.view,
          renderNode, parent.appEl, null, this.appStmts);
      this.appElements.add(appEl);
    }
    this._addRenderNode(renderNode, appEl, ast.ngContentIndex, parent);
    var newParent = new ParentElement<EXPRESSION>(
        renderNode, isPresent(appEl) ? appEl : parent.appEl, component);
    templateVisitAll(this, ast.children, newParent);
    if (isPresent(appEl) && isPresent(component)) {
      this.factory.createAndSetComponentView(
          this.renderer,
          this.viewManager,
          this.view,
          appEl,
          component,
          newParent.contentNodesByNgContentIndex,
          this.appStmts);
    }
    return null;
  }

  dynamic visitEmbeddedTemplate(
      EmbeddedTemplateAst ast, ParentElement<EXPRESSION> parent) {
    var renderNode = this.factory.createTemplateAnchor(
        this.renderer,
        this._getParentRenderNode(ast.ngContentIndex, parent),
        this.renderStmts);
    var elementIndex = this.elementCount++;
    var protoEl = this.protoView.protoElements[elementIndex];
    var embeddedViewFactory = this.factory.createViewFactory(
        ast.children, protoEl.embeddedTemplateIndex, this.targetStatements);
    var appEl = this.factory.createAppElement(protoEl.appProtoEl, this.view,
        renderNode, parent.appEl, embeddedViewFactory, this.appStmts);
    this._addRenderNode(renderNode, appEl, ast.ngContentIndex, parent);
    this.appElements.add(appEl);
    return null;
  }

  dynamic visitVariable(VariableAst ast, dynamic ctx) {
    return null;
  }

  dynamic visitAttr(AttrAst ast, dynamic ctx) {
    return null;
  }

  dynamic visitDirective(DirectiveAst ast, dynamic ctx) {
    return null;
  }

  dynamic visitEvent(BoundEventAst ast, dynamic ctx) {
    return null;
  }

  dynamic visitDirectiveProperty(
      BoundDirectivePropertyAst ast, dynamic context) {
    return null;
  }

  dynamic visitElementProperty(BoundElementPropertyAst ast, dynamic context) {
    return null;
  }
}

String codeGenEventHandler(
    Expression view, num boundElementIndex, String eventName) {
  return codeGenValueFn([
    "event"
  ], '''${ view . expression}.triggerEventHandlers(${ escapeValue ( eventName )}, event, ${ boundElementIndex})''');
}

String codeGenViewFactoryName(
    CompileDirectiveMetadata component, num embeddedTemplateIndex) {
  return '''viewFactory_${ component . type . name}${ embeddedTemplateIndex}''';
}

String codeGenViewEncapsulation(ViewEncapsulation value) {
  if (IS_DART) {
    return '''${ METADATA_MODULE_REF}${ value}''';
  } else {
    return '''${ value}''';
  }
}
