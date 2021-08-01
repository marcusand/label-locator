import { Weights, OverlapsRemoveArgs, OverlapsRemoveReturn } from "./interfaces";
import { rectOverlap, coolingSchedule, getRandomIndex } from "./lib";

const weightDefaults: Weights = {
  labelAnchorDistance: 0.1,
  labelLabelOverlap: 30,
  labelAnchorOverlap: 30,
  labelOwnAnchorOverlap: 30,
  outOfBounds: 5000,
};

export default function overlapsRemove(args: OverlapsRemoveArgs): OverlapsRemoveReturn {
  const labels = args.labels.map((label) => ({ ...label }));
  const anchors = args.anchors.map((anchor) => ({ ...anchor }));
  const containerPadding = args.containerPadding ?? [0, 0, 0, 0];
  const labelMargin = args.labelMargin ?? 0;
  const anchorMargin = args.anchorMargin ?? 0;
  const maxDistance = args.maxDistance ?? 200;
  const preferredDistance = args.preferredDistance ?? maxDistance / 2;
  const onlyMoveOrthogonally = args.onlyMoveOrthogonally ?? true;
  const weights = { ...weightDefaults, ...args.weights };
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

  const getLabelAnchorRootOverlap = (
    indexLabel: number,
    indexAnchor?: number,
  ): number => {
    const label = labels[indexLabel];
    const anchor = anchors[indexAnchor ?? indexLabel];

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

  const getLabelAnchorDx = (index: number) => {
    const label = labels[index];
    const anchor = anchors[index];
    const dimensionX = label.x < anchor.x ? label.width : 0;

    return Math.abs(label.x + dimensionX - anchor.x);
  };

  const getLabelAnchorDy = (index: number) => {
    const label = labels[index];
    const anchor = anchors[index];
    const dimensionY = label.y < anchor.y ? label.height : 0;

    return Math.abs(label.y + dimensionY - anchor.y);
  };

  const getLabelAnchorDistance = (index: number) => {
    const dx = getLabelAnchorDx(index);
    const dy = getLabelAnchorDx(index);

    return Math.sqrt(dx * dx + dy * dy);
  };

  const hasValidPosition = (index: number): boolean => {
    if (!onlyMoveOrthogonally) return true;

    const dx = getLabelAnchorDx(index);
    const dy = getLabelAnchorDy(index);

    return Math.round(dx) === Math.round(dy);
  };

  const energy = (index: number): number => {
    let energy = 0;

    const anchorLabelDistance = getLabelAnchorDistance(index);
    const deviationFromPreferredDistance = Math.abs(
      anchorLabelDistance - preferredDistance,
    );

    // label length penalty
    energy += deviationFromPreferredDistance * weights.labelAnchorDistance;

    // out ouf bounds penalty
    if (isOutOfBounds(index)) {
      energy += weights.outOfBounds;
    }

    // label anchor root penalty
    energy += getLabelAnchorRootOverlap(index) * weights.labelOwnAnchorOverlap;

    labels.forEach((label, i) => {
      if (index === i) return;

      const labelLabelOverlap = getLabelLabelOverlap(index, i);
      const labelAnchorOverlap = getLabelAnchorRootOverlap(index, i);

      energy += labelLabelOverlap * weights.labelLabelOverlap;
      energy += labelAnchorOverlap * weights.labelAnchorOverlap;
    });

    // check if valid position
    if (!hasValidPosition(index)) {
      energy *= 30;
    }

    return energy;
  };

  const transform = (currT: number): void => {
    // select random label
    const index = getRandomIndex(labels.length);
    const label = labels[index];
    const xOld = label.x;
    const yOld = label.y;
    const oldEnergy = energy(index);

    move(index);

    let newEnergy = energy(index);

    if (label.energyFactor) {
      newEnergy *= label.energyFactor;
    }

    const deltaEnergy = newEnergy - oldEnergy;

    const e = Math.exp(-deltaEnergy / currT);
    const condition = Math.random() >= e;

    if (condition) {
      label.x = xOld;
      label.y = yOld;
    }
  };

  const move = (index: number): void => {
    const label = labels[index];
    const anchor = anchors[index];
    const moveX = Math.random() * maxDistance;
    const moveY = onlyMoveOrthogonally ? moveX : Math.random() * maxDistance;
    const signX = Math.random() > 0.5 ? 1 : -1;
    const signY = Math.random() > 0.5 ? 1 : -1;

    const dimensionX = signX === -1 ? label.width : 0;
    const dimensionY = signY === -1 ? label.height : 0;

    label.x = anchor.x + signX * (moveX + dimensionX);
    label.y = anchor.y + signY * (moveY + dimensionY);
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

  return {
    start,
  };
}
