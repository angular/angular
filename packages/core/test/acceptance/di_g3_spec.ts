/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Component,
  createEnvironmentInjector,
  ElementRef,
  EnvironmentInjector,
  inject,
  Injectable,
  runInInjectionContext,
  TemplateRef,
} from '@angular/core';
import {TestBed} from '@angular/core/testing';

describe('di (g3-only generic token inference)', () => {
  it('should infer generic type parameter when injecting generic classes and abstract classes', () => {
    type IsAny<T> = 0 extends 1 & T ? true : false;

    @Injectable()
    class GenericService<T extends 'a' | 'b'> {
      value!: T;
    }

    @Injectable()
    abstract class AbstractGenericService<T extends 'x' | 'y'> {
      abstract value: T;
    }

    @Injectable()
    abstract class AbstractDateAdapter<D, L = any> {
      abstract getYear(date: D): number;
      abstract clone(date: D): D;
    }

    // Here the protected constructor will prevent inferring the T generic parameter
    class ProtectedConstructorService<T> {
      protected constructor(public value: T) {}
    }

    @Injectable()
    class MissingGenericService<T> {
      value!: T;
    }

    @Injectable()
    class GenericServiceWithCtor<T> {
      constructor(public dep: string) {}
      value!: T;
    }

    @Injectable()
    abstract class AbstractGenericServiceWithCtor<T> {
      constructor(public dep: string) {}
      abstract value: T;
    }

    @Component({
      template: '',
      providers: [
        {provide: GenericService, useValue: {value: 'a'}},
        {provide: AbstractGenericService, useValue: {value: 'x'}},
        {
          provide: AbstractDateAdapter,
          useValue: {getYear: (d: any) => 2026, clone: (d: any) => d},
        },
        {provide: ProtectedConstructorService, useValue: {value: 'p'}},
        {provide: GenericServiceWithCtor, useValue: {dep: 'd', value: 'ctor'}},
        {provide: AbstractGenericServiceWithCtor, useValue: {dep: 'ad', value: 42}},
      ],
    })
    class TestCmp {
      elDefault = inject(ElementRef);
      el = inject(ElementRef<HTMLButtonElement>);
      templateRef = inject(TemplateRef<{foo: number}>, {optional: true});
      genericDefault = inject(GenericService);
      genericSpecialized = inject(GenericService<'a'>);
      genericSpecializedWithOptions = inject(GenericService<'a'>, {self: true});
      genericSpecializedOptional = inject(GenericService<'a'>, {optional: true});
      genericSpecializedNonOptional = inject(GenericService<'a'>, {optional: false});
      missingGenericOptional = inject(MissingGenericService<string>, {optional: true});
      genericWithCtorDefault = inject(GenericServiceWithCtor);
      genericWithCtorSpecialized = inject(GenericServiceWithCtor<string>);
      genericWithCtorOptional = inject(GenericServiceWithCtor<string>, {optional: true});
      abstractDefault = inject(AbstractGenericService);
      abstractSpecialized = inject(AbstractGenericService<'x'>);
      abstractSpecializedWithOptions = inject(AbstractGenericService<'x'>, {self: true});
      abstractSpecializedOptional = inject(AbstractGenericService<'x'>, {optional: true});
      abstractWithCtorSpecialized = inject(AbstractGenericServiceWithCtor<number>);
      abstractWithCtorOptional = inject(AbstractGenericServiceWithCtor<number>, {optional: true});
      abstractDateAdapterDefault = inject(AbstractDateAdapter);
      abstractDateAdapterSpecialized = inject(AbstractDateAdapter<Date>);
      abstractDateAdapterSpecializedOptional = inject(AbstractDateAdapter<Date>, {
        optional: true,
      });
      protectedConstructor = inject(ProtectedConstructorService);
      protectedConstructorExplicit = inject<ProtectedConstructorService<string>>(
        ProtectedConstructorService,
      );
      protectedConstructorGeneric = inject<ProtectedConstructorService<string>>(
        ProtectedConstructorService<string>,
      );
      abstractProtectedOptional = inject(ProtectedConstructorService, {
        optional: true,
        skipSelf: true,
      });
    }

    const fixture = TestBed.createComponent(TestCmp);
    const instance = fixture.componentInstance;

    // Ensure specialized generic parameters on concrete classes and abstract classes
    // preserve their generic types (including classes with required constructor parameters).
    const _elDefaultIsAny: IsAny<typeof instance.elDefault.nativeElement> = true;
    const _elNotAny: IsAny<typeof instance.el.nativeElement> = false;
    const _elType: HTMLButtonElement = instance.el.nativeElement;
    const _templateRefCtxNotAny: IsAny<
      Parameters<NonNullable<typeof instance.templateRef>['createEmbeddedView']>[0]
    > = false;
    const _templateRefCtxType: {foo: number} = {} as Parameters<
      NonNullable<typeof instance.templateRef>['createEmbeddedView']
    >[0];
    const _genericWithCtorDefaultNotAny: IsAny<typeof instance.genericWithCtorDefault.value> =
      false;
    const _genericWithCtorSpecializedNotAny: IsAny<
      typeof instance.genericWithCtorSpecialized.value
    > = false;
    const _genericWithCtorSpecializedType: string = instance.genericWithCtorSpecialized.value;
    const _genericWithCtorOptionalNotAny: IsAny<
      NonNullable<typeof instance.genericWithCtorOptional>['value']
    > = false;
    const _abstractWithCtorSpecializedNotAny: IsAny<
      typeof instance.abstractWithCtorSpecialized.value
    > = false;
    const _abstractWithCtorSpecializedType: number = instance.abstractWithCtorSpecialized.value;
    const _abstractWithCtorOptionalNotAny: IsAny<
      NonNullable<typeof instance.abstractWithCtorOptional>['value']
    > = false;

    const injector = fixture.componentRef.injector;
    const getElDefault = injector.get(ElementRef);
    const getElBtn = injector.get(ElementRef<HTMLButtonElement>);
    const getElBtnOpt = injector.get(ElementRef<HTMLButtonElement>, null, {optional: true});
    const getWithCtor = injector.get(GenericServiceWithCtor<string>);
    const getWithCtorOpt = injector.get(GenericServiceWithCtor<string>, null, {optional: true});
    const getAbsWithCtor = injector.get(AbstractGenericServiceWithCtor<number>);
    const getTpl = injector.get(TemplateRef<{foo: number}>, null, {optional: true});

    const _getElDefaultIsAny: IsAny<typeof getElDefault.nativeElement> = true;
    const _getElBtnNotAny: IsAny<typeof getElBtn.nativeElement> = false;
    const _getElBtnType: HTMLButtonElement = getElBtn.nativeElement;
    const _getElBtnOptNotAny: IsAny<NonNullable<typeof getElBtnOpt>['nativeElement']> = false;
    const _getWithCtorNotAny: IsAny<typeof getWithCtor.value> = false;
    const _getWithCtorType: string = getWithCtor.value;
    const _getWithCtorOptNotAny: IsAny<NonNullable<typeof getWithCtorOpt>['value']> = false;
    const _getAbsWithCtorNotAny: IsAny<typeof getAbsWithCtor.value> = false;
    const _getAbsWithCtorType: number = getAbsWithCtor.value;
    const _getTplNotAny: IsAny<Parameters<NonNullable<typeof getTpl>['createEmbeddedView']>[0]> =
      false;

    const _genericDefaultNotAny: IsAny<typeof instance.genericDefault.value> = false;
    const _genericDefaultType: 'a' | 'b' = instance.genericDefault.value;
    const _genericSpecializedNotAny: IsAny<typeof instance.genericSpecialized.value> = false;
    const _genericSpecializedType: 'a' = instance.genericSpecialized.value;
    const _genericSpecializedWithOptionsNotAny: IsAny<
      typeof instance.genericSpecializedWithOptions.value
    > = false;
    const _genericSpecializedWithOptionsType: 'a' = instance.genericSpecializedWithOptions.value;
    const _genericSpecializedOptionalNotAny: IsAny<
      NonNullable<typeof instance.genericSpecializedOptional>['value']
    > = false;
    const _genericSpecializedOptionalType: 'a' | null =
      instance.genericSpecializedOptional && instance.genericSpecializedOptional.value;
    const _genericSpecializedNonOptionalNotAny: IsAny<
      typeof instance.genericSpecializedNonOptional.value
    > = false;
    const _genericSpecializedNonOptionalType: 'a' = instance.genericSpecializedNonOptional.value;
    const _missingGenericOptionalType: MissingGenericService<string> | null =
      instance.missingGenericOptional;
    const _abstractDefaultNotAny: IsAny<typeof instance.abstractDefault.value> = false;
    const _abstractDefaultType: 'x' | 'y' = instance.abstractDefault.value;
    const _abstractSpecializedNotAny: IsAny<typeof instance.abstractSpecialized.value> = false;
    const _abstractSpecializedType: 'x' = instance.abstractSpecialized.value;
    const _abstractSpecializedWithOptionsNotAny: IsAny<
      typeof instance.abstractSpecializedWithOptions.value
    > = false;
    const _abstractSpecializedWithOptionsType: 'x' = instance.abstractSpecializedWithOptions.value;
    const _abstractSpecializedOptionalNotAny: IsAny<
      NonNullable<typeof instance.abstractSpecializedOptional>['value']
    > = false;
    const _abstractSpecializedOptionalType: 'x' | null =
      instance.abstractSpecializedOptional && instance.abstractSpecializedOptional.value;

    const _abstractDateAdapterDefaultNotAny: IsAny<
      Parameters<typeof instance.abstractDateAdapterDefault.getYear>[0]
    > = false;
    const _abstractDateAdapterSpecializedNotAny: IsAny<
      Parameters<typeof instance.abstractDateAdapterSpecialized.getYear>[0]
    > = false;
    const _abstractDateAdapterSpecializedType: Date = instance.abstractDateAdapterSpecialized.clone(
      new Date(),
    );
    const _abstractDateAdapterSpecializedOptionalType: Date | undefined =
      instance.abstractDateAdapterSpecializedOptional?.clone(new Date());

    // Ensure an unspecialized abstract class token infers unknown for type parameters without defaults
    class ConsumingClass<D> {
      adapter: AbstractDateAdapter<unknown> = inject(AbstractDateAdapter);
      adapterSpecialized: AbstractDateAdapter<D> = inject(AbstractDateAdapter<D>);
    }
    runInInjectionContext(fixture.componentRef.injector, () => {
      expect(new ConsumingClass()).toBeInstanceOf(ConsumingClass);
    });

    const _protectedConstructorIsAny: IsAny<typeof instance.protectedConstructor.value> = true;
    const _protectedConstructorSpecializedNotAny: IsAny<
      typeof instance.protectedConstructorExplicit.value
    > = false;
    const _protectedConstructorSpecializedType: string =
      instance.protectedConstructorExplicit.value;
    const _protectedConstructorGenericSpecializedNotAny: IsAny<
      typeof instance.protectedConstructorGeneric.value
    > = false;
    const _protectedConstructorGenericSpecializedType: string =
      instance.protectedConstructorGeneric.value;

    expect(_elDefaultIsAny).toBe(true);
    expect(_elNotAny).toBe(false);
    expect(_elType).toBeDefined();
    expect(_templateRefCtxNotAny).toBe(false);
    expect(_templateRefCtxType).toBeDefined();
    expect(_genericWithCtorDefaultNotAny).toBe(false);
    expect(_genericWithCtorSpecializedNotAny).toBe(false);
    expect(_genericWithCtorSpecializedType).toBe('ctor');
    expect(_genericWithCtorOptionalNotAny).toBe(false);
    expect(_abstractWithCtorSpecializedNotAny).toBe(false);
    expect(_abstractWithCtorSpecializedType).toBe(42);
    expect(_abstractWithCtorOptionalNotAny).toBe(false);
    expect(_getElDefaultIsAny).toBe(true);
    expect(_getElBtnNotAny).toBe(false);
    expect(_getElBtnType).toBeDefined();
    expect(_getElBtnOptNotAny).toBe(false);
    expect(_getWithCtorNotAny).toBe(false);
    expect(_getWithCtorType).toBe('ctor');
    expect(_getWithCtorOptNotAny).toBe(false);
    expect(_getAbsWithCtorNotAny).toBe(false);
    expect(_getAbsWithCtorType).toBe(42);
    expect(_getTplNotAny).toBe(false);
    expect(instance.el).toBeInstanceOf(ElementRef);
    expect(_genericDefaultNotAny).toBe(false);
    expect(_genericDefaultType).toBe('a');
    expect(_genericSpecializedType).toBe('a');
    expect(_genericSpecializedWithOptionsType).toBe('a');
    expect(_genericSpecializedOptionalType).toBe('a');
    expect(_genericSpecializedNonOptionalType).toBe('a');
    expect(_missingGenericOptionalType).toBeNull();
    expect(instance.genericSpecializedWithOptions.value).toBe('a');
    expect(instance.genericSpecializedOptional?.value).toBe('a');
    expect(instance.genericSpecializedNonOptional.value).toBe('a');
    expect(instance.missingGenericOptional).toBeNull();
    expect(_abstractDefaultNotAny).toBe(false);
    expect(_abstractDefaultType).toBe('x');
    expect(_abstractSpecializedNotAny).toBe(false);
    expect(_abstractSpecializedType).toBe('x');
    expect(_abstractSpecializedWithOptionsType).toBe('x');
    expect(_abstractSpecializedOptionalType).toBe('x');
    expect(instance.abstractSpecializedWithOptions.value).toBe('x');
    expect(instance.abstractSpecializedOptional?.value).toBe('x');
    expect(_abstractDateAdapterDefaultNotAny).toBe(false);
    expect(_abstractDateAdapterSpecializedNotAny).toBe(false);
    expect(_abstractDateAdapterSpecializedType).toBeInstanceOf(Date);
    expect(_abstractDateAdapterSpecializedOptionalType).toBeInstanceOf(Date);
    expect(_protectedConstructorIsAny).toBe(true);
    expect(_protectedConstructorSpecializedNotAny).toBe(false);
    expect(_protectedConstructorGenericSpecializedNotAny).toBe(false);
    expect(instance.protectedConstructor.value).toBe('p');
    expect(instance.protectedConstructorExplicit.value).toBe('p');
    expect(instance.protectedConstructorGeneric.value).toBe('p');
    expect(instance.abstractProtectedOptional).toBeNull();
  });

  it('should preserve generic type parameters in EnvironmentInjector.get and TestBed.inject', () => {
    type IsAny<T> = 0 extends 1 & T ? true : false;

    @Injectable()
    class GenericServiceWithCtor<T> {
      constructor(public dep: string) {}
      value!: T;
    }

    @Injectable()
    abstract class AbstractGenericServiceWithCtor<T> {
      constructor(public dep: string) {}
      abstract value: T;
    }

    const elInstance = new ElementRef({});
    TestBed.configureTestingModule({
      providers: [
        {provide: ElementRef, useValue: elInstance},
        {provide: GenericServiceWithCtor, useValue: {dep: 'd', value: 'hello'}},
        {provide: AbstractGenericServiceWithCtor, useValue: {dep: 'ad', value: 123}},
      ],
    });

    // TestBed.inject
    const tbElDefault = TestBed.inject(ElementRef);
    const tbElBtn = TestBed.inject(ElementRef<HTMLButtonElement>);
    const tbElBtnOpt = TestBed.inject(ElementRef<HTMLButtonElement>, null, {optional: true});
    const tbWithCtor = TestBed.inject(GenericServiceWithCtor<string>);
    const tbWithCtorOpt = TestBed.inject(GenericServiceWithCtor<string>, null, {optional: true});
    const tbAbsWithCtor = TestBed.inject(AbstractGenericServiceWithCtor<number>);

    const _tbElDefaultIsAny: IsAny<typeof tbElDefault.nativeElement> = true;
    const _tbElBtnNotAny: IsAny<typeof tbElBtn.nativeElement> = false;
    const _tbElBtnType: HTMLButtonElement = tbElBtn.nativeElement;
    const _tbElBtnOptNotAny: IsAny<NonNullable<typeof tbElBtnOpt>['nativeElement']> = false;
    const _tbWithCtorNotAny: IsAny<typeof tbWithCtor.value> = false;
    const _tbWithCtorType: string = tbWithCtor.value;
    const _tbWithCtorOptNotAny: IsAny<NonNullable<typeof tbWithCtorOpt>['value']> = false;
    const _tbAbsWithCtorNotAny: IsAny<typeof tbAbsWithCtor.value> = false;
    const _tbAbsWithCtorType: number = tbAbsWithCtor.value;

    expect(_tbElDefaultIsAny).toBe(true);
    expect(_tbElBtnNotAny).toBe(false);
    expect(_tbElBtnType).toBeDefined();
    expect(_tbElBtnOptNotAny).toBe(false);
    expect(_tbWithCtorNotAny).toBe(false);
    expect(_tbWithCtorType).toBe('hello');
    expect(_tbWithCtorOptNotAny).toBe(false);
    expect(_tbAbsWithCtorNotAny).toBe(false);
    expect(_tbAbsWithCtorType).toBe(123);

    // EnvironmentInjector.get
    const envInjector = createEnvironmentInjector(
      [
        {provide: ElementRef, useValue: elInstance},
        {provide: GenericServiceWithCtor, useValue: {dep: 'd', value: 'env'}},
        {provide: AbstractGenericServiceWithCtor, useValue: {dep: 'ad', value: 456}},
      ],
      TestBed.inject(EnvironmentInjector),
    );

    const envElDefault = envInjector.get(ElementRef);
    const envElBtn = envInjector.get(ElementRef<HTMLButtonElement>);
    const envElBtnOpt = envInjector.get(ElementRef<HTMLButtonElement>, null, {optional: true});
    const envWithCtor = envInjector.get(GenericServiceWithCtor<string>);
    const envWithCtorOpt = envInjector.get(GenericServiceWithCtor<string>, null, {optional: true});
    const envAbsWithCtor = envInjector.get(AbstractGenericServiceWithCtor<number>);

    const _envElDefaultIsAny: IsAny<typeof envElDefault.nativeElement> = true;
    const _envElBtnNotAny: IsAny<typeof envElBtn.nativeElement> = false;
    const _envElBtnType: HTMLButtonElement = envElBtn.nativeElement;
    const _envElBtnOptNotAny: IsAny<NonNullable<typeof envElBtnOpt>['nativeElement']> = false;
    const _envWithCtorNotAny: IsAny<typeof envWithCtor.value> = false;
    const _envWithCtorType: string = envWithCtor.value;
    const _envWithCtorOptNotAny: IsAny<NonNullable<typeof envWithCtorOpt>['value']> = false;
    const _envAbsWithCtorNotAny: IsAny<typeof envAbsWithCtor.value> = false;
    const _envAbsWithCtorType: number = envAbsWithCtor.value;

    expect(_envElDefaultIsAny).toBe(true);
    expect(_envElBtnNotAny).toBe(false);
    expect(_envElBtnType).toBeDefined();
    expect(_envElBtnOptNotAny).toBe(false);
    expect(_envWithCtorNotAny).toBe(false);
    expect(_envWithCtorType).toBe('env');
    expect(_envWithCtorOptNotAny).toBe(false);
    expect(_envAbsWithCtorNotAny).toBe(false);
    expect(_envAbsWithCtorType).toBe(456);

    envInjector.destroy();
  });

  it('should handle generic classes with type parameters in constructor arguments', () => {
    type IsAny<T> = 0 extends 1 & T ? true : false;
    type IsNever<T> = [T] extends [never] ? true : false;

    @Injectable()
    class ConstrainedCtorParam<T extends 'a' | 'b'> {
      constructor(public x: T) {}
    }

    @Injectable()
    class CtorWithOtherAndT<T = any> {
      constructor(
        public label: string,
        public data: T,
      ) {}
    }

    TestBed.configureTestingModule({
      providers: [
        {provide: ConstrainedCtorParam, useValue: {x: 'a'}},
        {provide: CtorWithOtherAndT, useValue: {label: 'l', data: 99}},
      ],
    });

    // Specialized instantiation expressions preserve their type arguments.
    const constrainedSpec = TestBed.inject(ConstrainedCtorParam<'a'>);
    const otherAndTSpec = TestBed.inject(CtorWithOtherAndT<number>);

    const _constrainedSpecNotAny: IsAny<typeof constrainedSpec.x> = false;
    const _constrainedSpecType: 'a' = constrainedSpec.x;
    const _otherAndTSpecNotAny: IsAny<typeof otherAndTSpec.data> = false;
    const _otherAndTSpecType: number = otherAndTSpec.data;

    // Unspecialized tokens with a constrained T or another concrete ctor param fall into the
    // `abstract new (...args: never[]) => T` overload, inferring `never` for `T`.
    const constrainedDefault = TestBed.inject(ConstrainedCtorParam);
    const otherAndTDefault = TestBed.inject(CtorWithOtherAndT);

    const _constrainedDefaultIsNever: IsNever<typeof constrainedDefault.x> = true;
    const _otherAndTDefaultIsNever: IsNever<typeof otherAndTDefault.data> = true;

    expect(_constrainedSpecNotAny).toBe(false);
    expect(_constrainedSpecType).toBe('a');
    expect(_otherAndTSpecNotAny).toBe(false);
    expect(_otherAndTSpecType).toBe(99);
    expect(_constrainedDefaultIsNever).toBe(true);
    expect(_otherAndTDefaultIsNever).toBe(true);
  });
});
