/**
  * RubyGarage.
  * https://rubygarage.org/
  *
  * Copyright (c) 2016 RubyGarage.
  * Licensed under the MIT license.
  */

/**
  * Returns augumented dataset, seasonal coefficients and errors.
  *
  * @param {Array<Number>} data - input data
  * @param {Number} m - extrapolated future data points
  *
  * @returns {Object}
  */
function getAugumentedDataset (data, m) {
  var initialparams = [0.0, 0.1, 0.2, 0.4, 0.6, 0.8, 1.0]
  var alpha, beta, gamma, period, prediction
  var err = Infinity

  // TODO: rewrite this bruteforce with Levenberg-Marquardt equation
  initialparams.forEach(function (a) {
    initialparams.forEach(function (b) {
      initialparams.forEach(function (g) {
        for (var p = 1; p < data.length / 2; p++) {
          var currentPrediction = getForecast(data, a, b, g, p, m)
          var error
          if (currentPrediction) {
            error = mse(data, currentPrediction, p)
          }

          if (error && err > error) {
            err = error
            alpha = a
            beta = b
            gamma = g
            period = p
            prediction = currentPrediction
          }
        }
      })
    })
  })

  var augumentedDataset = prediction.slice()

  for (var i = 0; i < data.length; i++) {
    augumentedDataset[i] = data[i]
  }

  return {
    augumentedDataset: augumentedDataset,
    alpha: alpha,
    beta: beta,
    gamma: gamma,
    period: period,
    mse: mse(data, prediction, period),
    sse: sse(data, prediction, period),
    mpe: mpe(data, prediction, period)
  }
}

function getForecast (data, alpha, beta, gamma, period, m) {
  var seasons, seasonal, st1, bt1

  if (!validArgs(data, alpha, beta, gamma, period, m)) {
    return
  }

  seasons = Math.floor(data.length / period)
  st1 = data[0]
  bt1 = initialTrend(data, period)
  seasonal = seasonalIndices(data, period, seasons)

  return calcHoltWinters(
    data,
    st1,
    bt1,
    alpha,
    beta,
    gamma,
    seasonal,
    period,
    m
  )
}

function mse (origin, data, period) {
  return sse(origin, data, period) / (origin.length - period)
}

function sse (origin, data, period) {
  var sum = 0
  for (var i = period; i < origin.length; i++) {
    sum += Math.pow(data[i] - origin[i], 2)
  }
  return sum
}

function mpe (origin, data, period) {
  var sum = 0
  for (var i = period; i < origin.length; i++) {
    sum += (data[i] - origin[i]) / origin[i]
  }
  return Math.abs(sum / (origin.length - period))
}

function validArgs (data, alpha, beta, gamma, period, m) {
  if (!data.length) {
    return false
  }
  if (m <= 0) {
    return false
  }
  if (m > period) {
    return false
  }
  if (alpha < 0.0 || alpha > 1.0) {
    return false
  }
  if (beta < 0.0 || beta > 1.0) {
    return false
  }
  if (gamma < 0.0 || gamma > 1.0) {
    return false
  }
  return true
}

function initialTrend (data, period) {
  var sum = 0
  for (var i = 0; i < period; i++) {
    sum += (data[period + i] - data[i])
  }
  return sum / (period * period)
}

function seasonalIndices (data, period, seasons) {
  var savg, obsavg, si, i, j

  savg = Array(seasons)
  obsavg = Array(data.length)

  si = Array(period)

  for (i = 0; i < seasons; i++) {
    savg[i] = 0.0
  }
  for (i = 0; i < period; i++) {
    si[i] = 0.0
  }

  for (i = 0; i < seasons; i++) {
    for (j = 0; j < period; j++) {
      savg[i] += data[(i * period) + j]
    }
    savg[i] /= period
  }
  for (i = 0; i < seasons; i++) {
    for (j = 0; j < period; j++) {
      obsavg[(i * period) + j] = data[(i * period) + j] / savg[i]
    }
  }
  for (i = 0; i < period; i++) {
    for (j = 0; j < seasons; j++) {
      si[i] += obsavg[(j * period) + i]
    }
    si[i] /= seasons
  }

  return si
}

function calcHoltWinters
  (data, st1, bt1, alpha, beta, gamma, seasonal, period, m) {
  var len = data.length
  var st = Array(len)
  var bt = Array(len)
  var it = Array(len)
  var ft = Array(len)
  var i

  st[1] = st1
  bt[1] = bt1

  for (i = 0; i < len; i++) {
    ft[i] = 0.0
  }

  for (i = 0; i < period; i++) {
    it[i] = seasonal[i]
  }

  for (i = 2; i < len; i++) {
    if (i - period >= 0) {
      st[i] = ((alpha * data[i]) / it[i - period]) +
        ((1.0 - alpha) * (st[i - 1] + bt[i - 1]))
    } else {
      st[i] = (alpha * data[i]) + ((1.0 - alpha) *
                                   (st[i - 1] + bt[i - 1]))
    }

    bt[i] = (gamma * (st[i] - st[i - 1])) +
      ((1 - gamma) * bt[i - 1])

    if (i - period >= 0) {
      it[i] = ((beta * data[i]) / st[i]) +
        ((1.0 - beta) * it[i - period])
    }

    if (i + m >= period) {
      ft[i + m] = (st[i] + (m * bt[i])) *
        it[i - period + m]
    }
  }

  return ft
}

module.exports = getAugumentedDataset
