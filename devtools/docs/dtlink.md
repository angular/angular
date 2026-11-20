# DtLink

`DtLink` (short for DevTools) is an RPC layer build on top of `MessageBus`, intended to provide a more convenient way for describing and implementing the communication logic between the frontend and the backend, in contrast of the lower-level `MessageBus`-based event emitting and listening approach, which also lacks cross-context error reporting capabilities.

The two parties in the `DtLink` architecture are the **target**, where the remote calls are executed, and the **initiator**, which initiates the calls. They correspond to the the **backend** (target) and **frontend** (initiator), in the context of DevTools.

## API and Usage

In order to be able to remotely execute functions from the initiator, you have to expose those calls on the target first. This can be achieved via `exposeDtLinkApi`, which accepts a `MessageBus` used for transport and communication, an API array, and an optional error logger:

```typescript
// An async function that returns a value
async function getSignalGraph(cmp: Cmp): SignalGraph {
  ...
}

exposeDtLinkApi(
  messageBus,
  [
    asyncFn({ getSignalGraph }) // The exposed function must be decorated.
  ]
);
```

To consume the exposed API on the initiator side, the initiator must create a `DtLinkInitiator` instance with a provided `MessageBus` that corresponds with the target's `MessageBus`. All of the available exposed remote calls should be accessible via `DtLinkInitiator.api.<REMOTE_CALL>`:

```typescript
class Service {
  dtlink = new DtLinkInitiator(messageBus);

  async updateSignalGraph() {
    const graph = await this.dtlink.api.getSignalGraph(cmp);
    ...
  }
}
```

In the context of the DevTools frontend, the `DtLinkInitiator` is a globally provided service under the `DTLINK` injection token:

```typescript
@Component({})
class DevtoolsTabs {
  dtlink = inject(DTLINK);

  async updateSignalGraph() {
    const graph = await this.dtlink.api.getSignalGraph(cmp);
    ...
  }
}
```

> [!NOTE]
> `provideDtLink()` provider function can be used to create an instance where a `MessageBus` is available.

## Supported calls and Decorators

The target supports 5 types of remote calls:

- Sync functions that return a value – should be decorated with `syncFn`
- Async functions that return/resolve a value – should be decorated with `asyncFn`
- Void sync functions – should be decorated with `voidSyncFn`
- Void async functions – should be decorated with `voidAsyncFn`
- Async generators – should be decorated with `asyncGeneratorFn`

A decorator accepts a single-valued object where the key corresponds to the exposed API/call name and the value – the actual remote call. For example:

```typescript
// On target:
function targetFoo() {}

const API = [
  syncFn({ foo: targetFoo });
];

// Will be available as `foo` on the initiator side:
dtLink.api.foo();
```

Of course, in the majority of cases, the exposed call name is unchanged, i.e. `decorator({ remoteCall: remoteCall })`, so the object property value shorthand is commonly used: `decorator({ remoteCall })`.

> [!NOTE]
> All sync exposed calls on the target are consumed as async calls on the initiator side.

## Mechanism

As mentioned in the header, the `DtLink` works on top of the existing `MessageBus` infrastructure, which on its own operates over the `window.postMessage` API.

When both the target (BE) and the initiator (FE) have `DtLink` set up, the following happens:

- On the target side (BE), the provided API is exposed by using a set of `MessageBus` listeners along with `emit`s. Along with that, the API metadata (remote call names and types) is serialized and a special dedicated listener is created for serving this metadata to the initiator when requested.
- On the initiator side (FE), the API metadata is requested since it doesn’t know what kind of remote calls to expect. Based on it, the initiator `MessageBus` wiring is established. The remote API is accessed via a `Proxy` object.
- In the case of DevTools, typings on the frontend are entirely inferred from the API array exposed on the backend. No need for a shared manually-maintained protocol similar to the message bus `Events`.
- After all of this is set, the two parties can successfully initiate and, respectively, execute remote calls.

> [!NOTE]
> The serialized API metadata sent from the target to the initiator is represented by a simple `Record<CALL_NAME, CALL_TYPE>`.
