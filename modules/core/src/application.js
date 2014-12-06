import {Injector, bind, OpaqueToken} from 'di/di';
import {Type, FIELD, isBlank, isPresent, BaseException, assertionsEnabled} from 'facade/lang';
import {DOM, Element} from 'facade/dom';
import {Compiler, CompilerCache} from './compiler/compiler';
import {ProtoView} from './compiler/view';
import {Reflector, reflector} from 'reflection/reflection';
import {Parser} from 'change_detection/parser/parser';
import {Lexer} from 'change_detection/parser/lexer';
import {ChangeDetector} from 'change_detection/change_detector';
import {RecordRange} from 'change_detection/record_range';
import {TemplateLoader} from './compiler/template_loader';
import {DirectiveMetadataReader} from './compiler/directive_metadata_reader';
import {AnnotatedType} from './compiler/annotated_type';
import {ListWrapper} from 'facade/collection';

var _rootInjector: Injector;

// Contains everything that is safe to share between applications.
var _rootBindings = [
  bind(Reflector).toValue(reflector), Compiler, CompilerCache, TemplateLoader, DirectiveMetadataReader, Parser, Lexer
];

export var appViewToken = new OpaqueToken('AppView');
export var appRecordRangeToken = new OpaqueToken('AppRecordRange');
export var appElementToken = new OpaqueToken('AppElement');
export var appComponentAnnotatedTypeToken = new OpaqueToken('AppComponentAnnotatedType');
export var appDocumentToken = new OpaqueToken('AppDocument');

// Exported only for tests that need to overwrite default document binding.
export function documentDependentBindings(appComponentType) {
  return [
      bind(appComponentAnnotatedTypeToken).toFactory((reader) => {
        // TODO(rado): inspect annotation here and warn if there are bindings,
        // lightDomServices, and other component annotations that are skipped
        // for bootstrapping components.
        return reader.annotatedType(appComponentType);
      }, [DirectiveMetadataReader]),

      bind(appElementToken).toFactory((appComponentAnnotatedType, appDocument) => {
        var selector = appComponentAnnotatedType.annotation.selector;
        var element = DOM.querySelector(appDocument, selector);
        if (isBlank(element)) {
          throw new BaseException(`The app selector "${selector}" did not match any elements`);
        }
        return element;
      }, [appComponentAnnotatedTypeToken, appDocumentToken]),

      bind(appViewToken).toAsyncFactory((compiler, injector, appElement,
            appComponentAnnotatedType) => {
        return compiler.compile(appComponentAnnotatedType.type, null).then(
            (protoView) => {
          var appProtoView = ProtoView.createRootProtoView(protoView,
              appElement, appComponentAnnotatedType);
          // The light Dom of the app element is not considered part of
          // the angular application. Thus the context and lightDomInjector are
          // empty.
          var view = appProtoView.instantiate(null);
          view.hydrate(injector, null, new Object());
          return view;
        });
      }, [Compiler, Injector, appElementToken, appComponentAnnotatedTypeToken]),

      bind(appRecordRangeToken).toFactory((rootView) => rootView.recordRange,
          [appViewToken]),
      bind(ChangeDetector).toFactory((appRecordRange) =>
          new ChangeDetector(appRecordRange, assertionsEnabled()), [appRecordRangeToken]),
      bind(appComponentType).toFactory((rootView) => rootView.elementInjectors[0].getComponent(),
          [appViewToken])
  ];
}

function _injectorBindings(appComponentType) {
  return ListWrapper.concat([bind(appDocumentToken).toValue(DOM.defaultDoc())],
      documentDependentBindings(appComponentType));
}

// Multiple calls to this method are allowed. Each application would only share
// _rootInjector, which is not user-configurable by design, thus safe to share.
export function bootstrap(appComponentType: Type, bindings=null) {
  // TODO(rado): prepopulate template cache, so applications with only
  // index.html and main.js are possible.
  if (isBlank(_rootInjector)) _rootInjector = new Injector(_rootBindings);
  var appInjector = _rootInjector.createChild(_injectorBindings(
      appComponentType));
  if (isPresent(bindings)) appInjector = appInjector.createChild(bindings);

  return appInjector.asyncGet(ChangeDetector).then((cd) => {
    // TODO(rado): replace with zone.
    cd.detectChanges();
    return appInjector;
  });
}
