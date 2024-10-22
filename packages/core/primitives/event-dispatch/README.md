# JSAction

> [!CAUTION] This document serves as a technical documentation of an internal
> library used within Angular. This is **not** a public API that Angular
> provides, avoid using it directly in Angular applications.

JSAction is a tiny, low-level event delegation library that decouples the
registration of event listeners from the JavaScript code for the listeners
themselves. This enables capturing user interactions before the application is
bootstrapped or hydrated as well as very fine grained lazy loading of event
handling code. It is typically used as a sub-component of a larger framework,
rather than as a stand-alone library.

## How it works

The traditional way of adding an event listener is to obtain a reference to the
node and call `.addEventListener` (or use `.onclick`-like properties). However,
this necessarily requires that the code that handles the event has been loaded.
This can introduce a couple problems:

1.  Server rendered applications will silently ignore user events that happen
    before the app hydrates and registers handlers

    ```html
    <!-- Let's say this server-rendered page is streamed to the browser -->
    <body>
      <button id="buy_btn" type="button">Buy now!</button>
      ...
      <!--
      There's a window of time between when the button is rendered and the
      script below reaches the client, either because there's a lot of content
      streamed in-between, network lag, or the script is asynchronously loaded
      via a follow-up network request rather than as part of the main document
      content.
      ->
      ...
      <script>
        const btn = document.querySelector('#buy_btn');
        // Until this line is executed, clicking on the button doesn't do
        // anything. This can be a frustrating user experience.
        btn.addEventListener('click', () => app.confirmPurchase());
      </script>
    ```

2.  Applications must eagerly load any possible handler that could be needed to
    handle user interactions, even if that handler is never invoked or even
    rendered on the page

    ```html
    // This button is rarely clicked, but the code to show the dialog must be
    // loaded for every user
    <button type="button" (click)="showAdvancedOptionsDialog()">
      Advanced options
    </button>

    // Non-admins will never see this button, and yet they still have to load
    // this handler.
    @if (isAdmin) {
      <button type="button" (click)="showAdminOptionsDialog()">
        Admin options
      </button>
    }
    ```

    It's possible to write these handlers so that they will late-load their
    inner logic, but that's a manual, opt-in solution.

Instead, JSAction "registers" event handlers by storing a map from event type
to handler name (which can map to whatever handler function or behavior the
application needs) on a custom HTML `jsaction` attribute.

```html
<button id="buy_btn" type="button" jsaction="click:confirmPurchase">
  Buy now!
</button>
```

A small inline script is added before any application content which registers
global event handlers for event types that could be delegated. Any events
triggered on the page bubble up to the global handler and are queued until the
application has bootstrapped or hydrated.

Once ready, JSAction can "replay" the queued events to the application,
providing the events and their matched handler name. It's up to the user of
JSAction what to do with the replayed events. The handler name could be mapped
to some eagerly loaded handlers and called right away, or it could be used to
lazily load a handler. (Typically JSAction is not used directly, but configured
by a framework like Angular or Wiz).

Frameworks may continue using JSAction after hydration to take advantage of its
event delegation. This allows handling most if not all events in your
application with just a few global listeners, saving the cost of registering
a larger amount (potentially thousands) of listeners on individual elements.

### `jsaction` attribute syntax

The value of the `jsaction` attribute encodes a mapping from event type to
handler name. The grammar for its syntax in [EBNF
format](https://en.wikipedia.org/wiki/Extended_Backus%E2%80%93Naur_form) is as
follows:

```ebnf
; JSAction attribute syntax in ENBF format
jsaction-attr-value   = binding, { ";", jsaction-attr-value }

binding               = [ event-type, ":" ], event-handler

event-type            = { white space characters }, [valid-name], { white space characters }
event-handler         = { white space characters }, [valid-name], { white space characters }

valid-name            = { valid-char }

valid-char            = character - invalid-name-chars
invalid-name-chars    = ":" | ";" | "."
```

- Omitting the event type and colon will default the binding to the `click`
  event (e.g.`jsaction="handleClick;hover:handleHover"`)
- Both the event type and handler name can be the empty string (but make sure
  to keep the colon: `jsaction="change:;"`)
- The `event-handler` is an arbitrary string that can store metadata needed to
  find the handler that handles the event. The user of JSAction can choose to
  define the semantics of the handler string however they like.

#### Example

```html
<div jsaction="click:handleClick;hover:handleHover"></div>
```

In this example, there are two event bindings:

1.  The `click` event is bound to the handler name `handleClick`
2.  The `hover` event is bound to the handler name `handleHover`

## Setup

### 1. Create the `EventContract`

First, we need to set up the `EventContract`, which installs the global handlers
for JSAction. The contract can be configured as follows:

```javascript
import {EventContract} from '@angular/core/primitives/event-dispatch/src/eventcontract';
import {EventContractContainer} from '@angular/core/primitives/event-dispatch/src/event_contract_container';

/**
 * The list of event types that you want JSAction to listen for. In Angular,
 * this is dynamically generated at server render time.
 */
const EVENTS_TO_LISTEN_TO = ['click', 'keydown', ...];

// Events will be handled by JSAction for all elements under this container
const eventContract = new EventContract(
    new EventContractContainer(document.body));

for (const eventType of EVENTS_TO_LISTEN_TO) {
  eventContract.addEvent(eventType);
}

// Stash the contract somewhere the main application bundle can access.
window['__ec'] = eventContract;
```

This code should be compiled/bundled/minified separately from the main
application bundle. Code size is critical here since this code will be inlined
at the top of the page and will block rendering content.

For scroll-blocking events like `touchstart`, `touchmove`, `wheel` and `mousewheel`,
you can optimize scrolling performance by passing the `passive` option to the
`addEvent` function. This allows the browser to continue scrolling smoothly even
while the event listener is processing. For example:
```javascript
eventContract.addEvent(eventType, prefixedEventType, /* passive= */ true);
```

### 2. Embed the `EventContract`

In your server rendered application, embed the contract bundle at the top of
your `<body>`, before any other content is rendered. Make sure that the bundle
is inlined in a `<script>` tag rather than loaded from a URL, since inlined
scripts will block rendering and prevent showing content before JSAction is
installed.

```html
<body>
  <script type="text/javascript">
    <!-- inline bundled code from above here -->
  </script>
    <!-- ...page content here... -->
</body>
```

### 3. Bind to events with `jsaction` attributes

Add a `jsaction` attribute for every handler in your application that you want
to register with JSAction. If you're embedding JSAction into a framework, you
would probably update your event handling APIs to automatically render these
attributes for your users.

```html
<button type="button" jsaction="click:handleClick">Buy now!</button>
```

### 4. Register your application with JSAction

Finally, once your application is bootstrapped and ready to handle events,
you'll need to create a `Dispatcher` and register it with the `EventContract`
that has been queueing events.

```javascript
import {Dispatcher, registerDispatcher} from '@angular/core/primitives/event-dispatch';

function handleEvent(eventInfoWrapper) {
  // eventInfoWrapper contains all the information about the event
  const eventType = eventInfoWrapper.getEventType();
  const handlerName = eventInfoWrapper.getAction().name;
  const event = eventInfoWrapper.getEvent();

  // Your application or framework must now decide how to get and call the
  // appropriate handler.
  myApp.runHandler(eventType, handlerName, event);
}

function eventReplayer(eventInfoWrappers) {
  // The dispatcher uses a separate callback for replaying events to allow
  // control over how the events are replayed. Here we simply handle them like
  // any other event.
  for (const eventInfoWrapper of eventInfoWrappers) {
    handleEvent(eventInfoWrapper);
  }
}

// Get the contract that we stashed in the other bundle.
const eventContract = window['__ec'];
const dispatcher = new Dispatcher(handleEvent, {eventReplayer});

// This will replay any queued events and call handleEvent for each one of them.
registerDispatcher(eventContract, dispatcher);
```

Now the application is set up to handle events through JSAction! What the
application does to handle the dispatched events is up to you. It can be as
simple as calling methods in a map keyed by handler name, or as complicated as a
dynamic lazy loading system to load a handler based on the handler name.

### 5. [optional] Cleanup event contract

Optionally, you can clean up and remove the event contract from the app if you
plan to replace all jsaction attributes with native event handlers. There are
some tradeoffs to doing this:

Pros of cleaning up event contract:

- Native handlers avoid the [quirks](#known-caveats) of JSAction dispatching

Pros of keeping event contract:

- JSAction's event delegation drastically reduces the number of event
  listeners registered with the browser. In extreme cases, registering
  thousands of listeners in your app can be noticably slow.
- There may be slight behavior differences when your event is dispatched via
  JSAction vs native event listeners. Always using JSAction dispatch keeps
  things consistent.

<!-- end list -->

```javascript
window['__ec'].cleanUp();
```

## Known caveats

Because JSAction may potentially replay queued events some time after the events
originally fired, certain APIs like `e.preventDefault()` or
`e.stopPropagation()` won't function correctly.

<!-- TODO: Add a comprehensive list of known behavior differences for both replayed and delegated events. There are also plans to emulate some browser behavior (i.e. stopPropagation) that may fix some of these. -->
