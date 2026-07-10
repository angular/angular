# Отладка и устранение неполадок внедрения зависимостей

Проблемы внедрения зависимостей (DI) обычно связаны с ошибками конфигурации, областью видимости или неверными паттернами использования. Это руководство помогает выявлять и решать типичные проблемы DI.

## Типичные ошибки и решения {#common-pitfalls-and-solutions}

### Сервис недоступен там, где ожидается {#services-not-available-where-expected}

Одна из самых частых проблем DI — попытка внедрить сервис, который Angular не находит в текущем инжекторе или родительских. Обычно сервис предоставлен в неверной области или не предоставлен вовсе.

#### Несовпадение области провайдера {#provider-scope-mismatch}

Когда сервис добавляют в массив `providers` компонента, Angular создаёт экземпляр в инжекторе этого компонента. Экземпляр доступен только этому компоненту и его потомкам. Родительские и соседние компоненты не могут получить к нему доступ — у них другие инжекторы.

```angular-ts {header: 'child-view.ts'}
import {Component} from '@angular/core';
import {DataStore} from './data-store';

@Component({
  selector: 'app-child',
  template: '<p>Child</p>',
  providers: [DataStore], // Only available in this component and its children
})
export class ChildView {}
```

```angular-ts {header: 'parent-view.ts'}
import {Component, inject} from '@angular/core';
import {DataStore} from './data-store';

@Component({
  selector: 'app-parent',
  template: '<app-child />',
})
export class ParentView {
  private dataService = inject(DataStore); // ERROR: Not available to parent
}
```

Angular ищет только вверх по иерархии, никогда вниз. Родительские компоненты не могут получить сервисы, предоставленные в дочерних.

**Решение:** предоставьте сервис на более высоком уровне (приложение или родительский компонент).

```ts {prefer}
import {Service} from '@angular/core';

@Service()
export class DataStore {
  // Available everywhere
}
```

TIP: `@Service` делает сервисы доступными везде и включает tree-shaking. Если не нужна область всего приложения, укажите `autoProvided: false`.

#### Сервисы и лениво загружаемые маршруты {#services-and-lazy-loaded-routes}

Когда сервис добавляют в `providers` лениво загружаемого маршрута, Angular создаёт дочерний инжектор для этого маршрута. Инжектор и его сервисы становятся доступны только после загрузки маршрута. Компоненты в eagerly загружаемых частях приложения не могут получить эти сервисы — у них другие инжекторы, существующие до создания ленивого инжектора.

```ts {header: 'feature.routes.ts'}
import {Routes} from '@angular/router';
import {FeatureClient} from './feature-client';

export const featureRoutes: Routes = [
  {
    path: 'feature',
    providers: [FeatureClient],
    loadComponent: () => import('./feature-view'),
  },
];
```

```angular-ts {header: 'eager-view.ts'}
import {Component, inject} from '@angular/core';
import {FeatureClient} from './feature-client';

@Component({
  selector: 'app-eager',
  template: '<p>Eager Component</p>',
})
export class EagerView {
  private featureService = inject(FeatureClient); // ERROR: Not available yet
}
```

Лениво загружаемые маршруты создают дочерние инжекторы, доступные только после загрузки маршрута.

NOTE: По умолчанию инжекторы маршрутов и их сервисы сохраняются даже после ухода с маршрута. Они уничтожаются только при закрытии приложения. Об автоматической очистке неиспользуемых инжекторов маршрутов см. [настройку поведения маршрутов](guide/routing/customizing-route-behavior#experimental-automatic-cleanup-of-unused-route-injectors).

**Решение:** используйте `@Service` для сервисов, которыми нужно делиться через границы ленивой загрузки.

```ts {prefer, header: 'Provide at root for shared services'}
import {Service} from '@angular/core';

@Service()
export class FeatureClient {
  // Available everywhere, including before lazy load
}
```

Если сервис должен загружаться лениво, но всё же быть доступен eager-компонентам, внедряйте его только там, где нужно, и используйте опциональное внедрение для обработки доступности.

### Несколько экземпляров вместо синглтонов {#multiple-instances-instead-of-singletons}

Ожидается один общий экземпляр (синглтон), но в разных компонентах получаются отдельные экземпляры.

#### Предоставление в компоненте вместо root {#providing-in-component-instead-of-root}

Когда сервис добавляют в `providers` компонента, Angular создаёт новый экземпляр для каждого экземпляра компонента. У каждого компонента свой экземпляр сервиса — изменения в одном не влияют на другой. Это часто неожиданно, когда нужно общее состояние в приложении.

```angular-ts {avoid, header: 'Component-level provider creates multiple instances'}
import {Component, inject} from '@angular/core';
import {UserClient} from './user-client';

@Component({
  selector: 'app-profile',
  template: '<p>Profile</p>',
  providers: [UserClient], // Creates new instance per component!
})
export class UserProfile {
  private userService = inject(UserClient);
}

@Component({
  selector: 'app-settings',
  template: '<p>Settings</p>',
  providers: [UserClient], // Different instance!
})
export class UserSettings {
  private userService = inject(UserClient);
}
```

Каждый компонент получает свой экземпляр `UserClient`. Изменения в одном не влияют на другой.

**Решение:** используйте `@Service` для синглтонов.

```ts {prefer, header: 'Root-level singleton'}
import {Injectable} from '@angular/core';

@Service()
export class UserClient {
  // Single instance shared across all components
}
```

#### Когда несколько экземпляров намеренны {#when-multiple-instances-are-intentional}

Иногда нужны отдельные экземпляры на компонент для состояния, специфичного для компонента.

```angular-ts {header: 'Intentional: Component-scoped state'}
import {Injectable, signal} from '@angular/core';

@Injectable() // No providedIn - must be provided explicitly
export class FormStateStore {
  private formData = signal({});

  setData(data: any) {
    this.formData.set(data);
  }

  getData() {
    return this.formData();
  }
}

@Component({
  selector: 'app-user-form',
  template: '<form>...</form>',
  providers: [FormStateStore], // Each form gets its own state
})
export class UserForm {
  private formState = inject(FormStateStore);
}
```

Этот паттерн полезен для:

- управления состоянием формы (у каждой формы изолированное состояние)
- кэширования на уровне компонента
- временных данных, которыми не следует делиться

### Некорректное использование inject() {#incorrect-inject-usage}

Функция `inject()` работает только в определённых контекстах при создании класса и выполнении фабрик.

#### Вызов inject() в хуках жизненного цикла {#using-inject-in-lifecycle-hooks}

При вызове `inject()` внутри хуков вроде `ngOnInit()`, `ngAfterViewInit()` или `ngOnDestroy()` Angular выбрасывает ошибку: эти методы выполняются вне контекста внедрения. Контекст внедрения доступен только во время синхронного создания класса, до вызова хуков жизненного цикла.

```angular-ts {avoid, header: 'inject() in ngOnInit'}
import {Component, inject} from '@angular/core';
import {UserClient} from './user-client';

@Component({
  selector: 'app-profile',
  template: '<p>User: {{userName}}</p>',
})
export class UserProfile {
  userName = '';

  ngOnInit() {
    const userService = inject(UserClient); // ERROR: Not an injection context
    this.userName = userService.getUser().name;
  }
}
```

**Решение:** захватывайте зависимости и вычисляйте значения в инициализаторах полей.

```angular-ts {prefer, header: 'Derive values in field initializers'}
import {Component, inject} from '@angular/core';
import {UserClient} from './user-client';

@Component({
  selector: 'app-profile',
  template: '<p>User: {{userName}}</p>',
})
export class UserProfile {
  private userService = inject(UserClient);
  userName = this.userService.getUser().name;
}
```

#### Использование Injector для отложенного внедрения {#using-the-injector-for-deferred-injection}

Когда нужно получить сервисы вне контекста внедрения, используйте захваченный `Injector` напрямую через `injector.get()`:

```angular-ts
import {Component, inject, Injector} from '@angular/core';
import {UserClient} from './user-client';

@Component({
  selector: 'app-profile',
  template: '<button (click)="delayedLoad()">Load Later</button>',
})
export class UserProfile {
  private injector = inject(Injector);

  delayedLoad() {
    setTimeout(() => {
      const userService = this.injector.get(UserClient);
      console.log(userService.getUser());
    }, 1000);
  }
}
```

#### Использование runInInjectionContext для колбэков {#using-runininjectioncontext-for-callbacks}

Используйте `runInInjectionContext()`, когда нужно дать **другому коду** возможность вызывать `inject()`. Это полезно при приёме колбэков, которые могут использовать DI:

```angular-ts
import {Component, inject, Injector, input} from '@angular/core';

@Component({
  selector: 'app-data-loader',
  template: '<button (click)="load()">Load</button>',
})
export class DataLoader {
  private injector = inject(Injector);
  onLoad = input<() => void>();

  load() {
    const callback = this.onLoad();
    if (callback) {
      // Enable the callback to use inject()
      this.injector.runInInjectionContext(callback);
    }
  }
}
```

Метод `runInInjectionContext()` создаёт временный контекст внедрения, позволяя коду внутри колбэка вызывать `inject()`.

IMPORTANT: По возможности всегда захватывайте зависимости на уровне класса. Для простого отложенного получения используйте `injector.get()`, а `runInInjectionContext()` — только когда внешнему коду нужно вызывать `inject()`.

TIP: Используйте `assertInInjectionContext()`, чтобы проверить, что код выполняется в допустимом контексте внедрения. Это полезно при создании переиспользуемых функций, вызывающих `inject()`. См. [Проверка контекста](guide/di/dependency-injection-context#asserts-the-context).

### Путаница providers и viewProviders {#providers-vs-viewproviders-confusion}

Разница между `providers` и `viewProviders` важна в сценариях проекции контента.

#### Понимание разницы {#understanding-the-difference}

**providers:** доступны шаблону компонента И любому контенту, спроецированному в компонент (ng-content).

**viewProviders:** доступны только шаблону компонента, НЕ спроецированному контенту.

```angular-ts {header: 'parent-view.ts'}
import {Component, inject} from '@angular/core';
import {ThemeStore} from './theme-store';

@Component({
  selector: 'app-parent',
  template: `
    <div>
      <p>Theme: {{ themeService.theme() }}</p>
      <ng-content />
    </div>
  `,
  providers: [ThemeStore], // Available to content children
})
export class ParentView {
  protected themeService = inject(ThemeStore);
}

@Component({
  selector: 'app-parent-view',
  template: `
    <div>
      <p>Theme: {{ themeService.theme() }}</p>
      <ng-content />
    </div>
  `,
  viewProviders: [ThemeStore], // NOT available to content children
})
export class ParentViewOnly {
  protected themeService = inject(ThemeStore);
}
```

```angular-ts {header: 'child-view.ts'}
import {Component, inject} from '@angular/core';
import {ThemeStore} from './theme-store';

@Component({
  selector: 'app-child',
  template: '<p>Child theme: {{theme()}}</p>',
})
export class ChildView {
  private themeService = inject(ThemeStore, {optional: true});
  theme = () => this.themeService?.theme() ?? 'none';
}
```

```angular-ts {header: 'app.ts'}
@Component({
  selector: 'app-root',
  template: `
    <app-parent>
      <app-child />
      <!-- Can access ThemeStore -->
    </app-parent>

    <app-parent-view>
      <app-child />
      <!-- Cannot access ThemeStore -->
    </app-parent-view>
  `,
})
export class App {}
```

**При проекции в `app-parent`:** дочерний компонент может внедрить `ThemeStore`, потому что `providers` делает его доступным спроецированному контенту.

**При проекции в `app-parent-view`:** дочерний компонент не может внедрить `ThemeStore`, потому что `viewProviders` ограничивает доступ только шаблоном родителя.

#### Выбор между providers и viewProviders {#choosing-between-providers-and-viewproviders}

Используйте `providers`, когда:

- сервис должен быть доступен спроецированному контенту
- content children должны получать доступ к сервису
- предоставляются сервисы общего назначения

Используйте `viewProviders`, когда:

- сервис должен быть доступен только шаблону вашего компонента
- нужно скрыть детали реализации от спроецированного контента
- предоставляются внутренние сервисы, которые не должны «утекать» наружу

**Рекомендация по умолчанию:** используйте `providers`, если нет конкретной причины ограничить доступ через `viewProviders`.

### Проблемы с InjectionToken {#injectiontoken-issues}

При использовании `InjectionToken` для не-классовых зависимостей часто возникают проблемы с идентичностью токена, типобезопасностью и конфигурацией провайдера. Обычно они связаны с тем, как JavaScript обрабатывает идентичность объектов и как TypeScript выводит типы.

#### Путаница с идентичностью токена {#token-identity-confusion}

При создании нового экземпляра `InjectionToken` JavaScript создаёт уникальный объект в памяти. Даже другой `InjectionToken` с той же строкой описания — совершенно другой объект. Angular сопоставляет провайдеры с точками внедрения по идентичности объекта токена (не по описанию), поэтому токены с одинаковым описанием, но разной идентичностью не могут получить значения друг друга.

```ts {header: 'config.token.ts'}
import {InjectionToken} from '@angular/core';

export interface AppConfig {
  apiUrl: string;
}

export const APP_CONFIG = new InjectionToken<AppConfig>('app config');
```

```ts {header: 'app.config.ts'}
import {APP_CONFIG} from './config.token';

export const appConfig: AppConfig = {
  apiUrl: 'https://api.example.com',
};

bootstrapApplication(App, {
  providers: [{provide: APP_CONFIG, useValue: appConfig}],
});
```

```angular-ts {avoid, header: 'feature-view.ts'}
// Creating new token with same description
import {InjectionToken, inject} from '@angular/core';
import {AppConfig} from './config.token';

const APP_CONFIG = new InjectionToken<AppConfig>('app config');

@Component({
  selector: 'app-feature',
  template: '<p>Feature</p>',
})
export class FeatureView {
  private config = inject(APP_CONFIG); // ERROR: Different token instance!
}
```

Хотя у обоих токенов описание `'app config'`, это разные объекты. Angular сравнивает токены по ссылке, а не по описанию.

**Решение:** импортируйте тот же экземпляр токена.

```angular-ts {prefer, header: 'feature-view.ts'}
import {inject} from '@angular/core';
import {APP_CONFIG, AppConfig} from './config.token';

@Component({
  selector: 'app-feature',
  template: '<p>API: {{config.apiUrl}}</p>',
})
export class FeatureView {
  protected config = inject(APP_CONFIG); // Works: Same token instance
}
```

TIP: Всегда экспортируйте токены из общего файла и импортируйте их везде, где они нужны. Никогда не создавайте несколько экземпляров `InjectionToken` с одним описанием.

#### Попытка внедрить интерфейсы {#trying-to-inject-interfaces}

Интерфейс TypeScript существует только при компиляции для проверки типов. При компиляции в JavaScript определения интерфейсов стираются, и в runtime нет объекта, который Angular мог бы использовать как injection token. При попытке внедрить тип интерфейса Angular не с чем сопоставить конфигурацию провайдера.

```angular-ts {avoid, header: "Can't inject interface"}
interface UserConfig {
  name: string;
  email: string;
}

@Component({
  selector: 'app-profile',
  template: '<p>Profile</p>',
})
export class UserProfile {
  // ERROR: Interfaces don't exist at runtime
  constructor(private config: UserConfig) {}
}
```

**Решение:** используйте `InjectionToken` для типов интерфейсов.

```angular-ts {prefer, header: 'Use InjectionToken for interfaces'}
import {InjectionToken, inject} from '@angular/core';

interface UserConfig {
  name: string;
  email: string;
}

export const USER_CONFIG = new InjectionToken<UserConfig>('user configuration');

// Provide the configuration
bootstrapApplication(App, {
  providers: [
    {
      provide: USER_CONFIG,
      useValue: {name: 'Alice', email: 'alice@example.com'},
    },
  ],
});

// Inject using the token
@Component({
  selector: 'app-profile',
  template: '<p>User: {{config.name}}</p>',
})
export class UserProfile {
  protected config = inject(USER_CONFIG);
}
```

`InjectionToken` существует в runtime и подходит для внедрения, а интерфейс `UserConfig` обеспечивает типобезопасность при разработке.

### Циклические зависимости {#circular-dependencies}

Циклические зависимости возникают, когда сервисы внедряют друг друга, создавая цикл, который Angular не может разрешить. Подробные объяснения и примеры кода см. в [NG0200: Circular dependency](errors/NG0200).

**Стратегии разрешения** (в порядке предпочтения):

1. **Реструктуризация** — вынести общую логику в третий сервис, разорвав цикл
2. **События** — заменить прямые зависимости на обмен событиями (например, `Subject`)
3. **Ленивое внедрение** — использовать `Injector.get()` для отложенной зависимости (крайний случай)

NOTE: Не используйте `forwardRef()` для циклических зависимостей сервисов — он решает только циклические импорты в конфигурациях standalone-компонентов.

## Отладка разрешения зависимостей {#debugging-dependency-resolution}

### Понимание процесса разрешения {#understanding-the-resolution-process}

Angular разрешает зависимости, поднимаясь по иерархии инжекторов. При `NullInjectorError` понимание порядка поиска помогает понять, куда добавить недостающий провайдер.

Angular ищет в таком порядке:

1. **Element injector** — текущий компонент или директива
2. **Родительские element injectors** — вверх по DOM через родительские компоненты
3. **Environment injector** — инжектор маршрута или приложения
4. **NullInjector** — выбрасывает `NullInjectorError`, если не найдено

При `NullInjectorError` сервис не предоставлен ни на одном уровне, доступном компоненту. Проверьте, что:

- у сервиса есть `@Service()` или
- у сервиса есть `@Injectable({providedIn: 'root'})`, или
- сервис есть в массиве `providers`, до которого компонент может дотянуться

Поведение поиска можно изменить модификаторами разрешения: `self`, `skipSelf`, `host` и `optional`. Полное описание правил и модификаторов — в [руководстве по иерархическим инжекторам](guide/di/hierarchical-dependency-injection).

### Использование Angular DevTools {#using-angular-devtools}

Angular DevTools включает инспектор дерева инжекторов, который визуализирует всю иерархию и показывает, какие провайдеры доступны на каждом уровне. Об установке и общем использовании см. [документацию Angular DevTools по инжекторам](tools/devtools/injectors).

При отладке DI с помощью DevTools отвечайте на вопросы:

- **Предоставлен ли сервис?** Выберите компонент, в котором внедрение падает, и проверьте, есть ли сервис в разделе Injector.
- **На каком уровне?** Поднимитесь по дереву компонентов и найдите, где сервис реально предоставлен (компонент, маршрут или приложение).
- **Несколько экземпляров?** Если синглтон появляется в нескольких инжекторах компонентов, вероятно, он указан в `providers` компонентов вместо `@Service` или `providedIn: 'root'`.

Если сервис нигде не появляется, проверьте наличие декоратора `@Service` или запись в массиве `providers`.

### Логирование и трассировка внедрения {#logging-and-tracing-injection}

Когда DevTools недостаточно, используйте логирование для трассировки поведения внедрения.

#### Логирование создания сервиса {#logging-service-creation}

Добавьте console.log в конструкторы сервисов, чтобы видеть, когда сервисы создаются.

```ts
import {Service} from '@angular/core';

@Service()
export class UserClient {
  constructor() {
    console.log('UserClient created');
    console.trace(); // Shows call stack
  }

  getUser() {
    return {name: 'Alice'};
  }
}
```

При создании сервиса вы увидите сообщение и стек вызовов, показывающий, где произошло внедрение.

**На что смотреть:**

- Сколько раз вызывается конструктор? (для синглтонов — один раз)
- Где в коде происходит внедрение? (смотрите стек)
- Создаётся ли сервис в ожидаемое время? (старт приложения vs lazy)

#### Проверка доступности сервиса {#checking-service-availability}

Используйте опциональное внедрение с логированием, чтобы определить доступность сервиса.

```angular-ts
import {Component, inject} from '@angular/core';
import {UserClient} from './user-client';

@Component({
  selector: 'app-debug',
  template: '<p>Debug Component</p>',
})
export class DebugView {
  private userService = inject(UserClient, {optional: true});

  constructor() {
    if (this.userService) {
      console.log('UserClient available:', this.userService);
    } else {
      console.warn('UserClient NOT available');
      console.trace(); // Shows where we tried to inject
    }
  }
}
```

Этот паттерн помогает проверить доступность сервиса без падения приложения.

#### Логирование модификаторов разрешения {#logging-resolution-modifiers}

Проверяйте разные стратегии разрешения с логированием.

```angular-ts
import {Component, inject} from '@angular/core';
import {UserClient} from './user-client';

@Component({
  selector: 'app-debug',
  template: '<p>Debug Component</p>',
  providers: [UserClient],
})
export class DebugView {
  // Try to get local instance
  private localService = inject(UserClient, {self: true, optional: true});

  // Try to get parent instance
  private parentService = inject(UserClient, {
    skipSelf: true,
    optional: true,
  });

  constructor() {
    console.log('Local instance:', this.localService);
    console.log('Parent instance:', this.parentService);
    console.log('Same instance?', this.localService === this.parentService);
  }
}
```

Так видно, какие экземпляры доступны на разных уровнях инжекторов.

### Рабочий процесс отладки {#debugging-workflow}

При сбое DI следуйте систематическому подходу:

**Шаг 1: Прочитайте сообщение об ошибке**

- Определите код ошибки (NG0200, NG0203 и т.д.)
- Прочитайте путь зависимостей
- Отметьте, какой токен не удалось разрешить

**Шаг 2: Проверьте основы**

- Есть ли у сервиса `@Service` или `@Injectable()`?
- Если используется `@Injectable`, корректно ли задан `providedIn`?
- Верны ли импорты?
- Включён ли файл в компиляцию?

**Шаг 3: Проверьте контекст внедрения**

- Вызывается ли `inject()` в допустимом контексте?
- Есть ли проблемы с async (await, setTimeout, promises)?
- Верно ли время вызова (не после destroy)?

**Шаг 4: Используйте инструменты отладки**

- Откройте Angular DevTools
- Проверьте иерархию инжекторов
- Добавьте console.log в конструкторы
- Используйте опциональное внедрение для проверки доступности

**Шаг 5: Упростите и изолируйте**

- Убирайте зависимости по одной
- Тестируйте в минимальном компоненте
- Проверяйте каждый уровень инжектора отдельно
- Создайте воспроизводимый кейс

## Справочник ошибок DI {#di-error-reference}

В этом разделе — подробная информация о конкретных кодах ошибок Angular DI. Используйте его как справочник при появлении этих ошибок в консоли.

### NullInjectorError: No provider for [Service] {#nullinjectorerror-no-provider-for-service}

**Код ошибки:** нет (отображается как `NullInjectorError`)

Ошибка возникает, когда Angular не находит провайдер для токена в иерархии инжекторов. Сообщение включает путь зависимостей, показывающий, где пытались внедрить.

```
NullInjectorError: No provider for UserClient!
  Dependency path: App -> AuthClient -> UserClient
```

Путь показывает: `App` внедрил `AuthClient`, который пытался внедрить `UserClient`, но провайдер не найден.

#### Отсутствует декоратор `@Service` или `@Injectable` {#missing-the-service-or-injectable-decorator}

Самая частая причина — забытый декоратор `@Service` или `@Injectable()` на классе сервиса.

```ts {avoid, header: 'Missing decorator'}
export class UserClient {
  getUser() {
    return {name: 'Alice'};
  }
}
```

Angular требует `@Service()` для генерации метаданных, нужных для внедрения зависимостей.

```ts {prefer, header: 'Include @Service'}
import {Service} from '@angular/core';

@Service()
export class UserClient {
  getUser() {
    return {name: 'Alice'};
  }
}
```

NOTE: Классы с конструкторами без аргументов могут работать без `@Service()`, но это не рекомендуется. Всегда добавляйте декоратор для согласованности и чтобы избежать проблем при добавлении зависимостей позже.

#### Отсутствует конфигурация providedIn {#missing-providedin-configuration}

У сервиса может быть `@Injectable()`, но не указано, где его предоставлять.

```ts {avoid, header: 'No providedIn specified'}
import {Injectable} from '@angular/core';

@Injectable()
export class UserClient {
  getUser() {
    return {name: 'Alice'};
  }
}
```

Используйте декоратор `@Service`, чтобы сделать сервис доступным во всём приложении.

```ts {prefer, header: 'Specify providedIn'}
import {Service} from '@angular/core';

@Service()
export class UserClient {
  getUser() {
    return {name: 'Alice'};
  }
}
```

Декоратор `@Service` делает сервис доступным на уровне приложения и включает tree-shaking (сервис удаляется из бандла, если никогда не внедряется).

#### Standalone-компонент без импортов {#standalone-component-missing-imports}

В Angular v20+ со standalone-компонентами зависимости нужно явно импортировать или предоставлять в каждом компоненте.

```angular-ts {avoid, header: 'Missing service import'}
import {Component, inject} from '@angular/core';
import {UserClient} from './user-client';

@Component({
  selector: 'app-profile',
  template: '<p>User: {{user().name}}</p>',
})
export class UserProfile {
  private userService = inject(UserClient); // ERROR: No provider
  user = this.userService.getUser();
}
```

Убедитесь, что сервис использует `@Service`, или добавьте его в массив `providers` компонента.

```angular-ts {prefer, header: 'Service uses providedIn: root'}
import {Component, inject} from '@angular/core';
import {UserClient} from './user-client';

@Component({
  selector: 'app-profile',
  template: '<p>User: {{user().name}}</p>',
})
export class UserProfile {
  private userService = inject(UserClient); // Works: providedIn: 'root'
  user = this.userService.getUser();
}
```

#### Отладка по пути зависимостей {#debugging-with-the-dependency-path}

Путь зависимостей в сообщении об ошибке показывает цепочку внедрений, приведшую к сбою.

```
NullInjectorError: No provider for LoggerStore!
  Dependency path: App -> DataStore -> ApiClient -> LoggerStore
```

Этот путь говорит:

1. `App` внедрил `DataStore`
2. `DataStore` внедрил `ApiClient`
3. `ApiClient` пытался внедрить `LoggerStore`
4. Провайдер для `LoggerStore` не найден

Начинайте расследование с конца цепочки (`LoggerStore`) и проверяйте его конфигурацию.

#### Проверка доступности провайдера через опциональное внедрение {#checking-provider-availability-with-optional-injection}

Используйте опциональное внедрение, чтобы проверить наличие провайдера без ошибки.

```angular-ts
import {Component, inject} from '@angular/core';
import {UserClient} from './user-client';

@Component({
  selector: 'app-debug',
  template: '<p>Service available: {{serviceAvailable}}</p>',
})
export class DebugView {
  private userService = inject(UserClient, {optional: true});
  serviceAvailable = this.userService !== null;
}
```

Опциональное внедрение возвращает `null`, если провайдер не найден, позволяя обработать отсутствие корректно.

### NG0203: inject() must be called from an injection context {#ng0203-inject-must-be-called-from-an-injection-context}

**Код ошибки:** NG0203

Ошибка возникает при вызове `inject()` вне допустимого контекста внедрения. Angular требует синхронный вызов `inject()` во время создания класса или выполнения фабрики.

```
NG0203: inject() must be called from an injection context such as a
constructor, a factory function, a field initializer, or a function
used with `runInInjectionContext`.
```

#### Допустимые контексты внедрения {#valid-injection-contexts}

Angular разрешает `inject()` в следующих местах:

1. **Инициализаторы полей класса**

   ```angular-ts
   import {Component, inject} from '@angular/core';
   import {UserClient} from './user-client';

   @Component({
     selector: 'app-profile',
     template: '<p>User: {{user().name}}</p>',
   })
   export class UserProfile {
     private userService = inject(UserClient); // Valid
     user = this.userService.getUser();
   }
   ```

2. **Конструктор класса**

   ```angular-ts
   import {Component, inject} from '@angular/core';
   import {UserClient} from './user-client';

   @Component({
     selector: 'app-profile',
     template: '<p>User: {{user().name}}</p>',
   })
   export class UserProfile {
     private userService: UserClient;

     constructor() {
       this.userService = inject(UserClient); // Valid
     }

     user = this.userService.getUser();
   }
   ```

3. **Фабричные функции провайдеров**

   ```ts
   import {inject, InjectionToken} from '@angular/core';
   import {UserClient} from './user-client';

   export const GREETING = new InjectionToken<string>('greeting', {
     factory() {
       const userService = inject(UserClient); // Valid
       const user = userService.getUser();
       return `Hello, ${user.name}`;
     },
   });
   ```

4. **Внутри runInInjectionContext()**

   ```angular-ts
   import {Component, inject, Injector} from '@angular/core';
   import {UserClient} from './user-client';

   @Component({
     selector: 'app-profile',
     template: '<button (click)="loadUser()">Load User</button>',
   })
   export class UserProfile {
     private injector = inject(Injector);

     loadUser() {
       this.injector.runInInjectionContext(() => {
         const userService = inject(UserClient); // Valid
         console.log(userService.getUser());
       });
     }
   }
   ```

Другие контексты, где `inject()` также работает:

- [provideAppInitializer](api/core/provideAppInitializer)
- [provideEnvironmentInitializer](api/core/provideEnvironmentInitializer)
- Функциональные [route guards](guide/routing/route-guards)
- Функциональные [data resolvers](guide/routing/data-resolvers)

#### Когда возникает эта ошибка {#when-this-error-occurs}

Ошибка возникает при:

- вызове `inject()` в хуках жизненного цикла (`ngOnInit`, `ngAfterViewInit` и т.д.)
- вызове `inject()` после `await` в async-функциях
- вызове `inject()` в колбэках (`setTimeout`, `Promise.then()` и т.д.)
- вызове `inject()` вне фазы создания класса

Подробные примеры и решения — в разделе «Некорректное использование inject()».

#### Решения и обходные пути {#solutions-and-workarounds}

**Решение 1:** захватывайте зависимости в инициализаторах полей (самый частый случай)

```ts
private userService = inject(UserClient) // Capture at class level
```

**Решение 2:** используйте `runInInjectionContext()` для колбэков

```ts
private injector = inject(Injector)

someCallback() {
  this.injector.runInInjectionContext(() => {
    const service = inject(MyClient)
  })
}
```

**Решение 3:** передавайте зависимости параметрами вместо внедрения внутри

```ts
// Instead of injecting inside a callback
setTimeout(() => {
  const service = inject(MyClient) // ERROR
}, 1000)

// Capture first, then use
private service = inject(MyClient)

setTimeout(() => {
  this.service.doSomething() // Use captured reference
}, 1000)
```

### NG0200: Circular dependency detected {#ng0200-circular-dependency-detected}

**Код ошибки:** NG0200

Ошибка возникает, когда два или более сервисов зависят друг от друга, создавая циклическую зависимость, которую Angular не может разрешить.

```
NG0200: Circular dependency in DI detected for AuthClient
  Dependency path: AuthClient -> UserClient -> AuthClient
```

Путь показывает цикл: `AuthClient` зависит от `UserClient`, который снова зависит от `AuthClient`.

#### Понимание ошибки {#understanding-the-error}

Angular создаёт экземпляры сервисов, вызывая конструкторы и внедряя зависимости. При циклической зависимости сервисов Angular не может определить, какой создать первым.

#### Частые причины {#common-causes}

- Прямая циклическая зависимость (Service A → Service B → Service A)
- Косвенная циклическая зависимость (Service A → Service B → Service C → Service A)
- Циклы импортов в файлах модулей, у которых также есть зависимости сервисов

#### Стратегии разрешения {#resolution-strategies}

См. раздел «Циклические зависимости» для подробных примеров и решений:

1. **Реструктуризация** — вынести общую логику в третий сервис (рекомендуется)
2. **События** — заменить прямые зависимости на обмен событиями
3. **Ленивое внедрение** — использовать `Injector.get()` для отложенной зависимости (крайний случай)

НЕ используйте `forwardRef()` для циклических зависимостей сервисов. Он решает только циклические импорты в конфигурациях компонентов.

### Другие коды ошибок DI {#other-di-error-codes}

Подробные объяснения и решения этих ошибок см. в [справочнике ошибок Angular](errors):

| Код ошибки              | Описание                                                                                   |
| ----------------------- | ------------------------------------------------------------------------------------------ |
| [NG0204](errors/NG0204) | Can't resolve all parameters — отсутствует декоратор `@Injectable()`                       |
| [NG0205](errors/NG0205) | Injector already destroyed — доступ к сервисам после уничтожения компонента                |
| [NG0207](errors/NG0207) | EnvironmentProviders в неверном контексте — `provideHttpClient()` в providers компонента   |

## Следующие шаги {#next-steps}

При ошибках DI помните:

1. Внимательно прочитайте сообщение об ошибке и путь зависимостей
2. Проверьте базовую конфигурацию (декораторы, `providedIn`, импорты)
3. Проверьте контекст внедрения и время вызова
4. Используйте DevTools и логирование для расследования
5. Упростите и изолируйте проблему

Для более глубокого понимания отдельных тем DI см.:

- [Понимание внедрения зависимостей](guide/di) — основные концепции и паттерны DI
- [Иерархическое внедрение зависимостей](guide/di/hierarchical-dependency-injection) — как работает иерархия инжекторов
- [Тестирование с внедрением зависимостей](guide/testing) — TestBed и моки зависимостей
