# Программный рендеринг компонентов

TIP: Это руководство предполагает, что вы уже ознакомились с [Руководством по основам](essentials). Прочитайте его в
первую очередь, если вы новичок в Angular.

Помимо использования компонента напрямую в шаблоне, вы также можете динамически рендерить компоненты программно. Это
полезно в ситуациях, когда компонент изначально неизвестен (и, следовательно, на него нельзя сослаться в шаблоне
напрямую) и зависит от некоторых условий.

Существует два основных способа программного рендеринга компонента: в шаблоне с использованием `NgComponentOutlet` или в
TypeScript-коде с использованием `ViewContainerRef`.

HELPFUL: для случаев ленивой загрузки (например, если вы хотите отложить загрузку тяжелого компонента), рассмотрите
возможность использования встроенной функции [`@defer`](/guide/templates/defer). Функция `@defer` позволяет
автоматически извлекать код любых компонентов, директив и пайпов внутри блока `@defer` в отдельные JavaScript-чанки и
загружать их только при необходимости, основываясь на настроенных триггерах.

## Использование NgComponentOutlet

`NgComponentOutlet` — это структурная директива, которая динамически рендерит заданный компонент в шаблоне.

```angular-ts
@Component({ ... })
export class AdminBio { /* ... */ }

@Component({ ... })
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

См. [справочник API NgComponentOutlet](api/common/NgComponentOutlet) для получения дополнительной информации о
возможностях директивы.

## Использование ViewContainerRef

**Контейнер представления (view container)** — это узел в дереве компонентов Angular, который может содержать контент.
Любой компонент или директива могут внедрить `ViewContainerRef`, чтобы получить ссылку на контейнер представления,
соответствующий местоположению этого компонента или директивы в DOM.

Вы можете использовать метод `createComponent` в `ViewContainerRef` для динамического создания и рендеринга компонента.
Когда вы создаете новый компонент с помощью `ViewContainerRef`, Angular добавляет его в DOM как следующий соседний
элемент (sibling) компонента или директивы, внедрившей `ViewContainerRef`.

```angular-ts
@Component({
  selector: 'leaf-content',
  template: `
    This is the leaf content
  `,
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
  template: `
    <button (click)="loadContent()">Load content</button>
  `,
})
export class InnerItem {
  private viewContainer = inject(ViewContainerRef);

  loadContent() {
    this.viewContainer.createComponent(LeafContent);
  }
}
```

В приведенном выше примере нажатие кнопки «Load content» приводит к следующей структуре DOM:

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

## Ленивая загрузка компонентов

HELPFUL: если вы хотите лениво загружать некоторые компоненты, рассмотрите возможность использования встроенной
функции [`@defer`](/guide/templates/defer).

Если ваш случай использования не покрывается функцией `@defer`, вы можете использовать `NgComponentOutlet` или
`ViewContainerRef` со стандартным
JavaScript [динамическим импортом](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/import).

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

Приведенный выше пример загружает и отображает `AdvancedSettings` после нажатия кнопки.

## Привязка Input-ов, Output-ов и установка хост-директив при создании

При динамическом создании компонентов ручная установка Input-ов и подписка на Output-ы может привести к ошибкам. Часто
приходится писать дополнительный код только для того, чтобы настроить привязки после создания экземпляра компонента.

Чтобы упростить это, и `createComponent`, и `ViewContainerRef.createComponent` поддерживают передачу массива `bindings`
с такими помощниками, как `inputBinding()`, `outputBinding()` и `twoWayBinding()`, для предварительной настройки входов
и выходов. Вы также можете указать массив `directives` для применения любых хост-директив. Это позволяет создавать
компоненты программно с привязками, подобными шаблонным, в одном декларативном вызове.

### Хост-представление с использованием `ViewContainerRef.createComponent`

`ViewContainerRef.createComponent` создает компонент и автоматически вставляет его хост-представление и хост-элемент в
иерархию представлений контейнера в месте расположения контейнера. Используйте это, когда динамический компонент должен
стать частью логической и визуальной структуры контейнера (например, добавление элементов списка или встроенного UI).

Напротив, автономный API `createComponent` не прикрепляет новый компонент к какому-либо существующему представлению или
местоположению в DOM — он возвращает `ComponentRef` и дает вам явный контроль над тем, где разместить хост-элемент
компонента.

```angular-ts
import { Component, input, model, output } from "@angular/core";

@Component({
  selector: 'app-warning',
  template: `
      @if(isExpanded()) {
        <section>
            <p>Warning: Action needed!</p>
            <button (click)="close.emit(true)">Close</button>
        </section>
      }
  `
})
export class AppWarningComponent {
  readonly canClose = input.required<boolean>();
  readonly isExpanded = model<boolean>();
  readonly close = output<boolean>();
}
```

```ts
import { Component, ViewContainerRef, signal, inputBinding, outputBinding, twoWayBinding, inject } from '@angular/core';
import { FocusTrap } from "@angular/cdk/a11y";
import { ThemeDirective } from '../theme.directive';

@Component({
  template: `<ng-container #container />`
})
export class HostComponent {
  private vcr = inject(ViewContainerRef);
  readonly canClose = signal(true);
  readonly isExpanded = signal(true);

  showWarning() {
    const compRef = this.vcr.createComponent(AppWarningComponent, {
      bindings: [
        inputBinding('canClose', this.canClose),
        twoWayBinding('isExpanded', this.isExpanded),
        outputBinding<boolean>('close', (confirmed) => {
          console.log('Closed with result:', confirmed);
        })
      ],
      directives: [
        FocusTrap,
        { type: ThemeDirective, bindings: [inputBinding('theme', () => 'warning')] }
      ]
    });
  }
}
```

В приведенном выше примере динамический компонент **AppWarningComponent** создается с привязкой его Input-а `canClose` к
реактивному сигналу, двусторонней привязкой состояния `isExpanded` и слушателем Output-а `close`. `FocusTrap` и
`ThemeDirective` прикрепляются к хост-элементу через `directives`.

### Всплывающее окно, прикрепленное к `document.body` с помощью `createComponent` + `hostElement`

Используйте это при рендеринге вне текущей иерархии представлений (например, оверлеи). Предоставленный `hostElement`
становится хостом компонента в DOM, поэтому Angular не создает новый элемент, соответствующий селектору. Позволяет
настраивать **привязки** напрямую.

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
import { PopupComponent } from './popup.component';

@Injectable({ providedIn: 'root' })
export class PopupService {
  private readonly injector = inject(EnvironmentInjector);
  private readonly appRef = inject(ApplicationRef);

  show(message: string) {
    // Создаем хост-элемент для попапа
    const host = document.createElement('popup-host');

    // Создаем компонент и настраиваем привязки в одном вызове
    const ref = createComponent(PopupComponent, {
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

    // Регистрирует представление компонента, чтобы оно участвовало в цикле обнаружения изменений.
    this.appRef.attachView(ref.hostView);
    // Вставляет предоставленный хост-элемент в DOM (вне обычной иерархии представлений Angular).
    // Это делает попап видимым на экране, обычно используется для оверлеев или модальных окон.
    document.body.appendChild(host);
  }
}
```
