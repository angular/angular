# Начало работы с NgOptimizedImage

Директива `NgOptimizedImage` упрощает применение best practices производительности при загрузке изображений.

Директива гарантирует приоритетную загрузку изображения [Largest Contentful Paint (LCP)](http://web.dev/lcp) за счёт:

- Автоматической установки атрибута `fetchpriority` на теге `<img>`
- Ленивой загрузки остальных изображений по умолчанию
- Автоматической генерации preconnect link tag в document head
- Автоматической генерации атрибута `srcset`
- Генерации [preload hint](https://developer.mozilla.org/docs/Web/HTML/Link_types/preload), если приложение использует SSR

Помимо оптимизации загрузки LCP-изображения, `NgOptimizedImage` обеспечивает ряд best practices для изображений, например:

- Использование [URL image CDN для применения оптимизаций](https://web.dev/image-cdns/#how-image-cdns-use-urls-to-indicate-optimization-options)
- Предотвращение layout shift за счёт требования `width` и `height`
- Предупреждение, если `width` или `height` заданы некорректно
- Предупреждение, если изображение будет визуально искажено при рендере

Если вы используете фоновое изображение в CSS, [начните здесь](#how-to-migrate-your-background-image).

**NOTE: Хотя директива `NgOptimizedImage` стала стабильной в Angular 15, она была бэкпортирована и доступна как стабильная функция также в версиях 13.4.0 и 14.3.0.**

## Начало работы {#getting-started}

<docs-workflow>
<docs-step title="Import `NgOptimizedImage` directive">
Импортируйте директиву `NgOptimizedImage` из `@angular/common`:

```ts
import {NgOptimizedImage} from '@angular/common';
```

и включите её в массив `imports` standalone-компонента или NgModule:

```ts
imports: [
  NgOptimizedImage,
  // ...
],
```

</docs-step>
<docs-step title="(Optional) Set up a Loader">
Image loader **не обязателен** для использования NgOptimizedImage, но использование loader с image CDN открывает мощные возможности производительности, включая автоматические `srcset` для изображений.

Краткое руководство по настройке loader — в разделе [Configuring an Image Loader](#configuring-an-image-loader-for-ngoptimizedimage) в конце этой страницы.
</docs-step>
<docs-step title="Enable the directive">
Чтобы активировать директиву `NgOptimizedImage`, замените атрибут `src` изображения на `ngSrc`.

```html
<img ngSrc="cat.jpg" />
```

Если вы используете [встроенный сторонний loader](#built-in-loaders), не включайте base URL path в `src` — loader добавит его автоматически.
</docs-step>
<docs-step title="Mark images as `priority`">
Всегда помечайте [LCP-изображение](https://web.dev/lcp/#what-elements-are-considered) на странице как `priority`, чтобы приоритизировать его загрузку.

```html
<img ngSrc="cat.jpg" width="400" height="200" priority />
```

Пометка изображения как `priority` применяет следующие оптимизации:

- Устанавливает `fetchpriority=high` (подробнее о priority hints [здесь](https://web.dev/priority-hints))
- Устанавливает `loading=eager` (подробнее о native lazy loading [здесь](https://web.dev/browser-level-image-lazy-loading))
- Автоматически генерирует [preload link element](https://developer.mozilla.org/docs/Web/HTML/Link_types/preload) при [рендере на сервере](guide/ssr).

Angular показывает предупреждение в режиме разработки, если LCP-элемент — изображение без атрибута `priority`. LCP-элемент страницы может меняться в зависимости от ряда факторов — например, размеров экрана пользователя, поэтому на странице может быть несколько изображений, которые следует пометить `priority`. Подробнее см. [CSS for Web Vitals](https://web.dev/css-web-vitals/#images-and-largest-contentful-paint-lcp).
</docs-step>
<docs-step title="Include Width and Height">
Чтобы предотвратить [image-related layout shifts](https://web.dev/css-web-vitals/#images-and-layout-shifts), NgOptimizedImage требует указать height и width для изображения:

```html
<img ngSrc="cat.jpg" width="400" height="200" />
```

Для **responsive-изображений** (изображений, стилизованных так, чтобы расти и сжиматься относительно viewport) атрибуты `width` и `height` должны быть intrinsic size файла изображения. Для responsive-изображений также важно [задать значение для `sizes`.](#responsive-images)

Для **изображений фиксированного размера** атрибуты `width` и `height` должны отражать желаемый rendered size изображения. Соотношение сторон этих атрибутов всегда должно совпадать с intrinsic aspect ratio изображения.

NOTE: Если вы не знаете размер изображений, рассмотрите «fill mode», чтобы наследовать размер родительского контейнера, как описано ниже.
</docs-step>
</docs-workflow>

## Использование режима `fill` {#using-fill-mode}

Когда нужно, чтобы изображение заполняло содержащий элемент, можно использовать атрибут `fill`. Это часто полезно для поведения «background image». Также помогает, когда точные width и height изображения неизвестны, но есть родительский контейнер известного размера, в который нужно вписать изображение (см. «object-fit» ниже).

При добавлении атрибута `fill` к изображению не нужно и не следует указывать `width` и `height`, как в этом примере:

```html
<img ngSrc="cat.jpg" fill />
```

Можно использовать CSS-свойство [object-fit](https://developer.mozilla.org/docs/Web/CSS/object-fit), чтобы изменить, как изображение заполняет контейнер. Если стилизовать изображение с `object-fit: "contain"`, изображение сохранит соотношение сторон и будет «letterboxed» под элемент. Если задать `object-fit: "cover"`, элемент сохранит соотношение сторон, полностью заполнит элемент, а часть контента может быть «обрезана».

Визуальные примеры выше — в [документации MDN по object-fit.](https://developer.mozilla.org/docs/Web/CSS/object-fit)

Также можно стилизовать изображение свойством [object-position](https://developer.mozilla.org/docs/Web/CSS/object-position), чтобы скорректировать его позицию внутри содержащего элемента.

IMPORTANT: Чтобы изображение «fill» корректно рендерилось, его родительский элемент **должен** быть стилизован с `position: "relative"`, `position: "fixed"` или `position: "absolute"`.

## Как мигрировать фоновое изображение {#how-to-migrate-your-background-image}

Ниже — простой пошаговый процесс миграции с `background-image` на `NgOptimizedImage`. Элемент с фоновым изображением будем называть «containing element»:

1. Удалите стиль `background-image` у containing element.
2. Убедитесь, что containing element имеет `position: "relative"`, `position: "fixed"` или `position: "absolute"`.
3. Создайте новый элемент изображения как дочерний containing element, используя `ngSrc` для включения директивы `NgOptimizedImage`.
4. Дайте этому элементу атрибут `fill`. Не указывайте `height` и `width`.
5. Если считаете, что это изображение может быть вашим [LCP-элементом](https://web.dev/lcp/), добавьте атрибут `priority` к элементу изображения.

Как фоновое изображение заполняет контейнер, можно настроить, как описано в разделе [Using fill mode](#using-fill-mode).

## Использование placeholder {#using-placeholders}

### Автоматические placeholder {#automatic-placeholders}

NgOptimizedImage может показывать автоматический low-resolution placeholder для изображения, если вы используете CDN или image host с автоматическим изменением размера. Воспользуйтесь этой возможностью, добавив атрибут `placeholder` к изображению:

```html
<img ngSrc="cat.jpg" width="400" height="200" placeholder />
```

Добавление этого атрибута автоматически запрашивает вторую, меньшую версию изображения через указанный image loader. Это маленькое изображение применяется как стиль `background-image` с CSS blur, пока загружается основное изображение. Если image loader не предоставлен, placeholder сгенерировать нельзя, и будет выброшена ошибка.

Размер сгенерированных placeholder по умолчанию — 30px в ширину. Его можно изменить, указав значение в пикселях в провайдере `IMAGE_CONFIG`:

```ts
providers: [
  {
    provide: IMAGE_CONFIG,
    useValue: {
      placeholderResolution: 40
    }
  },
],
```

Если нужны чёткие края вокруг blurred placeholder, оберните изображение в содержащий `<div>` со стилем `overflow: hidden`. Пока `<div>` того же размера, что и изображение (например, через стиль `width: fit-content`), «размытые края» placeholder будут скрыты.

### Data URL placeholder {#data-url-placeholders}

Также можно указать placeholder через base64 [data URL](https://developer.mozilla.org/docs/Web/HTTP/Basics_of_HTTP/Data_URLs) без image loader. Формат data url — `data:image/[imagetype];[data]`, где `[imagetype]` — формат изображения, например `png`, а `[data]` — base64-кодирование изображения. Кодирование можно сделать через командную строку или в JavaScript. Конкретные команды — в [документации MDN](https://developer.mozilla.org/docs/Web/HTTP/Basics_of_HTTP/Data_URLs#encoding_data_into_base64_format). Пример data URL placeholder с усечёнными данными:

```html
<img ngSrc="cat.jpg" width="400" height="200" placeholder="data:image/png;base64,iVBORw0K..." />
```

Однако большие data URL увеличивают размер Angular-бандлов и замедляют загрузку страницы. Если image loader использовать нельзя, команда Angular рекомендует держать base64 placeholder-изображения меньше 4KB и использовать их только на критических изображениях. Помимо уменьшения размеров placeholder, рассмотрите смену форматов изображений или параметров при сохранении. При очень низком разрешении эти параметры сильно влияют на размер файла.

### Placeholder без blur {#non-blurred-placeholders}

По умолчанию NgOptimizedImage применяет CSS blur к image placeholder. Чтобы отрендерить placeholder без blur, передайте аргумент `placeholderConfig` с объектом, включающим свойство `blur`, установленное в false. Например:

```html
<img ngSrc="cat.jpg" width="400" height="200" placeholder [placeholderConfig]="{blur: false}" />
```

## Настройка стилей изображения {#adjusting-image-styling}

В зависимости от стилей изображения добавление атрибутов `width` и `height` может изменить его рендер. `NgOptimizedImage` предупреждает, если стили рендерят изображение с искажённым соотношением сторон.

Обычно это исправляется добавлением `height: auto` или `width: auto` к стилям изображения. Подробнее — в [статье web.dev о теге `<img>`](https://web.dev/patterns/web-vitals-patterns/images/img-tag).

Если атрибуты `width` и `height` мешают задать размер изображения через CSS так, как нужно, рассмотрите режим `fill` и стилизацию родительского элемента изображения.

## Возможности производительности {#performance-features}

NgOptimizedImage включает ряд возможностей, улучшающих производительность загрузки в приложении. Они описаны в этом разделе.

### Добавление resource hints {#add-resource-hints}

[`preconnect` resource hint](https://web.dev/preconnect-and-dns-prefetch) для origin изображения гарантирует максимально быструю загрузку LCP-изображения.

Preconnect-ссылки автоматически генерируются для доменов, переданных как аргумент [loader](#optional-set-up-a-loader). Если origin изображения нельзя определить автоматически и для LCP-изображения не обнаружена preconnect-ссылка, `NgOptimizedImage` предупредит в режиме разработки. В этом случае следует вручную добавить resource hint в `index.html`. Внутри `<head>` документа добавьте тег `link` с `rel="preconnect"`, как показано ниже:

```html
<link rel="preconnect" href="https://my.cdn.origin" />
```

Чтобы отключить предупреждения preconnect, внедрите токен `PRECONNECT_CHECK_BLOCKLIST`:

```ts

providers: [
{provide: PRECONNECT_CHECK_BLOCKLIST, useValue: 'https://your-domain.com'}
],

```

Подробнее об автоматической генерации preconnect — [здесь](#why-is-a-preconnect-element-not-being-generated-for-my-image-domain).

### Запрос изображений правильного размера с автоматическим `srcset` {#request-images-at-the-correct-size-with-automatic-srcset}

Определение атрибута [`srcset`](https://developer.mozilla.org/docs/Web/API/HTMLImageElement/srcset) гарантирует, что браузер запросит изображение нужного размера для viewport пользователя и не будет тратить время на скачивание слишком большого изображения. `NgOptimizedImage` генерирует подходящий `srcset` для изображения на основе наличия и значения атрибута [`sizes`](https://developer.mozilla.org/docs/Web/API/HTMLImageElement/sizes) на теге изображения.

#### Изображения фиксированного размера {#fixed-size-images}

Если изображение должно быть «фиксированного» размера (т.е. одного размера на устройствах, за исключением [pixel density](https://web.dev/codelab-density-descriptors/)), атрибут `sizes` задавать не нужно. `srcset` можно сгенерировать автоматически из атрибутов width и height изображения без дополнительного ввода.

Пример сгенерированного srcset:

```html
<img ... srcset="image-400w.jpg 1x, image-800w.jpg 2x" />
```

#### Responsive-изображения {#responsive-images}

Если изображение должно быть responsive (т.е. расти и сжиматься в зависимости от размера viewport), нужно определить атрибут [`sizes`](https://developer.mozilla.org/docs/Web/API/HTMLImageElement/sizes) для генерации `srcset`.

Если вы раньше не использовали `sizes`, хорошая отправная точка — задать его на основе ширины viewport. Например, если CSS заставляет изображение заполнять 100% ширины viewport, задайте `sizes` как `100vw`, и браузер выберет изображение в `srcset`, ближайшее к ширине viewport (с учётом pixel density). Если изображение, скорее всего, занимает половину экрана (например, в sidebar), задайте `sizes` как `50vw`, чтобы браузер выбрал меньшее изображение. И так далее.

Если вышеописанное не покрывает желаемое поведение изображения, см. документацию по [advanced sizes values](#advanced-sizes-values).

Обратите внимание: `NgOptimizedImage` автоматически добавляет `"auto"` в начало предоставленного значения `sizes`. Это оптимизация, повышающая точность выбора srcset в браузерах с поддержкой `sizes="auto"`, и игнорируемая браузерами без поддержки.

По умолчанию responsive breakpoints:

`[16, 32, 48, 64, 96, 128, 256, 384, 640, 750, 828, 1080, 1200, 1920, 2048, 3840]`

Если нужно кастомизировать эти breakpoints, используйте провайдер `IMAGE_CONFIG`:

```ts
providers: [
  {
    provide: IMAGE_CONFIG,
    useValue: {
      breakpoints: [16, 48, 96, 128, 384, 640, 750, 828, 1080, 1200, 1920]
    }
  },
],
```

Если нужно вручную определить атрибут `srcset`, можно предоставить свой через атрибут `ngSrcset`:

```html
<img ngSrc="hero.jpg" ngSrcset="100w, 200w, 300w" />
```

Если атрибут `ngSrcset` присутствует, `NgOptimizedImage` генерирует и устанавливает `srcset` на основе включённых размеров. Не включайте имена файлов изображений в `ngSrcset` — директива выводит эту информацию из `ngSrc`. Директива поддерживает и width descriptors (например, `100w`), и density descriptors (например, `1x`).

```html
<img ngSrc="hero.jpg" ngSrcset="100w, 200w, 300w" sizes="50vw" />
```

### Отключение автоматической генерации srcset {#disabling-automatic-srcset-generation}

Чтобы отключить генерацию srcset для одного изображения, добавьте атрибут `disableOptimizedSrcset`:

```html
<img ngSrc="about.jpg" disableOptimizedSrcset />
```

### Отключение ленивой загрузки изображений {#disabling-image-lazy-loading}

По умолчанию `NgOptimizedImage` устанавливает `loading=lazy` для всех изображений, не помеченных `priority`. Это поведение для non-priority изображений можно отключить, задав атрибут `loading`. Атрибут принимает значения: `eager`, `auto` и `lazy`. [Подробности — в документации стандартного атрибута `loading` изображения](https://developer.mozilla.org/docs/Web/API/HTMLImageElement/loading#value).

```html
<img ngSrc="cat.jpg" width="400" height="200" loading="eager" />
```

### Управление декодированием изображений {#controlling-image-decoding}

По умолчанию `NgOptimizedImage` устанавливает `decoding="auto"` для всех изображений. Это позволяет браузеру выбрать оптимальное время декодирования изображения после его получения. Когда изображение помечено как `priority`, Angular автоматически устанавливает `decoding="sync"`, чтобы изображение декодировалось и отрисовывалось как можно раньше, помогая улучшить производительность **Largest Contentful Paint (LCP)**.

Это поведение всё равно можно переопределить, явно задав атрибут `decoding`.  
[Подробности — в документации стандартного атрибута `decoding` изображения](https://developer.mozilla.org/docs/Web/HTML/Element/img#decoding).

```html
<!-- Default: decoding is 'auto' -->
<img ngSrc="gallery/landscape.jpg" width="1200" height="800" />

<!-- Decode the image asynchronously to avoid blocking the main thread.-->
<img ngSrc="gallery/preview.jpg" width="600" height="400" decoding="async" />

<!-- Priority images automatically use decoding="sync" -->
<img ngSrc="awesome.jpg" width="500" height="625" priority />

<!-- Decode immediately (can block) when you need the pixels right away -->
<img ngSrc="hero.jpg" width="1600" height="900" decoding="sync" />
```

**Допустимые значения**

- `auto` (по умолчанию): браузер выбирает оптимальную стратегию.
- `async`: декодирует изображение асинхронно, по возможности избегая блокировки main‑thread.
- `sync`: декодирует изображение сразу; может блокировать рендеринг, но гарантирует готовность пикселей, как только изображение доступно.

### Продвинутые значения 'sizes' {#advanced-sizes-values}

Может понадобиться отображать изображения разной ширины на экранах разного размера. Распространённый пример — layout на основе сетки или колонок, который рендерит одну колонку на мобильных и две — на больших устройствах. Это поведение можно выразить в атрибуте `sizes` синтаксисом «media query»:

```html
<img ngSrc="cat.jpg" width="400" height="200" sizes="(max-width: 768px) 100vw, 50vw" />
```

Атрибут `sizes` в примере выше говорит: «Я ожидаю, что это изображение будет 100 процентов ширины экрана на устройствах уже 768px. Иначе — 50 процентов ширины экрана».

Дополнительно об атрибуте `sizes` — на [web.dev](https://web.dev/learn/design/responsive-images/#sizes) или [mdn](https://developer.mozilla.org/docs/Web/API/HTMLImageElement/sizes).

## Настройка image loader для `NgOptimizedImage` {#configuring-an-image-loader-for-ngoptimizedimage}

«Loader» — функция, генерирующая [URL трансформации изображения](https://web.dev/image-cdns/#how-image-cdns-use-urls-to-indicate-optimization-options) для данного файла изображения. Когда уместно, `NgOptimizedImage` задаёт трансформации размера, формата и качества изображения.

`NgOptimizedImage` предоставляет и generic loader без трансформаций, и loaders для различных сторонних image-сервисов. Также поддерживается написание собственного custom loader.

| Тип loader                             | Поведение                                                                                                                                                                                                                      |
| :------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Generic loader                         | URL, возвращаемый generic loader, всегда совпадает со значением `src`. Иными словами, этот loader не применяет трансформаций. Основной сценарий — сайты, которые отдают изображения через Angular.                            |
| Loaders для сторонних image-сервисов   | URL, возвращаемый loaders для сторонних image-сервисов, следует API-соглашениям конкретного сервиса.                                                                                                                           |
| Custom loaders                         | Поведение custom loader определяется его разработчиком. Используйте custom loader, если ваш image-сервис не поддерживается loaders, предустановленными с `NgOptimizedImage`.                                                   |

На основе image-сервисов, часто используемых с Angular-приложениями, `NgOptimizedImage` предоставляет loaders, предустановленные для работы со следующими сервисами:

| Image Service             | Angular API               | Документация                                                                |
| :------------------------ | :------------------------ | :-------------------------------------------------------------------------- |
| Cloudflare Image Resizing | `provideCloudflareLoader` | [Documentation](https://developers.cloudflare.com/images/image-resizing/)   |
| Cloudinary                | `provideCloudinaryLoader` | [Documentation](https://cloudinary.com/documentation/resizing_and_cropping) |
| ImageKit                  | `provideImageKitLoader`   | [Documentation](https://docs.imagekit.io/)                                  |
| Imgix                     | `provideImgixLoader`      | [Documentation](https://docs.imgix.com/)                                    |
| Netlify                   | `provideNetlifyLoader`    | [Documentation](https://docs.netlify.com/image-cdn/overview/)               |

Для использования **generic loader** дополнительные изменения кода не нужны. Это поведение по умолчанию.

### Встроенные Loaders {#built-in-loaders}

Чтобы использовать существующий loader для **стороннего image-сервиса**, добавьте provider factory выбранного сервиса в массив `providers`. В примере ниже используется Imgix loader:

```ts
providers: [
  provideImgixLoader('https://my.base.url/'),
],
```

Base URL для image assets следует передать в provider factory как аргумент. Для большинства сайтов этот base URL должен соответствовать одному из паттернов:

- <https://yoursite.yourcdn.com>
- <https://subdomain.yoursite.com>
- <https://subdomain.yourcdn.com/yoursite>

Подробнее о структуре base URL — в документации соответствующего CDN-провайдера.

### Custom Loaders {#custom-loaders}

Чтобы использовать **custom loader**, предоставьте функцию loader как значение DI-токена `IMAGE_LOADER`. В примере ниже custom loader возвращает URL, начинающийся с `https://example.com`, который включает `src`, `width` и `height` как URL-параметры.

```ts
providers: [
  {
    provide: IMAGE_LOADER,
    useValue: (config: ImageLoaderConfig) => {
      return `https://example.com/images?src=${config.src}&width=${config.width}&height=${config.height}`;
    },
  },
],
```

Функция loader для директивы `NgOptimizedImage` принимает объект типа `ImageLoaderConfig` (из `@angular/common`) как аргумент и возвращает абсолютный URL image asset. Объект `ImageLoaderConfig` содержит свойство `src` и опциональные свойства `width`, `height` и `loaderParams`.

NOTE: даже если свойство `width` не всегда присутствует, custom loader должен использовать его для поддержки запроса изображений разной ширины, чтобы `ngSrcset` работал корректно.

### Свойство `loaderParams` {#the-loaderparams-property}

Директива `NgOptimizedImage` поддерживает дополнительный атрибут `loaderParams`, специально предназначенный для поддержки custom loaders. Атрибут `loaderParams` принимает объект с любыми свойствами как значение и сам по себе ничего не делает. Данные в `loaderParams` добавляются к объекту `ImageLoaderConfig`, передаваемому custom loader, и могут использоваться для управления поведением loader.

Распространённое применение `loaderParams` — управление продвинутыми возможностями image CDN.

### Использование свойства `transform` со встроенными loaders {#using-the-transform-property-with-built-in-loaders}

Встроенные loaders для Cloudinary, Cloudflare, ImageKit и Imgix поддерживают специальное свойство `transform` внутри `loaderParams`. Оно позволяет применять кастомные трансформации изображений, предоставляемые CDN.

Свойство `transform` принимает два формата:

#### Строковый формат {#string-format}

Передайте трансформации как строку через запятую, используя синтаксис трансформаций вашего CDN:

```html
<img
  ngSrc="my-image.jpg"
  width="400"
  height="300"
  [loaderParams]="{transform: 'e_grayscale,r_10'}"
/>
```

#### Объектный формат {#object-format}

Передайте трансформации как объект с парами ключ-значение.

```html
<img
  ngSrc="my-image.jpg"
  width="400"
  height="300"
  [loaderParams]="{transform: {e: 'grayscale', r: 10}}"
/>
```

NOTE: Свойство `transform` не поддерживается Netlify loader, так как image CDN Netlify не предоставляет кастомные параметры трансформации.

### Пример custom loader {#example-custom-loader}

Ниже — пример функции custom loader. Эта функция конкатенирует `src`, `width` и `height` и использует `loaderParams` для управления кастомной возможностью CDN для скруглённых углов:

```ts
const myCustomLoader = (config: ImageLoaderConfig) => {
  let url = `https://example.com/images/${config.src}?`;
  let queryParams = [];
  if (config.width) {
    queryParams.push(`w=${config.width}`);
  }
  if (config.height) {
    queryParams.push(`h=${config.height}`);
  }
  if (config.loaderParams?.roundedCorners) {
    queryParams.push('mask=corners&corner-radius=5');
  }
  return url + queryParams.join('&');
};
```

Обратите внимание: в примере выше мы придумали имя свойства 'roundedCorners' для управления возможностью custom loader. Затем эту возможность можно использовать при создании изображения:

```html
<img ngSrc="profile.jpg" width="300" height="300" [loaderParams]="{roundedCorners: true}" />
```

## Часто задаваемые вопросы {#frequently-asked-questions}

### Поддерживает ли NgOptimizedImage CSS-свойство `background-image`? {#does-ngoptimizedimage-support-the-background-image-css-property}

NgOptimizedImage напрямую не поддерживает CSS-свойство `background-image`, но спроектирован так, чтобы легко покрывать сценарий изображения как фона другого элемента.

Пошаговый процесс миграции с `background-image` на `NgOptimizedImage` — в разделе [How to migrate your background image](#how-to-migrate-your-background-image) выше.

### Почему нельзя использовать `src` с `NgOptimizedImage`? {#why-cant-i-use-src-with-ngoptimizedimage}

Атрибут `ngSrc` был выбран как trigger для NgOptimizedImage из технических соображений о том, как браузер загружает изображения. NgOptimizedImage программно меняет атрибут `loading` — если браузер увидит атрибут `src` до этих изменений, он начнёт eagerly скачивать файл изображения, и изменения loading будут проигнорированы.

### Почему для домена моего изображения не генерируется элемент preconnect? {#why-is-a-preconnect-element-not-being-generated-for-my-image-domain}

Генерация preconnect выполняется на основе статического анализа приложения. Это значит, что домен изображения должен быть напрямую включён в параметр loader, как в следующем примере:

```ts
providers: [
  provideImgixLoader('https://my.base.url/'),
],
```

Если для передачи строки домена в loader используется переменная, или loader не используется, статический анализ не сможет определить домен, и preconnect-ссылка не будет сгенерирована. В этом случае следует вручную добавить preconnect-ссылку в document head, как [описано выше](#add-resource-hints).

### Можно ли использовать два разных домена изображений на одной странице? {#can-i-use-two-different-image-domains-in-the-same-page}

Паттерн провайдера [image loaders](#configuring-an-image-loader-for-ngoptimizedimage) спроектирован максимально просто для распространённого случая одного image CDN в компоненте. Однако управлять несколькими image CDN через один провайдер всё равно вполне возможно.

Для этого рекомендуем написать [custom image loader](#custom-loaders), который использует свойство [`loaderParams`](#the-loaderparams-property) для передачи флага, указывающего, какой image CDN использовать, и затем вызывает соответствующий loader на основе этого флага.

### Можно ли добавить новый встроенный loader для моего предпочтительного CDN? {#can-you-add-a-new-built-in-loader-for-my-preferred-cdn}

По причинам поддержки мы сейчас не планируем поддерживать дополнительные встроенные loaders в репозитории Angular. Вместо этого рекомендуем разработчикам публиковать дополнительные image loaders как сторонние пакеты.

### Можно ли использовать это с тегом `<picture>` {#can-i-use-this-with-the-picture-tag}

Нет, но это в нашем roadmap — следите за обновлениями.

Если ждёте эту возможность, проголосуйте за GitHub issue [здесь](https://github.com/angular/angular/issues/56594).

### Как найти LCP-изображение с помощью Chrome DevTools? {#how-do-i-find-my-lcp-image-with-chrome-devtools}

1. На вкладке performance Chrome DevTools нажмите кнопку «start profiling and reload page» вверху слева. Она выглядит как иконка обновления страницы.

2. Это запустит profiling snapshot вашего Angular-приложения.

3. Когда результат profiling будет доступен, выберите «LCP» в секции timings.

4. В панели внизу должна появиться summary entry. LCP-элемент можно найти в строке «related node». Клик по нему покажет элемент на панели Elements.

<img alt="LCP in the Chrome DevTools" src="assets/images/guide/image-optimization/devtools-lcp.png">

NOTE: Это определяет LCP-элемент только в пределах viewport тестируемой страницы. Также рекомендуется использовать mobile emulation, чтобы определить LCP-элемент для меньших экранов.
