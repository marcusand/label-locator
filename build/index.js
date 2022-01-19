import { coolingSchedule, getRandomIndex, getLabelAnchorDistance, getLabelLabelOverlap, getLabelAnchorRootOverlap, isPositionOrthogonal, } from "./lib";
const weightDefaults = {
    labelAnchorDistance: 0.1,
    labelLabelOverlap: 30,
    labelAnchorOverlap: 30,
    labelOwnAnchorOverlap: 30,
    outOfBounds: 5000,
};
export default function overlapsRemove(args) {
    var _a, _b, _c, _d, _e, _f;
    const labels = args.labels.map((label) => (Object.assign({}, label)));
    const anchors = args.anchors.map((anchor) => (Object.assign({}, anchor)));
    const containerPadding = (_a = args.containerPadding) !== null && _a !== void 0 ? _a : [0, 0, 0, 0];
    const labelMargin = (_b = args.labelMargin) !== null && _b !== void 0 ? _b : 0;
    const anchorMargin = (_c = args.anchorMargin) !== null && _c !== void 0 ? _c : 0;
    const maxDistance = (_d = args.maxDistance) !== null && _d !== void 0 ? _d : 200;
    const preferredDistance = (_e = args.preferredDistance) !== null && _e !== void 0 ? _e : maxDistance / 2;
    const onlyMoveOrthogonally = (_f = args.onlyMoveOrthogonally) !== null && _f !== void 0 ? _f : true;
    const weights = Object.assign(Object.assign({}, weightDefaults), args.weights);
    const { containerWidth, containerHeight } = args;
    const isOutOfBounds = (index) => {
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
    const energy = (index) => {
        const anchor = anchors[index];
        const label = labels[index];
        let energy = 0;
        const anchorLabelDistance = getLabelAnchorDistance(label, anchor);
        const deviationFromPreferredDistance = Math.abs(anchorLabelDistance - preferredDistance);
        // label length penalty
        energy += deviationFromPreferredDistance * weights.labelAnchorDistance;
        // out ouf bounds penalty
        if (isOutOfBounds(index)) {
            energy += weights.outOfBounds;
        }
        // label anchor root penalty
        energy +=
            getLabelAnchorRootOverlap(label, anchor, labelMargin, anchorMargin) *
                weights.labelOwnAnchorOverlap;
        labels.forEach((currLabel, i) => {
            if (index === i)
                return;
            const currAnchor = anchors[i];
            const labelLabelOverlap = getLabelLabelOverlap(label, currLabel, labelMargin);
            const labelAnchorOverlap = getLabelAnchorRootOverlap(label, currAnchor, labelMargin, anchorMargin);
            energy += labelLabelOverlap * weights.labelLabelOverlap;
            energy += labelAnchorOverlap * weights.labelAnchorOverlap;
        });
        // check if valid position
        if (onlyMoveOrthogonally && !isPositionOrthogonal(label, anchor)) {
            energy *= 30;
        }
        return energy;
    };
    const transform = (currT) => {
        // select random label
        const index = getRandomIndex(labels.length);
        const label = labels[index];
        if (label.fixed)
            return;
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
    const move = (index) => {
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
    const start = (sweeps) => {
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
//# sourceMappingURL=index.js.map