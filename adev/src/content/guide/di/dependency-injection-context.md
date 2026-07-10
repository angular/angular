# Контекст внедрения

Система внедрения зависимостей (DI) опирается на runtime-контекст, в котором доступен текущий инжектор.

Это значит, что инжекторы работают только при выполнении кода внутри этого контекста.

Контекст внедрения доступен в следующих ситуациях:

- При создании (через `constructor`) класса, экземпляр которого создаёт система DI, например `@Injectable` или `@Component`.
- В инициализаторах полей таких классов.
- В фабричной функции, указанной для `useFactory` у `Provider` или `@Injectable`.
- В функции `factory`, указанной для `InjectionToken`.
- Внутри стекового фрейма, выполняющегося в контексте внедрения.

Зная, что вы находитесь в контексте внедрения, можно использовать функцию [`inject`](api/core/inject) для получения зависимостей.

NOTE: Базовые примеры использования `inject()` в конструкторах и инициализаторах полей см. в [обзорном руководстве](/guide/di#where-can-inject-be-used).

## Стек-фрейм в контексте {#stack-frame-in-context}

Некоторые API рассчитаны на выполнение в контексте внедрения. Так, например, устроены guard'ы роутера. Это позволяет вызывать [`inject`](api/core/inject) внутри функции guard для доступа к сервисам.

Пример для `CanActivateFn`:

```ts {highlight: [3]}
const canActivateTeam: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  return inject(PermissionsService).canActivate(inject(UserToken), route.params.id);
};
```

## Выполнение в контексте внедрения {#run-within-an-injection-context}

Если нужно выполнить функцию в контексте внедрения, не находясь в нём, используйте `runInInjectionContext`.
Для этого нужен доступ к инжектору, например `EnvironmentInjector`:

```ts {highlight: [9], header:"hero.service.ts"}
@Injectable({
  providedIn: 'root',
})
export class HeroService {
  private environmentInjector = inject(EnvironmentInjector);

  someMethod() {
    runInInjectionContext(this.environmentInjector, () => {
      inject(SomeService); // Do what you need with the injected service
    });
  }
}
```

Учтите: [`inject`](/api/core/inject) возвращает экземпляр только если инжектор может разрешить запрошенный токен.

## Проверка контекста {#asserts-the-context}

Angular предоставляет вспомогательную функцию `assertInInjectionContext`, которая проверяет, что текущий контекст — контекст внедрения, и выбрасывает понятную ошибку, если это не так. Передайте ссылку на вызывающую функцию, чтобы сообщение об ошибке указывало на правильную точку входа API. Так сообщение получается яснее и полезнее, чем стандартная общая ошибка внедрения.

```ts
import {ElementRef, assertInInjectionContext, inject} from '@angular/core';

export function injectNativeElement<T extends Element>(): T {
  assertInInjectionContext(injectNativeElement);
  return inject(ElementRef).nativeElement;
}
```

Затем этот хелпер можно вызывать **из контекста внедрения** (конструктор, инициализатор поля, фабрика провайдера или код, выполняемый через `runInInjectionContext`):

```ts
import {Component, inject} from '@angular/core';
import {injectNativeElement} from './dom-helpers';

@Component({
  /* … */
})
export class PreviewCard {
  readonly hostEl = injectNativeElement<HTMLElement>(); // Field initializer runs in an injection context.

  onAction() {
    const anotherRef = injectNativeElement<HTMLElement>(); // Fails: runs outside an injection context.
  }
}
```

## Использование DI вне контекста {#using-di-outside-of-a-context}

Если вызвать [`inject`](api/core/inject) или `assertInInjectionContext` вне контекста внедрения, Angular выбросит [ошибку NG0203](/errors/NG0203).
