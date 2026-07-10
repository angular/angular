# Использование DOM API

TIP: Это руководство предполагает, что вы уже прочитали [Essentials Guide](essentials). Если вы новичок в Angular, начните с него.

Angular обрабатывает большую часть создания, обновления и удаления DOM за вас. Однако иногда может
понадобиться напрямую взаимодействовать с DOM компонента. Компоненты могут внедрять ElementRef, чтобы получить ссылку на
host-элемент компонента:

```ts
@Component(/* ... */)
export class ProfilePhoto {
  constructor() {
    const elementRef = inject(ElementRef);
    console.log(elementRef.nativeElement);
  }
}
```

Свойство `nativeElement` ссылается на
экземпляр host-[Element](https://developer.mozilla.org/docs/Web/API/Element).

Можно использовать функции Angular `afterEveryRender` и `afterNextRender`, чтобы зарегистрировать **render
callback**, который выполняется, когда Angular закончил рендерить страницу.

```ts
@Component(/* ... */)
export class ProfilePhoto {
  constructor() {
    const elementRef = inject(ElementRef);
    afterEveryRender(() => {
      // Focus the first input element in this component.
      elementRef.nativeElement.querySelector('input')?.focus();
    });
  }
}
```

`afterEveryRender` и `afterNextRender` нужно вызывать в _контексте внедрения_, обычно в
конструкторе компонента.

**По возможности избегайте прямой манипуляции DOM.** Всегда предпочитайте выражать структуру DOM
в шаблонах компонентов и обновлять этот DOM через привязки.

**Render callback'и никогда не выполняются во время server-side rendering или build-time pre-rendering.**

**Никогда не манипулируйте DOM напрямую внутри других хуков жизненного цикла Angular.** Angular не
гарантирует, что DOM компонента полностью отрендерен в любой момент, кроме render callback'ов.
Кроме того, чтение или изменение DOM в других хуках жизненного цикла может негативно влиять на
производительность страницы, вызывая [layout thrashing](https://web.dev/avoid-large-complex-layouts-and-layout-thrashing).

## Использование renderer компонента {#using-a-components-renderer}

Компоненты могут внедрять экземпляр `Renderer2` для выполнения определённых манипуляций DOM, связанных
с другими возможностями Angular.

Любые DOM-элементы, созданные через `Renderer2` компонента, участвуют в
[инкапсуляции стилей](guide/components/styling#style-scoping) этого компонента.

Некоторые API `Renderer2` также связаны с системой анимаций Angular. Можно использовать метод `setProperty`
для обновления synthetic animation properties и метод `listen` для добавления слушателей событий
synthetic animation events. Подробности — в руководстве [Animations](guide/animations).

Помимо этих двух узких сценариев, разницы между использованием `Renderer2` и нативными
DOM API нет. API `Renderer2` не поддерживают манипуляцию DOM в контексте server-side rendering или
build-time pre-rendering.

## Когда использовать DOM API {#when-to-use-dom-apis}

Хотя Angular обрабатывает большую часть задач рендеринга, некоторые поведения всё ещё могут требовать DOM API. Некоторые
распространённые сценарии:

- Управление фокусом элемента
- Измерение геометрии элемента, например через `getBoundingClientRect`
- Чтение текстового содержимого элемента
- Настройка нативных observers, таких
  как [`MutationObserver`](https://developer.mozilla.org/docs/Web/API/MutationObserver),
  [`ResizeObserver`](https://developer.mozilla.org/docs/Web/API/ResizeObserver) или
  [`IntersectionObserver`](https://developer.mozilla.org/docs/Web/API/Intersection_Observer_API).

Избегайте вставки, удаления и изменения DOM-элементов. В частности, **никогда не задавайте напрямую
свойство `innerHTML` элемента** — это может сделать приложение уязвимым
к [атакам cross-site scripting (XSS)](https://developer.mozilla.org/docs/Glossary/Cross-site_scripting).
Привязки шаблонов Angular, включая привязки для `innerHTML`, включают защиты, помогающие
защититься от XSS-атак. Подробности — в [руководстве по безопасности](best-practices/security).
