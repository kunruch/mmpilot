
// Recusrsively merge config and custom, overriding the base value with custom values
function deepMerge (base, custom) {
  Object.keys(custom).forEach(function (key) {
    if (!base.hasOwnProperty(key) || typeof base[key] !== 'object') {
      base[key] = custom[key]
    } else {
      base[key] = deepMerge(base[key], custom[key])
    }
  })

  return base
}

exports.deepMerge = deepMerge
