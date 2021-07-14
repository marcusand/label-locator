import {
  Weights,
  OverlapsRemoveArgs,
  OverlapsRemoveReturn,
  needsUpdateArgs,
} from "./interfaces";

import {
  rectOverlap,
  coolingSchedule,
  distance,
  lineIntersect,
  getRandomIndex,
} from "./lib";

const weightDefaults: Weights = {
  leaderLineLength: 0.1,
  leaderLineIntersection: 0.1,
  labelLabelOverlap: 30,
  labelAnchorOverlap: 30,
  labelAnchorRootOverlap: 30,
  outOfBounds: 5000,
};

const maxMove = 2000;
const maxAngle = 360;

export default function overlapsRemove(args: OverlapsRemoveArgs): OverlapsRemoveReturn {
  const labels = args.labels.map((label) => ({ ...label }));
  const anchors = args.anchors.map((anchor) => ({ ...anchor }));
  const containerPadding = args.containerPadding || [0, 0, 0, 0];
  const labelMargin = args.labelMargin || 0;
  const weights = { ...weightDefaults, ...args.weights };
  const hardwallBoundaries = args.hardwallBoundaries === false ? false : true;
  const { containerWidth, containerHeight } = args;

  const isOutOfBounds = (index: number): boolean => {
    const label = labels[index];

    // right
    if (label.x + label.width + labelMargin >= containerWidth - containerPadding[2]) {
      return true;
    }

    // left
    if (label.x - labelMargin <= 0 + containerPadding[0]) {
      return true;
    }

    // bottom
    if (label.y + label.height + labelMargin >= containerHeight - containerPadding[3]) {
      return true;
    }

    // top
    if (label.y - labelMargin <= containerPadding[1]) {
      return true;
    }

    return false;
  };

  const hasLabelAnchorRootOverlap = (index: number): boolean => {
    const label = labels[index];
    const anchor = anchors[index];

    return (
      anchor.x >= label.x - labelMargin &&
      anchor.x <= label.x + label.width + labelMargin &&
      anchor.y >= label.y - labelMargin &&
      anchor.y <= label.y + label.height + labelMargin
    );
  };

  const getLabelLabelOverlap = (indexA: number, indexB: number): number => {
    const labelA = labels[indexA];
    const labelB = labels[indexB];

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
  };

  const getLabelAnchorOverlap = (indexLabel: number, indexAnchor: number): number => {
    const label = labels[indexLabel];
    const anchor = anchors[indexAnchor];

    return rectOverlap(
      {
        x1: label.x - labelMargin,
        y1: label.y - labelMargin,
        x2: label.x + label.width + labelMargin,
        y2: label.y + label.height + labelMargin,
      },
      {
        x1: anchor.x - anchor.length,
        y1: anchor.y - anchor.length,
        x2: anchor.x + anchor.length,
        y2: anchor.y + anchor.length,
      },
    );
  };

  const energy = (index: number, energyFactor?: number): number => {
    const label = labels[index];
    const anchor = anchors[index];
    let energy = 0;

    const anchorLabelDistance = distance(
      { x: label.x, y: label.y },
      { x: anchor.x, y: anchor.y },
    );

    // label length penalty
    energy += Math.abs(anchor.length - anchorLabelDistance) * weights.leaderLineLength;

    // out ouf bounds penalty
    if (isOutOfBounds(index)) {
      energy += weights.outOfBounds;
    }

    // label anchor root penalty
    if (hasLabelAnchorRootOverlap(index)) energy += weights.labelAnchorRootOverlap;

    // label orientation penalty
    // const dx = (label.x - anchor.x) / anchorLabelDistance;
    // const dy = (label.y - anchor.y) / anchorLabelDistance;
    // const orientationX = 10 / Math.abs(dx);
    // const orientationY = 10 / Math.abs(dy);

    // if (orientationX && orientationY) {
    //   energy += orientationX;
    //   energy += orientationY;
    // }

    // if (dx === 0 || dy === 0) {
    //   energy += 300;
    // }

    // if (dx > 0 && dy > 0) {
    //   energy += weights.orientation.left;
    // } else if (dx < 0 && dy > 0) {
    //   energy += weights.orientation.bottom;
    // } else if (dx < 0 && dy < 0) {
    //   energy += weights.orientation.right;
    // } else {
    //   energy += weights.orientation.right;
    // }

    labels.forEach((currLabel, i) => {
      if (index === i) return;

      const currAnchor = anchors[i];

      const hasIntersection = lineIntersect(
        { x1: anchor.x, y1: anchor.y, x2: label.x, y2: label.y },
        { x1: currAnchor.x, y1: currAnchor.y, x2: currLabel.x, y2: currLabel.y },
      );

      const labelLabelOverlap = getLabelLabelOverlap(index, i);
      const labelAnchorOverlap = getLabelAnchorOverlap(index, i);

      energy += labelLabelOverlap * weights.labelLabelOverlap;
      energy += labelAnchorOverlap * weights.labelAnchorOverlap;
      if (hasIntersection) energy += weights.leaderLineIntersection;
    });

    if (energyFactor >= 0) energy *= energyFactor;

    return energy;
  };

  type Transformation = "move" | "rotate";

  const transform = (currT: number, transformation: Transformation): void => {
    // select random label
    const index = getRandomIndex(labels.length);
    const label = labels[index];
    const xOld = label.x;
    const yOld = label.y;
    const oldEnergy = energy(index);

    if (transformation === "move") move(index);
    if (transformation === "rotate") rotate(index);

    const newEnergy = energy(index, label.energyFactor);
    const deltaEnergy = newEnergy - oldEnergy;

    const e = Math.exp(-deltaEnergy / currT);
    const condition = Math.random() >= e;
    const oob = hardwallBoundaries ? isOutOfBounds(index) : false;

    if (condition || oob) {
      label.x = xOld;
      label.y = yOld;
    }
  };

  const move = (index: number): void => {
    const label = labels[index];

    label.x -= (Math.random() - 0.5) * maxMove;
    label.y += (Math.random() - 0.5) * maxMove;
  };

  const rotate = (index: number): void => {
    const label = labels[index];
    const anchor = anchors[index];

    const angle = Math.random() * maxAngle;
    const s = Math.sin(angle);
    const c = Math.cos(angle);

    // translate label (relative to anchor at origin):
    label.x = label.x - anchor.x;
    label.y = label.x - anchor.y;

    // rotate label
    const xNew = label.x * c - label.y * s;
    const yNew = label.x * s + label.y * c;

    // translate label back
    label.x = xNew + anchor.x;
    label.y = yNew + anchor.y;
  };

  const start = (sweeps: number) => {
    const initialT = 1;
    let currT = 1;

    for (let a = 0; a < sweeps; a++) {
      for (let b = 0; b < labels.length; b++) {
        transform(currT, Math.random() < 0.5 ? "move" : "rotate");
      }
      currT = coolingSchedule(currT, initialT, sweeps);
    }

    return labels;
  };

  const needsUpdate = (args: needsUpdateArgs): boolean => {
    let highestEnergy = 0;
    let totalEnergy = 0;

    if (labels.length === 0) return false;

    for (let index = 0; index < labels.length; index++) {
      const labelEnergy = energy(index);

      if (highestEnergy < labelEnergy) {
        highestEnergy = labelEnergy;
      }

      totalEnergy += labelEnergy;
    }

    const averageEnergy = totalEnergy / labels.length;

    if (args.monitor) {
      console.log("average energy:", averageEnergy, "peak energy:", highestEnergy);
    }

    return highestEnergy > args.peakThreshold || averageEnergy > args.averageThreshold;
  };

  return {
    start,
    needsUpdate,
  };
}
