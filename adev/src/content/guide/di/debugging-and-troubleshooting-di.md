# Отладка и устранение неполадок внедрения зависимостей {#debugging-and-troubleshooting-dependency-injection}

Проблемы с внедрением зависимостей (DI) обычно возникают из-за ошибок конфигурации, проблем с областью видимости или неправильных шаблонов использования. Это руководство поможет вам выявить и устранить распространённые проблемы DI, с которыми сталкиваются разработчики.

## Распространённые ошибки и их решения {#common-pitfalls-and-solutions}

### Сервисы недоступны там, где ожидается {#services-not-available-where-expected}

Одна из наиболее распространённых проблем DI возникает, когда вы пытаетесь внедрить сервис, но Angular не может найти его в текущем инжекторе или каком-либо родительском инжекторе. Обычно это происходит, когда сервис предоставлен в неправильной области видимости или не предоставлен вообще.

#### Несоответствие области видимости провайдера {#provider-scope-mismatch}

Когда вы предоставляете сервис в массиве `providers` компонента, Angular создаёт экземпляр в инжекторе этого компонента. Этот экземпляр доступен только этому компоненту и его дочерним компонентам. Родительские и соседние компоненты не могут получить к нему доступ, поскольку используют другие инжекторы.

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

Angular выполняет поиск только вверх по иерархии, никогда вниз. Родительские компоненты не могут получить доступ к сервисам, предоставленным в дочерних компонентах.

**Решение:** Предоставьте сервис на более высоком уровне (приложения или родительского компонента).

```ts {prefer}
import {Injectable} from '@angular/core';

@Injectable({providedIn: 'root'})
export class DataStore {
  // Available everywhere
}
```

TIP: По умолчанию используйте `providedIn: 'root'` для сервисов, которым не нужно состояние, специфичное для компонента. Это делает сервисы доступными везде и позволяет выполнять tree-shaking.

#### Сервисы и маршруты с отложенной загрузкой {#services-and-lazy-loaded-routes}

Когда вы предоставляете сервис в массиве `providers` маршрута с отложенной загрузкой, Angular создаёт дочерний инжектор для этого маршрута. Этот инжектор и его сервисы становятся доступными только после загрузки маршрута. Компоненты в немедленно загружаемых частях приложения не могут получить доступ к этим сервисам, поскольку используют другие инжекторы, существующие до создания инжектора с отложенной загрузкой.

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

Маршруты с отложенной загрузкой создают дочерние инжекторы, которые становятся доступными только после загрузки маршрута.

NOTE: По умолчанию инжекторы маршрутов и их сервисы сохраняются даже после перехода с маршрута. Они не уничтожаются до закрытия приложения. Для автоматической очистки неиспользуемых инжекторов маршрутов см. [настройку поведения маршрутов](guide/routing/customizing-route-behavior#experimental-automatic-cleanup-of-unused-route-injectors).

**Решение:** Используйте `providedIn: 'root'` для сервисов, которые должны быть доступны за пределами границ отложенной загрузки.

```ts {prefer, header: 'Provide at root for shared services'}
import {Injectable} from '@angular/core';

@Injectable({providedIn: 'root'})
export class FeatureClient {
  // Available everywhere, including before lazy load
}
```

Если сервис должен загружаться отложенно, но при этом быть доступен для немедленно загружаемых компонентов, внедряйте его только там, где он нужен, и используйте опциональное внедрение для обработки доступности.

### Несколько экземпляров вместо одиночки {#multiple-instances-instead-of-singletons}

Вы ожидаете один общий экземпляр (одиночка), но получаете отдельные экземпляры в разных компонентах.

#### Предоставление в компоненте вместо root {#providing-in-component-instead-of-root}

Когда вы добавляете сервис в массив `providers` компонента, Angular создаёт новый экземпляр этого сервиса для каждого экземпляра компонента. Каждый компонент получает свой отдельный экземпляр сервиса, а это означает, что изменения в одном компоненте не влияют на экземпляр сервиса в других компонентах. Это часто неожиданно, когда нужно общее состояние в приложении.

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

Каждый компонент получает собственный экземпляр `UserClient`. Изменения в одном компоненте не влияют на другой.

**Решение:** Используйте `providedIn: 'root'` для одиночек.

```ts {prefer, header: 'Root-level singleton'}
import {Injectable} from '@angular/core';

@Injectable({providedIn: 'root'})
export class UserClient {
  // Single instance shared across all components
}
```

#### Когда несколько экземпляров являются намеренными {#when-multiple-instances-are-intentional}

Иногда нужны отдельные экземпляры для каждого компонента — для компонентно-специфического состояния.

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

Этот шаблон полезен для:

- Управления состоянием форм (каждая форма имеет изолированное состояние)
- Компонентно-специфического кэширования
- Временных данных, которые не должны быть общими

### Неправильное использование inject() {#incorrect-inject-usage}

Функция `inject()` работает только в определённых контекстах во время создания класса и выполнения фабрики.

#### Использование inject() в хуках жизненного цикла {#using-inject-in-lifecycle-hooks}

Когда вы вызываете функцию `inject()` внутри хуков жизненного цикла, таких как `ngOnInit()`, `ngAfterViewInit()` или `ngOnDestroy()`, Angular выдаёт ошибку, поскольку эти методы выполняются вне контекста внедрения. Контекст внедрения доступен только во время синхронного выполнения конструктора класса, которое происходит до вызова хуков жизненного цикла.

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

**Решение:** Захватывайте зависимости и вычисляйте значения в инициализаторах полей.

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

#### Использование runInInjectionContext для обратных вызовов {#using-runInInjectionContext-for-callbacks}

Используйте `runInInjectionContext()`, когда нужно позволить **другому коду** вызывать `inject()`. Это полезно при принятии обратных вызовов, которые могут использовать внедрение зависимостей:

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

Метод `runInInjectionContext()` создаёт временный контекст внедрения, позволяя коду внутри обратного вызова вызывать `inject()`.

IMPORTANT: По возможности всегда захватывайте зависимости на уровне класса. Используйте `injector.get()` для простого отложенного получения, а `runInInjectionContext()` — только когда внешнему коду нужно вызывать `inject()`.

TIP: Используйте `assertInInjectionContext()` для проверки того, что ваш код выполняется в допустимом контексте внедрения. Это полезно при создании многократно используемых функций, вызывающих `inject()`. Подробнее см. [Проверка контекста](guide/di/dependency-injection-context#asserts-the-context).

### Путаница между providers и viewProviders {#providers-vs-viewproviders-confusion}

Разница между `providers` и `viewProviders` влияет на сценарии с проецированием содержимого.

#### Понимание разницы {#understanding-the-difference}

**providers:** Доступен для шаблона компонента И для любого содержимого, проецируемого в компонент (ng-content).

**viewProviders:** Доступен только для шаблона компонента, НЕ для проецируемого содержимого.

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

**При проецировании в `app-parent`:** Дочерний компонент может внедрить `ThemeStore`, поскольку `providers` делает его доступным для проецируемого содержимого.

**При проецировании в `app-parent-view`:** Дочерний компонент не может внедрить `ThemeStore`, поскольку `viewProviders` ограничивает его доступность только шаблоном родительского компонента.

#### Выбор между providers и viewProviders {#choosing-between-providers-and-viewproviders}

Используйте `providers`, когда:

- Сервис должен быть доступен для проецируемого содержимого
- Нужно, чтобы дочерние компоненты содержимого имели доступ к сервису
- Предоставляются сервисы общего назначения

Используйте `viewProviders`, когда:

- Сервис должен быть доступен только для шаблона вашего компонента
- Нужно скрыть детали реализации от проецируемого содержимого
- Предоставляются внутренние сервисы, которые не должны «утекать» наружу

**Рекомендация по умолчанию:** Используйте `providers`, если нет конкретной причины ограничивать доступ с помощью `viewProviders`.

### Проблемы с InjectionToken {#injectiontoken-issues}

При использовании `InjectionToken` для зависимостей, не являющихся классами, разработчики часто сталкиваются с проблемами, связанными с идентичностью токена, типобезопасностью и конфигурацией провайдера. Эти проблемы обычно обусловлены тем, как JavaScript обрабатывает идентичность объектов и как TypeScript выводит типы.

#### Путаница с идентичностью токена {#token-identity-confusion}

Когда вы создаёте новый экземпляр `InjectionToken`, JavaScript создаёт уникальный объект в памяти. Даже если создать другой `InjectionToken` с точно такой же строкой описания, это будет совершенно другой объект. Angular использует идентичность объекта токена (а не его описание) для сопоставления провайдеров с точками внедрения, поэтому токены с одинаковым описанием, но разной идентичностью не могут получать доступ к значениям друг друга.

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

Хотя оба токена имеют описание `'app config'`, они являются разными объектами. Angular сравнивает токены по ссылке, а не по описанию.

**Решение:** Импортируйте один и тот же экземпляр токена.

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

TIP: Всегда экспортируйте токены из общего файла и импортируйте их везде, где они нужны. Никогда не создавайте несколько экземпляров `InjectionToken` с одинаковым описанием.

#### Попытка внедрить интерфейсы {#trying-to-inject-interfaces}

Когда вы определяете интерфейс TypeScript, он существует только во время компиляции для проверки типов. TypeScript удаляет все определения интерфейсов при компиляции в JavaScript, поэтому во время выполнения нет объекта, который Angular мог бы использовать как токен внедрения. При попытке внедрить тип интерфейса Angular не может сопоставить его с конфигурацией провайдера.

```angular-ts {avoid, header: 'Can\'t inject interface'}
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

**Решение:** Используйте `InjectionToken` для типов интерфейсов.

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

`InjectionToken` существует во время выполнения и может использоваться для внедрения, тогда как интерфейс `UserConfig` обеспечивает типобезопасность во время разработки.

### Циклические зависимости {#circular-dependencies}

Циклические зависимости возникают, когда сервисы внедряют друг друга, создавая цикл, который Angular не может разрешить. Подробные объяснения и примеры кода см. в [NG0200: Circular dependency](errors/NG0200).

**Стратегии разрешения** (в порядке предпочтения):

1. **Реструктуризация** — вынесите общую логику в третий сервис, разрывая цикл
2. **Использование событий** — замените прямые зависимости событийным взаимодействием (например, `Subject`)
3. **Отложенное внедрение** — используйте `Injector.get()` для откладывания одной зависимости (крайний случай)

NOTE: Не используйте `forwardRef()` для циклических зависимостей сервисов — он решает только проблему циклических импортов в конфигурациях standalone-компонентов.

## Отладка разрешения зависимостей {#debugging-dependency-resolution}

### Понимание процесса разрешения {#understanding-the-resolution-process}

Angular разрешает зависимости, поднимаясь вверх по иерархии инжекторов. При возникновении `NullInjectorError` понимание порядка поиска помогает определить, где добавить недостающий провайдер.

Angular выполняет поиск в следующем порядке:

1. **Инжектор элемента** — текущий компонент или директива
2. **Инжекторы родительских элементов** — вверх по дереву DOM через родительские компоненты
3. **Инжектор среды** — инжектор маршрута или приложения
4. **NullInjector** — выбрасывает `NullInjectorError`, если провайдер не найден

Когда вы видите `NullInjectorError`, сервис не предоставлен ни на одном уровне, доступном компоненту. Проверьте, что:

- Сервис имеет `@Injectable({providedIn: 'root'})`, или
- Сервис находится в массиве `providers`, доступном компоненту

Это поведение поиска можно изменить с помощью модификаторов разрешения: `self`, `skipSelf`, `host` и `optional`. Подробное описание правил разрешения и модификаторов см. в [руководстве по иерархическим инжекторам](guide/di/hierarchical-dependency-injection).

### Использование Angular DevTools {#using-angular-devtools}

Angular DevTools включает инспектор дерева инжекторов, который визуализирует всю иерархию инжекторов и показывает, какие провайдеры доступны на каждом уровне. Информацию об установке и общем использовании см. в [документации по инжекторам Angular DevTools](tools/devtools/injectors).

При отладке проблем DI используйте DevTools для ответа на следующие вопросы:

- **Предоставлен ли сервис?** Выберите компонент, в котором не удаётся выполнить внедрение, и проверьте, появляется ли сервис в разделе Injector.
- **На каком уровне?** Поднимайтесь по дереву компонентов, чтобы найти, где фактически предоставлен сервис (уровень компонента, маршрута или приложения).
- **Несколько экземпляров?** Если singleton-сервис появляется в нескольких инжекторах компонентов, вероятно, он предоставлен в массивах `providers` компонентов вместо использования `providedIn: 'root'`.

Если сервис не появляется ни в одном инжекторе, убедитесь, что у него есть декоратор `@Injectable()` с `providedIn: 'root'` или он указан в массиве `providers`.

### Логирование и трассировка внедрения {#logging-and-tracing-injection}

Если DevTools недостаточно, используйте логирование для трассировки поведения внедрения.

#### Логирование создания сервиса {#logging-service-creation}

Добавьте вывод в консоль в конструкторы сервисов, чтобы видеть, когда создаются сервисы.

```ts
import {Injectable} from '@angular/core';

@Injectable({providedIn: 'root'})
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

При создании сервиса вы увидите сообщение журнала и трассировку стека, показывающую, где произошло внедрение.

**На что обращать внимание:**

- Сколько раз вызывается конструктор? (для одиночек должен быть один раз)
- В каком месте кода происходит внедрение? (проверьте трассировку стека)
- В ожидаемое ли время создаётся? (при запуске приложения vs. отложенно)

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

Этот шаблон помогает проверить доступность сервиса без аварийного завершения приложения.

#### Логирование модификаторов разрешения {#logging-resolution-modifiers}

Тестируйте различные стратегии разрешения с логированием.

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

Это покажет, какие экземпляры доступны на разных уровнях инжектора.

### Рабочий процесс отладки {#debugging-workflow}

При сбое DI следуйте систематическому подходу:

**Шаг 1: Прочитайте сообщение об ошибке**

- Определите код ошибки (NG0200, NG0203 и т.д.)
- Прочитайте путь зависимости
- Обратите внимание, какой токен дал сбой

**Шаг 2: Проверьте основы**

- Есть ли у сервиса `@Injectable()`?
- Правильно ли задан `providedIn`?
- Правильны ли импорты?
- Включён ли файл в компиляцию?

**Шаг 3: Проверьте контекст внедрения**

- Вызывается ли `inject()` в допустимом контексте?
- Проверьте наличие асинхронных проблем (await, setTimeout, промисы)
- Проверьте временные аспекты (не после уничтожения)

**Шаг 4: Используйте инструменты отладки**

- Откройте Angular DevTools
- Проверьте иерархию инжекторов
- Добавьте вывод в консоль в конструкторы
- Используйте опциональное внедрение для проверки доступности

**Шаг 5: Упростите и изолируйте**

- Удаляйте зависимости по одной
- Тестируйте в минимальном компоненте
- Проверяйте каждый уровень инжектора отдельно
- Создайте воспроизводящий пример

## Справочник ошибок DI {#di-error-reference}

В этом разделе приведена подробная информация о конкретных кодах ошибок Angular DI, которые вы можете встретить. Используйте его как справочник при появлении этих ошибок в консоли.

### NullInjectorError: No provider for [Service] {#nullinjectorerror-no-provider-for-service}

**Код ошибки:** Нет (отображается как `NullInjectorError`)

Эта ошибка возникает, когда Angular не может найти провайдер для токена в иерархии инжекторов. Сообщение об ошибке содержит путь зависимости, показывающий, где была предпринята попытка внедрения.

```
NullInjectorError: No provider for UserClient!
  Dependency path: App -> AuthClient -> UserClient
```

Путь зависимости показывает, что `App` внедрял `AuthClient`, который пытался внедрить `UserClient`, но провайдер не был найден.

#### Отсутствие декоратора @Injectable {#missing-injectable-decorator}

Наиболее распространённая причина — забытый декоратор `@Injectable()` на классе сервиса.

```ts {avoid, header: 'Missing decorator'}
export class UserClient {
  getUser() {
    return {name: 'Alice'};
  }
}
```

Angular требует декоратор `@Injectable()` для генерации метаданных, необходимых для внедрения зависимостей.

```ts {prefer, header: 'Include @Injectable'}
import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UserClient {
  getUser() {
    return {name: 'Alice'};
  }
}
```

NOTE: Классы с конструкторами без аргументов могут работать без `@Injectable()`, но это не рекомендуется. Всегда включайте декоратор для единообразия и во избежание проблем при последующем добавлении зависимостей.

#### Отсутствие конфигурации providedIn {#missing-providedin-configuration}

Сервис может иметь `@Injectable()`, но не указывать, где он должен быть предоставлен.

```ts {avoid, header: 'No providedIn specified'}
import {Injectable} from '@angular/core';

@Injectable()
export class UserClient {
  getUser() {
    return {name: 'Alice'};
  }
}
```

Укажите `providedIn: 'root'`, чтобы сделать сервис доступным во всём приложении.

```ts {prefer, header: 'Specify providedIn'}
import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UserClient {
  getUser() {
    return {name: 'Alice'};
  }
}
```

Конфигурация `providedIn: 'root'` делает сервис доступным во всём приложении и включает tree-shaking (сервис удаляется из бандла, если никогда не внедряется).

#### Отсутствующие импорты в standalone-компоненте {#standalone-component-missing-imports}

В Angular v20+ со standalone-компонентами необходимо явно импортировать или предоставлять зависимости в каждом компоненте.

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

Убедитесь, что сервис использует `providedIn: 'root'`, или добавьте его в массив `providers` компонента.

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

#### Отладка с помощью пути зависимости {#debugging-with-the-dependency-path}

Путь зависимости в сообщении об ошибке показывает цепочку внедрений, приведших к сбою.

```
NullInjectorError: No provider for LoggerStore!
  Dependency path: App -> DataStore -> ApiClient -> LoggerStore
```

Этот путь говорит о следующем:

1. `App` внедрял `DataStore`
2. `DataStore` внедрял `ApiClient`
3. `ApiClient` пытался внедрить `LoggerStore`
4. Провайдер для `LoggerStore` не был найден

Начните расследование с конца цепочки (`LoggerStore`) и проверьте наличие правильной конфигурации.

#### Проверка доступности провайдера с помощью опционального внедрения {#checking-provider-availability-with-optional-injection}

Используйте опциональное внедрение, чтобы проверить наличие провайдера без выброса ошибки.

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

Опциональное внедрение возвращает `null`, если провайдер не найден, что позволяет корректно обработать его отсутствие.

### NG0203: inject() must be called from an injection context {#ng0203-inject-must-be-called-from-an-injection-context}

**Код ошибки:** NG0203

Эта ошибка возникает, когда вы вызываете `inject()` вне допустимого контекста внедрения. Angular требует, чтобы `inject()` вызывался синхронно во время создания класса или выполнения фабрики.

```
NG0203: inject() must be called from an injection context such as a
constructor, a factory function, a field initializer, or a function
used with `runInInjectionContext`.
```

#### Допустимые контексты внедрения {#valid-injection-contexts}

Angular допускает вызов `inject()` в следующих местах:

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

Другие контексты внедрения, в которых также работает `inject()`, включают:

- [provideAppInitializer](api/core/provideAppInitializer)
- [provideEnvironmentInitializer](api/core/provideEnvironmentInitializer)
- Функциональные [Guard маршрутов](guide/routing/route-guards)
- Функциональные [резолверы данных](guide/routing/data-resolvers)

#### Когда возникает эта ошибка {#when-this-error-occurs}

Эта ошибка возникает при:

- Вызове `inject()` в хуках жизненного цикла (`ngOnInit`, `ngAfterViewInit` и т.д.)
- Вызове `inject()` после `await` в асинхронных функциях
- Вызове `inject()` в обратных вызовах (`setTimeout`, `Promise.then()` и т.д.)
- Вызове `inject()` вне фазы создания класса

Подробные примеры и решения см. в разделе «Неправильное использование inject()».

#### Решения и обходные пути {#solutions-and-workarounds}

**Решение 1:** Захватывайте зависимости в инициализаторах полей (наиболее распространённый вариант)

```ts
private userService = inject(UserClient) // Capture at class level
```

**Решение 2:** Используйте `runInInjectionContext()` для обратных вызовов

```ts
private injector = inject(Injector)

someCallback() {
  this.injector.runInInjectionContext(() => {
    const service = inject(MyClient)
  })
}
```

**Решение 3:** Передавайте зависимости как параметры вместо их внедрения

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

Эта ошибка возникает, когда два или более сервиса зависят друг от друга, создавая циклическую зависимость, которую Angular не может разрешить.

```
NG0200: Circular dependency in DI detected for AuthClient
  Dependency path: AuthClient -> UserClient -> AuthClient
```

Путь зависимости показывает цикл: `AuthClient` зависит от `UserClient`, который в свою очередь зависит от `AuthClient`.

#### Понимание ошибки {#understanding-the-error}

Angular создаёт экземпляры сервисов, вызывая их конструкторы и внедряя зависимости. Когда сервисы циклически зависят друг от друга, Angular не может определить, какой из них создавать первым.

#### Распространённые причины {#common-causes}

- Прямая циклическая зависимость (Сервис A → Сервис B → Сервис A)
- Косвенная циклическая зависимость (Сервис A → Сервис B → Сервис C → Сервис A)
- Циклы импортов в файлах модулей, имеющих также зависимости сервисов

#### Стратегии разрешения {#resolution-strategies}

Подробные примеры и решения см. в разделе «Циклические зависимости»:

1. **Реструктуризация** — вынесите общую логику в третий сервис (рекомендуется)
2. **Использование событий** — замените прямые зависимости событийным взаимодействием
3. **Отложенное внедрение** — используйте `Injector.get()` для откладывания одной зависимости (крайний случай)

НЕ используйте `forwardRef()` для циклических зависимостей сервисов. Он решает только проблему циклических импортов в конфигурациях компонентов.

### Другие коды ошибок DI {#other-di-error-codes}

Подробные объяснения и решения для этих ошибок см. в [справочнике ошибок Angular](errors):

| Код ошибки              | Описание                                                                                                     |
| ----------------------- | ------------------------------------------------------------------------------------------------------------ |
| [NG0204](errors/NG0204) | Невозможно разрешить все параметры — отсутствует декоратор `@Injectable()`                                   |
| [NG0205](errors/NG0205) | Инжектор уже уничтожен — обращение к сервисам после уничтожения компонента                                   |
| [NG0207](errors/NG0207) | EnvironmentProviders в неправильном контексте — использование `provideHttpClient()` в провайдерах компонента |

## Следующие шаги {#next-steps}

При возникновении ошибок DI помните, что нужно:

1. Внимательно прочитать сообщение об ошибке и путь зависимости
2. Проверить базовую конфигурацию (декораторы, `providedIn`, импорты)
3. Проверить контекст внедрения и временные аспекты
4. Использовать DevTools и логирование для расследования
5. Упростить и изолировать проблему

Для более глубокого понимания конкретных тем по внедрению зависимостей обратитесь к:

- [Понимание внедрения зависимостей](guide/di) — основные концепции и шаблоны DI
- [Иерархическое внедрение зависимостей](guide/di/hierarchical-dependency-injection) — как работает иерархия инжекторов
- [Тестирование с внедрением зависимостей](guide/testing) — использование TestBed и имитация зависимостей
