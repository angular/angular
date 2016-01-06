import {
  describe,
  ddescribe,
  it,
  iit,
  xit,
  xdescribe,
  expect,
  beforeEach,
  beforeEachProviders,
  inject,
  AsyncTestCompleter,
  el,
  containsRegexp,
  ComponentFixture,
  TestComponentBuilder,
  fakeAsync,
  tick
} from 'angular2/testing_internal';
import {isBlank, isPresent, stringify, Type, CONST_EXPR} from 'angular2/src/facade/lang';
import {
  ViewContainerRef,
  TemplateRef,
  ElementRef,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  Directive,
  Component,
  DebugElement,
  forwardRef,
  Input,
  PipeTransform,
  Attribute,
  ViewMetadata,
  provide,
  Injector,
  Provider,
  Optional,
  Inject,
  Injectable,
  Self,
  SkipSelf,
  InjectMetadata,
  Pipe,
  Host,
  HostMetadata,
  SkipSelfMetadata
} from 'angular2/core';
import {NgIf} from 'angular2/common';
import {DOM} from 'angular2/src/platform/dom/dom_adapter';

const ALL_DIRECTIVES = CONST_EXPR([
  forwardRef(() => SimpleDirective),
  forwardRef(() => CycleDirective),
  forwardRef(() => SimpleComponent),
  forwardRef(() => SomeOtherDirective),
  forwardRef(() => NeedsDirectiveFromSelf),
  forwardRef(() => NeedsServiceComponent),
  forwardRef(() => OptionallyNeedsDirective),
  forwardRef(() => NeedsComponentFromHost),
  forwardRef(() => NeedsDirectiveFromHost),
  forwardRef(() => NeedsDirective),
  forwardRef(() => NeedsService),
  forwardRef(() => NeedsAppService),
  forwardRef(() => NeedsAttribute),
  forwardRef(() => NeedsAttributeNoType),
  forwardRef(() => NeedsElementRef),
  forwardRef(() => NeedsViewContainerRef),
  forwardRef(() => NeedsTemplateRef),
  forwardRef(() => OptionallyNeedsTemplateRef),
  forwardRef(() => DirectiveNeedsChangeDetectorRef),
  forwardRef(() => PushComponentNeedsChangeDetectorRef),
  forwardRef(() => NeedsServiceFromHost),
  forwardRef(() => NeedsAttribute),
  forwardRef(() => NeedsAttributeNoType),
  forwardRef(() => NeedsElementRef),
  forwardRef(() => NeedsViewContainerRef),
  forwardRef(() => NeedsTemplateRef),
  forwardRef(() => OptionallyNeedsTemplateRef),
  forwardRef(() => DirectiveNeedsChangeDetectorRef),
  forwardRef(() => PushComponentNeedsChangeDetectorRef),
  forwardRef(() => NeedsHostAppService),
  NgIf
]);

const ALL_PIPES = CONST_EXPR([
  forwardRef(() => PipeNeedsChangeDetectorRef),
  forwardRef(() => PipeNeedsService),
  forwardRef(() => PurePipe),
  forwardRef(() => ImpurePipe),
]);

@Directive({selector: '[simpleDirective]'})
class SimpleDirective {
  @Input('simpleDirective') value: any = null;
}

@Component({selector: '[simpleComponent]', template: '', directives: ALL_DIRECTIVES})
class SimpleComponent {
}

class SimpleService {}

@Directive({selector: '[someOtherDirective]'})
class SomeOtherDirective {
}

@Directive({selector: '[cycleDirective]'})
class CycleDirective {
  constructor(self: CycleDirective) {}
}

@Directive({selector: '[needsDirectiveFromSelf]'})
class NeedsDirectiveFromSelf {
  dependency: SimpleDirective;
  constructor(@Self() dependency: SimpleDirective) { this.dependency = dependency; }
}

@Directive({selector: '[optionallyNeedsDirective]'})
class OptionallyNeedsDirective {
  dependency: SimpleDirective;
  constructor(@Self() @Optional() dependency: SimpleDirective) { this.dependency = dependency; }
}

@Directive({selector: '[needsComponentFromHost]'})
class NeedsComponentFromHost {
  dependency: SimpleComponent;
  constructor(@Host() dependency: SimpleComponent) { this.dependency = dependency; }
}

@Directive({selector: '[needsDirectiveFromHost]'})
class NeedsDirectiveFromHost {
  dependency: SimpleDirective;
  constructor(@Host() dependency: SimpleDirective) { this.dependency = dependency; }
}

@Directive({selector: '[needsDirective]'})
class NeedsDirective {
  dependency: SimpleDirective;
  constructor(dependency: SimpleDirective) { this.dependency = dependency; }
}

@Directive({selector: '[needsService]'})
class NeedsService {
  service: any;
  constructor(@Inject("service") service) { this.service = service; }
}

@Directive({selector: '[needsAppService]'})
class NeedsAppService {
  service: any;
  constructor(@Inject("appService") service) { this.service = service; }
}

@Component({selector: '[needsHostAppService]', template: '', directives: ALL_DIRECTIVES})
class NeedsHostAppService {
  service: any;
  constructor(@Host() @Inject("appService") service) { this.service = service; }
}

@Component({selector: '[needsServiceComponent]', template: ''})
class NeedsServiceComponent {
  service: any;
  constructor(@Inject("service") service) { this.service = service; }
}

@Directive({selector: '[needsServiceFromHost]'})
class NeedsServiceFromHost {
  service: any;
  constructor(@Host() @Inject("service") service) { this.service = service; }
}

@Directive({selector: '[needsAttribute]'})
class NeedsAttribute {
  typeAttribute;
  titleAttribute;
  fooAttribute;
  constructor(@Attribute('type') typeAttribute: String, @Attribute('title') titleAttribute: String,
              @Attribute('foo') fooAttribute: String) {
    this.typeAttribute = typeAttribute;
    this.titleAttribute = titleAttribute;
    this.fooAttribute = fooAttribute;
  }
}

@Directive({selector: '[needsAttributeNoType]'})
class NeedsAttributeNoType {
  fooAttribute;
  constructor(@Attribute('foo') fooAttribute) { this.fooAttribute = fooAttribute; }
}

@Directive({selector: '[needsElementRef]'})
class NeedsElementRef {
  elementRef;
  constructor(ref: ElementRef) { this.elementRef = ref; }
}

@Directive({selector: '[needsViewContainerRef]'})
class NeedsViewContainerRef {
  viewContainer;
  constructor(vc: ViewContainerRef) { this.viewContainer = vc; }
}

@Directive({selector: '[needsTemplateRef]'})
class NeedsTemplateRef {
  templateRef;
  constructor(ref: TemplateRef) { this.templateRef = ref; }
}

@Directive({selector: '[optionallyNeedsTemplateRef]'})
class OptionallyNeedsTemplateRef {
  templateRef;
  constructor(@Optional() ref: TemplateRef) { this.templateRef = ref; }
}

@Directive({selector: '[directiveNeedsChangeDetectorRef]'})
class DirectiveNeedsChangeDetectorRef {
  constructor(public changeDetectorRef: ChangeDetectorRef) {}
}

@Component({
  selector: '[componentNeedsChangeDetectorRef]',
  template: '{{counter}}',
  directives: ALL_DIRECTIVES,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class PushComponentNeedsChangeDetectorRef {
  counter: number = 0;
  constructor(public changeDetectorRef: ChangeDetectorRef) {}
}

@Pipe({name: 'purePipe', pure: true})
class PurePipe {
  constructor() {}
  transform(value: any, args: any[] = null): any { return this; }
}

@Pipe({name: 'impurePipe', pure: false})
class ImpurePipe {
  constructor() {}
  transform(value: any, args: any[] = null): any { return this; }
}

@Pipe({name: 'pipeNeedsChangeDetectorRef'})
class PipeNeedsChangeDetectorRef {
  constructor(public changeDetectorRef: ChangeDetectorRef) {}
  transform(value: any, args: any[] = null): any { return this; }
}

@Pipe({name: 'pipeNeedsService'})
export class PipeNeedsService implements PipeTransform {
  service: any;
  constructor(@Inject("service") service) { this.service = service; }
  transform(value: any, args: any[] = null): any { return this; }
}


@Component({selector: 'root'})
class TestComp {
}

export function main() {
  var tcb: TestComponentBuilder;

  function createCompFixture(template: string, tcb: TestComponentBuilder,
                             comp: Type = null): ComponentFixture {
    if (isBlank(comp)) {
      comp = TestComp;
    }
    return tcb.overrideView(comp,
                            new ViewMetadata(
                                {template: template, directives: ALL_DIRECTIVES, pipes: ALL_PIPES}))
        .createFakeAsync(comp);
  }

  function createComp(template: string, tcb: TestComponentBuilder,
                      comp: Type = null): DebugElement {
    var fixture = createCompFixture(template, tcb, comp);
    fixture.detectChanges();
    return fixture.debugElement;
  }

  describe("View Injector", () => {
    // On CJS fakeAsync is not supported...
    if (!DOM.supportsDOMEvents()) return;

    beforeEachProviders(() => [provide("appService", {useValue: 'appService'})]);

    beforeEach(inject([TestComponentBuilder], (_tcb) => { tcb = _tcb; }));

    describe("injection", () => {
      it("should instantiate directives that have no dependencies", fakeAsync(() => {
           var el = createComp('<div simpleDirective>', tcb);
           expect(el.children[0].inject(SimpleDirective)).toBeAnInstanceOf(SimpleDirective);
         }));

      it("should instantiate directives that depend on another directive", fakeAsync(() => {
           var el = createComp('<div simpleDirective needsDirective>', tcb);

           var d = el.children[0].inject(NeedsDirective);

           expect(d).toBeAnInstanceOf(NeedsDirective);
           expect(d.dependency).toBeAnInstanceOf(SimpleDirective);
         }));

      it("should instantiate providers that have dependencies with SkipSelf", fakeAsync(() => {
           var el = createComp('<div simpleDirective><span someOtherDirective></span></div>',
                               tcb.overrideProviders(
                                      SimpleDirective,
                                      [provide('injectable1', {useValue: 'injectable1'})])
                                   .overrideProviders(SomeOtherDirective, [
                                     provide('injectable1', {useValue: 'new-injectable1'}),
                                     provide('injectable2',
                                             {
                                               useFactory: (val) => `${val}-injectable2`,
                                               deps: [
                                                 [
                                                   new InjectMetadata('injectable1'),
                                                   new SkipSelfMetadata()
                                                 ]
                                               ]
                                             })
                                   ]));
           expect(el.children[0].children[0].inject('injectable2'))
               .toEqual('injectable1-injectable2');
         }));

      it("should instantiate providers that have dependencies", fakeAsync(() => {
           var providers = [
             provide('injectable1', {useValue: 'injectable1'}),
             provide('injectable2',
                     {useFactory: (val) => `${val}-injectable2`, deps: ['injectable1']})
           ];
           var el = createComp('<div simpleDirective></div>',
                               tcb.overrideProviders(SimpleDirective, providers));
           expect(el.children[0].inject('injectable2')).toEqual('injectable1-injectable2');
         }));

      it("should instantiate viewProviders that have dependencies", fakeAsync(() => {
           var viewProviders = [
             provide('injectable1', {useValue: 'injectable1'}),
             provide('injectable2',
                     {useFactory: (val) => `${val}-injectable2`, deps: ['injectable1']})
           ];

           var el = createComp('<div simpleComponent></div>',
                               tcb.overrideViewProviders(SimpleComponent, viewProviders));
           expect(el.children[0].inject('injectable2')).toEqual('injectable1-injectable2');
         }));

      it("should instantiate components that depend on viewProviders providers", fakeAsync(() => {
           var el =
               createComp('<div needsServiceComponent></div>',
                          tcb.overrideViewProviders(NeedsServiceComponent,
                                                    [provide('service', {useValue: 'service'})]));
           expect(el.children[0].inject(NeedsServiceComponent).service).toEqual('service');
         }));

      it("should instantiate multi providers", fakeAsync(() => {
           var providers = [
             provide('injectable1', {useValue: 'injectable11', multi: true}),
             provide('injectable1', {useValue: 'injectable12', multi: true})
           ];
           var el = createComp('<div simpleDirective></div>',
                               tcb.overrideProviders(SimpleDirective, providers));
           expect(el.children[0].inject('injectable1')).toEqual(['injectable11', 'injectable12']);
         }));

      it("should instantiate providers lazily", fakeAsync(() => {
           var created = false;
           var el = createComp(
               '<div simpleDirective></div>',
               tcb.overrideProviders(SimpleDirective,
                                     [provide('service', {useFactory: () => created = true})]));

           expect(created).toBe(false);

           el.children[0].inject('service');

           expect(created).toBe(true);
         }));

      it("should instantiate view providers lazily", fakeAsync(() => {
           var created = false;
           var el = createComp(
               '<div simpleComponent></div>',
               tcb.overrideViewProviders(SimpleComponent,
                                         [provide('service', {useFactory: () => created = true})]));

           expect(created).toBe(false);

           el.children[0].inject('service');

           expect(created).toBe(true);
         }));

      it("should not instantiate other directives that depend on viewProviders providers",
         fakeAsync(() => {
           expect(() =>
                      createComp('<div simpleComponent needsService></div>',
                                 tcb.overrideViewProviders(
                                     SimpleComponent, [provide("service", {useValue: "service"})])))
               .toThrowError(containsRegexp(`No provider for service!`));
         }));

      it("should instantiate directives that depend on providers of other directives",
         fakeAsync(() => {
           var el =
               createComp('<div simpleDirective><div needsService></div></div>',
                          tcb.overrideProviders(SimpleDirective,
                                                [provide('service', {useValue: 'parentService'})]));
           expect(el.children[0].children[0].inject(NeedsService).service).toEqual('parentService');
         }));

      it("should instantiate directives that depend on providers in a parent view",
         fakeAsync(() => {
           var el = createComp(
               '<div simpleDirective><template [ngIf]="true"><div *ngIf="true" needsService></div></template></div>',
               tcb.overrideProviders(SimpleDirective,
                                     [provide('service', {useValue: 'parentService'})]));
           expect(el.children[0].children[0].inject(NeedsService).service).toEqual('parentService');
         }));

      it("should instantiate directives that depend on providers of a component", fakeAsync(() => {
           var el =
               createComp('<div simpleComponent></div>',
                          tcb.overrideTemplate(SimpleComponent, '<div needsService></div>')
                              .overrideProviders(SimpleComponent,
                                                 [provide('service', {useValue: 'hostService'})]));
           expect(el.children[0].children[0].inject(NeedsService).service).toEqual('hostService');
         }));

      it("should instantiate directives that depend on view providers of a component",
         fakeAsync(() => {
           var el = createComp(
               '<div simpleComponent></div>',
               tcb.overrideTemplate(SimpleComponent, '<div needsService></div>')
                   .overrideViewProviders(SimpleComponent,
                                          [provide('service', {useValue: 'hostService'})]));
           expect(el.children[0].children[0].inject(NeedsService).service).toEqual('hostService');
         }));

      it("should instantiate directives in a root embedded view that depend on view providers of a component",
         fakeAsync(() => {
           var el = createComp(
               '<div simpleComponent></div>',
               tcb.overrideTemplate(SimpleComponent, '<div *ngIf="true" needsService></div>')
                   .overrideViewProviders(SimpleComponent,
                                          [provide('service', {useValue: 'hostService'})]));
           expect(el.children[0].children[0].inject(NeedsService).service).toEqual('hostService');
         }));

      it("should instantiate directives that depend on instances in the app injector",
         fakeAsync(() => {
           var el = createComp('<div needsAppService></div>', tcb);
           expect(el.children[0].inject(NeedsAppService).service).toEqual('appService');
         }));

      it("should not instantiate a directive with cyclic dependencies", fakeAsync(() => {
           expect(() => createComp('<div cycleDirective></div>', tcb))
               .toThrowError(
                   'Template parse errors:\nCannot instantiate cyclic dependency! CycleDirective ("[ERROR ->]<div cycleDirective></div>"): TestComp@0:0');
         }));

      it("should not instantiate a directive in a view that has a host dependency on providers" +
             " of the component",
         fakeAsync(() => {
           expect(() => createComp(
                      '<div simpleComponent></div>',
                      tcb.overrideProviders(SimpleComponent,
                                            [provide('service', {useValue: 'hostService'})])
                          .overrideTemplate(SimpleComponent, '<div needsServiceFromHost><div>')))
               .toThrowError(
                   `Template parse errors:\nNo provider for service ("[ERROR ->]<div needsServiceFromHost><div>"): SimpleComponent@0:0`);
         }));

      it("should not instantiate a directive in a view that has a host dependency on providers" +
             " of a decorator directive",
         fakeAsync(() => {
           expect(() => createComp(
                      '<div simpleComponent someOtherDirective></div>',
                      tcb.overrideProviders(SomeOtherDirective,
                                            [provide('service', {useValue: 'hostService'})])
                          .overrideTemplate(SimpleComponent, '<div needsServiceFromHost><div>')))
               .toThrowError(
                   `Template parse errors:\nNo provider for service ("[ERROR ->]<div needsServiceFromHost><div>"): SimpleComponent@0:0`);
         }));

      it("should not instantiate a directive in a view that has a self dependency on a parent directive",
         fakeAsync(() => {
           expect(() => createComp('<div simpleDirective><div needsDirectiveFromSelf></div></div>',
                                   tcb))
               .toThrowError(
                   `Template parse errors:\nNo provider for SimpleDirective ("<div simpleDirective>[ERROR ->]<div needsDirectiveFromSelf></div></div>"): TestComp@0:21`);
         }));

      it("should instantiate directives that depend on other directives", fakeAsync(() => {
           var el = createComp('<div simpleDirective><div needsDirective></div></div>', tcb);
           var d = el.children[0].children[0].inject(NeedsDirective);

           expect(d).toBeAnInstanceOf(NeedsDirective);
           expect(d.dependency).toBeAnInstanceOf(SimpleDirective);
         }));

      it("should throw when a dependency cannot be resolved", fakeAsync(() => {
           expect(() => createComp('<div needsService></div>', tcb))
               .toThrowError(containsRegexp(`No provider for service!`));
         }));

      it("should inject null when an optional dependency cannot be resolved", fakeAsync(() => {
           var el = createComp('<div optionallyNeedsDirective></div>', tcb);
           var d = el.children[0].inject(OptionallyNeedsDirective);
           expect(d.dependency).toEqual(null);
         }));

      it("should instantiate directives that depends on the host component", fakeAsync(() => {
           var el = createComp(
               '<div simpleComponent></div>',
               tcb.overrideTemplate(SimpleComponent, '<div needsComponentFromHost></div>'));
           var d = el.children[0].children[0].inject(NeedsComponentFromHost);
           expect(d.dependency).toBeAnInstanceOf(SimpleComponent);
         }));

      it("should instantiate host views for components that have a @Host dependency ",
         fakeAsync(() => {
           var el = createComp('', tcb, NeedsHostAppService);
           expect(el.componentInstance.service).toEqual('appService');
         }));

      it("should not instantiate directives that depend on other directives on the host element",
         fakeAsync(() => {
           expect(() => createComp(
                      '<div simpleComponent simpleDirective></div>',
                      tcb.overrideTemplate(SimpleComponent, '<div needsDirectiveFromHost></div>')))
               .toThrowError(
                   `Template parse errors:\nNo provider for SimpleDirective ("[ERROR ->]<div needsDirectiveFromHost></div>"): SimpleComponent@0:0`);
         }));
    });

    describe('static attributes', () => {
      it('should be injectable', fakeAsync(() => {
           var el = createComp('<div needsAttribute type="text" title></div>', tcb);
           var needsAttribute = el.children[0].inject(NeedsAttribute);

           expect(needsAttribute.typeAttribute).toEqual('text');
           expect(needsAttribute.titleAttribute).toEqual('');
           expect(needsAttribute.fooAttribute).toEqual(null);
         }));

      it('should be injectable without type annotation', fakeAsync(() => {
           var el = createComp('<div needsAttributeNoType foo="bar"></div>', tcb);
           var needsAttribute = el.children[0].inject(NeedsAttributeNoType);

           expect(needsAttribute.fooAttribute).toEqual('bar');
         }));
    });

    describe("refs", () => {
      it("should inject ElementRef", fakeAsync(() => {
           var el = createComp('<div needsElementRef></div>', tcb);
           expect(el.children[0].inject(NeedsElementRef).elementRef.nativeElement)
               .toBe(el.children[0].nativeElement);
         }));

      it("should inject ChangeDetectorRef of the component's view into the component via a proxy",
         fakeAsync(() => {
           var cf = createCompFixture('<div componentNeedsChangeDetectorRef></div>', tcb);
           cf.detectChanges();
           var compEl = cf.debugElement.children[0];
           var comp = compEl.inject(PushComponentNeedsChangeDetectorRef);
           comp.counter = 1;
           cf.detectChanges();
           expect(compEl.nativeElement).toHaveText('0');
           comp.changeDetectorRef.markForCheck();
           cf.detectChanges();
           expect(compEl.nativeElement).toHaveText('1');
         }));

      it("should inject ChangeDetectorRef of the containing component into directives",
         fakeAsync(() => {
           var cf = createCompFixture(
               '<div componentNeedsChangeDetectorRef></div>',
               tcb.overrideTemplate(PushComponentNeedsChangeDetectorRef,
                                    '{{counter}}<div directiveNeedsChangeDetectorRef></div>'));
           cf.detectChanges();
           var compEl = cf.debugElement.children[0];
           var comp = compEl.inject(PushComponentNeedsChangeDetectorRef);
           comp.counter = 1;
           cf.detectChanges();
           expect(compEl.nativeElement).toHaveText('0');
           compEl.children[0]
               .inject(DirectiveNeedsChangeDetectorRef)
               .changeDetectorRef.markForCheck();
           cf.detectChanges();
           expect(compEl.nativeElement).toHaveText('1');
         }));

      it('should inject ViewContainerRef', fakeAsync(() => {
           var el = createComp('<div needsViewContainerRef></div>', tcb);
           expect(el.children[0].inject(NeedsViewContainerRef).viewContainer.element.nativeElement)
               .toBe(el.children[0].nativeElement);
         }));

      it("should inject TemplateRef", fakeAsync(() => {
           var el = createComp('<template needsViewContainerRef needsTemplateRef></template>', tcb);
           expect(el.childNodes[0].inject(NeedsTemplateRef).templateRef.elementRef)
               .toBe(el.childNodes[0].inject(NeedsViewContainerRef).viewContainer.element);
         }));

      it("should throw if there is no TemplateRef", fakeAsync(() => {
           expect(() => createComp('<div needsTemplateRef></div>', tcb))
               .toThrowError(containsRegexp(`No provider for TemplateRef!`));
         }));

      it('should inject null if there is no TemplateRef when the dependency is optional',
         fakeAsync(() => {
           var el = createComp('<div optionallyNeedsTemplateRef></div>', tcb);
           var instance = el.children[0].inject(OptionallyNeedsTemplateRef);
           expect(instance.templateRef).toBeNull();
         }));
    });

    describe('pipes', () => {
      it('should instantiate pipes that have dependencies', fakeAsync(() => {
           var el = createComp(
               '<div [simpleDirective]="true | pipeNeedsService"></div>',
               tcb.overrideProviders(TestComp, [provide('service', {useValue: 'pipeService'})]));
           expect(el.children[0].inject(SimpleDirective).value.service).toEqual('pipeService');
         }));

      it('should inject ChangeDetectorRef into pipes', fakeAsync(() => {
           var el = createComp(
               '<div [simpleDirective]="true | pipeNeedsChangeDetectorRef" directiveNeedsChangeDetectorRef></div>',
               tcb);
           var cdRef = el.children[0].inject(DirectiveNeedsChangeDetectorRef).changeDetectorRef;
           expect(el.children[0].inject(SimpleDirective).value.changeDetectorRef).toBe(cdRef);
         }));

      it('should cache pure pipes', fakeAsync(() => {
           var el = createComp(
               '<div [simpleDirective]="true | purePipe"></div><div [simpleDirective]="true | purePipe"></div>',
               tcb);
           var purePipe1 = el.children[0].inject(SimpleDirective).value;
           var purePipe2 = el.children[1].inject(SimpleDirective).value;
           expect(purePipe1).toBeAnInstanceOf(PurePipe);
           expect(purePipe1).toBe(purePipe2);
         }));

      it('should not cache pure pipes', fakeAsync(() => {
           var el = createComp(
               '<div [simpleDirective]="true | impurePipe"></div><div [simpleDirective]="true | impurePipe"></div>',
               tcb);
           var purePipe1 = el.children[0].inject(SimpleDirective).value;
           var purePipe2 = el.children[1].inject(SimpleDirective).value;
           expect(purePipe1).toBeAnInstanceOf(ImpurePipe);
           expect(purePipe2).toBeAnInstanceOf(ImpurePipe);
           expect(purePipe1).not.toBe(purePipe2);
         }));
    });
  });
}
