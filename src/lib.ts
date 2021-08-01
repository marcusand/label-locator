import { Rect, Label, Anchor } from "./interfaces";

export function getRandomIndex(arrayLength: number): number {
  return Math.floor(Math.random() * arrayLength);
}

/**
 * linear cooling
 *
 * @param currT
 * @param initialT
 * @param sweeps
 * @returns
 */
export function coolingSchedule(currT: number, initialT: number, sweeps: number): number {
  return currT - initialT / sweeps;
}

/**
 * returns the size of the overlap area of two rectangles
 *
 * @param rectA
 * @param rectB
 * @returns
 */
export function rectOverlap(rectA: Rect, rectB: Rect): number {
  if (
    rectA.x1 > rectA.x2 ||
    rectA.y1 > rectA.y2 ||
    rectB.x1 > rectB.x2 ||
    rectB.y1 > rectB.y2
  ) {
    throw new Error("Rect has negative size");
  }

  const xOverlap = Math.max(
    0,
    Math.min(rectA.x2, rectB.x2) - Math.max(rectA.x1, rectB.x1),
  );
  const yOverlap = Math.max(
    0,
    Math.min(rectA.y2, rectB.y2) - Math.max(rectA.y1, rectB.y1),
  );

  return xOverlap * yOverlap;
}

export function getLabelAnchorRootOverlap(
  label: Label,
  anchor: Anchor,
  labelMargin: number,
  anchorMargin: number,
): number {
  return rectOverlap(
    {
      x1: label.x - labelMargin,
      y1: label.y - labelMargin,
      x2: label.x + label.width + labelMargin,
      y2: label.y + label.height + labelMargin,
    },
    {
      x1: anchor.x - anchorMargin,
      y1: anchor.y - anchorMargin,
      x2: anchor.x + anchorMargin,
      y2: anchor.y + anchorMargin,
    },
  );
}

export function getLabelLabelOverlap(
  labelA: Label,
  labelB: Label,
  labelMargin: number,
): number {
  return rectOverlap(
    {
      x1: labelA.x - labelMargin,
      y1: labelA.y - labelMargin,
      x2: labelA.x + labelA.width + labelMargin,
      y2: labelA.y + labelA.height + labelMargin,
    },
    {
      x1: labelB.x - labelMargin,
      y1: labelB.y - labelMargin,
      x2: labelB.x + labelB.width + labelMargin,
      y2: labelB.y + labelB.height + labelMargin,
    },
  );
}

export function getLabelAnchorDx(label: Label, anchor: Anchor): number {
  const dimensionX = label.x < anchor.x ? label.width : 0;

  return Math.abs(label.x + dimensionX - anchor.x);
}

export function getLabelAnchorDy(label: Label, anchor: Anchor): number {
  const dimensionY = label.y < anchor.y ? label.height : 0;

  return Math.abs(label.y + dimensionY - anchor.y);
}

export function getLabelAnchorDistance(label: Label, anchor: Anchor): number {
  const dx = getLabelAnchorDx(label, anchor);
  const dy = getLabelAnchorDx(label, anchor);

  return Math.sqrt(dx * dx + dy * dy);
}

export function isPositionOrthogonal(label: Label, anchor: Anchor): boolean {
  const dx = getLabelAnchorDx(label, anchor);
  const dy = getLabelAnchorDy(label, anchor);

  return Math.round(dx) === Math.round(dy);
}
