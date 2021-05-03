declare module jasmine {
  interface AsyncMatchers {
    toBeRejectedWithPreviewServerError(status: number, message?: string | RegExp): Promise<void>;
  }
}
