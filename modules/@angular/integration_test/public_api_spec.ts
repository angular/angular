import {
  beforeEach,
  ddescribe,
  describe,
  expect,
  iit,
  inject,
  it,
  xdescribe,
  xit
} from '@angular/core/testing/testing_internal';
import {IS_DART, RegExpWrapper, StringWrapper} from '../facade/src/lang';
import {getSymbolsFromLibrary} from './symbol_inspector/symbol_inspector';
import {ListWrapper} from '../facade/src/collection';

// =================================================================================================
// =================================================================================================
// =========== S T O P   -  S T O P   -  S T O P   -  S T O P   -  S T O P   -  S T O P  ===========
// =================================================================================================
// =================================================================================================
//
// DO NOT EDIT THIS LIST OF PUBLIC APIS UNLESS YOU GET IT CLEARED BY: mhevery, vsavkin, or tbosch!
//
// =================================================================================================
// =================================================================================================
// Note that this test only tests for *values* exported (e.g. classes, functions, variables), but
// not for *types* exported (interfaces, typedefs).
// See tools/public_api_guard/public_api_spec.ts for a type based test.
// =================================================================================================


var COMMON: string[] = [
  'APP_BASE_HREF',
  'HashLocationStrategy',
  'Location',
  'LocationStrategy',
  'PathLocationStrategy',
  'PlatformLocation',
  'AbstractControl',
  'AbstractControlDirective',
  'AsyncPipe',
  'COMMON_DIRECTIVES',
  'COMMON_PIPES',
  'CORE_DIRECTIVES',
  'CheckboxControlValueAccessor',
  'Control',
  'ControlArray',
  'ControlContainer',
  'ControlGroup',
  'ControlValueAccessor:dart',
  'CurrencyPipe',
  'DatePipe',
  'DecimalPipe',
  'DefaultValueAccessor',
  'FORM_BINDINGS',
  'FORM_DIRECTIVES',
  'FORM_PROVIDERS',
  'Form:dart',
  'FormBuilder',
  'I18nPluralPipe',
  'I18nSelectPipe',
  'JsonPipe',
  'LowerCasePipe',
  'MaxLengthValidator',
  'MinLengthValidator',
  'NG_ASYNC_VALIDATORS',
  'NG_VALIDATORS',
  'NG_VALUE_ACCESSOR',
  'NgClass',
  'NgControl',
  'NgControlGroup',
  'NgControlName',
  'NgControlStatus',
  'NgFor',
  'NgForm',
  'NgFormControl',
  'NgFormModel',
  'NgIf',
  'NgTemplateOutlet',
  'NgModel',
  'NgSelectOption',
  'NgStyle',
  'NgSwitch',
  'NgSwitchWhen',
  'NgSwitchDefault',
  'NumberPipe',
  'ObservableListDiff:dart',
  'ObservableListDiffFactory:dart',
  'PatternValidator',
  'PercentPipe',
  'ReplacePipe',
  'RequiredValidator',
  'SelectControlValueAccessor',
  'SlicePipe',
  'UpperCasePipe',
  'Validator:dart',
  'Validators',
  'RadioButtonState',
  'NgLocalization',
  'NgPlural',
  'NgPluralCase'
];

var COMMON_TESTING: string[] = ['MockLocationStrategy', 'SpyLocation'];

var COMPILER: string[] = [
  'ElementSchemaRegistry',
  '__compiler_private__',
  "TemplateAst:dart",
  "TemplateAstVisitor:dart",
  "DEFAULT_PACKAGE_URL_PROVIDER",
  "UrlResolver",
  "AttrAst",
  "BoundDirectivePropertyAst",
  "BoundElementPropertyAst",
  "BoundEventAst",
  "BoundTextAst",
  "COMPILER_PROVIDERS",
  "CompileDirectiveMetadata",
  "CompileTemplateMetadata",
  "CompileTypeMetadata",
  "DirectiveAst",
  "ElementAst",
  "EmbeddedTemplateAst",
  "NgContentAst",
  "PropertyBindingType",
  "SourceModule",
  "TEMPLATE_TRANSFORMS",
  "TextAst",
  "VariableAst",
  "ReferenceAst",
  "XHR",
  "templateVisitAll",
  "CompileDiDependencyMetadata",
  "CompileFactoryMetadata",
  "CompileIdentifierMetadata",
  "CompileMetadataWithIdentifier",
  "CompileMetadataWithType",
  "CompilePipeMetadata",
  "CompileProviderMetadata",
  "CompileQueryMetadata",
  "CompileTokenMetadata",
  "CompilerConfig",
  "RenderTypes",
  "DirectiveResolver",
  "NormalizedComponentWithViewDirectives",
  "OfflineCompiler",
  "RuntimeCompiler",
  "PipeResolver",
  "ProviderAst",
  "ProviderAstType",
  "ViewResolver",
  "createOfflineCompileUrlResolver"
];

var COMPILER_TESTING: string[] = [
  'ComponentFixture',
  'ComponentFixtureAutoDetect',
  'ComponentFixtureNoNgZone',
  'MockDirectiveResolver',
  'MockSchemaRegistry',
  'MockViewResolver',
  'MockXHR',
  'TestComponentBuilder',
  'TestComponentRenderer'
];

var CORE: string[] = [
  '__core_private__',
  'BaseException',
  'DefaultIterableDiffer',
  'getDebugNode',
  'wtfCreateScope',
  'wtfEndTimeRange',
  'wtfLeave',
  'wtfStartTimeRange',
  'APP_INITIALIZER',
  'APP_ID',
  'AngularEntrypoint:dart',
  'AbstractProviderError',
  'AUTO_STYLE',
  'AnimationAnimateMetadata',
  'AnimationEntryMetadata',
  'AnimationGroupMetadata',
  'AnimationMetadata',
  'AnimationSequenceMetadata',
  'AnimationStateDeclarationMetadata',
  'AnimationStateMetadata',
  'AnimationStateTransitionMetadata',
  'AnimationStyleMetadata',
  'AnimationWithStepsMetadata',
  'AnimationKeyframesSequenceMetadata',
  'AnimationPlayer',
  'animate',
  'group',
  'sequence',
  'state',
  'style',
  'keyframes',
  'trigger',
  'transition',
  'ApplicationRef',
  'APPLICATION_COMMON_PROVIDERS',
  'Attribute',
  'AttributeMetadata',
  'Binding',
  'Provider',
  'ProviderBuilder',
  'PLATFORM_DIRECTIVES',
  "CollectionChangeRecord",
  'ChangeDetectionStrategy',
  'ChangeDetectorRef',
  'Class:js',
  'ComponentResolver',
  'SystemJsComponentResolver',
  'Component',
  'ComponentMetadata',
  'ComponentRef',
  'ContentChild',
  'ContentChildMetadata',
  'ContentChildren',
  'ContentChildrenMetadata',
  'CyclicDependencyError',
  'PLATFORM_PIPES',
  'DebugNode',
  'DebugElement',
  'ReflectiveDependency',
  'DependencyMetadata',
  'Directive',
  'DirectiveMetadata',
  'DynamicComponentLoader',
  'ElementRef',
  'Output',
  'EmbeddedViewRef',
  'EventEmitter',
  'ExceptionHandler',
  'OutputMetadata',
  'enableProdMode',
  'ExpressionChangedAfterItHasBeenCheckedException',
  'Host',
  'HostBinding',
  'HostBindingMetadata',
  'HostListener',
  'HostListenerMetadata',
  'HostMetadata',
  'ComponentFactory',
  'Inject',
  'InjectMetadata',
  'Injectable',
  'InjectableMetadata',
  'Injector',
  'ReflectiveInjector',
  'InstantiationError',
  'InvalidProviderError',
  'IterableDiffers',
  'ReflectiveKey',
  'KeyValueChangeRecord',
  'KeyValueDiffers',
  'NgZone',
  'NgZoneError',
  'NoAnnotationError',
  'NoProviderError',
  'OpaqueToken',
  'Optional',
  'OptionalMetadata',
  'OutOfBoundsError',
  'Pipe',
  'PipeMetadata',
  'PlatformRef',
  'Input',
  'InputMetadata',
  'Query',
  'QueryList',
  'QueryMetadata',
  'Renderer',
  'RootRenderer',
  'RenderComponentType',
  'ResolvedReflectiveBinding:dart',
  'ResolvedReflectiveProvider:dart',
  'ResolvedReflectiveFactory',
  'Self',
  'SelfMetadata',
  'SkipSelf',
  'SkipSelfMetadata',
  'SimpleChange',
  'TemplateRef',
  'Testability',
  'TestabilityRegistry',
  'GetTestability:dart',
  'setTestabilityGetter',
  'Type',
  'PACKAGE_ROOT_URL',
  'View:dart',
  /*
  'View.directives:dart',
  'View.encapsulation:dart',
  'View.pipes:dart',
  'View.styleUrls:dart',
  'View.styles:dart',
  'View.template:dart',
  'View.templateUrl:dart',
  */
  'ViewChild',
  'ViewChildMetadata',
  'ViewChildren',
  'ViewChildrenMetadata',
  'ViewContainerRef',
  'ViewEncapsulation',
  'ViewMetadata',
  'ViewQuery',
  'ViewQueryMetadata',
  'WrappedException',
  'WrappedValue',
  'asNativeElements',
  'bind',
  'provide',
  'createNgZone',
  'forwardRef:js',
  'coreBootstrap',
  'coreLoadAndBootstrap',
  'createPlatform',
  'disposePlatform',
  'getPlatform',
  'assertPlatform',
  'resolveForwardRef:js',
  'PLATFORM_COMMON_PROVIDERS',
  'PLATFORM_INITIALIZER',
  'AfterContentChecked',
  'AfterContentInit',
  'AfterViewChecked',
  'AfterViewInit',
  'DoCheck',
  'IterableDifferFactory:dart',
  'IterableDiffer:dart',
  'KeyValueDifferFactory:dart',
  'KeyValueDiffer:dart',
  'OnChanges',
  'OnDestroy',
  'OnInit',
  'PipeTransform:dart',
  'reflector',
  'Stream:dart',
  'GetterFn:dart',
  'MethodFn:dart',
  'NoReflectionCapabilities:dart',
  'PlatformReflectionCapabilities:dart',
  'ReflectionInfo',
  'Reflector',
  'SetterFn:dart',
  'ViewRef',
  'TrackByFn:dart'
];

var CORE_TESTING: string[] = [
  'InjectSetupWrapper',
  'Log',
  'MockApplicationRef',
  'MockNgZone',
  'TestInjector',
  'afterEach',
  'async',
  'beforeEach',
  'beforeEachProviders',
  'clearPendingTimers',
  'containsRegexp',
  'ddescribe',
  'describe',
  'expect',
  'fakeAsync',
  'fdescribe',
  'fit',
  'flushMicrotasks',
  'getTestInjector',
  'getTypeOf',
  'iit',
  'inject',
  'injectAsync',
  'instantiateType',
  'it',
  'resetBaseTestProviders',
  'setBaseTestProviders',
  'tick',
  'withProviders',
  'xdescribe',
  'xit'
];

var PLATFORM_BROWSER: string[] = [
  '__platform_browser_private__',
  'AngularEntrypoint:dart',
  'bootstrap',
  'bootstrapApp',
  'bootstrapRender',
  'BROWSER_APP_PROVIDERS',
  'BROWSER_APP_COMPILER_PROVIDERS',
  'BROWSER_PLATFORM_PROVIDERS',
  'BROWSER_SANITIZATION_PROVIDERS',
  'browserPlatform',
  'BrowserPlatformLocation',
  'By',
  'CACHED_TEMPLATE_PROVIDER',
  'ClientMessageBroker',
  'ClientMessageBrokerFactory',
  'disableDebugTools',
  'DOCUMENT',
  'DomEventsPlugin',
  'DomSanitizationService',
  'ELEMENT_PROBE_PROVIDERS',
  'enableDebugTools',
  'EVENT_MANAGER_PLUGINS',
  'EventManager',
  'FnArg',
  'HAMMER_GESTURE_CONFIG',
  'HammerGestureConfig',
  'initializeGenericWorkerRenderer',
  'KeyEventsPlugin',
  'MessageBus',
  'PRIMITIVE',
  'ReceivedMessage',
  'SecurityContext',
  'ServiceMessageBroker',
  'ServiceMessageBrokerFactory',
  'Title',
  'UiArguments',
  'UrlChangeEvent:dart',
  'UrlChangeListener:dart',
  'WebWorkerInstance',
  'WORKER_APP_APPLICATION_PROVIDERS',
  'WORKER_APP_LOCATION_PROVIDERS',
  'WORKER_APP_PLATFORM_PROVIDERS',
  'WORKER_RENDER_APPLICATION_PROVIDERS',
  'WORKER_RENDER_LOCATION_PROVIDERS',
  'WORKER_RENDER_PLATFORM_PROVIDERS',
  'WORKER_RENDER_STARTABLE_MESSAGING_SERVICE',
  'WORKER_SCRIPT',
  'workerAppPlatform',
  'workerRenderPlatform'
];

var PLATFORM_BROWSER_TESTING: string[] = [
  'ADDITIONAL_TEST_BROWSER_PROVIDERS',  // This should be made private
  'ADDITIONAL_TEST_BROWSER_STATIC_PROVIDERS',  // This should be made private
  'BrowserDetection',
  'browserDetection',
  'dispatchEvent',
  'DOMTestComponentRenderer',
  'el',
  'expect',
  'normalizeCSS',
  'stringifyElement',
  'TEST_BROWSER_APPLICATION_PROVIDERS',
  'TEST_BROWSER_PLATFORM_PROVIDERS',
  'TEST_BROWSER_STATIC_APPLICATION_PROVIDERS',
  'TEST_BROWSER_STATIC_PLATFORM_PROVIDERS'
];

var PLATFORM_SERVER: string[] = ['Parse5DomAdapter'];

var PLATFORM_SERVER_TESTING: string[] =
    ['TEST_SERVER_APPLICATION_PROVIDERS', 'TEST_SERVER_PLATFORM_PROVIDERS'];

var UPGRADE: string[] = [
  'UpgradeAdapter',
  'UpgradeAdapterRef',
];

var HTTP: string[] = [
  'BaseRequestOptions',
  'BaseResponseOptions',
  'BrowserXhr',
  'Connection',
  'ConnectionBackend',
  'HTTP_BINDINGS',
  'HTTP_PROVIDERS',
  'Headers',
  'Http',
  'JSONPBackend',
  'JSONPConnection',
  'JSONP_PROVIDERS',
  'JSON_BINDINGS',
  'Jsonp',
  'ReadyState',
  'Request',
  'RequestMethod',
  'RequestOptions',
  'Response',
  'ResponseOptions',
  'ResponseType',
  'URLSearchParams',
  'XHRBackend',
  'XHRConnection'
];

var HTTP_TESTING: string[] = ['MockBackend', 'MockConnection'];

var ROUTER_DEPRECATED: string[] = [
  'AsyncRoute',
  'AuxRoute',
  'CanActivate',
  'ComponentInstruction',
  'Instruction',
  'OpaqueToken',
  'ROUTER_BINDINGS',
  'ROUTER_DIRECTIVES',
  'ROUTER_PRIMARY_COMPONENT',
  'ROUTER_PROVIDERS',
  'ROUTER_PROVIDERS_COMMON',
  'Redirect',
  'Route',
  'RouteConfig',
  'RouteData',
  'RouteParams',
  'RouteRegistry',
  'Router',
  'RouterLink',
  'RouterOutlet'
];

var ROUTER_DEPRETACED_TESTING: string[] = [];


var ROUTER: string[] = [
  'ROUTER_DIRECTIVES',
  'ROUTER_PROVIDERS',
  'Route',
  'Router',
  'DefaultRouterUrlSerializer',
  'RouteSegment',
  'RouteTree',
  'RouterOutletMap',
  'RouterUrlSerializer',
  'Routes',
  'Tree',
  'UrlSegment',
  'UrlTree'
];

var ROUTER_TESTING: string[] = ['ROUTER_FAKE_PROVIDERS'];


var API = {
  'common': COMMON,
  'common/testing': COMMON_TESTING,
  'compiler': COMPILER,
  'compiler/testing': COMPILER_TESTING,
  'core': CORE,
  'core/testing': CORE_TESTING,
  'http': HTTP,
  'http/testing': HTTP_TESTING,
  'router-deprecated': ROUTER_DEPRECATED,
  'router-deprecated/testing': ROUTER_DEPRETACED_TESTING,
  'router': ROUTER,
  'router/testing': ROUTER_TESTING,
  'upgrade': UPGRADE,
  'platform-browser': PLATFORM_BROWSER,
  'platform-browser/testing': PLATFORM_BROWSER_TESTING,
  'platform-server': PLATFORM_SERVER,
  'platform-server/testing': PLATFORM_SERVER_TESTING
};

export function main() {
  /**
   var x = getSymbolsFromLibrary('ng');
   x.sort();
   var parts = [];
   x.forEach((i) => parts.push(`'${i'`));
  print(`[ ${parts.join(',
  ')} ]`);
   */

  describe('public API', () => {
    var barrelList = [
      'common',
      'common/testing',
      'compiler',
      'compiler/testing',
      'core',
      'core/testing',
      'http',
      'http/testing',
      'router',
      'router/testing',
      'upgrade',
      'platform-browser',
      'platform-browser/testing',
      'platform-server',
      'platform-server/testing'
    ];

    if (IS_DART) {
      barrelList = barrelList.filter(b => b !== 'upgrade');
    }

    barrelList.forEach(mod => {
      // Dom Events are merged into DomAdapter in Dart
      if (IS_DART && mod === 'ngPlatformDomEvent') return;
      it(`should fail if public API for ${mod} has changed`, () => {
        var symbols = getSymbolsFromLibrary(mod);
        expect(diff(symbols, API[mod])).toEqual([]);
      })
    });
  });
}

function diff(actual: string[], expected: string[]): string[] {
  ListWrapper.sort(actual, compareIgnoreLang);
  ListWrapper.sort(expected, compareIgnoreLang);
  let mode = IS_DART ? "dart" : "js";
  let missing = actual.filter(i => expected.indexOf(i) < 0 && expected.indexOf(`${i}:${mode}`) < 0)
                    .map(s => `+${s}`);
  let extra = expected.filter(i => shouldIgnore(i) ? false : (actual.indexOf(stripLang(i)) < 0))
                  .map(s => `-${s}`);
  return ListWrapper.concat(missing, extra);
}

function shouldIgnore(expected: string): boolean {
  let isDart = RegExpWrapper.create('\\:dart$');
  let isJs = RegExpWrapper.create('\\:js$');
  return IS_DART ? RegExpWrapper.test(isJs, expected) : RegExpWrapper.test(isDart, expected);
}

function compareIgnoreLang(a: string, b: string): number {
  return StringWrapper.compare(stripLang(a), stripLang(b));
}

function stripLang(text: string): string {
  let index = text.indexOf(':');
  return (index >= 0) ? text.substring(0, index) : text;
}
