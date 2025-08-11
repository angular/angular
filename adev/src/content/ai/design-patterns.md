# Design patterns for AI SDKs and signal APIs

Interacting with AI and Large Language Model (LLM) APIs introduces unique challenges, such as managing asynchronous operations, handling streaming data, and designing a responsive user experience for potentially slow or unreliable network requests. Angular [signals](guide/signals) and the [`resource`](guide/signals/resource) API provide powerful tools to solve these problems elegantly.

## Triggering requests with signals

A common pattern when working with user-provided prompts is to separate the user's live input from the submitted value that triggers the API call.

1. Store the user's raw input in one signal as they type
2. When the user submits (e.g., by clicking a button), update a second signal with contents of the first signal.
3. Use the second signal in the **`params`** field of your `resource`.

This setup ensures the resource's **`loader`** function only runs when the user explicitly submits their prompt, not on every keystroke. You can use additional signal parameters, like a `sessionId` or `userId` (which can be useful for creating persistent LLM sessions), in the `loader` field. This way, the request always uses these parameters' current values without re-triggering the asyncronous function defined in the `loader` field.

Many AI SDKs provide helper methods for making API calls. For example, the Genkit client library exposes a `runFlow` method for calling Genkit flows, which you can call from a resource's `loader`. For other APIs, you can use the [`httpResource`](guide/signals/resource#reactive-data-fetching-with-httpresource).

The following example shows a `resource` that fetches parts of an AI-generated story. The `loader` is triggered only when the `storyInput` signal changes.

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

## Preparing LLM data for templates

You can configure LLM APIs to return structured data. Strongly typing your `resource` to match the expected output from the LLM provides better type safety and editor autocompletion.

To manage state derived from a resource, use a `computed` signal or `linkedSignal`. Because `linkedSignal` [provides access to prior values](guide/signals/linked-signal), it can serve a variety of AI-related use cases, including
  * building a chat history
  * preserving or customizing data that templates display while LLMs generate content

In the example below, `storyParts` is a `linkedSignal` that appends the latest story parts returned from `storyResource` to the existing array of story parts.

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

## Performance and user experience

LLM APIs may be slower and more error-prone than conventional, more deterministic APIs. You can use several Angular features to build a performant and user-friendly interface.

* **Scoped Loading:** place the `resource` in the component that directly uses the data. This helps limit change detection cycles (especially in zoneless applications) and prevents blocking other parts of your application. If data needs to be shared across multiple components, provide the `resource` from a service.  
* **SSR and Hydration:** use Server-Side Rendering (SSR) with incremental hydration to render the initial page content quickly. You can show a placeholder for the AI-generated content and defer fetching the data until the component hydrates on the client.  
* **Loading State:** use the `resource` `LOADING` [status](guide/signals/resource#resource-status) to show an indicator, like a spinner, while the request is in flight. This status covers both initial loads and reloads.  
* **Error Handling and Retries:** use the `resource` [**`reload()`**](guide/signals/resource#reloading) method as a simple way for users to retry failed requests, may be more prevalent when relying on AI generated content.

The following example demonstrates how to create a responsive UI to dynamically display an AI generated image with loading and retry functionality.

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


## AI patterns in action: streaming chat responses
Interfaces often display partial results from LLM-based APIs incrementally as response data arrives. Angular's resource API provides the ability to stream responses to support this type of pattern. The `stream` property of `resource` accepts an asyncronous function you can use to apply updates to a signal value over time. The signal being updated represents the data being streamed.

```ts
characters = resource({
  stream: async () => {
    const data = signal<ResourceStreamItem<string>>({value: ''});
    // Calls a Genkit streaming flow using the streamFlow method
    // expose by the Genkit client SDK
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

The `characters` member is updated asynchronously and can be displayed in the template.

```angular-html
@if (characters.isLoading()) {
  <p>Loading...</p>
} @else if (characters.hasValue()) {
  <p>{{characters.value()}}</p>
} @else {
  <p>{{characters.error()}}</p>
}
```

On the server side, in `server.ts` for example, the defined endpoint sends the data to be streamed to the client. The following code uses Gemini with the Genkit framework but this technique is applicable to other APIs that support streaming responses from LLMs:

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
