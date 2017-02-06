// Classes
export class UploadError extends Error {
  // Constructor
  constructor(public status: number = 500, message?: string) {
    super(message);
    Object.setPrototypeOf(this, UploadError.prototype);
  }
}
