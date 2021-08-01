import { Rect, Label, Anchor } from "./interfaces";
export declare function getRandomIndex(arrayLength: number): number;
/**
 * linear cooling
 *
 * @param currT
 * @param initialT
 * @param sweeps
 * @returns
 */
export declare function coolingSchedule(currT: number, initialT: number, sweeps: number): number;
/**
 * returns the size of the overlap area of two rectangles
 *
 * @param rectA
 * @param rectB
 * @returns
 */
export declare function rectOverlap(rectA: Rect, rectB: Rect): number;
export declare function getLabelAnchorRootOverlap(label: Label, anchor: Anchor, labelMargin: number, anchorMargin: number): number;
export declare function getLabelLabelOverlap(labelA: Label, labelB: Label, labelMargin: number): number;
export declare function getLabelAnchorDx(label: Label, anchor: Anchor): number;
export declare function getLabelAnchorDy(label: Label, anchor: Anchor): number;
export declare function getLabelAnchorDistance(label: Label, anchor: Anchor): number;
export declare function isPositionOrthogonal(label: Label, anchor: Anchor): boolean;
