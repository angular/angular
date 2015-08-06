import {
  AsyncTestCompleter,
  beforeEach,
  ddescribe,
  describe,
  expect,
  iit,
  inject,
  it,
  xdescribe,
  xit
} from 'angular2/test_lib';

import * as ng from 'angular2/angular2';

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

const NG_API = [
  'APP_COMPONENT',  // TODO: To be removed
  'APP_ID',
  'AbstractBindingError',
  'AbstractBindingError.addKey',
  'AbstractBindingError.captureStackTrace',
  'AbstractBindingError.constructor',
  'AbstractBindingError.constructor.captureStackTrace',
  'AbstractBindingError.constructor.stackTraceLimit',
  'AbstractBindingError.context',
  'AbstractBindingError.stackTraceLimit',
  'AbstractBindingError.toString',

  'AbstractControl',
  'AbstractControl.dirty',
  'AbstractControl.errors',
  'AbstractControl.find',
  'AbstractControl.getError',
  'AbstractControl.hasError',
  'AbstractControl.markAsDirty',
  'AbstractControl.markAsTouched',
  'AbstractControl.pristine',
  'AbstractControl.setParent',
  'AbstractControl.status',
  'AbstractControl.touched',
  'AbstractControl.untouched',
  'AbstractControl.updateValidity',
  'AbstractControl.updateValueAndValidity',
  'AbstractControl.valid',
  'AbstractControl.value',
  'AbstractControl.valueChanges',

  'AbstractControlDirective',
  'AbstractControlDirective.control',
  'AbstractControlDirective.dirty',
  'AbstractControlDirective.errors',
  'AbstractControlDirective.pristine',
  'AbstractControlDirective.touched',
  'AbstractControlDirective.untouched',
  'AbstractControlDirective.valid',
  'AbstractControlDirective.value',

  'AppRootUrl',
  'AppRootUrl.value',

  'AppViewManager',
  'AppViewManager.attachViewInContainer',
  'AppViewManager.createEmbeddedViewInContainer',
  'AppViewManager.createHostViewInContainer',
  'AppViewManager.createRootHostView',
  'AppViewManager.destroyRootHostView',
  'AppViewManager.destroyViewInContainer',
  'AppViewManager.detachViewInContainer',
  'AppViewManager.getComponent',
  'AppViewManager.getHostElement',
  'AppViewManager.getNamedElementInComponentView',
  'AppViewManager.getViewContainer',

  'ApplicationRef',
  'ApplicationRef.bootstrap',
  'ApplicationRef.dispose',
  'ApplicationRef.injector',
  'ApplicationRef.registerBootstrapListener',
  'ApplicationRef.zone',

  'AsyncPipe',
  'AsyncPipe.onDestroy',
  'AsyncPipe.transform',

  'Attribute',
  'Attribute.constructor',
  'Attribute.constructor.constructor',
  'Attribute.constructor.toString',
  'Attribute.constructor.token',
  'Attribute.toString',
  'Attribute.token',

  'AttributeMetadata',
  'AttributeMetadata.constructor',
  'AttributeMetadata.toString',
  'AttributeMetadata.token',

  'Binding',
  'Binding.multi',

  'BindingBuilder',
  'BindingBuilder.toAlias',
  'BindingBuilder.toClass',
  'BindingBuilder.toFactory',
  'BindingBuilder.toValue',

  'By',  // TODO: not sure
  'By.all',
  'By.css',
  'By.directive',


  'CORE_DIRECTIVES',

  'ChangeDetectionError',
  'ChangeDetectionError.captureStackTrace',
  'ChangeDetectionError.constructor',
  'ChangeDetectionError.constructor.captureStackTrace',
  'ChangeDetectionError.constructor.stackTraceLimit',
  'ChangeDetectionError.context',
  'ChangeDetectionError.message',
  'ChangeDetectionError.originalException',
  'ChangeDetectionError.originalStack',
  'ChangeDetectionError.stackTraceLimit',
  'ChangeDetectionError.toString',
  'ChangeDetectionError.wrapperMessage',
  'ChangeDetectionError.wrapperStack',

  'ChangeDetectionStrategy',

  'ChangeDetectorRef',
  'ChangeDetectorRef.detach',
  'ChangeDetectorRef.detectChanges',
  'ChangeDetectorRef.markForCheck',
  'ChangeDetectorRef.reattach',

  'CheckboxControlValueAccessor',
  'CheckboxControlValueAccessor.ngClassDirty',
  'CheckboxControlValueAccessor.ngClassInvalid',
  'CheckboxControlValueAccessor.ngClassPristine',
  'CheckboxControlValueAccessor.ngClassTouched',
  'CheckboxControlValueAccessor.ngClassUntouched',
  'CheckboxControlValueAccessor.ngClassValid',
  'CheckboxControlValueAccessor.registerOnChange',
  'CheckboxControlValueAccessor.registerOnTouched',
  'CheckboxControlValueAccessor.writeValue',

  'Class',

  'Compiler',
  'Compiler.compileInHost',

  'Component',
  'Component.constructor',
  'Component.constructor.constructor',

  'ComponentMetadata',
  'ComponentMetadata.constructor',

  'ComponentRef',
  'ComponentRef.dispose',
  'ComponentRef.hostComponent',
  'ComponentRef.hostComponentType',
  'ComponentRef.hostView',

  'ComponentUrlMapper',
  'ComponentUrlMapper.getUrl',

  'ContentChild',
  'ContentChild.constructor',
  'ContentChild.constructor.constructor',
  'ContentChild.constructor.isVarBindingQuery',
  'ContentChild.constructor.isViewQuery',
  'ContentChild.constructor.selector',
  'ContentChild.constructor.toString',
  'ContentChild.constructor.token',
  'ContentChild.constructor.varBindings',
  'ContentChild.isVarBindingQuery',
  'ContentChild.isViewQuery',
  'ContentChild.selector',
  'ContentChild.toString',
  'ContentChild.token',
  'ContentChild.varBindings',
  'ContentChildMetadata',
  'ContentChildMetadata.constructor',
  'ContentChildMetadata.isVarBindingQuery',
  'ContentChildMetadata.isViewQuery',
  'ContentChildMetadata.selector',
  'ContentChildMetadata.toString',
  'ContentChildMetadata.token',
  'ContentChildMetadata.varBindings',

  'ContentChildren',
  'ContentChildren.constructor',
  'ContentChildren.constructor.constructor',
  'ContentChildren.constructor.isVarBindingQuery',
  'ContentChildren.constructor.isViewQuery',
  'ContentChildren.constructor.selector',
  'ContentChildren.constructor.toString',
  'ContentChildren.constructor.token',
  'ContentChildren.constructor.varBindings',
  'ContentChildren.isVarBindingQuery',
  'ContentChildren.isViewQuery',
  'ContentChildren.selector',
  'ContentChildren.toString',
  'ContentChildren.token',
  'ContentChildren.varBindings',
  'ContentChildrenMetadata',
  'ContentChildrenMetadata.constructor',
  'ContentChildrenMetadata.isVarBindingQuery',
  'ContentChildrenMetadata.isViewQuery',
  'ContentChildrenMetadata.selector',
  'ContentChildrenMetadata.toString',
  'ContentChildrenMetadata.token',
  'ContentChildrenMetadata.varBindings',

  'Control',
  'Control.constructor',
  'Control.dirty',
  'Control.errors',
  'Control.find',
  'Control.getError',
  'Control.hasError',
  'Control.markAsDirty',
  'Control.markAsTouched',
  'Control.pristine',
  'Control.registerOnChange',
  'Control.setParent',
  'Control.status',
  'Control.touched',
  'Control.untouched',
  'Control.updateValidity',
  'Control.updateValue',
  'Control.updateValueAndValidity',
  'Control.valid',
  'Control.value',
  'Control.valueChanges',

  'ControlArray',
  'ControlArray.at',
  'ControlArray.constructor',
  'ControlArray.dirty',
  'ControlArray.errors',
  'ControlArray.find',
  'ControlArray.getError',
  'ControlArray.hasError',
  'ControlArray.insert',
  'ControlArray.length',
  'ControlArray.markAsDirty',
  'ControlArray.markAsTouched',
  'ControlArray.pristine',
  'ControlArray.push',
  'ControlArray.removeAt',
  'ControlArray.setParent',
  'ControlArray.status',
  'ControlArray.touched',
  'ControlArray.untouched',
  'ControlArray.updateValidity',
  'ControlArray.updateValueAndValidity',
  'ControlArray.valid',
  'ControlArray.value',
  'ControlArray.valueChanges',

  'ControlContainer',
  'ControlContainer.constructor',
  'ControlContainer.control',
  'ControlContainer.dirty',
  'ControlContainer.errors',
  'ControlContainer.formDirective',
  'ControlContainer.path',
  'ControlContainer.pristine',
  'ControlContainer.touched',
  'ControlContainer.untouched',
  'ControlContainer.valid',
  'ControlContainer.value',

  'ControlGroup',
  'ControlGroup.addControl',
  'ControlGroup.constructor',
  'ControlGroup.contains',
  'ControlGroup.dirty',
  'ControlGroup.errors',
  'ControlGroup.exclude',
  'ControlGroup.find',
  'ControlGroup.getError',
  'ControlGroup.hasError',
  'ControlGroup.include',
  'ControlGroup.markAsDirty',
  'ControlGroup.markAsTouched',
  'ControlGroup.pristine',
  'ControlGroup.removeControl',
  'ControlGroup.setParent',
  'ControlGroup.status',
  'ControlGroup.touched',
  'ControlGroup.untouched',
  'ControlGroup.updateValidity',
  'ControlGroup.updateValueAndValidity',
  'ControlGroup.valid',
  'ControlGroup.value',
  'ControlGroup.valueChanges',

  'CurrencyPipe',
  'CurrencyPipe.constructor',
  'CurrencyPipe.transform',

  'CyclicDependencyError',
  'CyclicDependencyError.addKey',
  'CyclicDependencyError.captureStackTrace',
  'CyclicDependencyError.constructor',
  'CyclicDependencyError.constructor.captureStackTrace',
  'CyclicDependencyError.constructor.stackTraceLimit',
  'CyclicDependencyError.context',
  'CyclicDependencyError.stackTraceLimit',
  'CyclicDependencyError.toString',

  'DEFAULT_PIPES',

  'DEFAULT_PIPES_TOKEN',

  'DOCUMENT',

  'DatePipe',
  'DatePipe.supports',
  'DatePipe.transform',

  'DebugElement',
  'DebugElement.children',
  'DebugElement.componentInstance',
  'DebugElement.componentViewChildren',
  'DebugElement.elementRef',
  'DebugElement.getDirectiveInstance',
  'DebugElement.getLocal',
  'DebugElement.hasDirective',
  'DebugElement.inject',
  'DebugElement.nativeElement',
  'DebugElement.query',
  'DebugElement.queryAll',
  'DebugElement.triggerEventHandler',

  'DependencyMetadata',
  'DependencyMetadata.token',

  'DecimalPipe',
  'DecimalPipe.constructor',
  'DecimalPipe.transform',

  'DefaultValidators',

  'DefaultValueAccessor',
  'DefaultValueAccessor.ngClassDirty',
  'DefaultValueAccessor.ngClassInvalid',
  'DefaultValueAccessor.ngClassPristine',
  'DefaultValueAccessor.ngClassTouched',
  'DefaultValueAccessor.ngClassUntouched',
  'DefaultValueAccessor.ngClassValid',
  'DefaultValueAccessor.registerOnChange',
  'DefaultValueAccessor.registerOnTouched',
  'DefaultValueAccessor.writeValue',

  'Dependency',
  'Dependency.fromKey',

  'Directive',
  'Directive.constructor',
  'Directive.constructor.constructor',

  'DirectiveMetadata',
  'DirectiveMetadata.constructor',
  'DirectiveResolver',
  'DirectiveResolver.resolve',

  'DynamicComponentLoader',
  'DynamicComponentLoader.loadAsRoot',
  'DynamicComponentLoader.loadIntoLocation',
  'DynamicComponentLoader.loadNextToLocation',

  'ELEMENT_PROBE_BINDINGS',

  'ElementRef',
  'ElementRef.nativeElement',
  'ElementRef.renderView',

  'Event',

  'EventEmitter',
  'EventEmitter.constructor',
  'EventEmitter.next',
  'EventEmitter.observer',
  'EventEmitter.return',
  'EventEmitter.throw',
  'EventEmitter.toRx',

  'EventMetadata',

  'ExpressionChangedAfterItHasBeenCheckedException',
  'ExpressionChangedAfterItHasBeenCheckedException.captureStackTrace',
  'ExpressionChangedAfterItHasBeenCheckedException.constructor',
  'ExpressionChangedAfterItHasBeenCheckedException.constructor.captureStackTrace',
  'ExpressionChangedAfterItHasBeenCheckedException.constructor.stackTraceLimit',
  'ExpressionChangedAfterItHasBeenCheckedException.stackTraceLimit',
  'ExpressionChangedAfterItHasBeenCheckedException.toString',

  'FORM_BINDINGS',

  'FORM_DIRECTIVES',

  'FormBuilder',
  'FormBuilder.array',
  'FormBuilder.control',
  'FormBuilder.group',

  'Host',
  'Host.toString',

  'HostBinding',

  'HostBindingMetadata',

  'HostListener',
  'HostListenerMetadata',

  'HostMetadata',
  'HostMetadata.toString',

  'Inject',
  'Inject.toString',

  'InjectMetadata',
  'InjectMetadata.toString',

  'Injectable',

  'InjectableMetadata',

  'Injector',
  'Injector.createChildFromResolved',
  'Injector.debugContext',
  'Injector.displayName',
  'Injector.fromResolvedBindings',
  'Injector.get',
  'Injector.getAt',
  'Injector.getOptional',
  'Injector.instantiateResolved',
  'Injector.internalStrategy',
  'Injector.parent',
  'Injector.resolve',
  'Injector.resolveAndCreate',
  'Injector.resolveAndCreateChild',
  'Injector.resolveAndInstantiate',
  'Injector.toString',

  'InstantiationError',
  'InstantiationError.addKey',
  'InstantiationError.captureStackTrace',
  'InstantiationError.causeKey',
  'InstantiationError.constructor',
  'InstantiationError.constructor.captureStackTrace',
  'InstantiationError.constructor.stackTraceLimit',
  'InstantiationError.context',
  'InstantiationError.message',
  'InstantiationError.originalException',
  'InstantiationError.originalStack',
  'InstantiationError.stackTraceLimit',
  'InstantiationError.toString',
  'InstantiationError.wrapperMessage',
  'InstantiationError.wrapperStack',

  'InvalidBindingError',
  'InvalidBindingError.captureStackTrace',
  'InvalidBindingError.constructor',
  'InvalidBindingError.constructor.captureStackTrace',
  'InvalidBindingError.constructor.stackTraceLimit',
  'InvalidBindingError.stackTraceLimit',
  'InvalidBindingError.toString',

  'IterableDiffers',
  'IterableDiffers.create',
  'IterableDiffers.extend',
  'IterableDiffers.find',

  'JsonPipe',
  'JsonPipe.transform',

  'Key',
  'Key.displayName',
  'Key.get',
  'Key.numberOfKeys',

  'KeyRegistry',
  'KeyRegistry.get',
  'KeyRegistry.numberOfKeys',

  'KeyValueDiffers',
  'KeyValueDiffers.create',
  'KeyValueDiffers.extend',
  'KeyValueDiffers.find',

  'LifeCycle',  // TODO: replace with ApplicationRef
  'LifeCycle.registerWith',
  'LifeCycle.tick',

  'SlicePipe',
  'SlicePipe.supports',
  'SlicePipe.transform',

  'Locals',
  'Locals.clearValues',
  'Locals.contains',
  'Locals.get',
  'Locals.set',

  'LowerCasePipe',
  'LowerCasePipe.transform',

  'MAX_IN_MEMORY_ELEMENTS_PER_TEMPLATE',

  'NG_VALIDATORS',

  'NgClass',
  'NgClass.doCheck',
  'NgClass.initialClasses',
  'NgClass.onDestroy',
  'NgClass.rawClass',

  'NgControl',
  'NgControl.constructor',
  'NgControl.control',
  'NgControl.dirty',
  'NgControl.errors',
  'NgControl.path',
  'NgControl.pristine',
  'NgControl.touched',
  'NgControl.untouched',
  'NgControl.valid',
  'NgControl.validator',
  'NgControl.value',
  'NgControl.viewToModelUpdate',

  'NgControlGroup',
  'NgControlGroup.constructor',
  'NgControlGroup.control',
  'NgControlGroup.dirty',
  'NgControlGroup.errors',
  'NgControlGroup.formDirective',
  'NgControlGroup.onDestroy',
  'NgControlGroup.onInit',
  'NgControlGroup.path',
  'NgControlGroup.pristine',
  'NgControlGroup.touched',
  'NgControlGroup.untouched',
  'NgControlGroup.valid',
  'NgControlGroup.value',

  'NgControlName',
  'NgControlName.constructor',
  'NgControlName.control',
  'NgControlName.dirty',
  'NgControlName.errors',
  'NgControlName.formDirective',
  'NgControlName.onChanges',
  'NgControlName.onDestroy',
  'NgControlName.path',
  'NgControlName.pristine',
  'NgControlName.touched',
  'NgControlName.untouched',
  'NgControlName.valid',
  'NgControlName.validator',
  'NgControlName.value',
  'NgControlName.viewToModelUpdate',

  'NgFor',
  'NgFor.doCheck',
  'NgFor.ngForOf',

  'NgForm',
  'NgForm.addControl',
  'NgForm.addControlGroup',
  'NgForm.constructor',
  'NgForm.control',
  'NgForm.controls',
  'NgForm.dirty',
  'NgForm.errors',
  'NgForm.formDirective',
  'NgForm.getControl',
  'NgForm.getControlGroup',
  'NgForm.onSubmit',
  'NgForm.path',
  'NgForm.pristine',
  'NgForm.removeControl',
  'NgForm.removeControlGroup',
  'NgForm.touched',
  'NgForm.untouched',
  'NgForm.updateModel',
  'NgForm.valid',
  'NgForm.value',

  'NgFormControl',
  'NgFormControl.constructor',
  'NgFormControl.control',
  'NgFormControl.dirty',
  'NgFormControl.errors',
  'NgFormControl.onChanges',
  'NgFormControl.path',
  'NgFormControl.pristine',
  'NgFormControl.touched',
  'NgFormControl.untouched',
  'NgFormControl.valid',
  'NgFormControl.validator',
  'NgFormControl.value',
  'NgFormControl.viewToModelUpdate',

  'NgFormModel',
  'NgFormModel.addControl',
  'NgFormModel.addControlGroup',
  'NgFormModel.constructor',
  'NgFormModel.control',
  'NgFormModel.dirty',
  'NgFormModel.errors',
  'NgFormModel.formDirective',
  'NgFormModel.getControl',
  'NgFormModel.getControlGroup',
  'NgFormModel.onChanges',
  'NgFormModel.onSubmit',
  'NgFormModel.path',
  'NgFormModel.pristine',
  'NgFormModel.removeControl',
  'NgFormModel.removeControlGroup',
  'NgFormModel.touched',
  'NgFormModel.untouched',
  'NgFormModel.updateModel',
  'NgFormModel.valid',
  'NgFormModel.value',

  'NgIf',
  'NgIf.ngIf',

  'NgModel',
  'NgModel.constructor',
  'NgModel.control',
  'NgModel.dirty',
  'NgModel.errors',
  'NgModel.onChanges',
  'NgModel.path',
  'NgModel.pristine',
  'NgModel.touched',
  'NgModel.untouched',
  'NgModel.valid',
  'NgModel.validator',
  'NgModel.value',
  'NgModel.viewToModelUpdate',

  'NgNonBindable',

  'NgSelectOption',

  'NgStyle',
  'NgStyle.doCheck',
  'NgStyle.rawStyle',

  'NgSwitch',
  'NgSwitch.ngSwitch',

  'NgSwitchDefault',

  'NgSwitchWhen',
  'NgSwitchWhen.ngSwitchWhen',

  'NgZone',
  'NgZone.overrideOnErrorHandler',
  'NgZone.overrideOnEventDone',
  'NgZone.overrideOnTurnDone',
  'NgZone.overrideOnTurnStart',
  'NgZone.run',
  'NgZone.runOutsideAngular',

  'NoAnnotationError',
  'NoAnnotationError.captureStackTrace',
  'NoAnnotationError.constructor',
  'NoAnnotationError.constructor.captureStackTrace',
  'NoAnnotationError.constructor.stackTraceLimit',
  'NoAnnotationError.stackTraceLimit',
  'NoAnnotationError.toString',

  'NoBindingError',
  'NoBindingError.addKey',
  'NoBindingError.captureStackTrace',
  'NoBindingError.constructor',
  'NoBindingError.constructor.captureStackTrace',
  'NoBindingError.constructor.stackTraceLimit',
  'NoBindingError.context',
  'NoBindingError.stackTraceLimit',
  'NoBindingError.toString',

  'NumberPipe',

  'Observable',
  'Observable.observer',

  'OpaqueToken',
  'OpaqueToken.toString',

  'Optional',
  'Optional.toString',

  'OptionalMetadata',
  'OptionalMetadata.toString',

  'OutOfBoundsError',
  'OutOfBoundsError.captureStackTrace',
  'OutOfBoundsError.constructor',
  'OutOfBoundsError.constructor.captureStackTrace',
  'OutOfBoundsError.constructor.stackTraceLimit',
  'OutOfBoundsError.stackTraceLimit',
  'OutOfBoundsError.toString',

  'PercentPipe',
  'PercentPipe.constructor',
  'PercentPipe.transform',

  'Pipe',
  'Pipe.constructor',
  'Pipe.constructor.constructor',
  'Pipe.constructor.pure',
  'Pipe.pure',

  'PipeMetadata',
  'PipeMetadata.constructor',
  'PipeMetadata.pure',

  'PlatformRef',
  'PlatformRef.application',
  'PlatformRef.asyncApplication',
  'PlatformRef.dispose',
  'PlatformRef.injector',

  'Property',

  'PropertyMetadata',

  'ProtoViewRef',

  'Query',
  'Query.constructor',
  'Query.constructor.constructor',
  'Query.constructor.isVarBindingQuery',
  'Query.constructor.isViewQuery',
  'Query.constructor.selector',
  'Query.constructor.toString',
  'Query.constructor.token',
  'Query.constructor.varBindings',
  'Query.isVarBindingQuery',
  'Query.isViewQuery',
  'Query.selector',
  'Query.toString',
  'Query.token',
  'Query.varBindings',

  'QueryList',
  'QueryList.add',
  'QueryList.fireCallbacks',
  'QueryList.first',
  'QueryList.last',
  'QueryList.length',
  'QueryList.map',
  'QueryList.onChange',
  'QueryList.removeAllCallbacks',
  'QueryList.removeCallback',
  'QueryList.reset',
  'QueryList.toString',

  'QueryMetadata',
  'QueryMetadata.constructor',
  'QueryMetadata.isVarBindingQuery',
  'QueryMetadata.isViewQuery',
  'QueryMetadata.selector',
  'QueryMetadata.toString',
  'QueryMetadata.token',
  'QueryMetadata.varBindings',

  'RenderDirectiveMetadata',
  'RenderDirectiveMetadata.COMPONENT_TYPE',
  'RenderDirectiveMetadata.DIRECTIVE_TYPE',
  'RenderDirectiveMetadata.create',

  'RenderFragmentRef',

  'RenderProtoViewRef',

  'RenderViewRef',

  'RenderViewWithFragments',

  'Renderer',
  'Renderer.attachFragmentAfterElement',
  'Renderer.attachFragmentAfterFragment',
  'Renderer.createRootHostView',
  'Renderer.createView',
  'Renderer.dehydrateView',
  'Renderer.destroyView',
  'Renderer.detachFragment',
  'Renderer.getNativeElementSync',
  'Renderer.hydrateView',
  'Renderer.invokeElementMethod',
  'Renderer.setElementAttribute',
  'Renderer.setElementClass',
  'Renderer.setElementProperty',
  'Renderer.setElementStyle',
  'Renderer.setEventDispatcher',
  'Renderer.setText',

  'ResolvedBinding',
  'ResolvedBinding.resolvedFactory',
  'ResolvedFactory',

  'Scope',
  'Scope.all',
  'Scope.light',
  'Scope.view',

  'SelectControlValueAccessor',
  'SelectControlValueAccessor.ngClassDirty',
  'SelectControlValueAccessor.ngClassInvalid',
  'SelectControlValueAccessor.ngClassPristine',
  'SelectControlValueAccessor.ngClassTouched',
  'SelectControlValueAccessor.ngClassUntouched',
  'SelectControlValueAccessor.ngClassValid',
  'SelectControlValueAccessor.registerOnChange',
  'SelectControlValueAccessor.registerOnTouched',
  'SelectControlValueAccessor.writeValue',

  'Self',
  'Self.toString',

  'SelfMetadata',
  'SelfMetadata.toString',

  'SkipSelf',
  'SkipSelf.toString',

  'SkipSelfMetadata',
  'SkipSelfMetadata.toString',

  'SwitchView',
  'SwitchView.create',
  'SwitchView.destroy',

  'TemplateRef',
  'TemplateRef.hasLocal',
  'TemplateRef.protoViewRef',

  'Type',

  'TypeLiteral',
  'TypeLiteral.type',

  'UpperCasePipe',
  'UpperCasePipe.transform',

  'UrlResolver',
  'UrlResolver.resolve',

  'Validators',
  'Validators.array',
  'Validators.compose',
  'Validators.group',
  'Validators.nullValidator',
  'Validators.required',

  'View',

  'ViewChild',
  'ViewChild.constructor',
  'ViewChild.constructor.constructor',
  'ViewChild.constructor.isVarBindingQuery',
  'ViewChild.constructor.isViewQuery',
  'ViewChild.constructor.selector',
  'ViewChild.constructor.toString',
  'ViewChild.constructor.token',
  'ViewChild.constructor.varBindings',
  'ViewChild.isVarBindingQuery',
  'ViewChild.isViewQuery',
  'ViewChild.selector',
  'ViewChild.toString',
  'ViewChild.token',
  'ViewChild.varBindings',
  'ViewChildMetadata',
  'ViewChildMetadata.constructor',
  'ViewChildMetadata.isVarBindingQuery',
  'ViewChildMetadata.isViewQuery',
  'ViewChildMetadata.selector',
  'ViewChildMetadata.toString',
  'ViewChildMetadata.token',
  'ViewChildMetadata.varBindings',

  'ViewChildren',
  'ViewChildren.constructor',
  'ViewChildren.constructor.constructor',
  'ViewChildren.constructor.isVarBindingQuery',
  'ViewChildren.constructor.isViewQuery',
  'ViewChildren.constructor.selector',
  'ViewChildren.constructor.toString',
  'ViewChildren.constructor.token',
  'ViewChildren.constructor.varBindings',
  'ViewChildren.isVarBindingQuery',
  'ViewChildren.isViewQuery',
  'ViewChildren.selector',
  'ViewChildren.toString',
  'ViewChildren.token',
  'ViewChildren.varBindings',
  'ViewChildrenMetadata',
  'ViewChildrenMetadata.constructor',
  'ViewChildrenMetadata.isVarBindingQuery',
  'ViewChildrenMetadata.isViewQuery',
  'ViewChildrenMetadata.selector',
  'ViewChildrenMetadata.toString',
  'ViewChildrenMetadata.token',
  'ViewChildrenMetadata.varBindings',

  'ViewContainerRef',
  'ViewContainerRef.clear',
  'ViewContainerRef.createEmbeddedView',
  'ViewContainerRef.createHostView',
  'ViewContainerRef.detach',
  'ViewContainerRef.get',
  'ViewContainerRef.indexOf',
  'ViewContainerRef.insert',
  'ViewContainerRef.length',
  'ViewContainerRef.remove',

  'ViewDefinition',

  'ViewEncapsulation',

  'ViewMetadata',

  'ViewQuery',
  'ViewQuery.constructor',
  'ViewQuery.constructor.constructor',
  'ViewQuery.constructor.isVarBindingQuery',
  'ViewQuery.constructor.isViewQuery',
  'ViewQuery.constructor.selector',
  'ViewQuery.constructor.toString',
  'ViewQuery.constructor.token',
  'ViewQuery.constructor.varBindings',
  'ViewQuery.isVarBindingQuery',
  'ViewQuery.isViewQuery',
  'ViewQuery.selector',
  'ViewQuery.toString',
  'ViewQuery.token',
  'ViewQuery.varBindings',

  'ViewQueryMetadata',
  'ViewQueryMetadata.constructor',
  'ViewQueryMetadata.isVarBindingQuery',
  'ViewQueryMetadata.isViewQuery',
  'ViewQueryMetadata.selector',
  'ViewQueryMetadata.toString',
  'ViewQueryMetadata.token',
  'ViewQueryMetadata.varBindings',

  'ViewRef',
  'ViewRef.changeDetectorRef',
  'ViewRef.render',
  'ViewRef.renderFragment',
  'ViewRef.setLocal',

  'WrappedException',
  'WrappedException.captureStackTrace',
  'WrappedException.constructor',
  'WrappedException.constructor.captureStackTrace',
  'WrappedException.constructor.stackTraceLimit',
  'WrappedException.context',
  'WrappedException.message',
  'WrappedException.originalException',
  'WrappedException.originalStack',
  'WrappedException.stackTraceLimit',
  'WrappedException.toString',
  'WrappedException.wrapperMessage',
  'WrappedException.wrapperStack',

  'WrappedValue',
  'WrappedValue.wrap',

  'asNativeElements',
  'bind',
  'bootstrap',
  'forwardRef',
  'inspectElement',
  'inspectNativeElement',
  'platform',
  'resolveForwardRef',
  'wtfCreateScope',
  'wtfEndTimeRange',
  'wtfLeave',
  'wtfStartTimeRange'
].sort();

export function main() {
  describe('public API', () => {
    it('should fail if public API has changed', () => {
      var ngApi = extractApi(ng);
      // console.log(ngApi);
      expect(diffApi(NG_API, ngApi)).toBe(0);
    });
  });
}

function extractApi(src: any, dst: string[] = [], path: string[] = [], alreadySeen: any[] = []):
    string[] {
  if (alreadySeen.indexOf(src) != -1) {
    return;
  }
  alreadySeen.push(src);
  for (var name in src) {
    if (name.charAt(0) == '_') continue;
    path.push(name);
    var value = null;
    try {
      value = src[name];
    } catch (e) {
      value = 'property';
    }
    switch (typeof value) {
      case 'function':
        var type: any = {};
        dst.push(path.join('.'));
        extractApi(value, dst, path, alreadySeen);            // static methods
        extractApi(value.prototype, dst, path, alreadySeen);  // instance methods;
        break;
      default:
        dst.push(path.join('.'));
    }
    path.pop();
  }
  alreadySeen.pop();
  dst.sort();
  return dst;
}

function diffApi(expected: string[], actual: string[]): number {
  var diffCount = 0;
  for (var i = 0, j = 0, length = expected.length + actual.length; i + j < length;) {
    var expectedName = expected[i] || '~';
    var actualName = actual[j] || '~';
    if (expectedName == actualName) {
      i++;
      j++;
    } else if (expectedName > actualName) {
      console.log('Extra symbol: ' + actualName);
      j++;
      diffCount++;
    } else {
      console.log('Missing symbol ' + expectedName);
      i++;
      diffCount++;
    }
  }
  return diffCount;
}
