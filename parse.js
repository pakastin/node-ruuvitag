const dataFormats = require('./dataformats');

function stripUrl(url) {
  const match = url.match(/#(.+)$/);
  return match ? match[1] : new Error('Invalid url');
}

function getReadings(buffer) {
  // validate
  if (buffer.length !== 6) {
    return new Error('Invalid data');
  }
  const dataFormat = buffer[0];

  return dataFormat === 2 || dataFormat === 4 ?
    dataFormats.formats_2_and_4.parse(buffer) :
    new Error('Unsupported data format: ' + dataFormat);
}

const that = module.exports = {};

that.parseUrl = url => {

  if (!url.match(/ruu\.vi/)) {
    return new Error('Not a ruuviTag url');
  }

  const encodedData = stripUrl(url);

  return encodedData instanceof Error ? encodedData : getReadings(Buffer.from(encodedData, 'base64'));
};
