# Программный рендеринг компонентов {#programmatically-rendering-components}

TIP: В этом руководстве предполагается, что вы уже ознакомились с [Руководством по основам](essentials). Прочитайте его в первую очередь, если вы новичок в Angular.

Помимо использования компонента непосредственно в шаблоне, вы также можете динамически отображать компоненты программно. Это полезно в ситуациях, когда компонент заранее неизвестен (и поэтому не может быть указан в шаблоне напрямую) и зависит от каких-либо условий.

Существует два основных способа программного рендеринга компонента: в шаблоне с использованием `NgComponentOutlet` или в TypeScript-коде с использованием `ViewContainerRef`.

HELPFUL: Для сценариев ленивой загрузки (например, если вы хотите отложить загрузку тяжёлого компонента) рассмотрите использование встроенной [функции `@defer`](guide/templates/defer). Функция `@defer` позволяет автоматически выделить код всех компонентов, директив и pipe внутри блока `@defer` в отдельные JavaScript-чанки и загружать их только при необходимости, в зависимости от настроенных триггеров.

## Использование NgComponentOutlet {#using-ngcomponentoutlet}

`NgComponentOutlet` — это структурная директива, которая динамически отображает заданный компонент в шаблоне.

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

### Передача Input-свойств динамически отображаемым компонентам {#passing-inputs-to-dynamically-rendered-components}

Вы можете передавать Input-свойства динамически отображаемому компоненту с помощью свойства `ngComponentOutletInputs`. Это свойство принимает объект, где ключи — имена Input-свойств, а значения — соответствующие значения.

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

Input-свойства обновляются при каждом изменении сигнала `greetingInputs`, поддерживая динамический компонент в синхронизации с состоянием родительского компонента.

### Проекция контента {#providing-content-projection}

Используйте `ngComponentOutletContent` для передачи проецируемого контента динамически отображаемому компоненту. Это полезно, когда динамический компонент использует `<ng-content>` для отображения контента.

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

NOTE: Гидратация не поддерживает проецирование DOM-узлов, созданных с помощью нативных DOM API. Это вызывает [ошибку NG0503](errors/NG0503). Используйте Angular API для создания проецируемого контента или добавьте `ngSkipHydration` к компоненту.

### Предоставление инжекторов {#providing-injectors}

Вы можете предоставить пользовательский инжектор динамически создаваемому компоненту с помощью `ngComponentOutletInjector`. Это полезно для предоставления специфичных для компонента сервисов или конфигурации.

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

Вы можете получить доступ к экземпляру динамически созданного компонента с помощью функции `exportAs` директивы:

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

NOTE: Свойство `componentInstance` равно `null` до тех пор, пока компонент не будет отрисован.

Подробнее о возможностях директивы см. в [справочнике API NgComponentOutlet](api/common/NgComponentOutlet).

## Использование ViewContainerRef {#using-viewcontainerref}

**Контейнер представления** — это узел в дереве компонентов Angular, который может содержать контент. Любой компонент или директива может внедрить `ViewContainerRef` для получения ссылки на контейнер представления, соответствующий расположению этого компонента или директивы в DOM.

Вы можете использовать метод `createComponent` у `ViewContainerRef` для динамического создания и отображения компонента. Когда вы создаёте новый компонент с помощью `ViewContainerRef`, Angular добавляет его в DOM как следующий соседний элемент (sibling) того компонента или директивы, которая внедрила `ViewContainerRef`.

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

В примере выше нажатие кнопки «Load content» приводит к следующей DOM-структуре:

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

HELPFUL: Если вы хотите использовать ленивую загрузку компонентов, рассмотрите использование встроенной [функции `@defer`](guide/templates/defer).

Если ваш сценарий не покрывается функцией `@defer`, вы можете использовать `NgComponentOutlet` или `ViewContainerRef` со стандартным JavaScript [динамическим импортом](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/import).

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

В примере выше `AdvancedSettings` загружается и отображается по нажатию кнопки.

## Привязка Input, Output и установка хост-директив при создании {#binding-inputs-outputs-and-setting-host-directives-at-creation}

При динамическом создании компонентов ручная установка Input-свойств и подписка на Output-события может быть подвержена ошибкам. Часто приходится писать дополнительный код для настройки привязок после создания экземпляра компонента.

Для упрощения этого процесса как `createComponent`, так и `ViewContainerRef.createComponent` поддерживают передачу массива `bindings` с вспомогательными функциями `inputBinding()`, `outputBinding()` и `twoWayBinding()` для предварительной настройки Input и Output. Вы также можете указать массив `directives` для применения хост-директив. Это позволяет создавать компоненты программно с привязками, аналогичными шаблонным, в одном декларативном вызове.

### Представление хоста с помощью `ViewContainerRef.createComponent` {#host-view-using-viewcontainerrefcreatecomponent}

`ViewContainerRef.createComponent` создаёт компонент и автоматически вставляет его хост-представление и хост-элемент в иерархию представлений контейнера в месте расположения контейнера. Используйте этот подход, когда динамический компонент должен стать частью логической и визуальной структуры контейнера (например, добавление элементов списка или встроенного UI).

В отличие от этого, автономный API `createComponent` не присоединяет новый компонент к какому-либо существующему представлению или месту в DOM — он возвращает `ComponentRef` и предоставляет вам полный контроль над размещением хост-элемента компонента.

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

В примере выше динамический **AppWarning** создаётся с Input `canClose`, привязанным к реактивному сигналу, двусторонней привязкой состояния `isExpanded` и слушателем Output для `close`. `FocusTrap` и `ThemeDirective` присоединяются к хост-элементу через `directives`.

### Всплывающее окно, присоединённое к `document.body`, с помощью `createComponent` + `hostElement` {#popup-attached-to-documentbody-with-createcomponent--hostelement}

Используйте этот подход при рендеринге вне текущей иерархии представлений (например, оверлеи). Предоставленный `hostElement` становится хост-элементом компонента в DOM, поэтому Angular не создаёт новый элемент, соответствующий селектору. Позволяет настраивать **привязки** напрямую.

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
