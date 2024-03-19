export function getErrorFromUnknown(cause: unknown): Error & { statusCode?: number; code?: string } {
    if (cause instanceof Error) {
      return cause;
    }
    if (typeof cause === "string") {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore https://github.com/tc39/proposal-error-cause
      return new Error(cause, { cause });
    }
  
    return new Error(`Unhandled error of type '${typeof cause}''`);
  }