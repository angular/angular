export interface WebWorkerMessage {
  type: string;
  payload: any;
  id?: number;
}
