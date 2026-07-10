# Программная отрисовка компонентов

TIP: Это руководство предполагает, что вы уже прочитали [Essentials Guide](essentials). Прочитайте его сначала, если вы новичок в Angular.

В дополнение к использованию компонента напрямую в шаблоне можно также динамически отрисовывать компоненты
программно. Это полезно в ситуациях, когда компонент изначально неизвестен (и поэтому не может
быть напрямую указан в шаблоне) и зависит от некоторых условий.

Есть два основных способа программно отрисовать компонент: в шаблоне с помощью `NgComponentOutlet`
или в коде TypeScript с помощью `ViewContainerRef`.

HELPFUL: для сценариев lazy-loading (например, если хотите отложить загрузку тяжёлого компонента) рассмотрите
использование встроенной возможности [`@defer`](/guide/templates/defer). Возможность `@defer` позволяет коду
любых компонентов, директив и pipes внутри блока `@defer` автоматически извлекаться в отдельные JavaScript
chunks и загружаться только когда необходимо, на основе настроенных triggers.

## Использование NgComponentOutlet {#using-ngcomponentoutlet}

`NgComponentOutlet` — structural directive, которая динамически отрисовывает данный компонент в
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

### Передача inputs динамически отрисованным компонентам {#passing-inputs-to-dynamically-rendered-components}

Можно передавать inputs динамически отрисованному компоненту с помощью свойства `ngComponentOutletInputs`. Это свойство принимает объект, где ключи — имена inputs, а значения — значения inputs.

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

Inputs обновляются всякий раз, когда меняется сигнал `greetingInputs`, синхронизируя динамический компонент с состоянием родителя.

### Предоставление content projection {#providing-content-projection}

Используйте `ngComponentOutletContent` для передачи проецируемого контента динамически отрисованному компоненту. Это полезно, когда динамический компонент использует `<ng-content>` для отображения контента.

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

NOTE: Hydration не поддерживает проецирование DOM-узлов, созданных нативными DOM API. Это вызывает ошибку [NG0503](/errors/NG0503). Используйте API Angular для создания проецируемого контента или добавьте `ngSkipHydration` к компоненту.

### Предоставление injectors {#providing-injectors}

Можно предоставить пользовательский injector динамически созданному компоненту с помощью `ngComponentOutletInjector`. Это полезно для предоставления component-specific сервисов или конфигурации.

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

Можно получить доступ к экземпляру динамически созданного компонента с помощью возможности `exportAs` директивы:

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

NOTE: Свойство `componentInstance` равно `null` до отрисовки компонента.

См. [NgComponentOutlet API reference](api/common/NgComponentOutlet) для дополнительной информации о
возможностях директивы.

## Использование ViewContainerRef {#using-viewcontainerref}

**View container** — узел в дереве компонентов Angular, который может содержать контент. Любой компонент
или директива может внедрить `ViewContainerRef`, чтобы получить ссылку на view container, соответствующий
расположению этого компонента или директивы в DOM.

Можно использовать метод `createComponent` на `ViewContainerRef` для динамического создания и отрисовки
компонента. Когда вы создаёте новый компонент с `ViewContainerRef`, Angular добавляет его в
DOM как следующий sibling компонента или директивы, которые внедрили `ViewContainerRef`.

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

В примере выше клик по кнопке «Load content» приводит к следующей структуре DOM

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

## Lazy-loading компонентов {#lazy-loading-components}

HELPFUL: если хотите lazy-load некоторые компоненты, можете рассмотреть использование встроенной возможности [`@defer`](/guide/templates/defer)
вместо этого.

Если ваш use-case не покрывается возможностью `@defer`, можно использовать либо `NgComponentOutlet`, либо
`ViewContainerRef` со стандартным JavaScript [dynamic import](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/import).

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

Пример выше загружает и отображает `AdvancedSettings` при получении клика по кнопке.

## Привязка inputs, outputs и задание host directives при создании {#binding-inputs-outputs-and-setting-host-directives-at-creation}

При динамическом создании компонентов ручная установка inputs и подписка на outputs могут быть подвержены ошибкам. Часто нужно писать дополнительный код только для связывания bindings после создания экземпляра компонента.

Чтобы упростить это, и `createComponent`, и `ViewContainerRef.createComponent` поддерживают передачу массива `bindings` с хелперами вроде `inputBinding()`, `outputBinding()` и `twoWayBinding()` для предварительной настройки inputs и outputs. Также можно указать массив `directives` для применения любых host directives. Это позволяет создавать компоненты программно с template-like bindings в одном декларативном вызове.

### Host view с помощью `ViewContainerRef.createComponent` {#host-view-using-viewcontainerrefcreatecomponent}

`ViewContainerRef.createComponent` создаёт компонент и автоматически вставляет его host view и host element в иерархию views контейнера в расположении контейнера. Используйте это, когда динамический компонент должен стать частью логической и визуальной структуры контейнера (например, добавление элементов списка или inline UI).

Напротив, standalone API `createComponent` не прикрепляет новый компонент к какому-либо существующему view или расположению DOM — он возвращает `ComponentRef` и даёт явный контроль над тем, куда поместить host element компонента.

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

В примере выше динамический **AppWarning** создаётся с его input `canClose`, привязанным к реактивному сигналу, two-way binding на его состоянии `isExpanded` и слушателем output для `close`. `FocusTrap` и `ThemeDirective` прикрепляются к host element через `directives`.

### Popup, прикреплённый к `document.body`, с `createComponent` + `hostElement` {#popup-attached-to-documentbody-with-createcomponent--hostelement}

Используйте это при отрисовке вне текущей иерархии views (например, overlays). Предоставленный `hostElement` становится host компонента в DOM, поэтому Angular не создаёт новый элемент, совпадающий с селектором. Позволяет настраивать **bindings** напрямую.

```ts
import {
  ApplicationRef,
  createComponent,
  EnvironmentInjector,
  inject,
  Injectable,
  inputBinding,
  outputBinding,
  Service,
} from '@angular/core';
import {Popup} from './popup';

@Service()
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

    // Registers the component’s view so it participates in change detection cycle.
    this.appRef.attachView(ref.hostView);
    // Inserts the provided host element into the DOM (outside the normal Angular view hierarchy).
    // This is what makes the popup visible on screen, typically used for overlays or modals.
    document.body.appendChild(host);
  }
}
```
