# label-locator

A small library for automatic label placement in a graph.  

It uses simulated annealing and is heavily inspired by [D3-Labeler](https://github.com/tinker10/D3-Labeler).

In contrast to D3-Labeler this library is written in Typescript, does not mutate its input data and is not bound to any specific rendering library.

## Install
```
npm install label-locator
```

## Usage
```js
    import labelLocator from 'label-locator';
    
    const labels = [
      {
        x: 10, 
        y: 50,
        width: 100,
        height: 100
      },
      {
        x: 20, 
        y: 70,
        width: 100,
        height: 100
      },
    ];

    const anchors = [
      {
        x: 10,
        y: 50 
      },
      {
        x: 20,
        y: 70
      }
     ];

    const locator = labelLocator({
      labels,
      anchors,
      labelMargin: 10,
      containerWidth: 1000,
      containerHeight: 1000,
      maxDistance: maxMove,
      preferredDistance: maxMove / 5,
      weights: {
        labelAnchorDistance: 2000,
        labelLabelOverlap: 30,
        labelAnchorOverlap: 0.5,
        labelOwnAnchorOverlap: 10,
        outOfBounds: Infinity,
      },
      containerPadding: [0, 0],
    });

    const labelsWithUpdatedLocations = locator.start(1500);

```