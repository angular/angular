# Оптимизация изображений {#optimizing-images}

Изображения составляют большую часть многих приложений и могут быть основной причиной проблем с производительностью,
включая низкие показатели [Core Web Vitals](https://web.dev/explore/learn-core-web-vitals).

Оптимизация изображений может быть сложной темой, но Angular берет большую часть работы на себя с помощью директивы
`NgOptimizedImage`.

Примечание: Узнайте больше
об [оптимизации изображений с помощью NgOptimizedImage в подробном руководстве](/guide/image-optimization).

В этом упражнении вы узнаете, как использовать `NgOptimizedImage` для обеспечения эффективной загрузки изображений.

<hr>

<docs-workflow>

<docs-step title="Импорт директивы NgOptimizedImage">

Чтобы использовать директиву `NgOptimizedImage`, сначала импортируйте её из библиотеки `@angular/common` и добавьте в
массив `imports` компонента.

```ts
import { NgOptimizedImage } from '@angular/common';

@Component({
  imports: [NgOptimizedImage],
  ...
})
```

</docs-step>

<docs-step title="Замена атрибута src на ngSrc">

Чтобы включить директиву `NgOptimizedImage`, замените атрибут `src` на `ngSrc`. Это относится как к статическим
источникам изображений (т.е. `src`), так и к динамическим (т.е. `[src]`).

```angular-ts {highlight:[[7],[11]]}
import { NgOptimizedImage } from '@angular/common';

@Component({
template: `     ...
    <li>
      Static Image:
      <img ngSrc="/logo.svg" alt="Angular logo" width="32" height="32" />
    </li>
    <li>
      Dynamic Image:
      <img [ngSrc]="logoUrl" [alt]="logoAlt" width="32" height="32" />
    </li>
    ...
  `,
imports: [NgOptimizedImage],
})
```

</docs-step>

<docs-step title="Добавление атрибутов width и height">

Обратите внимание, что в приведенном выше примере кода у каждого изображения есть атрибуты `width` и `height`. Чтобы
предотвратить [сдвиг макета](https://web.dev/articles/cls), директива `NgOptimizedImage` требует наличия обоих атрибутов
размера для каждого изображения.

В ситуациях, когда вы не можете или не хотите указывать статические `height` и `width` для изображений, вы можете
использовать [атрибут `fill`](https://web.dev/articles/cls), чтобы изображение вело себя как "фоновое изображение",
заполняя содержащий его элемент:

```angular-html
// Container div has 'position: "relative"'
<div class="image-container">
  <img ngSrc="www.example.com/image.png" fill />
</div>
```

ПРИМЕЧАНИЕ: Чтобы изображение с `fill` отображалось правильно, его родительский элемент должен иметь стиль
`position: "relative"`, `position: "fixed"` или `position: "absolute"`.

</docs-step>

<docs-step title="Приоритезация важных изображений">

Одной из самых важных оптимизаций для производительности загрузки является приоритезация любого изображения, которое
может быть ["элементом LCP"](https://web.dev/articles/optimize-lcp) (самым большим графическим элементом на экране при
загрузке страницы). Чтобы оптимизировать время загрузки, обязательно добавьте атрибут `priority` к вашему "hero image" (
главному изображению) или любым другим изображениям, которые, по вашему мнению, могут быть элементом LCP.

```ts
<img ngSrc="www.example.com/image.png" height="600" width="800" priority />
```

</docs-step>

<docs-step title="Необязательно: Использование загрузчика изображений">

`NgOptimizedImage` позволяет
указать [загрузчик изображений](guide/image-optimization#configuring-an-image-loader-for-ngoptimizedimage), который
сообщает директиве, как форматировать URL-адреса для ваших изображений. Использование загрузчика позволяет определять
изображения с помощью коротких относительных URL-адресов:

```ts
providers: [provideImgixLoader('https://my.base.url/')],
```

Итоговый URL будет 'https://my.base.url/image.png'

```angular-html
<img ngSrc="image.png" height="600" width="800" />
```

Загрузчики изображений нужны не только для удобства — они позволяют использовать все возможности `NgOptimizedImage`.
Узнайте больше об этих оптимизациях и встроенных загрузчиках для популярных
CDN [здесь](guide/image-optimization#configuring-an-image-loader-for-ngoptimizedimage).

</docs-step>

</docs-workflow>

Добавив эту директиву в свой рабочий процесс, вы обеспечите загрузку изображений с использованием лучших практик с
помощью Angular 🎉

Если вы хотите узнать больше, ознакомьтесь с [документацией по `NgOptimizedImage`](guide/image-optimization).
Продолжайте в том же духе, и давайте перейдем к изучению маршрутизации.
