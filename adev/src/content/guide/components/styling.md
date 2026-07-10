# Стилизация компонентов

TIP: Это руководство предполагает, что вы уже прочитали [Essentials Guide](essentials). Если вы новичок в Angular, начните с него.

Компоненты опционально могут включать CSS-стили, применяемые к DOM этого компонента:

```angular-ts {highlight:[4]}
@Component({
  selector: 'profile-photo',
  template: `<img src="profile-photo.jpg" alt="Your profile photo" />`,
  styles: `
    img {
      border-radius: 50%;
    }
  `,
})
export class ProfilePhoto {}
```

Также можно писать стили в отдельных файлах:

```angular-ts {highlight:[4]}
@Component({
  selector: 'profile-photo',
  templateUrl: 'profile-photo.html',
  styleUrl: 'profile-photo.css',
})
export class ProfilePhoto {}
```

Когда Angular компилирует компонент, эти стили эмитятся вместе с JavaScript-выводом компонента.
Это значит, что стили компонента участвуют в системе модулей JavaScript. Когда вы
рендерите Angular-компонент, фреймворк автоматически включает связанные стили, даже при
ленивой загрузке компонента.

Angular работает с любым инструментом, который выводит CSS,
включая [Sass](https://sass-lang.com), [Less](https://lesscss.org)
и [Stylus](https://stylus-lang.com).

## Scope стилей {#style-scoping}

У каждого компонента есть настройка **view encapsulation**, определяющая, как фреймворк ограничивает
стили компонента. Есть четыре режима view encapsulation: `Emulated`, `ShadowDom`, `ExperimentalIsolatedShadowDom` и `None`.
Режим можно указать в декораторе `@Component`:

```angular-ts {highlight:[3]}
@Component({
  ...,
  encapsulation: ViewEncapsulation.None,
})
export class ProfilePhoto { }
```

### ViewEncapsulation.Emulated {#viewencapsulationemulated}

По умолчанию Angular использует emulated encapsulation, чтобы стили компонента применялись только к элементам,
определённым в шаблоне этого компонента. В этом режиме фреймворк генерирует уникальный HTML-атрибут
для каждого экземпляра компонента, добавляет этот атрибут к элементам в шаблоне компонента и
вставляет этот атрибут в CSS-селекторы, определённые в стилях компонента.

Этот режим гарантирует, что стили компонента не «утекут» наружу и не повлияют на другие компоненты. Однако
глобальные стили, определённые вне компонента, всё ещё могут влиять на элементы внутри компонента с
emulated encapsulation.

В emulated-режиме Angular поддерживает
псевдокласс [`:host`](https://developer.mozilla.org/docs/Web/CSS/:host).
Хотя псевдокласс [`:host-context()`](https://developer.mozilla.org/docs/Web/CSS/:host-context)
устарел в современных браузерах, компилятор Angular полностью его поддерживает. Оба псевдокласса
можно использовать без опоры на нативный
[Shadow DOM](https://developer.mozilla.org/docs/Web/Web_Components/Using_shadow_DOM).
Во время компиляции фреймворк преобразует эти псевдоклассы в атрибуты, поэтому во время выполнения он не
следует правилам этих нативных псевдоклассов (например, совместимость браузеров, specificity). Режим
emulated encapsulation Angular не поддерживает другие псевдоклассы, связанные с Shadow DOM, такие
как `::shadow` или `::part`.

#### `::ng-deep` {#ng-deep}

Режим emulated encapsulation Angular поддерживает кастомный псевдокласс `::ng-deep`.
**Команда Angular настоятельно не рекомендует новое использование `::ng-deep`**. Эти API остаются
исключительно для обратной совместимости.

Когда селектор содержит `::ng-deep`, Angular перестаёт применять границы view-encapsulation после этой точки в селекторе. Любая часть селектора после `::ng-deep` может совпадать с элементами вне шаблона компонента.

Например:

- CSS-правило с селектором вроде `p a` при emulated encapsulation совпадёт с элементами `<a>`, которые являются потомками элемента `<p>`,
  оба — внутри собственного шаблона компонента.

- Селектор вроде `::ng-deep p a` совпадёт с элементами `<a>` где угодно в приложении, потомками элемента `<p>` где угодно в приложении.

  По сути это делает его похожим на глобальный стиль.

- В `p ::ng-deep a` Angular требует, чтобы элемент `<p>` происходил из собственного шаблона компонента, но элемент `<a>` может быть где угодно в приложении.

  Таким образом, элемент `<a>` может быть в шаблоне компонента или в любом его projected или child content.

- С `:host ::ng-deep p a` и `<a>`, и `<p>` должны быть потомками host-элемента компонента.

  Они могут происходить из шаблона компонента или views его дочерних компонентов, но не из других мест приложения.

### ViewEncapsulation.ShadowDom {#viewencapsulationshadowdom}

Этот режим ограничивает стили внутри компонента, используя
[стандартный веб API Shadow DOM](https://developer.mozilla.org/docs/Web/Web_Components/Using_shadow_DOM).
При включении этого режима Angular присоединяет shadow root к host-элементу компонента и рендерит
шаблон и стили компонента в соответствующее shadow tree.

Стили внутри shadow tree не могут влиять на элементы вне этого shadow tree.

Включение encapsulation `ShadowDom`, однако, влияет не только на scope стилей. Рендер
компонента в shadow tree влияет на распространение событий, взаимодействие
с [API `<slot>`](https://developer.mozilla.org/docs/Web/Web_Components/Using_templates_and_slots)
и то, как browser developer tools показывают элементы. Всегда понимайте полные последствия использования
Shadow DOM в приложении, прежде чем включать эту опцию.

### ViewEncapsulation.ExperimentalIsolatedShadowDom {#viewencapsulationexperimentalisolatedshadowdom}

Ведёт себя как выше, за исключением того, что этот режим строго гарантирует: к элементам в
шаблоне компонента применяются _только_ стили этого компонента. Глобальные стили не могут влиять на элементы в shadow tree, а стили внутри
shadow tree не могут влиять на элементы вне этого shadow tree.

### ViewEncapsulation.None {#viewencapsulationnone}

Этот режим отключает всю инкапсуляцию стилей для компонента. Любые стили, связанные с
компонентом, ведут себя как глобальные стили.

NOTE: В режимах `Emulated` и `ShadowDom` Angular не гарантирует на 100%, что стили компонента всегда переопределят стили извне.
Предполагается, что эти стили имеют ту же specificity, что и стили компонента, в случае коллизии.

## Определение стилей в шаблонах {#defining-styles-in-templates}

Можно использовать элемент `<style>` в шаблоне компонента для определения дополнительных стилей. Режим
view encapsulation компонента применяется к стилям, определённым таким образом.

Angular не поддерживает привязки внутри элементов style.

## Ссылки на внешние файлы стилей {#referencing-external-style-files}

Шаблоны компонентов могут
использовать [элемент `<link>`](https://developer.mozilla.org/docs/Web/HTML/Element/link) для
ссылок на CSS-файлы. Кроме того, ваш CSS может
использовать [at-rule `@import`](https://developer.mozilla.org/docs/Web/CSS/@import) для ссылок на
CSS-файлы. Angular считает эти ссылки _внешними_ стилями. Внешние стили не затрагиваются
emulated view encapsulation.
