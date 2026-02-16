export type NavigateCb = (
  elementOrPath: string | Element,
  basePath?: string | undefined,
) => Promise<boolean>;
