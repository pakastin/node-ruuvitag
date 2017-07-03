// parser for data formats 2 and 4

module.exports = {
  parse: buffer => {
    return {
      humidity: buffer[1] / 2,
      temperature: undefined,
      pressure: undefined,
      id: undefined
    };
  }
};