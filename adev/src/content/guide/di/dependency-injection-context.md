# Контекст внедрения

Система внедрения зависимостей (DI) внутренне полагается на контекст времени выполнения, в котором доступен текущий
инжектор.

Это означает, что инжекторы могут работать только тогда, когда код выполняется в таком контексте.

Контекст внедрения доступен в следующих ситуациях:

- Во время создания (через `constructor`) класса, создаваемого системой DI, например, `@Injectable` или `@Component`.
- В инициализаторе полей таких классов.
- В фабричной функции, указанной для `useFactory` в `Provider` или `@Injectable`.
- В функции `factory`, указанной для `InjectionToken`.
- В рамках стека вызовов (stack frame), который выполняется в контексте внедрения.

Понимание того, когда вы находитесь в контексте внедрения, позволит вам использовать функцию [`inject`](api/core/inject)
для внедрения экземпляров.

NOTE: Основные примеры использования `inject()` в конструкторах классов и инициализаторах полей см.
в [обзорном руководстве](/guide/di#where-can-inject-be-used).

## Стек вызовов в контексте

Некоторые API спроектированы для выполнения в контексте внедрения. Это относится, например, к Guard'ам маршрутизатора.
Это позволяет использовать [`inject`](api/core/inject) внутри функции Guard для доступа к сервису.

Вот пример для `CanActivateFn`:

```ts {highlight: [3]}
const canActivateTeam: CanActivateFn =
  (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    return inject(PermissionsService).canActivate(inject(UserToken), route.params.id);
  };
```

## Запуск внутри контекста внедрения

Если вы хотите выполнить определенную функцию в контексте внедрения, не находясь в нем изначально, вы можете сделать это
с помощью `runInInjectionContext`.
Для этого требуется доступ к определенному инжектору, например, к `EnvironmentInjector`:

```ts {highlight: [9], header"hero.service.ts"}
@Injectable({
  providedIn: 'root'
})
export class HeroService {
  private environmentInjector = inject(EnvironmentInjector);

  someMethod() {
    runInInjectionContext(this.environmentInjector, () => {
      inject(SomeService); // Делайте то, что нужно, с внедренным сервисом
    });
  }
}
```

Обратите внимание, что [`inject`](/api/core/inject) вернет экземпляр только в том случае, если инжектор сможет разрешить требуемый токен.

## Проверка контекста

Angular предоставляет вспомогательную функцию `assertInInjectionContext`, чтобы подтвердить, что текущий контекст
является контекстом внедрения, и выбросить понятную ошибку, если это не так. Передайте ссылку на вызывающую функцию,
чтобы сообщение об ошибке указывало на правильную точку входа API. Это создает более понятное и полезное сообщение, чем
стандартная общая ошибка внедрения.

```ts
import { ElementRef, assertInInjectionContext, inject } from '@angular/core';

export function injectNativeElement<T extends Element>(): T {
    assertInInjectionContext(injectNativeElement);
    return inject(ElementRef).nativeElement;
}
```

Затем вы можете вызвать этот помощник **из контекста внедрения** (конструктор, инициализатор поля, фабрика провайдера
или код, выполняемый через `runInInjectionContext`):

```ts
import { Component, inject } from '@angular/core';
import { injectNativeElement } from './dom-helpers';

@Component({ /* … */ })
export class PreviewCard {
  readonly hostEl = injectNativeElement<HTMLElement>(); // Инициализатор поля выполняется в контексте внедрения.

  onAction() {
    const anotherRef = injectNativeElement<HTMLElement>(); // Ошибка: выполняется вне контекста внедрения.
  }
}
```

## Использование DI вне контекста

Вызов [`inject`](api/core/inject) или `assertInInjectionContext` вне контекста внедрения приведет к
ошибке [NG0203](/errors/NG0203).
