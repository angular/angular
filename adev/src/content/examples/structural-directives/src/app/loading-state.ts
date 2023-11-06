export type Loaded<T> = { type: 'loaded', data: T };

export type Loading = { type: 'loading' };

export type LoadingState<T> = Loaded<T> | Loading;
