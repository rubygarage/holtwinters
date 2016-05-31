Holt-Winters
============

Exponential smoothing is a rule of thumb technique for smoothing time series data, particularly for recursively applying as many as three low-pass filters with exponential window functions.

https://en.wikipedia.org/wiki/Exponential_smoothing

## Installation

```shell
  npm install holtwinters --save
```

## Usage

```js
  var holtWinters = require('holtwinters')
  var getAugumentedDataset = holtWinters.getAugumentedDataset

  var data = [1, 4, 5, 3, 1, 3, 4, 1, 2, 4, 5, 5]
  var predictionLength = 4

  var result = getAugumentedDataset(data, predictionLength)


  console.log(result)
  // OUTPUT:
  {
    augumentedDataset: [1, 4, 5, 3, 1, 3, 4, 1, 2, 4, 5, 5, 1.3338017069503336, 2.9451723210706824, 5.691675635182751, 6.721827583201698],
    alpha: 0.1,
    beta: 1,
    gamma: 0.4,
    period: 5,
    mse: 2.0945071482039226,
    sse: 14.661550037427457,
    mpe: 0.06217855085131068
  }
```

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style.
Add unit tests for any new or changed functionality. Lint and test your code.
