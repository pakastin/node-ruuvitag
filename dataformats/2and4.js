// parser for data formats 2 and 4

function unSign(signed) {
  // takes signed byte value, returns integer
  // see: https://github.com/ruuvi/ruuvi-sensor-protocols#protocol-specification-data-format-2-and-4
  return signed & 0x80 ? -1 * (signed & 0x7f) : signed;
}

module.exports = {
  parse: buffer => {
    return {
      humidity: buffer[1] / 2,
      temperature: unSign(buffer[2]),
      pressure: (buffer[4] * 256 + buffer[5] + 50000) / 100,
      eddystoneId: buffer.length === 7 ? buffer[6] : undefined,
    };
  },
};
