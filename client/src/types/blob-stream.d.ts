declare module 'blob-stream' {
  interface BlobStream {
    on(event: string, callback: Function): void;
    pipe<T>(destination: T): T;
    toBlob(type?: string): Blob;
  }

  function blobStream(): BlobStream;
  export = blobStream;
}