export type Match<P> = {
  params: P;
  isExact: boolean;
  path: string;
  url: string;
};

export interface IPathPattern<P> {
  match(path: string): (Match<P> | null);
  compile(params: P): string;
}
