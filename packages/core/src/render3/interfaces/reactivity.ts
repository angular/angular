/**
 * The private API for signal-based inputs used by the runtime.
 */
export interface InternalInputSignal {
  bindToComputation(computation: () => unknown): void;
  bindToValue(value: unknown): void;
  initialized(): void;
}
