export interface Rect {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface Line {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface Label {
  x: number;
  y: number;
  width: number;
  height: number;
  energyFactor?: number;
}

export interface Anchor {
  x: number;
  y: number;
}

export interface Weights {
  leaderLineLength?: number;
  leaderLineIntersection?: number;
  labelLabelOverlap?: number;
  labelAnchorOverlap?: number;
  labelOwnAnchorOverlap?: number;
  outOfBounds?: number;
}

export interface OverlapsRemoveArgs {
  labels: Array<Label>;
  anchors: Array<Anchor>;
  containerWidth: number;
  containerHeight: number;
  containerPadding?: Array<number>;
  labelMargin?: number;
  anchorMargin?: number;
  weights?: Weights;
  maxMove?: number;
}

export interface OverlapsRemoveReturn {
  start: (sweeps: number) => Array<Label>;
}
