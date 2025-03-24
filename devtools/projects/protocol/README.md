# Angular DevTools Communication Protocol

Angular DevTools injects scripts in the user application page that interact with the framework debugging APIs. The injected scripts interact with the extension via message passing using a statically typed protocol.

This subdirectory contains:
- Declaration of a statically typed message bus
- Implementation of priority aware message bus
- Interfaces that declare the messages exchanged between the extension and the page

We use the `PriorityAwareMessageBus` to ensure that certain messages have higher priority than others. Because of the asynchronous nature of the property exchange there's a risk that a message response may overwrite the result from a more recent response.

An example is:
1. We request the state of the component tree
1. We update the state
1. We request the state of the properties of a particular component

We don't have guarantees that the response of 1. will arrive before the response of 3. Often the response of 1. is larger and might be delivered after 3. In such a case, it may contain the application state prior to the update and override the state update we received from 3.
