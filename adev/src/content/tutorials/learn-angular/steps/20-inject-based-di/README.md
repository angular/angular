# Внедрение зависимостей с помощью inject

Создание внедряемого сервиса — это первая часть системы внедрения зависимостей (DI) в Angular. Как внедрить сервис в
компонент? В Angular есть удобная функция `inject()`, которую можно использовать в соответствующем контексте.

ПРИМЕЧАНИЕ: Контексты внедрения выходят за рамки этого руководства, но вы можете узнать больше
в [руководстве по основам внедрения зависимостей (DI)](/essentials/dependency-injection)
и [руководстве по контексту DI](guide/di/dependency-injection-context).

В этом задании вы узнаете, как внедрить сервис и использовать его в компоненте.

<hr>

Часто бывает полезно инициализировать свойства класса значениями, предоставляемыми системой DI. Вот пример:

<docs-code language="ts" highlight="[3]">
@Component({...})
class PetCareDashboard {
  petRosterService = inject(PetRosterService);
}
</docs-code>

<docs-workflow>

<docs-step title="Внедрите `CarService`">

В файле `app.ts`, используя функцию `inject()`, внедрите `CarService` и присвойте его свойству с именем `carService`.

ПРИМЕЧАНИЕ: Обратите внимание на разницу между свойством `carService` и классом `CarService`.

</docs-step>

<docs-step title="Используйте экземпляр `carService`">

Вызов `inject(CarService)` предоставил вам экземпляр `CarService`, который вы можете использовать в своем приложении,
сохраненный в свойстве `carService`.

Инициализируйте свойство `display` следующей реализацией:

```ts
display = this.carService.getCars().join(' ⭐️ ');
```

</docs-step>

<docs-step title="Обновите шаблон `App`">

Обновите шаблон компонента в `app.ts` следующим кодом:

```ts
template: `<p>Car Listing: {{ display }}</p>`,
```

</docs-step>

</docs-workflow>

Вы только что внедрили свой первый сервис в компонент — отличная работа.
