# Программный рендеринг компонентов

СОВЕТ: Это руководство предполагает, что вы уже ознакомились с [Руководством по основам](essentials). Прочитайте его в первую очередь, если вы новичок в Angular.

Помимо прямого использования компонента в шаблоне, можно также динамически рендерить компоненты
программно. Это полезно в ситуациях, когда компонент неизвестен заранее (и поэтому не может быть
напрямую указан в шаблоне) и зависит от каких-либо условий.

Существует два основных способа программного рендеринга компонента: в шаблоне с помощью `NgComponentOutlet`
или в TypeScript-коде с помощью `ViewContainerRef`.

ПОЛЕЗНО: для случаев ленивой загрузки (например, если нужно отложить загрузку тяжёлого компонента) рассмотрите
использование встроенной [функции `@defer`](/guide/templates/defer). Функция `@defer` позволяет автоматически извлекать
код любых компонентов, директив и Pipe внутри блока `@defer` в отдельные JavaScript-чанки и загружать их только при
необходимости, на основе настроенных триггеров.

## Использование NgComponentOutlet {#using-ngcomponentoutlet}

`NgComponentOutlet` — структурная директива, динамически рендерящая заданный компонент в
шаблоне.

```angular-ts
@Component({/*...*/})
export class AdminBio { /* ... */ }

@Component({/*...*/})
export class StandardBio { /* ... */ }

@Component({
  ...,
  template: `
    <p>Profile for {{user.name}}</p>
    <ng-container *ngComponentOutlet="getBioComponent()" /> `
})
export class CustomDialog {
  user = input.required<User>();

  getBioComponent() {
    return this.user().isAdmin ? AdminBio : StandardBio;
  }
}
```

### Передача inputs в динамически рендерируемые компоненты {#passing-inputs-to-dynamically-rendered-components}

Inputs можно передавать динамически рендерируемому компоненту с помощью свойства `ngComponentOutletInputs`. Это свойство принимает объект, где ключи — имена inputs, а значения — значения inputs.

```angular-ts
@Component({
  selector: 'user-greeting',
  template: `
    <div>
      <p>User: {{ username() }}</p>
      <p>Role: {{ role() }}</p>
    </div>
  `,
})
export class UserGreeting {
  username = input.required<string>();
  role = input('guest');
}

@Component({
  selector: 'profile-view',
  imports: [NgComponentOutlet],
  template: `<ng-container *ngComponentOutlet="greetingComponent; inputs: greetingInputs()" />`,
})
export class ProfileView {
  greetingComponent = UserGreeting;
  greetingInputs = signal({username: 'ngAwesome', role: 'admin'});
}
```

Inputs обновляются при каждом изменении сигнала `greetingInputs`, синхронизируя динамический компонент с состоянием родителя.

### Обеспечение проекции контента {#providing-content-projection}

Используйте `ngComponentOutletContent` для передачи проецируемого контента в динамически рендерируемый компонент. Это полезно, когда динамический компонент использует `<ng-content>` для отображения контента.

```angular-ts
@Component({
  selector: 'card-wrapper',
  template: `
    <div class="card">
      <ng-content />
    </div>
  `,
})
export class CardWrapper {}

@Component({
  imports: [NgComponentOutlet],
  template: `
    <ng-container *ngComponentOutlet="cardComponent; content: cardContent()" />

    <ng-template #contentTemplate>
      <h3>Dynamic Content</h3>
      <p>This content is projected into the card.</p>
    </ng-template>
  `,
})
export class DynamicCard {
  private vcr = inject(ViewContainerRef);
  cardComponent = CardWrapper;

  private contentTemplate = viewChild<TemplateRef<unknown>>('contentTemplate');

  cardContent = computed(() => {
    const template = this.contentTemplate();
    if (!template) return [];
    // Returns an array of projection slots. Each element represents one <ng-content> slot.
    // CardWrapper has one <ng-content>, so we return an array with one element.
    return [this.vcr.createEmbeddedView(template).rootNodes];
  });
}
```

ПРИМЕЧАНИЕ: Гидратация не поддерживает проецирование DOM-узлов, созданных с помощью нативных DOM API. Это вызывает [ошибку NG0503](/errors/NG0503). Используйте Angular API для создания проецируемого контента или добавьте `ngSkipHydration` к компоненту.

### Предоставление инжекторов {#providing-injectors}

Можно предоставить пользовательский инжектор динамически создаваемому компоненту с помощью `ngComponentOutletInjector`. Это полезно для предоставления сервисов или конфигурации, специфичных для компонента.

```angular-ts
export const THEME_DATA = new InjectionToken<string>('THEME_DATA', {
  factory: () => 'light',
});

@Component({
  selector: 'themed-panel',
  template: `<div [class]="theme">...</div>`,
})
export class ThemedPanel {
  theme = inject(THEME_DATA);
}

@Component({
  selector: 'dynamic-panel',
  imports: [NgComponentOutlet],
  template: `<ng-container *ngComponentOutlet="panelComponent; injector: customInjector" />`,
})
export class DynamicPanel {
  panelComponent = ThemedPanel;

  customInjector = Injector.create({
    providers: [{provide: THEME_DATA, useValue: 'dark'}],
  });
}
```

### Доступ к экземпляру компонента {#accessing-the-component-instance}

Получить доступ к экземпляру динамически созданного компонента можно с помощью функции `exportAs` директивы:

```angular-ts
@Component({
  selector: 'counter',
  template: `<p>Count: {{ count() }}</p>`,
})
export class Counter {
  count = signal(0);
  increment() {
    this.count.update((c) => c + 1);
  }
}

@Component({
  imports: [NgComponentOutlet],
  template: `
    <ng-container [ngComponentOutlet]="counterComponent" #outlet="ngComponentOutlet" />

    <button (click)="outlet.componentInstance?.increment()">Increment</button>
  `,
})
export class CounterHost {
  counterComponent = Counter;
}
```

ПРИМЕЧАНИЕ: Свойство `componentInstance` равно `null` до рендеринга компонента.

Подробнее о возможностях директивы см. в [справочнике API NgComponentOutlet](api/common/NgComponentOutlet).

## Использование ViewContainerRef {#using-viewcontainerref}

**Контейнер представления** — это узел в дереве компонентов Angular, который может содержать контент. Любой
компонент или директива может внедрить `ViewContainerRef` для получения ссылки на контейнер представления,
соответствующий местоположению этого компонента или директивы в DOM.

Метод `createComponent` на `ViewContainerRef` позволяет динамически создавать и рендерить
компонент. При создании нового компонента с помощью `ViewContainerRef` Angular добавляет его в
DOM как следующего соседа компонента или директивы, внедрившей `ViewContainerRef`.

```angular-ts
@Component({
  selector: 'leaf-content',
  template: `This is the leaf content`,
})
export class LeafContent {}

@Component({
  selector: 'outer-container',
  template: `
    <p>This is the start of the outer container</p>
    <inner-item />
    <p>This is the end of the outer container</p>
  `,
})
export class OuterContainer {}

@Component({
  selector: 'inner-item',
  template: `<button (click)="loadContent()">Load content</button>`,
})
export class InnerItem {
  private viewContainer = inject(ViewContainerRef);

  loadContent() {
    this.viewContainer.createComponent(LeafContent);
  }
}
```

В примере выше нажатие кнопки «Load content» приводит к следующей структуре DOM:

```angular-html
<outer-container>
  <p>This is the start of the outer container</p>
  <inner-item>
    <button>Load content</button>
  </inner-item>
  <leaf-content>This is the leaf content</leaf-content>
  <p>This is the end of the outer container</p>
</outer-container>
```

## Ленивая загрузка компонентов {#lazy-loading-components}

ПОЛЕЗНО: если нужно выполнить ленивую загрузку некоторых компонентов, рассмотрите использование встроенной [функции `@defer`](/guide/templates/defer).

Если ваш случай использования не покрывается функцией `@defer`, можно использовать `NgComponentOutlet` или
`ViewContainerRef` совместно со стандартным JavaScript [динамическим импортом](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/import).

```angular-ts
@Component({
  ...,
  template: `
    <section>
      <h2>Basic settings</h2>
      <basic-settings />
    </section>
    <section>
      <h2>Advanced settings</h2>
      @if(!advancedSettings) {
        <button (click)="loadAdvanced()">
          Load advanced settings
        </button>
      }
      <ng-container *ngComponentOutlet="advancedSettings" />
    </section>
  `
})
export class AdminSettings {
  advancedSettings: {new(): AdvancedSettings} | undefined;

  async loadAdvanced() {
    const { AdvancedSettings } = await import('path/to/advanced_settings.js');
    this.advancedSettings = AdvancedSettings;
  }
}
```

Пример выше загружает и отображает `AdvancedSettings` при нажатии кнопки.

## Привязка inputs, outputs и установка host-директив при создании {#binding-inputs-outputs-and-setting-host-directives-at-creation}

При динамическом создании компонентов ручная установка inputs и подписка на outputs могут быть подвержены ошибкам. Нередко приходится писать дополнительный код только для настройки привязок после инстанцирования компонента.

Для упрощения этого процесса и `createComponent`, и `ViewContainerRef.createComponent` поддерживают передачу массива `bindings` с вспомогательными функциями `inputBinding()`, `outputBinding()` и `twoWayBinding()` для предварительной настройки inputs и outputs. Также можно указать массив `directives` для применения host-директив. Это позволяет создавать компоненты программно с похожими на шаблонные привязки в одном декларативном вызове.

### Host-представление с помощью `ViewContainerRef.createComponent` {#host-view-using-viewcontainerref-createcomponent}

`ViewContainerRef.createComponent` создаёт компонент и автоматически вставляет его host-представление и host-элемент в иерархию представлений контейнера в его местоположении. Используйте это, когда динамический компонент должен стать частью логической и визуальной структуры контейнера (например, при добавлении элементов списка или встроенного UI).

Напротив, автономный API `createComponent` не присоединяет новый компонент ни к какому существующему представлению или местоположению в DOM — он возвращает `ComponentRef` и даёт явный контроль над тем, куда поместить host-элемент компонента.

```angular-ts
import {Component, input, model, output} from '@angular/core';

@Component({
  selector: 'app-warning',
  template: `
    @if (isExpanded()) {
      <section>
        <p>Warning: Action needed!</p>
        <button (click)="close.emit(true)">Close</button>
      </section>
    }
  `,
})
export class AppWarning {
  readonly canClose = input.required<boolean>();
  readonly isExpanded = model<boolean>();
  readonly close = output<boolean>();
}
```

```ts
import {
  Component,
  ViewContainerRef,
  signal,
  inputBinding,
  outputBinding,
  twoWayBinding,
  inject,
} from '@angular/core';
import {FocusTrap} from '@angular/cdk/a11y';
import {ThemeDirective} from '../theme.directive';

@Component({
  template: `<ng-container #container />`,
})
export class Host {
  private vcr = inject(ViewContainerRef);
  readonly canClose = signal(true);
  readonly isExpanded = signal(true);

  showWarning() {
    const compRef = this.vcr.createComponent(AppWarning, {
      bindings: [
        inputBinding('canClose', this.canClose),
        twoWayBinding('isExpanded', this.isExpanded),
        outputBinding<boolean>('close', (confirmed) => {
          console.log('Closed with result:', confirmed);
        }),
      ],
      directives: [
        FocusTrap,
        {type: ThemeDirective, bindings: [inputBinding('theme', () => 'warning')]},
      ],
    });
  }
}
```

В примере выше динамический **AppWarning** создаётся с привязкой Input `canClose` к реактивному сигналу, двусторонней привязкой состояния `isExpanded` и слушателем output `close`. `FocusTrap` и `ThemeDirective` присоединяются к host-элементу через `directives`.

### Всплывающее окно, прикреплённое к `document.body` с помощью `createComponent` + `hostElement` {#popup-attached-to-document-body-with-createcomponent-hostelement}

Используйте это при рендеринге за пределами текущей иерархии представлений (например, для оверлеев). Предоставленный `hostElement` становится host-элементом компонента в DOM, поэтому Angular не создаёт новый элемент по селектору. Позволяет настраивать **привязки** напрямую.

```ts
import {
  ApplicationRef,
  createComponent,
  EnvironmentInjector,
  inject,
  Injectable,
  inputBinding,
  outputBinding,
} from '@angular/core';
import {Popup} from './popup';

@Injectable({providedIn: 'root'})
export class PopupService {
  private readonly injector = inject(EnvironmentInjector);
  private readonly appRef = inject(ApplicationRef);

  show(message: string) {
    // Create a host element for the popup
    const host = document.createElement('popup-host');

    // Create the component and bind in one call
    const ref = createComponent(Popup, {
      environmentInjector: this.injector,
      hostElement: host,
      bindings: [
        inputBinding('message', () => message),
        outputBinding('closed', () => {
          document.body.removeChild(host);
          this.appRef.detachView(ref.hostView);
          ref.destroy();
        }),
      ],
    });

    // Registers the component's view so it participates in change detection cycle.
    this.appRef.attachView(ref.hostView);
    // Inserts the provided host element into the DOM (outside the normal Angular view hierarchy).
    // This is what makes the popup visible on screen, typically used for overlays or modals.
    document.body.appendChild(host);
  }
}
```
