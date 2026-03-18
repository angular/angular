# Drag and drop (перетаскивание) {#drag-and-drop}

## Обзор {#overview}

На этой странице описаны директивы drag and drop, позволяющие быстро создавать интерфейсы перетаскивания со следующими возможностями:

- Свободное перетаскивание
- Создание списка переупорядочиваемых перетаскиваемых элементов
- Перенос перетаскиваемых элементов между списками
- Анимации перетаскивания
- Фиксация перетаскиваемых элементов по оси или элементу
- Добавление пользовательских ручек перетаскивания
- Добавление превью при перетаскивании
- Добавление пользовательского заполнителя перетаскивания

Полный справочник API см. на [странице справочника API drag and drop Angular CDK](api#angular_cdk_drag-drop).

## Перед началом {#before-you-start}

### Установка CDK {#cdk-installation}

[Component Dev Kit (CDK)](https://material.angular.dev/cdk/categories) — это набор примитивов поведения для создания компонентов. Для использования директив drag and drop сначала установите `@angular/cdk` из npm. Это можно сделать из терминала с помощью Angular CLI:

```shell
ng add @angular/cdk
```

### Импорт drag and drop {#importing-drag-and-drop}

Для использования drag and drop импортируйте необходимое из директив в ваш компонент.

```ts
import {Component} from '@angular/core';
import {CdkDrag} from '@angular/cdk/drag-drop';

@Component({
  selector: 'drag-drop-example',
  templateUrl: 'drag-drop-example.html',
  imports: [CdkDrag],
})
export class DragDropExample {}
```

## Создание перетаскиваемых элементов {#create-draggable-elements}

Любой элемент можно сделать перетаскиваемым, добавив директиву `cdkDrag`. По умолчанию все перетаскиваемые элементы поддерживают свободное перетаскивание.

<docs-code-multifile preview path="adev/src/content/examples/drag-drop/src/overview/app/app.ts">
  <docs-code header="app.html" path="adev/src/content/examples/drag-drop/src/overview/app/app.html"/>
  <docs-code header="app.ts" path="adev/src/content/examples/drag-drop/src/overview/app/app.ts"/>
  <docs-code header="app.css" path="adev/src/content/examples/drag-drop/src/overview/app/app.css"/>
</docs-code-multifile>

## Создание списка переупорядочиваемых перетаскиваемых элементов {#create-a-list-of-reorderable-draggable-elements}

Добавьте директиву `cdkDropList` к родительскому элементу, чтобы сгруппировать перетаскиваемые элементы в переупорядочиваемую коллекцию. Это определяет место, куда можно сбросить перетаскиваемые элементы. Перетаскиваемые элементы в группе drop list автоматически переупорядочиваются по мере перемещения элемента.

Директивы drag and drop не обновляют вашу модель данных. Для обновления модели данных прослушивайте событие `cdkDropListDropped` (когда пользователь завершает перетаскивание) и обновляйте модель данных вручную.

<docs-code-multifile preview path="adev/src/content/examples/drag-drop/src/sorting/app/app.ts">
  <docs-code header="app.html" path="adev/src/content/examples/drag-drop/src/sorting/app/app.html"/>
  <docs-code header="app.ts" path="adev/src/content/examples/drag-drop/src/sorting/app/app.ts"/>
  <docs-code header="app.css" path="adev/src/content/examples/drag-drop/src/sorting/app/app.css"/>
</docs-code-multifile>

Вы можете использовать токен инъекции `CDK_DROP_LIST`, который можно использовать для ссылки на экземпляры `cdkDropList`. Подробнее см. в [руководстве по внедрению зависимостей](/guide/di) и [API токена инъекции drop list](api/cdk/drag-drop/CDK_DROP_LIST).

## Перенос перетаскиваемых элементов между списками {#transfer-draggable-elements-between-lists}

Директива `cdkDropList` поддерживает перенос перетаскиваемых элементов между связанными drop-списками. Есть два способа связать один или несколько экземпляров `cdkDropList` вместе:

- Установить свойство `cdkDropListConnectedTo` для другого drop-списка.
- Обернуть элементы в элемент с атрибутом `cdkDropListGroup`.

Директива `cdkDropListConnectedTo` работает как с прямой ссылкой на другой `cdkDropList`, так и по ссылке на id другого контейнера сброса.

```html
<!-- This is valid -->
<div cdkDropList #listOne="cdkDropList" [cdkDropListConnectedTo]="[listTwo]"></div>
<div cdkDropList #listTwo="cdkDropList" [cdkDropListConnectedTo]="[listOne]"></div>

<!-- This is valid as well -->
<div cdkDropList id="list-one" [cdkDropListConnectedTo]="['list-two']"></div>
<div cdkDropList id="list-two" [cdkDropListConnectedTo]="['list-one']"></div>
```

<docs-code-multifile preview path="adev/src/content/examples/drag-drop/src/connected-sorting/app/app.ts">
  <docs-code header="app.html" path="adev/src/content/examples/drag-drop/src/connected-sorting/app/app.html"/>
  <docs-code header="app.ts" path="adev/src/content/examples/drag-drop/src/connected-sorting/app/app.ts"/>
  <docs-code header="app.css" path="adev/src/content/examples/drag-drop/src/connected-sorting/app/app.css"/>
</docs-code-multifile>

Используйте директиву `cdkDropListGroup`, если у вас неизвестное количество связанных drop-списков для автоматической настройки соединения. Любой новый `cdkDropList`, добавленный под группу, автоматически соединяется со всеми другими списками.

```angular-html
<div cdkDropListGroup>
  <!-- All lists in here will be connected. -->
  @for (list of lists; track list) {
    <div cdkDropList></div>
  }
</div>
```

<docs-code-multifile preview path="adev/src/content/examples/drag-drop/src/connected-sorting-group/app/app.ts">
  <docs-code header="app.html" path="adev/src/content/examples/drag-drop/src/connected-sorting-group/app/app.html"/>
  <docs-code header="app.ts" path="adev/src/content/examples/drag-drop/src/connected-sorting-group/app/app.ts"/>
  <docs-code header="app.css" path="adev/src/content/examples/drag-drop/src/connected-sorting-group/app/app.css"/>
</docs-code-multifile>

Вы можете использовать токен инъекции `CDK_DROP_LIST_GROUP`, который можно использовать для ссылки на экземпляры `cdkDropListGroup`. Подробнее см. в [руководстве по внедрению зависимостей](/guide/di) и [API токена инъекции группы drop-списков](api/cdk/drag-drop/CDK_DROP_LIST_GROUP).

### Выборочное перетаскивание {#selective-dragging}

По умолчанию пользователь может перемещать элементы `cdkDrag` из одного контейнера в другой подключённый контейнер. Для более точного контроля над тем, какие элементы можно сбросить в контейнер, используйте `cdkDropListEnterPredicate`. Angular вызывает предикат каждый раз, когда перетаскиваемый элемент входит в новый контейнер. В зависимости от того, возвращает ли предикат true или false, элемент может или не может попасть в новый контейнер.

<docs-code-multifile preview path="adev/src/content/examples/drag-drop/src/enter-predicate/app/app.ts">
  <docs-code header="app.html" path="adev/src/content/examples/drag-drop/src/enter-predicate/app/app.html"/>
  <docs-code header="app.ts" path="adev/src/content/examples/drag-drop/src/enter-predicate/app/app.ts"/>
  <docs-code header="app.css" path="adev/src/content/examples/drag-drop/src/enter-predicate/app/app.css"/>
</docs-code-multifile>

## Прикрепление данных {#attach-data}

Вы можете связать произвольные данные как с `cdkDrag`, так и с `cdkDropList`, устанавливая `cdkDragData` или `cdkDropListData` соответственно. Вы можете подписаться на события, генерируемые обеими директивами, которые будут включать эти данные, позволяя легко определить источник взаимодействия перетаскивания.

```angular-html
@for (list of lists; track list) {
  <div cdkDropList [cdkDropListData]="list" (cdkDropListDropped)="drop($event)">
    @for (item of list; track item) {
      <div cdkDrag [cdkDragData]="item"></div>
    }
  </div>
}
```

## Настройки перетаскивания {#dragging-customizations}

### Настройка ручки перетаскивания {#customize-drag-handle}

По умолчанию пользователь может перетащить весь элемент `cdkDrag` для его перемещения. Чтобы ограничить пользователя возможностью делать это только с помощью элемента-ручки, добавьте директиву `cdkDragHandle` к элементу внутри `cdkDrag`. Вы можете иметь столько элементов `cdkDragHandle`, сколько нужно.

<docs-code-multifile preview path="adev/src/content/examples/drag-drop/src/custom-handle/app/app.ts">
  <docs-code header="app.html" path="adev/src/content/examples/drag-drop/src/custom-handle/app/app.html"/>
  <docs-code header="app.ts" path="adev/src/content/examples/drag-drop/src/custom-handle/app/app.ts"/>
  <docs-code header="app.css" path="adev/src/content/examples/drag-drop/src/custom-handle/app/app.css"/>
</docs-code-multifile>

Вы можете использовать токен инъекции `CDK_DRAG_HANDLE`, который можно использовать для ссылки на экземпляры `cdkDragHandle`. Подробнее см. в [руководстве по внедрению зависимостей](/guide/di) и [API токена инъекции ручки перетаскивания](api/cdk/drag-drop/CDK_DRAG_HANDLE).

### Настройка превью перетаскивания {#customize-drag-preview}

Элемент превью становится видимым, когда элемент `cdkDrag` перетаскивается. По умолчанию превью является клоном исходного элемента, расположенным рядом с курсором пользователя.

Для настройки превью укажите пользовательский шаблон через `*cdkDragPreview`. Пользовательское превью не будет соответствовать размеру исходного перетаскиваемого элемента, поскольку предположения о содержимом элемента не делаются. Чтобы превью соответствовало размеру элемента, передайте true в input `matchSize`.

Клонированный элемент удаляет свой атрибут id, чтобы избежать наличия нескольких элементов с одинаковым id на странице. Это приведёт к тому, что CSS, нацеленный на этот id, не применяется.

<docs-code-multifile preview path="adev/src/content/examples/drag-drop/src/custom-preview/app/app.ts">
  <docs-code header="app.html" path="adev/src/content/examples/drag-drop/src/custom-preview/app/app.html"/>
  <docs-code header="app.ts" path="adev/src/content/examples/drag-drop/src/custom-preview/app/app.ts"/>
  <docs-code header="app.css" path="adev/src/content/examples/drag-drop/src/custom-preview/app/app.css"/>
</docs-code-multifile>

Вы можете использовать токен инъекции `CDK_DRAG_PREVIEW`, который можно использовать для ссылки на экземпляры `cdkDragPreview`. Подробнее см. в [руководстве по внедрению зависимостей](/guide/di) и [API токена инъекции превью перетаскивания](api/cdk/drag-drop/CDK_DRAG_PREVIEW).

### Настройка точки вставки перетаскивания {#customize-drag-insertion-point}

По умолчанию Angular вставляет превью `cdkDrag` в `<body>` страницы, чтобы избежать проблем с позиционированием и переполнением. В некоторых случаях это может быть нежелательно, поскольку к превью не применяются унаследованные стили.

Вы можете изменить место вставки превью Angular, используя input `cdkDragPreviewContainer` на `cdkDrag`. Возможные значения:

| Значение                      | Описание                                                                                | Преимущества                                                                                                                 | Недостатки                                                                                                                                                                |
| :---------------------------- | :-------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `global`                      | Значение по умолчанию. Angular вставляет превью в <body> или ближайший shadow root.     | Превью не будет затронуто `z-index` или `overflow: hidden`. Также не влияет на селекторы `:nth-child` и flex-макеты.        | Не сохраняет унаследованные стили.                                                                                                                                        |
| `parent`                      | Angular вставляет превью внутрь родителя перетаскиваемого элемента.                     | Превью наследует те же стили, что и перетаскиваемый элемент.                                                                 | Превью может быть обрезано `overflow: hidden` или помещено под другими элементами из-за `z-index`. Кроме того, может влиять на селекторы `:nth-child` и некоторые flex-макеты. |
| `ElementRef` или `HTMLElement` | Angular вставляет превью в указанный элемент.                                           | Превью наследует стили из указанного элемента-контейнера.                                                                    | Превью может быть обрезано `overflow: hidden` или помещено под другими элементами из-за `z-index`. Кроме того, может влиять на селекторы `:nth-child` и некоторые flex-макеты. |

В качестве альтернативы можно изменить токен инъекции `CDK_DRAG_CONFIG` для обновления `previewContainer` в конфигурации, если значение — `global` или `parent`. Подробнее см. в [руководстве по внедрению зависимостей](/guide/di), [API токена инъекции конфигурации перетаскивания](api/cdk/drag-drop/CDK_DRAG_CONFIG) и [API конфигурации drag drop](api/cdk/drag-drop/DragDropConfig).

### Настройка заполнителя перетаскивания {#customize-drag-placeholder}

Пока элемент `cdkDrag` перетаскивается, директива создаёт элемент-заполнитель, показывающий, куда будет помещён элемент при сбросе. По умолчанию заполнитель является клоном перетаскиваемого элемента. Заменить заполнитель пользовательским можно с помощью директивы `*cdkDragPlaceholder`:

<docs-code-multifile preview path="adev/src/content/examples/drag-drop/src/custom-placeholder/app/app.ts">
  <docs-code header="app.html" path="adev/src/content/examples/drag-drop/src/custom-placeholder/app/app.html"/>
  <docs-code header="app.ts" path="adev/src/content/examples/drag-drop/src/custom-placeholder/app/app.ts"/>
  <docs-code header="app.css" path="adev/src/content/examples/drag-drop/src/custom-placeholder/app/app.css"/>
</docs-code-multifile>

Вы можете использовать токен инъекции `CDK_DRAG_PLACEHOLDER`, который можно использовать для ссылки на экземпляры `cdkDragPlaceholder`. Подробнее см. в [руководстве по внедрению зависимостей](/guide/di) и [API токена инъекции заполнителя перетаскивания](api/cdk/drag-drop/CDK_DRAG_PLACEHOLDER).

### Настройка корневого элемента перетаскивания {#customize-drag-root-element}

Установите атрибут `cdkDragRootElement`, если есть элемент, который нужно сделать перетаскиваемым, но у вас нет прямого доступа к нему.

Атрибут принимает CSS-селектор и просматривает DOM до тех пор, пока не найдёт элемент, соответствующий селектору. Если элемент найден, он становится перетаскиваемым. Это полезно для таких случаев, как создание перетаскиваемого диалогового окна.

<docs-code-multifile preview path="adev/src/content/examples/drag-drop/src/root-element/app/app.ts">
  <docs-code header="app.html" path="adev/src/content/examples/drag-drop/src/root-element/app/app.html"/>
  <docs-code header="app.ts" path="adev/src/content/examples/drag-drop/src/root-element/app/app.ts"/>
  <docs-code header="app.css" path="adev/src/content/examples/drag-drop/src/root-element/app/app.css"/>
</docs-code-multifile>

В качестве альтернативы можно изменить токен инъекции `CDK_DRAG_CONFIG` для обновления `rootElementSelector` в конфигурации. Подробнее см. в [руководстве по внедрению зависимостей](/guide/di), [API токена инъекции конфигурации перетаскивания](api/cdk/drag-drop/CDK_DRAG_CONFIG) и [API конфигурации drag drop](api/cdk/drag-drop/DragDropConfig).

### Установка позиции DOM для перетаскиваемого элемента {#set-dom-position-of-a-draggable-element}

По умолчанию элементы `cdkDrag`, не находящиеся в `cdkDropList`, перемещаются со своей обычной позиции DOM только при ручном перемещении элемента пользователем. Используйте input `cdkDragFreeDragPosition` для явного задания позиции элемента. Распространённый сценарий — восстановление позиции перетаскиваемого элемента после того, как пользователь перешёл на другую страницу и вернулся.

<docs-code-multifile preview path="adev/src/content/examples/drag-drop/src/free-drag-position/app/app.ts">
  <docs-code header="app.html" path="adev/src/content/examples/drag-drop/src/free-drag-position/app/app.html"/>
  <docs-code header="app.ts" path="adev/src/content/examples/drag-drop/src/free-drag-position/app/app.ts"/>
  <docs-code header="app.css" path="adev/src/content/examples/drag-drop/src/free-drag-position/app/app.css"/>
</docs-code-multifile>

### Ограничение движения в пределах элемента {#restrict-movement-within-an-element}

Чтобы запретить пользователю перетаскивать элемент `cdkDrag` за пределы другого элемента, передайте CSS-селектор атрибуту `cdkDragBoundary`. Атрибут принимает селектор и просматривает DOM до тех пор, пока не найдёт соответствующий элемент. Если совпадение найдено, элемент становится границей, за пределы которой нельзя перетащить перетаскиваемый элемент. `cdkDragBoundary` также можно использовать, когда `cdkDrag` помещён внутри `cdkDropList`.

<docs-code-multifile preview path="adev/src/content/examples/drag-drop/src/boundary/app/app.ts">
  <docs-code header="app.html" path="adev/src/content/examples/drag-drop/src/boundary/app/app.html"/>
  <docs-code header="app.ts" path="adev/src/content/examples/drag-drop/src/boundary/app/app.ts"/>
  <docs-code header="app.css" path="adev/src/content/examples/drag-drop/src/boundary/app/app.css"/>
</docs-code-multifile>

В качестве альтернативы можно изменить токен инъекции `CDK_DRAG_CONFIG` для обновления `boundaryElement` в конфигурации. Подробнее см. в [руководстве по внедрению зависимостей](/guide/di), [API токена инъекции конфигурации перетаскивания](api/cdk/drag-drop/CDK_DRAG_CONFIG) и [API конфигурации drag drop](api/cdk/drag-drop/DragDropConfig).

### Ограничение движения по оси {#restrict-movement-along-an-axis}

По умолчанию `cdkDrag` допускает свободное движение во всех направлениях. Чтобы ограничить перетаскивание по определённой оси, установите `cdkDragLockAxis` в "x" или "y" на `cdkDrag`. Чтобы ограничить перетаскивание для нескольких перетаскиваемых элементов внутри `cdkDropList`, установите `cdkDropListLockAxis` на `cdkDropList`.

<docs-code-multifile preview path="adev/src/content/examples/drag-drop/src/axis-lock/app/app.ts">
  <docs-code header="app.html" path="adev/src/content/examples/drag-drop/src/axis-lock/app/app.html"/>
  <docs-code header="app.ts" path="adev/src/content/examples/drag-drop/src/axis-lock/app/app.ts"/>
  <docs-code header="app.css" path="adev/src/content/examples/drag-drop/src/axis-lock/app/app.css"/>
</docs-code-multifile>

В качестве альтернативы можно изменить токен инъекции `CDK_DRAG_CONFIG` для обновления `lockAxis` в конфигурации. Подробнее см. в [руководстве по внедрению зависимостей](/guide/di), [API токена инъекции конфигурации перетаскивания](api/cdk/drag-drop/CDK_DRAG_CONFIG) и [API конфигурации drag drop](api/cdk/drag-drop/DragDropConfig).

### Задержка перетаскивания {#delay-dragging}

По умолчанию, когда пользователь нажимает указателем на элемент `cdkDrag`, начинается последовательность перетаскивания. Это поведение может быть нежелательным, например, для полноэкранных перетаскиваемых элементов на сенсорных устройствах, где пользователь может случайно вызвать событие перетаскивания при прокрутке страницы.

Вы можете задержать последовательность перетаскивания с помощью input `cdkDragStartDelay`. Input ждёт, пока пользователь удерживает указатель в течение указанного количества миллисекунд, прежде чем начать перетаскивание элемента.

<docs-code-multifile preview path="adev/src/content/examples/drag-drop/src/delay-drag/app/app.ts">
  <docs-code header="app.html" path="adev/src/content/examples/drag-drop/src/delay-drag/app/app.html"/>
  <docs-code header="app.ts" path="adev/src/content/examples/drag-drop/src/delay-drag/app/app.ts"/>
  <docs-code header="app.css" path="adev/src/content/examples/drag-drop/src/delay-drag/app/app.css"/>
</docs-code-multifile>

В качестве альтернативы можно изменить токен инъекции `CDK_DRAG_CONFIG` для обновления `dragStartDelay` в конфигурации. Подробнее см. в [руководстве по внедрению зависимостей](/guide/di), [API токена инъекции конфигурации перетаскивания](api/cdk/drag-drop/CDK_DRAG_CONFIG) и [API конфигурации drag drop](api/cdk/drag-drop/DragDropConfig).

### Отключение перетаскивания {#disable-dragging}

Если вы хотите отключить перетаскивание для конкретного элемента, установите input `cdkDragDisabled` на элемент `cdkDrag` в true или false. Вы можете отключить весь список с помощью input `cdkDropListDisabled` на `cdkDropList`. Также можно отключить конкретную ручку через `cdkDragHandleDisabled` на `cdkDragHandle`.

<docs-code-multifile preview path="adev/src/content/examples/drag-drop/src/disable-drag/app/app.ts">
  <docs-code header="app.html" path="adev/src/content/examples/drag-drop/src/disable-drag/app/app.html"/>
  <docs-code header="app.ts" path="adev/src/content/examples/drag-drop/src/disable-drag/app/app.ts"/>
  <docs-code header="app.css" path="adev/src/content/examples/drag-drop/src/disable-drag/app/app.css"/>
</docs-code-multifile>

В качестве альтернативы можно изменить токен инъекции `CDK_DRAG_CONFIG` для обновления `draggingDisabled` в конфигурации. Подробнее см. в [руководстве по внедрению зависимостей](/guide/di), [API токена инъекции конфигурации перетаскивания](api/cdk/drag-drop/CDK_DRAG_CONFIG) и [API конфигурации drag drop](api/cdk/drag-drop/DragDropConfig).

## Настройки сортировки {#sorting-customizations}

### Ориентация списка {#list-orientation}

По умолчанию директива `cdkDropList` предполагает вертикальные списки. Это можно изменить, установив свойство `cdkDropListOrientation` в `horizontal`.

<docs-code-multifile preview path="adev/src/content/examples/drag-drop/src/horizontal-sorting/app/app.ts">
  <docs-code header="app.html" path="adev/src/content/examples/drag-drop/src/horizontal-sorting/app/app.html"/>
  <docs-code header="app.ts" path="adev/src/content/examples/drag-drop/src/horizontal-sorting/app/app.ts"/>
  <docs-code header="app.css" path="adev/src/content/examples/drag-drop/src/horizontal-sorting/app/app.css"/>
</docs-code-multifile>

В качестве альтернативы можно изменить токен инъекции `CDK_DRAG_CONFIG` для обновления `listOrientation` в конфигурации. Подробнее см. в [руководстве по внедрению зависимостей](/guide/di), [API токена инъекции конфигурации перетаскивания](api/cdk/drag-drop/CDK_DRAG_CONFIG) и [API конфигурации drag drop](api/cdk/drag-drop/DragDropConfig).

### Перенос строк в списке {#list-wrapping}

По умолчанию `cdkDropList` сортирует перетаскиваемые элементы, перемещая их с помощью CSS-трансформации. Это позволяет анимировать сортировку, что обеспечивает лучший пользовательский опыт. Однако это также имеет недостаток: drop list работает только в одном направлении: вертикальном или горизонтальном.

Если у вас есть сортируемый список, который должен переноситься на новые строки, установите атрибут `cdkDropListOrientation` в `mixed`. Это заставит список использовать другую стратегию сортировки элементов, включающую перемещение их в DOM. Однако список больше не может анимировать действие сортировки.

<docs-code-multifile preview path="adev/src/content/examples/drag-drop/src/mixed-sorting/app/app.ts">
  <docs-code header="app.html" path="adev/src/content/examples/drag-drop/src/mixed-sorting/app/app.html"/>
  <docs-code header="app.ts" path="adev/src/content/examples/drag-drop/src/mixed-sorting/app/app.ts"/>
  <docs-code header="app.css" path="adev/src/content/examples/drag-drop/src/mixed-sorting/app/app.css"/>
</docs-code-multifile>

### Выборочная сортировка {#selective-sorting}

По умолчанию элементы `cdkDrag` сортируются в любую позицию внутри `cdkDropList`. Чтобы изменить это поведение, установите атрибут `cdkDropListSortPredicate`, принимающий функцию. Функция-предикат вызывается каждый раз, когда перетаскиваемый элемент собирается переместиться на новый индекс внутри drop-списка. Если предикат возвращает true, элемент перемещается на новый индекс, иначе — сохраняет текущую позицию.

<docs-code-multifile preview path="adev/src/content/examples/drag-drop/src/sort-predicate/app/app.ts">
  <docs-code header="app.html" path="adev/src/content/examples/drag-drop/src/sort-predicate/app/app.html"/>
  <docs-code header="app.ts" path="adev/src/content/examples/drag-drop/src/sort-predicate/app/app.ts"/>
  <docs-code header="app.css" path="adev/src/content/examples/drag-drop/src/sort-predicate/app/app.css"/>
</docs-code-multifile>

### Отключение сортировки {#disable-sorting}

Бывают случаи, когда перетаскиваемые элементы могут перетаскиваться из одного `cdkDropList` в другой, но пользователь не должен иметь возможности сортировать их внутри исходного списка. В таких случаях добавьте атрибут `cdkDropListSortingDisabled`, чтобы предотвратить сортировку перетаскиваемых элементов в `cdkDropList`. Это сохраняет исходную позицию перетаскиваемого элемента в исходном списке, если он не перетащен на новую допустимую позицию.

<docs-code-multifile preview path="adev/src/content/examples/drag-drop/src/disable-sorting/app/app.ts">
  <docs-code header="app.html" path="adev/src/content/examples/drag-drop/src/disable-sorting/app/app.html"/>
  <docs-code header="app.ts" path="adev/src/content/examples/drag-drop/src/disable-sorting/app/app.ts"/>
  <docs-code header="app.css" path="adev/src/content/examples/drag-drop/src/disable-sorting/app/app.css"/>
</docs-code-multifile>

В качестве альтернативы можно изменить токен инъекции `CDK_DRAG_CONFIG` для обновления `sortingDisabled` в конфигурации. Подробнее см. в [руководстве по внедрению зависимостей](/guide/di), [API токена инъекции конфигурации перетаскивания](api/cdk/drag-drop/CDK_DRAG_CONFIG) и [API конфигурации drag drop](api/cdk/drag-drop/DragDropConfig).

### Копирование элементов между списками {#copying-items-between-lists}

По умолчанию, когда элемент перетаскивается из одного списка в другой, он извлекается из исходного списка. Однако можно настроить директивы для копирования элемента, оставляя исходный элемент в списке-источнике.

Для включения копирования можно установить input `cdkDropListHasAnchor`. Это сообщает `cdkDropList` создать элемент «якорь», который остаётся в исходном контейнере и не перемещается вместе с элементом. Если пользователь перемещает элемент обратно в исходный контейнер, якорь удаляется автоматически. Элемент якоря можно стилизовать, нацеливаясь на CSS-класс `.cdk-drag-anchor`.

Сочетание `cdkDropListHasAnchor` с `cdkDropListSortingDisabled` позволяет создать список, из которого пользователь может копировать элементы, не имея возможности переупорядочивать список-источник (например, список товаров и корзина покупок).

<docs-code-multifile preview path="adev/src/content/examples/drag-drop/src/copy-list/app/app.ts">
  <docs-code header="app.html" path="adev/src/content/examples/drag-drop/src/copy-list/app/app.html"/>
  <docs-code header="app.ts" path="adev/src/content/examples/drag-drop/src/copy-list/app/app.ts"/>
  <docs-code header="app.css" path="adev/src/content/examples/drag-drop/src/copy-list/app/app.css"/>
</docs-code-multifile>

## Настройка анимаций {#customize-animations}

Drag and drop поддерживает анимации для:

- Сортировки перетаскиваемого элемента внутри списка
- Перемещения перетаскиваемого элемента из позиции, куда пользователь его сбросил, на финальную позицию внутри списка

Для настройки анимаций определите CSS-переход, нацеленный на свойство transform. Для анимаций можно использовать следующие классы:

| Имя CSS-класса      | Результат добавления перехода                                                                                                                                                                                              |
| :------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| .cdk-drag           | Анимирует перетаскиваемые элементы по мере их сортировки.                                                                                                                                                                  |
| .cdk-drag-animating | Анимирует перетаскиваемый элемент из позиции сброса на финальную позицию внутри `cdkDropList`.<br><br>Этот CSS-класс применяется к элементу `cdkDrag` только после остановки действия перетаскивания.                     |

## Стилизация {#styling}

Директивы `cdkDrag` и `cdkDropList` применяют только необходимые стили для функциональности. Приложения могут настраивать стили, нацеливаясь на указанные CSS-классы.

| Имя CSS-класса           | Описание                                                                                                                                                                                                                                                                                            |
| :----------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| .cdk-drop-list           | Селектор для элементов контейнера `cdkDropList`.                                                                                                                                                                                                                                                     |
| .cdk-drag                | Селектор для элементов `cdkDrag`.                                                                                                                                                                                                                                                                    |
| .cdk-drag-disabled       | Селектор для отключённых элементов `cdkDrag`.                                                                                                                                                                                                                                                        |
| .cdk-drag-handle         | Селектор для хост-элемента `cdkDragHandle`.                                                                                                                                                                                                                                                          |
| .cdk-drag-preview        | Селектор для элемента превью перетаскивания. Это элемент, появляющийся рядом с курсором при перетаскивании элемента в сортируемом списке.<br><br>Элемент выглядит точно так же, как перетаскиваемый элемент, если не настроен с помощью пользовательского шаблона через `*cdkDragPreview`.           |
| .cdk-drag-placeholder    | Селектор для элемента-заполнителя перетаскивания. Это элемент, отображаемый на месте, куда будет перемещён перетаскиваемый элемент после окончания перетаскивания.<br><br>Этот элемент выглядит точно так же, как сортируемый элемент, если не настроен с помощью директивы cdkDragPlaceholder.     |
| .cdk-drop-list-dragging  | Селектор для элемента контейнера `cdkDropList`, в котором в данный момент перетаскивается перетаскиваемый элемент.                                                                                                                                                                                   |
| .cdk-drop-list-disabled  | Селектор для отключённых элементов контейнера `cdkDropList`.                                                                                                                                                                                                                                         |
| .cdk-drop-list-receiving | Селектор для элемента контейнера `cdkDropList`, который может принять перетаскиваемый элемент из подключённого drop-списка, который в данный момент перетаскивается.                                                                                                                                  |
| .cdk-drag-anchor         | Селектор для элемента якоря, создаваемого при включении `cdkDropListHasAnchor`. Этот элемент указывает позицию, откуда начался перетаскиваемый элемент.                                                                                                                                              |

## Перетаскивание в прокручиваемом контейнере {#dragging-in-a-scrollable-container}

Если перетаскиваемые элементы находятся внутри прокручиваемого контейнера (например, `div` с `overflow: auto`), автоматическая прокрутка не будет работать, если у прокручиваемого контейнера нет директивы `cdkScrollable`. Без неё CDK не может обнаруживать или управлять поведением прокрутки контейнера во время операций перетаскивания.

## Интеграция с другими компонентами {#integrations-with-other-components}

Функциональность drag-and-drop CDK может быть интегрирована с различными компонентами. Распространённые сценарии использования включают сортируемые компоненты `MatTable` и сортируемые компоненты `MatTabGroup`.
