/**
 * Created by liukai on 2017/6/19.
 */
export function getEntryFileName (listEntry) {
  let name = ''
  if (listEntry.bittorrent) name = listEntry.bittorrent.info.name
  else name = listEntry.files[0].path.replace(/^.*[\\\/]/, '')
  if (!name) name = listEntry.files[0].uris[0].uri
  return name || '...'
}
export function bytesToSize (bytes, keepDigits) {
  bytes = Number(bytes)
  var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  if (bytes === 0) return '0 KB'
  var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1000)), 10)
  if (i === 0) return bytes + ' ' + sizes[i]
  var k = [1, 1, 10, 100, 100][i]
  if (Number.isInteger(keepDigits)) k = Math.pow(10, keepDigits)
  return `${Math.floor(bytes * 100 / Math.pow(1024, i) * k) / (100 * k)} ${sizes[i]}`
}
export function duration (value, format) {
  var DURATION_FORMATS_SPLIT = /((?:[^ydhms']+)|(?:'(?:[^']|'')*')|(?:y+|d+|h+|m+|s+))(.*)/;
  var DURATION_FORMATS = {
    y: { // years
      // "longer" years are not supported
      value: 365 * 24 * 60 * 60 * 1000,
    },
    yy: {
      value: 'y',
      pad: 2,
    },
    d: { // days
      value: 24 * 60 * 60 * 1000,
    },
    dd: {
      value: 'd',
      pad: 2,
    },
    h: { // hours
      value: 60 * 60 * 1000,
    },
    hh: { // padded hours
      value: 'h',
      pad: 2,
    },
    m: { // minutes
      value: 60 * 1000,
    },
    mm: { // padded minutes
      value: 'm',
      pad: 2,
    },
    s: { // seconds
      value: 1000,
    },
    ss: { // padded seconds
      value: 's',
      pad: 2,
    },
    sss: { // milliseconds
      value: 1,
    },
    ssss: { // padded milliseconds
      value: 'sss',
      pad: 4,
    },
  };

  function _parseFormat (string) {
    // @inspiration AngularJS date filter
    var parts = [];
    var format = string ? string.toString() : '';

    while (format) {
      var match = DURATION_FORMATS_SPLIT.exec(format);

      if (match) {
        parts = parts.concat(match.slice(1));

        format = parts.pop();
      } else {
        parts.push(format);

        format = null;
      }
    }

    return parts;
  }

  function _formatDuration (timestamp, format) {
    var text = '';
    var values = {};

    format.filter(function (format) { // filter only value parts of format
      return DURATION_FORMATS.hasOwnProperty(format);
    }).map(function (format) { // get formats with values only
      var config = DURATION_FORMATS[format];

      if (config.hasOwnProperty('pad')) {
        return config.value;
      } else {
        return format;
      }
    }).filter(function (format, index, arr) { // remove duplicates
      return (arr.indexOf(format) === index);
    }).map(function (format) { // get format configurations with values
      return Object.assign({
        name: format,
      }, DURATION_FORMATS[format]);
    }).sort(function (a, b) { // sort formats descending by value
      return b.value - a.value;
    }).forEach(function (format) { // create values for format parts
      var value = values[format.name] = Math.floor(timestamp / format.value);

      timestamp = timestamp - (value * format.value);
    });

    for(let i=0;i<format.length;i++){
      let part = format[i];

      var data = DURATION_FORMATS[part];

      if (data) {
        var value = values[data.value];
        if(!value&&!values[part] && format[i+1].match(/^\[.+\]/)){
          i++;
          continue;
        }
        text += (data.hasOwnProperty('pad') ? _padNumber(value, Math.max(data.pad, value.toString().length)) : values[part]);
      } else {
        text += part.replace(/(^'|'$)/g, '').replace(/''/g, '\'').replace(/^\[(.*)\]/,'$1');
      }

    }

   /* format.forEach(function (part) {
      var format = DURATION_FORMATS[part];

      if (format) {
        var value = values[format.value];

        text += (format.hasOwnProperty('pad') ? _padNumber(value, Math.max(format.pad, value.toString().length)) : values[part]);
      } else {
        text += part.replace(/(^'|'$)/g, '').replace(/''/g, '\'');
      }
    });*/

    return text;
  }

  function _padNumber (number, len) {
    return ((new Array(len + 1)).join('0') + number).slice(-len);
  }

  var parsedValue = parseFloat(value, 10);
  var parsedFormat = _parseFormat(format);

  if (isNaN(parsedValue) || (parsedFormat.length === 0)) {
    return value;
  } else {
    return _formatDuration(parsedValue, parsedFormat);
  }
}
