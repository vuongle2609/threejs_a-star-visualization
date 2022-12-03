type nodeTypeBlock<T> = {
  f: number;
  g: number;
  code: number;
  position: number[];
  prevNode: T | null;
};
export interface nodeTypeRecursive extends nodeTypeBlock<nodeTypeRecursive> {}
