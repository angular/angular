# Шаблоны проектирования для AI SDK и API сигналов

Взаимодействие с AI и API больших языковых моделей (LLM) создает уникальные проблемы, такие как управление асинхронными
операциями, обработка потоковых данных и создание отзывчивого пользовательского интерфейса при потенциально медленных
или ненадежных сетевых запросах. Angular [сигналы](guide/signals) и API [`resource`](guide/signals/resource)
предоставляют мощные инструменты для элегантного решения этих задач.

## Запуск запросов с помощью сигналов

Распространенный паттерн при работе с пользовательскими промптами — разделение текущего ввода пользователя и
отправленного значения, которое инициирует вызов API.

1. Сохраняйте "сырой" ввод пользователя в одном сигнале по мере ввода.
2. Когда пользователь отправляет данные (например, нажимая кнопку), обновляйте второй сигнал содержимым первого.
3. Используйте второй сигнал в поле **`params`** вашего `resource`.

Такая настройка гарантирует, что функция **`loader`** ресурса будет выполняться только тогда, когда пользователь явно
отправит свой промпт, а не при каждом нажатии клавиши. Вы можете использовать дополнительные параметры-сигналы, такие
как `sessionId` или `userId` (полезно для создания постоянных сессий LLM), внутри поля `loader`. Таким образом, запрос
всегда использует текущие значения этих параметров без повторного запуска асинхронной функции, определенной в поле
`loader`.

Многие AI SDK предоставляют вспомогательные методы для выполнения вызовов API. Например, клиентская библиотека Genkit
предоставляет метод `runFlow` для вызова потоков (flows) Genkit, который можно вызвать из `loader` ресурса. Для других
API можно использовать [`httpResource`](guide/signals/resource#reactive-data-fetching-with-httpresource).

В следующем примере показан `resource`, который запрашивает части истории, сгенерированной ИИ. `loader` срабатывает
только при изменении сигнала `storyInput`.

```ts
// A resource that fetches three parts of an AI generated story
storyResource = resource({
  // The default value to use before the first request or on error
  defaultValue: DEFAULT_STORY,
  // The loader is re-triggered when this signal changes
  params: () => this.storyInput(),
  // The async function to fetch data
  loader: ({params}): Promise<StoryData> => {
    // The params value is the current value of the storyInput signal
    const url = this.endpoint();
    return runFlow({ url, input: {
      userInput: params,
      sessionId: this.storyService.sessionId() // Read from another signal
    }});
  }
});
```

## Подготовка данных LLM для шаблонов

Вы можете настроить API LLM для возврата структурированных данных. Строгая типизация вашего `resource` в соответствии с
ожидаемым выводом от LLM обеспечивает лучшую безопасность типов и автодополнение в редакторе.

Для управления состоянием, производным от ресурса, используйте `computed` сигнал или `linkedSignal`. Поскольку
`linkedSignal` [предоставляет доступ к предыдущим значениям](guide/signals/linked-signal), он может служить для
различных сценариев использования ИИ, включая:

- создание истории чата;
- сохранение или настройку данных, отображаемых шаблонами, пока LLM генерирует контент.

В примере ниже `storyParts` — это `linkedSignal`, который добавляет последние части истории, возвращенные из
`storyResource`, к существующему массиву частей истории.

```ts
storyParts = linkedSignal<string[], string[]>({
  // The source signal that triggers the computation
  source: () => this.storyResource.value().storyParts,
  // The computation function
  computation: (newStoryParts, previous) => {
    // Get the previous value of this linkedSignal, or an empty array
    const existingStoryParts = previous?.value || [];
    // Return a new array with the old and new parts
    return [...existingStoryParts, ...newStoryParts];
  }
});
```

## Производительность и пользовательский опыт

API LLM могут быть медленнее и более подвержены ошибкам, чем обычные, более детерминированные API. Вы можете
использовать несколько возможностей Angular для создания производительного и удобного интерфейса.

- **Локальная загрузка (Scoped Loading):** размещайте `resource` в компоненте, который непосредственно использует
  данные. Это помогает ограничить циклы обнаружения изменений (особенно в приложениях zoneless) и предотвращает
  блокировку других частей приложения. Если данные нужно использовать в нескольких компонентах, предоставляйте
  `resource` через сервис.
- **SSR и гидратация:** используйте рендеринг на стороне сервера (SSR) с инкрементальной гидратацией для быстрого
  отображения начального контента страницы. Вы можете показать заполнитель (placeholder) для контента, генерируемого ИИ,
  и отложить загрузку данных до момента гидратации компонента на клиенте.
- **Состояние загрузки:** используйте [статус](guide/signals/resource#resource-status) `LOADING` у `resource` для
  отображения индикатора, например спиннера, пока выполняется запрос. Этот статус охватывает как первоначальные
  загрузки, так и перезагрузки.
- **Обработка ошибок и повторные попытки:** используйте метод [**`reload()`**](guide/signals/resource#reloading) у
  `resource` как простой способ для пользователей повторить неудачные запросы, что может быть более актуально при
  использовании контента, генерируемого ИИ.

Следующий пример демонстрирует создание отзывчивого UI для динамического отображения сгенерированного ИИ изображения с
функциональностью загрузки и повторной попытки.

```angular-html
<!-- Display a loading spinner while the LLM generates the image -->
@if (imgResource.isLoading()) {
  <div class="img-placeholder">
    <mat-spinner [diameter]="50" />
  </div>
<!-- Dynamically populates the src attribute with the generated image URL -->
} @else if (imgResource.hasValue()) {
  <img [src]="imgResource.value()" />
<!-- Provides a retry option if the request fails  -->
} @else {
  <div class="img-placeholder" (click)="imgResource.reload()">
    <mat-icon fontIcon="refresh" />
      <p>Failed to load image. Click to retry.</p>
  </div>
}
```

## Паттерны ИИ в действии: потоковые ответы чата

Интерфейсы часто отображают частичные результаты от API на основе LLM инкрементально, по мере поступления данных ответа.
API ресурсов Angular предоставляет возможность потоковой передачи ответов для поддержки такого типа паттернов. Свойство
`stream` в `resource` принимает асинхронную функцию, которую можно использовать для применения обновлений к значению
сигнала с течением времени. Обновляемый сигнал представляет собой данные, передаваемые в потоке.

```ts
characters = resource({
  stream: async () => {
    const data = signal<ResourceStreamItem<string>>({value: ''});
    // Calls a Genkit streaming flow using the streamFlow method
    // exposed by the Genkit client SDK
    const response = streamFlow({
      url: '/streamCharacters',
      input: 10
    });

    (async () => {
      for await (const chunk of response.stream) {
        data.update((prev) => {
          if ('value' in prev) {
            return { value: `${prev.value} ${chunk}` };
          } else {
            return { error: chunk as unknown as Error };
          }
        });
      }
    })();

    return data;
  }
});
```

Член класса `characters` обновляется асинхронно и может быть отображен в шаблоне.

```angular-html
@if (characters.isLoading()) {
  <p>Loading...</p>
} @else if (characters.hasValue()) {
  <p>{{characters.value()}}</p>
} @else {
  <p>{{characters.error()}}</p>
}
```

На стороне сервера, например в `server.ts`, определенный эндпоинт отправляет данные для потоковой передачи клиенту.
Следующий код использует Gemini с фреймворком Genkit, но эта техника применима и к другим API, поддерживающим потоковые
ответы от LLM:

```ts
import { startFlowServer } from '@genkit-ai/express';
import { genkit } from "genkit/beta";
import { googleAI, gemini20Flash } from "@genkit-ai/googleai";

const ai = genkit({ plugins: [googleAI()] });

export const streamCharacters = ai.defineFlow({
    name: 'streamCharacters',
    inputSchema: z.number(),
    outputSchema: z.string(),
    streamSchema: z.string(),
  },
  async (count, { sendChunk }) => {
    const { response, stream } = ai.generateStream({
    model: gemini20Flash,
    config: {
      temperature: 1,
    },
    prompt: `Generate ${count} different RPG game characters.`,
  });

  (async () => {
    for await (const chunk of stream) {
      sendChunk(chunk.content[0].text!);
    }
  })();

  return (await response).text;
});

startFlowServer({
  flows: [streamCharacters],
});

```
