<!-- TODO: need an Angular + AI logo -->
<docs-decorative-header title="Build with AI" imgSrc="adev/src/assets/images/what_is_angular.svg"> <!-- markdownlint-disable-line -->
Build AI-powered apps. Develop faster with AI.
</docs-decorative-header>

Generative AI (GenAI) with large language models (LLMs) enables the creation of sophisticated and engaging application experiences, including personalized content, intelligent recommendations, media generation and comprehension, information summarization, and dynamic functionality.

Developing features like these would have previously required deep domain expertise and significant engineering effort. However, new products and SDKs are lowering the barrier to entry. Angular is well-suited for integrating AI into your web application as a result of:

* Angular's robust templating APIs enable the creation of dynamic, cleanly composed UIs made from generated content
* Strong, signal-based architecture designed to dynamically manage data and state
* Angular integrates seamlessly with AI SDKs and APIs

This guide demonstrates how you can use [Genkit](/ai#build-ai-powered-applications-with-genkit-and-angular), [Firebase AI Logic](/ai#build-ai-powered-applications-with-firebase-ai-logic-and-angular), and the [Gemini API](/ai#build-ai-powered-applications-with-gemini-api-and-angular) to infuse your Angular apps with AI today. This guide will jumpstart your AI-powered web app development journey by explaining how to begin integrating AI into Angular apps. This guide also shares resources, such as starter kits, example code, and recipes for common workflows, you can use to get up to speed quickly.

To get started, you should have a basic understanding of Angular. New to Angular? Try our [essentials guide](/essentials) or our [getting started tutorials](/tutorials).

NOTE: While this page features integrations and examples with Google AI products, tools like Genkit are model agnostic and allow you to choose your own model. In many cases, the examples and code samples are applicable to other third-party solutions.

## Getting Started
Building AI-powered applications is a new and rapidly developing field. It can be challenging to decide where to start and which technologies to choose. The following section provides three options to choose from:

1. *Genkit* gives you the choice of [supported model and interface with a unified API](https://genkit.dev) for building full-stack applications. Ideal for applications requiring sophisticated back-end AI logic, such as personalized recommendations.

1. *Firebase AI Logic* provides a secure client-side API for Google's models to build client-side only applications or mobile apps. Best for interactive AI features directly in the browser, such as real-time text analysis or basic chatbots.

1. *Gemini API* enables you to build an application that uses the methods and functionality exposed through the API surface directly, best for full-stack applications. Suitable for applications needing direct control over AI models, like custom image generation or deep data processing.

### Build AI-powered applications with Genkit and Angular
[Genkit](https://genkit.dev) is an open-source toolkit designed to help you build AI-powered features in web and mobile apps. It offers a unified interface for integrating AI models from Google, OpenAI, Anthropic, Ollama, and more, so you can explore and choose the best models for your needs. As a server-side solution, your web apps need a supported server environment, such as a node-based server in order to integrate with Genkit. Building a full-stack app using Angular SSR gives you the starting server-side code, for example. 

Here are examples of how to build with Genkit and Angular:

* [Agentic Apps with Genkit and Angular starter-kit](https://github.com/angular/examples/tree/main/genkit-angular-starter-kit)— New to building with AI? Start here with a basic app that features an agentic workflow. Perfect place to start for your first AI building experience.

* [Use Genkit in an Angular app](https://genkit.dev/docs/angular/)— Build a basic application that uses Genkit Flows, Angular and Gemini 2.0 Flash. This step-by-step walkthrough guides you through creating a full-stack Angular application with AI features.

* [Dynamic Story Generator app](https://github.com/angular/examples/tree/main/genkit-angular-story-generator)— Learn to build an agentic Angular app powered by Genkit, Gemini and Imagen 3 to dynamically generate a story based on user interaction featuring beautiful image panels to accompany the events that take place. Start here if you'd like to experiment with a more advanced use-case.

  This example also has an in-depth video walkthrough of the functionality:
    * [Watch "Building Agentic Apps with Angular and Genkit live!"](https://youtube.com/live/mx7yZoIa2n4?feature=share)
    * [Watch "Building Agentic Apps with Angular and Genkit live! PT 2"](https://youtube.com/live/YR6LN5_o3B0?feature=share)

* [Building Agentic apps with Firebase and Google Cloud (Barista Example)](https://developers.google.com/solutions/learn/agentic-barista) - Learn how to build an agentic coffee ordering app with Firebase and Google Cloud. This example uses both Firebase AI Logic and Genkit.

### Build AI-powered applications with Firebase AI Logic and Angular
[Firebase AI Logic](https://firebase.google.com/products/vertex-ai-in-firebase) provides a secure way to interact with Vertex AI Gemini API or Imagen API directly from your web and mobile apps. This is compelling for Angular developers since apps can be either full-stack or client-side only. If you are developing a client-side only application, Firebase AI Logic is a good fit for incorporating AI into your web apps.

Here is an example of how to build with Firebase AI Logic and Angular:
* [Firebase AI Logic x Angular Starter Kit](https://github.com/angular/examples/tree/main/vertex-ai-firebase-angular-example) - Use this starter-kit to build an e-commerce application with a chat agent that can perform tasks. Start here if you do not have experience building with Firebase AI Logic and Angular.

  This example includes an [in-depth video walkthrough explaining the functionality and demonstrates how to add new features](https://youtube.com/live/4vfDz2al_BI).

### Build AI-powered applications with Gemini API and Angular
The [Gemini API](https://ai.google.dev/gemini-api/docs) provides access to state-of-the-art models from Google that supports audio, images, video, and text input. The models that are optimized for specific use cases, [learn more on the Gemini API documentation site](https://ai.google.dev/gemini-api/docs/models).

* [AI Text Editor Angular app template](https://github.com/FirebaseExtended/firebase-framework-tools/tree/main/starters/angular/ai-text-editor) - Use this template to start with a fully functioning text editor with AI-powered features like refining text, expanding text and formalizing text. This is a good starting point to gain experience with calling the Gemini API via HTTP.

* [AI Chatbot app template](https://github.com/FirebaseExtended/firebase-framework-tools/tree/main/starters/angular/ai-chatbot) - This template starts with a chatbot user interface that communicates with the Gemini API via HTTP. 

## AI patterns in action: Streaming chat responses
Having text appear as the response is received from the model is a common UI pattern for web apps using AI. You can achieve this asynchronous task with Angular's `resource` API. The `stream` property of `resource` accepts an asynchronous function you can use to apply updates to a signal value over time. The signal being updated represents the data being streamed.

```ts
characters = resource({
    stream: async () => {
      const data = signal<{ value: string } | { error: unknown }>({
        value: "",
      });

      fetch(this.url).then(async (response) => {
        if (!response.body) return;
        
        for await (const chunk of response.body) {
          const chunkText = this.decoder.decode(chunk);
          data.update((prev) => {
            if ("value" in prev) {
              return { value: `${prev.value} ${chunkText}` };
            } else {
              return { error: chunkText };
            }
          });
        }
      });

      return data;
    },
  });

```

The `characters` member is updated asynchronously and can be displayed in the template.

```html
<p>{{ characters.value() }}</p>
```

On the server side, in `server.ts` for example, the defined endpoint sends the data to be streamed to the client. The following code uses the Gemini API but this technique is applicable to other tools and frameworks that support streaming responses from LLMs:

```ts
 app.get("/api/stream-response", async (req, res) => {
   ai.models.generateContentStream({
     model: "gemini-2.0-flash",
     contents: "Explain how AI works",
   }).then(async (response) => {
     for await (const chunk of response) {
       res.write(chunk.text);
     }
   });
 });

```
This example connects to the Gemini API but other APIs that support streaming responses can be used here as well. [You can find the complete example on the Angular Github](https://github.com/angular/examples/tree/main/streaming-example).

## Best Practices
### Connecting to model providers and keeping your API Credentials Secure
When connecting to model providers, it is important to keep your API secrets safe. *Never put your API key in a file that ships to the client, such as `environments.ts`*.

Your application's architecture determines which AI APIs and tools to choose. Specifically, choose based on whether or not your application is client-side or server-side. Tools such as Firebase AI Logic provide a secure connection to the model APIs for client-side code. If you want to use a different API than Firerbase AI Logic or prefer to use a different model provider, consider creating a proxy-server or even [Cloud Functions for Firebase](https://firebase.google.com/docs/functions) to serve as a proxy and not expose your API keys.

For an example of connecting using a client-side app, see the code:  [Firebase AI Logic Angular example repository](https://github.com/angular/examples/tree/main/vertex-ai-firebase-angular-example).

For server-side connections to model APIs that require API keys, prefer using a secrets manager or environment variable, not `environments.ts`. You should follow standard best practices for securing API keys and credentials. Firebase now provides a new secrets manager with the latest updates from Firebase App Hosting. To learn more, [check out the official documentation](https://firebase.google.com/docs/app-hosting/configure).

For a server-side connection example in a full-stack application, see the code: [Angular AI Example (Genkit and Angular Story Generator) repository](https://github.com/angular/examples/tree/main/genkit-angular-story-generator).

### Use Tool Calling to enhance apps
If you want to build agentic workflows, where agents are able to act and use tools to solve problems based on prompts use "tool calling". Tool calling, also known as function calling, is a way to provide LLMs the ability to make requests back to the application that called it. As a developer, you define which tools are available and you are in control of how or when the tools are called.

Tool calling further enhances your web apps by expanding your AI integration further than a question and answer style chat bot. In fact, you can empower your model to request function calls using the function calling API of your model provider. The available tools can be used to perform more complex actions within the context of your application. 

In the [e-commerce example](https://github.com/angular/examples/blob/main/vertex-ai-firebase-angular-example/src/app/ai.service.ts#L88) of the [Angular examples repository](https://github.com/angular/examples), the LLM requests to make calls to functions for inventory in order to gain the necessary context to perform more complex tasks such as calculating how much a group of items in the store will cost. The scope of the available API is up to you as a developer just as is whether or not to call a function requested by the LLM. You remain in control of the flow of execution. You can expose specific functions of a service for example but not all functions of that service.

### Handling non-deterministic responses
Because models can return non-deterministic results, your applications should be designed with that in mind. Here are a few strategies that you can use in your application implementation:
* Adjust prompts and model parameters (such as [temperature](https://ai.google.dev/gemini-api/docs/prompting-strategies)) for more or less deterministic responses. You can [find out more in the prompting strategies section](https://ai.google.dev/gemini-api/docs/prompting-strategies) of [ai.google.dev](https://ai.google.dev/).
* Use the "human in the loop" strategy where a human verifies outputs before proceeding in a workflow. Build your application workflows to allow operators (humans or other models) to verify outputs and confirm key decisions.
* Employ tool (or function) calling and schema constraints to guide and restrict model responses to predefined formats, increasing response predictability.

Even considering these strategies and techniques, sensible fallbacks should be incorporated in your application design. Follow existing standards of application resiliency. For example, it is not acceptable for an application to crash if a resource or API is not available. In that scenario, an error message is displayed to the user and, if applicable, options for next steps are also displayed. Building AI-powered applications requires the same consideration. Confirm that the response is aligned with the expected output and provide a "safe landing" in case it is not aligned by way of [graceful degradation](https://developer.mozilla.org/en-US/docs/Glossary/Graceful_degradation). This also applies to API outages for LLM providers.

Consider this example: The LLM provider is not responding. A potential strategy to handle the outage is:
* Save the response from the user to used in a retry scenario (now or at a later time)
* Alert the user to the outage with an appropriate message that doesn't reveal sensitive information
* Resume the conversation at a later time once the services are available again.
