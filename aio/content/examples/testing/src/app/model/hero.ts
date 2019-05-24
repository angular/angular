export interface Hero {
  id: number;
  name: string;
}

// SystemJS bug:
// TS file must export something real in JS, not just interfaces
export const _dummy = undefined;
