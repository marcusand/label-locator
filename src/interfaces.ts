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
  length: number;
}

export interface Weights {
  leaderLineLength?: number;
  leaderLineIntersection?: number;
  labelLabelOverlap?: number;
  labelAnchorOverlap?: number;
  labelAnchorRootOverlap?: number;
  outOfBounds?: number;
}

export interface OverlapsRemoveArgs {
  labels: Array<Label>;
  anchors: Array<Anchor>;
  containerWidth: number;
  containerHeight: number;
  hardwallBoundaries?: boolean;
  containerPadding?: Array<number>;
  labelMargin?: number;
  weights?: Weights;
  maxMove?: number;
}

export interface needsUpdateArgs {
  peakThreshold: number;
  averageThreshold: number;
  monitor?: boolean;
}

export interface OverlapsRemoveReturn {
  start: (sweeps: number) => Array<Label>;
  needsUpdate: (args: needsUpdateArgs) => boolean;
}
