declare module 'tar-stream' {

  import {Readable, Writable} from 'stream';

  export interface Pack extends Readable {
    entry(header: Header, callback?: (err?: any) => {}): Writable;
    entry(header: Header, contents: string, callback?: (err?: any) => {}): Writable;
    entry(header: Header, buffer: Buffer, callback?: (err?: any) => {}): Writable;
    entry(header: Header, buffer: string|Buffer, callback?: (err?: any) => {}): Writable;
    finalize();
    destroy(err: any);
  }

  export interface Header {
    name: string;
    mode?: number;
    uid?: number;
    gid?: number;
    size?: number;
    mtime?: Date;
    type?: type;
    linkname?: string;
    uname?: string;
    gname?: string;
    devmajor?: number;
    devminor?: number;
  }

  export function pack(): Pack;
}
