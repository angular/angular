# Drag and drop

## Обзор

Эта страница описывает директивы drag and drop (перетаскивания), которые позволяют быстро создавать интерфейсы с
функцией перетаскивания, поддерживающие:

- Свободное перетаскивание
- Создание списка сортируемых перетаскиваемых элементов
- Перемещение перетаскиваемых элементов между списками
- Анимации перетаскивания
- Блокировку перетаскиваемых элементов по оси или внутри элемента
- Добавление кастомных элементов захвата (ручек)
- Добавление превью при перетаскивании
- Добавление кастомного плейсхолдера (заполнителя)

Полный справочник по API можно найти на [странице API drag and drop в Angular CDK](api#angular_cdk_drag-drop).

## Перед началом работы

### Установка CDK

[Component Dev Kit (CDK)](https://material.angular.dev/cdk/categories) — это набор поведенческих примитивов для создания
компонентов. Чтобы использовать директивы drag and drop, сначала установите `@angular/cdk` из npm. Вы можете сделать это
через терминал с помощью Angular CLI:

```shell
ng add @angular/cdk
```

### Импорт drag and drop

Чтобы использовать drag and drop, импортируйте необходимые директивы в ваш компонент.

```ts
import {Component} from '@angular/core';
import {CdkDrag} from '@angular/cdk/drag-drop';

@Component({
  selector: 'my-custom-component',
  templateUrl: 'my-custom-component.html',
  imports: [CdkDrag],
})
export class DragDropExample {}
```

## Создание перетаскиваемых элементов

Вы можете сделать любой элемент перетаскиваемым, добавив директиву `cdkDrag`. По умолчанию все перетаскиваемые элементы
поддерживают свободное перемещение.

<docs-code-multifile preview path="adev/src/content/examples/drag-drop/src/overview/app/app.component.ts">
  <docs-code header="app.component.html" path="adev/src/content/examples/drag-drop/src/overview/app/app.component.html"/>
  <docs-code header="app.component.ts" path="adev/src/content/examples/drag-drop/src/overview/app/app.component.ts"/>
  <docs-code header="app.component.css" path="adev/src/content/examples/drag-drop/src/overview/app/app.component.css"/>
</docs-code-multifile>

## Создание списка сортируемых перетаскиваемых элементов

Добавьте директиву `cdkDropList` к родительскому элементу, чтобы сгруппировать перетаскиваемые элементы в сортируемую
коллекцию. Это определяет область, куда можно сбрасывать перетаскиваемые элементы. Элементы внутри группы `cdkDropList`
автоматически перестраиваются при перемещении элемента.

Директивы drag and drop не обновляют вашу модель данных. Чтобы обновить модель данных, подпишитесь на событие
`cdkDropListDropped` (которое срабатывает, когда пользователь заканчивает перетаскивание) и обновите данные вручную.

<docs-code-multifile preview path="adev/src/content/examples/drag-drop/src/sorting/app/app.component.ts">
  <docs-code header="app.component.html" path="adev/src/content/examples/drag-drop/src/sorting/app/app.component.html"/>
  <docs-code header="app.component.ts" path="adev/src/content/examples/drag-drop/src/sorting/app/app.component.ts"/>
  <docs-code header="app.component.css" path="adev/src/content/examples/drag-drop/src/sorting/app/app.component.css"/>
</docs-code-multifile>

Вы можете использовать токен внедрения `CDK_DROP_LIST` для получения ссылок на экземпляры `cdkDropList`. Для получения
дополнительной информации см. [руководство по внедрению зависимостей](/guide/di)
и [API токена внедрения drop list](api/cdk/drag-drop/CDK_DROP_LIST).

## Перемещение перетаскиваемых элементов между списками

Директива `cdkDropList` поддерживает перемещение перетаскиваемых элементов между связанными списками. Существует два
способа связать один или несколько экземпляров `cdkDropList` вместе:

- Установить свойство `cdkDropListConnectedTo`, указывающее на другой список.
- Обернуть элементы в элемент с атрибутом `cdkDropListGroup`.

Свойство `cdkDropListConnectedTo` работает как с прямой ссылкой на другой `cdkDropList`, так и со ссылкой на id другого
контейнера.

```html
<!-- Это валидно -->
<div cdkDropList #listOne="cdkDropList" [cdkDropListConnectedTo]="[listTwo]"></div>
<div cdkDropList #listTwo="cdkDropList" [cdkDropListConnectedTo]="[listOne]"></div>

<!-- Это тоже валидно -->
<div cdkDropList id="list-one" [cdkDropListConnectedTo]="['list-two']"></div>
<div cdkDropList id="list-two" [cdkDropListConnectedTo]="['list-one']"></div>
```

<docs-code-multifile preview path="adev/src/content/examples/drag-drop/src/connected-sorting/app/app.component.ts">
  <docs-code header="app.component.html" path="adev/src/content/examples/drag-drop/src/connected-sorting/app/app.component.html"/>
  <docs-code header="app.component.ts" path="adev/src/content/examples/drag-drop/src/connected-sorting/app/app.component.ts"/>
  <docs-code header="app.component.css" path="adev/src/content/examples/drag-drop/src/connected-sorting/app/app.component.css"/>
</docs-code-multifile>

Используйте директиву `cdkDropListGroup`, если у вас неизвестное количество связанных списков, чтобы настроить
соединение автоматически. Любой новый `cdkDropList`, добавленный в группу, автоматически связывается со всеми остальными
списками.

```html
<div cdkDropListGroup>
  <!-- Все списки здесь будут связаны. -->
  @for (list of lists; track list) {
    <div cdkDropList></div>
  }
</div>
```

<docs-code-multifile preview path="adev/src/content/examples/drag-drop/src/connected-sorting-group/app/app.component.ts">
  <docs-code header="app.component.html" path="adev/src/content/examples/drag-drop/src/connected-sorting-group/app/app.component.html"/>
  <docs-code header="app.component.ts" path="adev/src/content/examples/drag-drop/src/connected-sorting-group/app/app.component.ts"/>
  <docs-code header="app.component.css" path="adev/src/content/examples/drag-drop/src/connected-sorting-group/app/app.component.css"/>
</docs-code-multifile>

Вы можете использовать токен внедрения `CDK_DROP_LIST_GROUP` для получения ссылок на экземпляры `cdkDropListGroup`. Для
получения дополнительной информации см. [руководство по внедрению зависимостей](/guide/di)
и [API токена внедрения группы списков](api/cdk/drag-drop/CDK_DROP_LIST_GROUP).

### Выборочное перетаскивание

По умолчанию пользователь может перемещать элементы `cdkDrag` из одного контейнера в другой связанный контейнер. Для
более точного контроля над тем, какие элементы могут быть сброшены в контейнер, используйте `cdkDropListEnterPredicate`.
Angular вызывает предикат всякий раз, когда перетаскиваемый элемент входит в новый контейнер. В зависимости от того,
возвращает предикат true или false, элемент может быть разрешен или запрещен для помещения в новый контейнер.

<docs-code-multifile preview path="adev/src/content/examples/drag-drop/src/enter-predicate/app/app.component.ts">
  <docs-code header="app.component.html" path="adev/src/content/examples/drag-drop/src/enter-predicate/app/app.component.html"/>
  <docs-code header="app.component.ts" path="adev/src/content/examples/drag-drop/src/enter-predicate/app/app.component.ts"/>
  <docs-code header="app.component.css" path="adev/src/content/examples/drag-drop/src/enter-predicate/app/app.component.css"/>
</docs-code-multifile>

## Прикрепление данных

Вы можете связать произвольные данные как с `cdkDrag`, так и с `cdkDropList`, установив `cdkDragData` или
`cdkDropListData` соответственно. Вы можете привязаться к событиям, вызываемым обеими директивами, которые будут
включать эти данные, что позволит легко определить источник взаимодействия drag или drop.

```html
@for (list of lists; track list) {
  <div cdkDropList [cdkDropListData]="list" (cdkDropListDropped)="drop($event)">
    @for (item of list; track item) {
      <div cdkDrag [cdkDragData]="item"></div>
    }
  </div>
}
```

## Настройка перетаскивания

### Настройка элемента захвата (ручки)

По умолчанию пользователь может перетаскивать весь элемент `cdkDrag` целиком. Чтобы ограничить пользователя возможностью
перетаскивания только за определенный элемент захвата, добавьте директиву `cdkDragHandle` к элементу внутри `cdkDrag`.
Вы можете добавить столько элементов `cdkDragHandle`, сколько необходимо.

<docs-code-multifile preview path="adev/src/content/examples/drag-drop/src/custom-handle/app/app.component.ts">
  <docs-code header="app.component.html" path="adev/src/content/examples/drag-drop/src/custom-handle/app/app.component.html"/>
  <docs-code header="app.component.ts" path="adev/src/content/examples/drag-drop/src/custom-handle/app/app.component.ts"/>
  <docs-code header="app.component.css" path="adev/src/content/examples/drag-drop/src/custom-handle/app/app.component.css"/>
</docs-code-multifile>

Вы можете использовать токен внедрения `CDK_DRAG_HANDLE` для получения ссылок на экземпляры `cdkDragHandle`. Для
получения дополнительной информации см. [руководство по внедрению зависимостей](/guide/di)
и [API токена внедрения элемента захвата](api/cdk/drag-drop/CDK_DRAG_HANDLE).

### Настройка превью при перетаскивании

Элемент превью становится видимым, когда элемент `cdkDrag` перетаскивается. По умолчанию превью — это клон оригинального
элемента, расположенный рядом с курсором пользователя.

Чтобы настроить превью, предоставьте пользовательский шаблон через `*cdkDragPreview`. Кастомное превью не будет
соответствовать размеру оригинального перетаскиваемого элемента, так как не делается никаких предположений о содержимом
элемента. Чтобы размер превью соответствовал размеру элемента, передайте `true` во входное свойство `matchSize`.

Клонированный элемент удаляет свой атрибут id, чтобы избежать наличия нескольких элементов с одинаковым id на странице.
Это приведет к тому, что любой CSS, нацеленный на этот id, не будет применен.

<docs-code-multifile preview path="adev/src/content/examples/drag-drop/src/custom-preview/app/app.component.ts">
  <docs-code header="app.component.html" path="adev/src/content/examples/drag-drop/src/custom-preview/app/app.component.html"/>
  <docs-code header="app.component.ts" path="adev/src/content/examples/drag-drop/src/custom-preview/app/app.component.ts"/>
  <docs-code header="app.component.css" path="adev/src/content/examples/drag-drop/src/custom-preview/app/app.component.css"/>
</docs-code-multifile>

Вы можете использовать токен внедрения `CDK_DRAG_PREVIEW` для получения ссылок на экземпляры `cdkDragPreview`. Для
получения дополнительной информации см. [руководство по внедрению зависимостей](/guide/di)
и [API токена внедрения превью](api/cdk/drag-drop/CDK_DRAG_PREVIEW).

### Настройка точки вставки при перетаскивании

По умолчанию Angular вставляет превью `cdkDrag` в `<body>` страницы, чтобы избежать проблем с позиционированием и
переполнением (overflow). В некоторых случаях это может быть нежелательно, так как к превью не будут применены
унаследованные стили.

Вы можете изменить место, куда Angular вставляет превью, используя входное свойство `cdkDragPreviewContainer` на
`cdkDrag`. Возможные значения:

| Значение                       | Описание                                                                              | Преимущества                                                                                                                  | Недостатки                                                                                                                                                                                 |
| :----------------------------- | :------------------------------------------------------------------------------------ | :---------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `global`                       | Значение по умолчанию. Angular вставляет превью в `<body>` или ближайший shadow root. | На превью не будут влиять `z-index` или `overflow: hidden`. Это также не повлияет на селекторы `:nth-child` и flex-раскладки. | Не сохраняет унаследованные стили.                                                                                                                                                         |
| `parent`                       | Angular вставляет превью внутрь родителя перетаскиваемого элемента.                   | Превью наследует те же стили, что и перетаскиваемый элемент.                                                                  | Превью может быть обрезано из-за `overflow: hidden` или перекрыто другими элементами из-за `z-index`. Кроме того, это может повлиять на селекторы `:nth-child` и некоторые flex-раскладки. |
| `ElementRef` или `HTMLElement` | Angular вставляет превью в указанный элемент.                                         | Превью наследует стили от указанного элемента-контейнера.                                                                     | Превью может быть обрезано из-за `overflow: hidden` или перекрыто другими элементами из-за `z-index`. Кроме того, это может повлиять на селекторы `:nth-child` и некоторые flex-раскладки. |

В качестве альтернативы вы можете изменить токен внедрения `CDK_DRAG_CONFIG`, чтобы обновить `previewContainer` в
конфигурации, если значение равно `global` или `parent`. Для получения дополнительной информации
см. [руководство по внедрению зависимостей](/guide/di), [API токена внедрения конфигурации drag](api/cdk/drag-drop/CDK_DRAG_CONFIG)
и [API конфигурации drag drop](api/cdk/drag-drop/DragDropConfig).

### Настройка плейсхолдера (заполнителя)

Пока элемент `cdkDrag` перетаскивается, директива создает элемент-плейсхолдер, который показывает, где элемент будет
размещен при сбросе. По умолчанию плейсхолдер — это клон перетаскиваемого элемента. Вы можете заменить плейсхолдер на
кастомный, используя директиву `*cdkDragPlaceholder`:

<docs-code-multifile preview path="adev/src/content/examples/drag-drop/src/custom-placeholder/app/app.component.ts">
  <docs-code header="app.component.html" path="adev/src/content/examples/drag-drop/src/custom-placeholder/app/app.component.html"/>
  <docs-code header="app.component.ts" path="adev/src/content/examples/drag-drop/src/custom-placeholder/app/app.component.ts"/>
  <docs-code header="app.component.css" path="adev/src/content/examples/drag-drop/src/custom-placeholder/app/app.component.css"/>
</docs-code-multifile>

Вы можете использовать токен внедрения `CDK_DRAG_PLACEHOLDER` для получения ссылок на экземпляры `cdkDragPlaceholder`.
Для получения дополнительной информации см. [руководство по внедрению зависимостей](/guide/di)
и [API токена внедрения плейсхолдера](api/cdk/drag-drop/CDK_DRAG_PLACEHOLDER).

### Настройка корневого элемента перетаскивания

Установите атрибут `cdkDragRootElement`, если есть элемент, который вы хотите сделать перетаскиваемым, но у вас нет к
нему прямого доступа.

Атрибут принимает селектор и ищет вверх по DOM, пока не найдет элемент, соответствующий селектору. Если элемент найден,
он становится перетаскиваемым. Это полезно, например, для того, чтобы сделать диалоговое окно перетаскиваемым.

<docs-code-multifile preview path="adev/src/content/examples/drag-drop/src/root-element/app/app.component.ts">
  <docs-code header="app.component.html" path="adev/src/content/examples/drag-drop/src/root-element/app/app.component.html"/>
  <docs-code header="app.component.ts" path="adev/src/content/examples/drag-drop/src/root-element/app/app.component.ts"/>
  <docs-code header="app.component.css" path="adev/src/content/examples/drag-drop/src/root-element/app/app.component.css"/>
</docs-code-multifile>

В качестве альтернативы вы можете изменить токен внедрения `CDK_DRAG_CONFIG`, чтобы обновить `rootElementSelector` в
конфигурации. Для получения дополнительной информации
см. [руководство по внедрению зависимостей](/guide/di), [API токена внедрения конфигурации drag](api/cdk/drag-drop/CDK_DRAG_CONFIG)
и [API конфигурации drag drop](api/cdk/drag-drop/DragDropConfig).

### Установка DOM-позиции перетаскиваемого элемента

По умолчанию элементы `cdkDrag`, не находящиеся в `cdkDropList`, перемещаются со своей нормальной DOM-позиции только
тогда, когда пользователь вручную перемещает элемент. Используйте входное свойство `cdkDragFreeDragPosition`, чтобы явно
задать позицию элемента. Частый случай использования — восстановление позиции перетаскиваемого элемента после того, как
пользователь ушел со страницы и вернулся.

<docs-code-multifile preview path="adev/src/content/examples/drag-drop/src/free-drag-position/app/app.component.ts">
  <docs-code header="app.component.html" path="adev/src/content/examples/drag-drop/src/free-drag-position/app/app.component.html"/>
  <docs-code header="app.component.ts" path="adev/src/content/examples/drag-drop/src/free-drag-position/app/app.component.ts"/>
  <docs-code header="app.component.css" path="adev/src/content/examples/drag-drop/src/free-drag-position/app/app.component.css"/>
</docs-code-multifile>

### Ограничение перемещения внутри элемента

Чтобы запретить пользователю перетаскивать элемент `cdkDrag` за пределы другого элемента, передайте CSS-селектор в
атрибут `cdkDragBoundary`. Этот атрибут принимает селектор и ищет вверх по DOM, пока не найдет соответствующий элемент.
Если совпадение найдено, элемент становится границей, за пределы которой перетаскиваемый элемент не может выйти.
`cdkDragBoundary` также можно использовать, когда `cdkDrag` находится внутри `cdkDropList`.

<docs-code-multifile preview path="adev/src/content/examples/drag-drop/src/boundary/app/app.component.ts">
  <docs-code header="app.component.html" path="adev/src/content/examples/drag-drop/src/boundary/app/app.component.html"/>
  <docs-code header="app.component.ts" path="adev/src/content/examples/drag-drop/src/boundary/app/app.component.ts"/>
  <docs-code header="app.component.css" path="adev/src/content/examples/drag-drop/src/boundary/app/app.component.css"/>
</docs-code-multifile>

В качестве альтернативы вы можете изменить токен внедрения `CDK_DRAG_CONFIG`, чтобы обновить `boundaryElement` в
конфигурации. Для получения дополнительной информации
см. [руководство по внедрению зависимостей](/guide/di), [API токена внедрения конфигурации drag](api/cdk/drag-drop/CDK_DRAG_CONFIG)
и [API конфигурации drag drop](api/cdk/drag-drop/DragDropConfig).

### Ограничение перемещения по оси

По умолчанию `cdkDrag` разрешает свободное перемещение во всех направлениях. Чтобы ограничить перетаскивание
определенной осью, установите `cdkDragLockAxis` в значение "x" или "y" на `cdkDrag`. Чтобы ограничить перетаскивание для
нескольких элементов внутри `cdkDropList`, установите `cdkDropListLockAxis` на `cdkDropList`.

<docs-code-multifile preview path="adev/src/content/examples/drag-drop/src/axis-lock/app/app.component.ts">
  <docs-code header="app.component.html" path="adev/src/content/examples/drag-drop/src/axis-lock/app/app.component.html"/>
  <docs-code header="app.component.ts" path="adev/src/content/examples/drag-drop/src/axis-lock/app/app.component.ts"/>
  <docs-code header="app.component.css" path="adev/src/content/examples/drag-drop/src/axis-lock/app/app.component.css"/>
</docs-code-multifile>

В качестве альтернативы вы можете изменить токен внедрения `CDK_DRAG_CONFIG`, чтобы обновить `lockAxis` в конфигурации.
Для получения дополнительной информации
см. [руководство по внедрению зависимостей](/guide/di), [API токена внедрения конфигурации drag](api/cdk/drag-drop/CDK_DRAG_CONFIG)
и [API конфигурации drag drop](api/cdk/drag-drop/DragDropConfig).

### Задержка перетаскивания

По умолчанию, когда пользователь нажимает указателем на `cdkDrag`, начинается последовательность перетаскивания. Это
поведение может быть нежелательным в таких случаях, как полноэкранные перетаскиваемые элементы на сенсорных устройствах,
где пользователь может случайно вызвать событие перетаскивания при прокрутке страницы.

Вы можете задержать начало перетаскивания, используя входное свойство `cdkDragStartDelay`. Оно заставляет ждать
указанное количество миллисекунд удержания указателя, прежде чем начать перетаскивание элемента.

<docs-code-multifile preview path="adev/src/content/examples/drag-drop/src/delay-drag/app/app.component.ts">
  <docs-code header="app.component.html" path="adev/src/content/examples/drag-drop/src/delay-drag/app/app.component.html"/>
  <docs-code header="app.component.ts" path="adev/src/content/examples/drag-drop/src/delay-drag/app/app.component.ts"/>
  <docs-code header="app.component.css" path="adev/src/content/examples/drag-drop/src/delay-drag/app/app.component.css"/>
</docs-code-multifile>

В качестве альтернативы вы можете изменить токен внедрения `CDK_DRAG_CONFIG`, чтобы обновить `dragStartDelay` в
конфигурации. Для получения дополнительной информации
см. [руководство по внедрению зависимостей](/guide/di), [API токена внедрения конфигурации drag](api/cdk/drag-drop/CDK_DRAG_CONFIG)
и [API конфигурации drag drop](api/cdk/drag-drop/DragDropConfig).

### Отключение перетаскивания

Если вы хотите отключить перетаскивание для конкретного элемента, установите входное свойство `cdkDragDisabled` на
элементе `cdkDrag` в `true` или `false`. Вы можете отключить весь список, используя входное свойство
`cdkDropListDisabled` на `cdkDropList`. Также можно отключить конкретный элемент захвата через `cdkDragHandleDisabled`
на `cdkDragHandle`.

<docs-code-multifile preview path="adev/src/content/examples/drag-drop/src/disable-drag/app/app.component.ts">
  <docs-code header="app.component.html" path="adev/src/content/examples/drag-drop/src/disable-drag/app/app.component.html"/>
  <docs-code header="app.component.ts" path="adev/src/content/examples/drag-drop/src/disable-drag/app/app.component.ts"/>
  <docs-code header="app.component.css" path="adev/src/content/examples/drag-drop/src/disable-drag/app/app.component.css"/>
</docs-code-multifile>

В качестве альтернативы вы можете изменить токен внедрения `CDK_DRAG_CONFIG`, чтобы обновить `draggingDisabled` в
конфигурации. Для получения дополнительной информации
см. [руководство по внедрению зависимостей](/guide/di), [API токена внедрения конфигурации drag](api/cdk/drag-drop/CDK_DRAG_CONFIG)
и [API конфигурации drag drop](api/cdk/drag-drop/DragDropConfig).

## Настройка сортировки

### Ориентация списка

По умолчанию директива `cdkDropList` предполагает, что списки вертикальные. Это можно изменить, установив свойство
`cdkDropListOrientation` в значение `horizontal`.

<docs-code-multifile preview path="adev/src/content/examples/drag-drop/src/horizontal-sorting/app/app.component.ts">
  <docs-code header="app.component.html" path="adev/src/content/examples/drag-drop/src/horizontal-sorting/app/app.component.html"/>
  <docs-code header="app.component.ts" path="adev/src/content/examples/drag-drop/src/horizontal-sorting/app/app.component.ts"/>
  <docs-code header="app.component.css" path="adev/src/content/examples/drag-drop/src/horizontal-sorting/app/app.component.css"/>
</docs-code-multifile>

В качестве альтернативы вы можете изменить токен внедрения `CDK_DRAG_CONFIG`, чтобы обновить `listOrientation` в
конфигурации. Для получения дополнительной информации
см. [руководство по внедрению зависимостей](/guide/di), [API токена внедрения конфигурации drag](api/cdk/drag-drop/CDK_DRAG_CONFIG)
и [API конфигурации drag drop](api/cdk/drag-drop/DragDropConfig).

### Перенос элементов списка

По умолчанию `cdkDropList` сортирует перетаскиваемые элементы, перемещая их с помощью CSS-трансформации. Это позволяет
анимировать сортировку, что улучшает пользовательский опыт. Однако недостатком является то, что список работает только в
одном направлении: вертикально или горизонтально.

Если у вас есть сортируемый список, который должен переноситься на новые строки, вы можете установить атрибут
`cdkDropListOrientation` в значение `mixed`. Это заставляет список использовать другую стратегию сортировки элементов,
которая включает их перемещение в DOM. Однако список больше не сможет анимировать действие сортировки.

<docs-code-multifile preview path="adev/src/content/examples/drag-drop/src/mixed-sorting/app/app.component.ts">
  <docs-code header="app.component.html" path="adev/src/content/examples/drag-drop/src/mixed-sorting/app/app.component.html"/>
  <docs-code header="app.component.ts" path="adev/src/content/examples/drag-drop/src/mixed-sorting/app/app.component.ts"/>
  <docs-code header="app.component.css" path="adev/src/content/examples/drag-drop/src/mixed-sorting/app/app.component.css"/>
</docs-code-multifile>

### Выборочная сортировка

По умолчанию элементы `cdkDrag` сортируются в любую позицию внутри `cdkDropList`. Чтобы изменить это поведение,
установите атрибут `cdkDropListSortPredicate`, который принимает функцию. Функция-предикат вызывается всякий раз, когда
перетаскиваемый элемент собирается переместиться на новый индекс в списке. Если предикат возвращает true, элемент будет
перемещен на новый индекс, в противном случае он сохранит свою текущую позицию.

<docs-code-multifile preview path="adev/src/content/examples/drag-drop/src/sort-predicate/app/app.component.ts">
  <docs-code header="app.component.html" path="adev/src/content/examples/drag-drop/src/sort-predicate/app/app.component.html"/>
  <docs-code header="app.component.ts" path="adev/src/content/examples/drag-drop/src/sort-predicate/app/app.component.ts"/>
  <docs-code header="app.component.css" path="adev/src/content/examples/drag-drop/src/sort-predicate/app/app.component.css"/>
</docs-code-multifile>

### Отключение сортировки

Бывают случаи, когда перетаскиваемые элементы можно перетаскивать из одного `cdkDropList` в другой, но пользователь не
должен иметь возможности сортировать их внутри исходного списка. Для таких случаев добавьте атрибут
`cdkDropListSortingDisabled`, чтобы предотвратить сортировку перетаскиваемых элементов в `cdkDropList`. Это сохраняет
начальную позицию перетаскиваемого элемента в исходном списке, если он не будет перетащен на новую валидную позицию.

<docs-code-multifile preview path="adev/src/content/examples/drag-drop/src/disable-sorting/app/app.component.ts">
  <docs-code header="app.component.html" path="adev/src/content/examples/drag-drop/src/disable-sorting/app/app.component.html"/>
  <docs-code header="app.component.ts" path="adev/src/content/examples/drag-drop/src/disable-sorting/app/app.component.ts"/>
  <docs-code header="app.component.css" path="adev/src/content/examples/drag-drop/src/disable-sorting/app/app.component.css"/>
</docs-code-multifile>

В качестве альтернативы вы можете изменить токен внедрения `CDK_DRAG_CONFIG`, чтобы обновить `sortingDisabled` в
конфигурации. Для получения дополнительной информации
см. [руководство по внедрению зависимостей](/guide/di), [API токена внедрения конфигурации drag](api/cdk/drag-drop/CDK_DRAG_CONFIG)
и [API конфигурации drag drop](api/cdk/drag-drop/DragDropConfig).

### Копирование элементов между списками

По умолчанию, когда элемент перетаскивается из одного списка в другой, он перемещается из исходного списка. Однако вы
можете настроить директивы так, чтобы элемент копировался, оставляя оригинал в исходном списке.

Чтобы включить копирование, вы можете установить входное свойство `cdkDropListHasAnchor`. Это указывает `cdkDropList`
создать элемент-"якорь", который остается в исходном контейнере и не перемещается вместе с элементом. Если пользователь
перемещает элемент обратно в исходный контейнер, якорь удаляется автоматически. Элемент-якорь можно стилизовать,
обратившись к CSS-классу `.cdk-drag-anchor`.

Сочетание `cdkDropListHasAnchor` с `cdkDropListSortingDisabled` позволяет создать список, из которого пользователь может
копировать элементы, не имея возможности переупорядочивать исходный список (например, список товаров и корзина покупок).

<docs-code-multifile preview path="adev/src/content/examples/drag-drop/src/copy-list/app/app.component.ts">
  <docs-code header="app.component.html" path="adev/src/content/examples/drag-drop/src/copy-list/app/app.component.html"/>
  <docs-code header="app.component.ts" path="adev/src/content/examples/drag-drop/src/copy-list/app/app.component.ts"/>
  <docs-code header="app.component.css" path="adev/src/content/examples/drag-drop/src/copy-list/app/app.component.css"/>
</docs-code-multifile>

## Настройка анимаций

Drag and drop поддерживает анимации для:

- Сортировки перетаскиваемого элемента внутри списка
- Перемещения перетаскиваемого элемента из позиции, где пользователь его сбросил, в конечную позицию внутри списка

Чтобы настроить анимации, определите CSS-переход (transition), нацеленный на свойство transform. Для анимаций можно
использовать следующие классы:

| Имя CSS-класса      | Результат добавления перехода                                                                                                                                                                        |
| :------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| .cdk-drag           | Анимирует перетаскиваемые элементы во время их сортировки.                                                                                                                                           |
| .cdk-drag-animating | Анимирует перетаскиваемый элемент из позиции сброса в конечную позицию внутри `cdkDropList`.<br><br>Этот CSS-класс применяется к элементу `cdkDrag` только после завершения действия перетаскивания. |

## Стилизация

Директивы `cdkDrag` и `cdkDropList` применяют только основные стили, необходимые для функциональности. Приложения могут
настраивать свои стили, используя указанные CSS-классы.

| Имя CSS-класса           | Описание                                                                                                                                                                                                                                                                                            |
| :----------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| .cdk-drop-list           | Селектор для контейнеров `cdkDropList`.                                                                                                                                                                                                                                                             |
| .cdk-drag                | Селектор для элементов `cdkDrag`.                                                                                                                                                                                                                                                                   |
| .cdk-drag-disabled       | Селектор для отключенных элементов `cdkDrag`.                                                                                                                                                                                                                                                       |
| .cdk-drag-handle         | Селектор для хост-элемента `cdkDragHandle`.                                                                                                                                                                                                                                                         |
| .cdk-drag-preview        | Селектор для элемента превью перетаскивания. Это элемент, который появляется рядом с курсором, когда пользователь перетаскивает элемент в сортируемом списке.<br><br>Элемент выглядит точно так же, как перетаскиваемый элемент, если не настроен пользовательский шаблон через `*cdkDragPreview`.  |
| .cdk-drag-placeholder    | Селектор для элемента-плейсхолдера перетаскивания. Это элемент, который показывается в месте, куда будет перетащен элемент после завершения действия перетаскивания.<br><br>Этот элемент выглядит точно так же, как сортируемый элемент, если не настроен с помощью директивы `cdkDragPlaceholder`. |
| .cdk-drop-list-dragging  | Селектор для контейнера `cdkDropList`, в котором в данный момент перетаскивается элемент.                                                                                                                                                                                                           |
| .cdk-drop-list-disabled  | Селектор для отключенных контейнеров `cdkDropList`.                                                                                                                                                                                                                                                 |
| .cdk-drop-list-receiving | Селектор для контейнера `cdkDropList`, который может принять перетаскиваемый элемент из связанного списка, который в данный момент перетаскивается.                                                                                                                                                 |
| .cdk-drag-anchor         | Селектор для элемента-якоря, который создается, когда включен `cdkDropListHasAnchor`. Этот элемент указывает позицию, с которой начал движение перетаскиваемый элемент.                                                                                                                             |

## Перетаскивание в прокручиваемом контейнере

Если ваши перетаскиваемые элементы находятся внутри прокручиваемого контейнера (например, `div` с `overflow: auto`),
автоматическая прокрутка не будет работать, если у контейнера нет директивы `cdkScrollable`. Без нее CDK не сможет
обнаруживать или контролировать поведение прокрутки контейнера во время операций перетаскивания.

## Интеграция с другими компонентами

Функциональность drag-and-drop из CDK может быть интегрирована с различными компонентами. Распространенные случаи
использования включают сортируемые компоненты `MatTable` и сортируемые компоненты `MatTabGroup`.
