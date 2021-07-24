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

export default function overlapsRemove(args: OverlapsRemoveArgs): OverlapsRemoveReturn {
  const labels = args.labels.map((label) => ({ ...label }));
  const anchors = args.anchors.map((anchor) => ({ ...anchor }));
  const containerPadding = args.containerPadding || [0, 0, 0, 0];
  const labelMargin = args.labelMargin || 0;
  const maxMove = args.maxMove || 200;
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

  const getLabelAnchorRootOverlap = (index: number): number => {
    const label = labels[index];
    const anchor = anchors[index];

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

  const hasValidPosition = (index: number): boolean => {
    const label = labels[index];
    const anchor = anchors[index];

    const dimensionX = label.x < anchor.x ? label.width : 0;
    const dimensionY = label.y < anchor.y ? label.height : 0;

    const dx = Math.abs(label.x + dimensionX - anchor.x);
    const dy = Math.abs(label.y + dimensionY - anchor.y);
    const a = Math.round(dx) === Math.round(dy);

    return a;
  };

  const energy = (index: number): number => {
    const label = labels[index];
    const anchor = anchors[index];
    let energy = 0;

    const anchorLabelDistance = distance(
      { x: label.x, y: label.y },
      { x: anchor.x, y: anchor.y },
    );

    // label length penalty
    if (anchorLabelDistance < 10) {
      energy += Math.pow(weights.leaderLineLength, 3);
    } else {
      energy += anchorLabelDistance * weights.leaderLineLength;
    }

    // out ouf bounds penalty
    if (isOutOfBounds(index)) {
      energy += weights.outOfBounds;
    }

    // label anchor root penalty
    energy += getLabelAnchorRootOverlap(index) * weights.labelAnchorRootOverlap;

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

    return energy;
  };

  const transform = (currT: number): void => {
    // select random label
    const index = getRandomIndex(labels.length);
    const label = labels[index];
    const xOld = label.x;
    const yOld = label.y;
    const validPosition = hasValidPosition(index);
    let oldEnergy = energy(index);

    if (!validPosition) {
      oldEnergy *= 5;
    }

    move(index);

    let newEnergy = energy(index);

    if (label.energyFactor) {
      newEnergy *= label.energyFactor;
    }

    const deltaEnergy = newEnergy - oldEnergy;

    const e = Math.exp(-deltaEnergy / currT);
    const condition = Math.random() >= e;
    const oob = hardwallBoundaries ? isOutOfBounds(index) : false;

    if (oob || condition) {
      label.x = xOld;
      label.y = yOld;
    }
  };

  const move = (index: number): void => {
    const label = labels[index];
    const anchor = anchors[index];
    const move = Math.random() * maxMove;
    const signX = Math.random() > 0.5 ? 1 : -1;
    const signY = Math.random() > 0.5 ? 1 : -1;

    const dimensionX = signX === -1 ? label.width : 0;
    const dimensionY = signY === -1 ? label.height : 0;

    label.x = anchor.x + signX * (move + dimensionX);
    label.y = anchor.y + signY * (move + dimensionY);
  };

  const start = (sweeps: number) => {
    const initialT = 1;
    let currT = 1;

    for (let a = 0; a < sweeps; a++) {
      for (let b = 0; b < labels.length; b++) {
        transform(currT);
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
