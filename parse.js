const dataFormats = require('./dataformats');

function stripUrl(url) {
  const match = url.match(/#(.+)$/);
  return match ? match[1] : new Error('Invalid url');
}

function getReadings(encodedData) {

  function addPaddingIfNecessary(str) {
    // if encoded data is truncated (data format 4), add some random padding
    return str.length === 9 ? str + 'a==' : str;
  }

  const buffer = Buffer.from(addPaddingIfNecessary(encodedData), 'base64');

  // validate
  if (buffer.length < 6 || buffer.length > 7) {
    return new Error('Invalid data');
  }
  const dataFormat = buffer[0];

  return dataFormat === 2 || dataFormat === 4 ?
    Object.assign({ dataFormat: dataFormat }, dataFormats.formats_2_and_4.parse(buffer)) :
    new Error('Unsupported data format: ' + dataFormat);
}

const that = module.exports = {};

that.parseUrl = url => {

  if (!url.match(/ruu\.vi/)) {
    return new Error('Not a ruuviTag url');
  }

  const encodedData = stripUrl(url);

  return encodedData instanceof Error ? encodedData : getReadings(encodedData);
};

that.parseManufacturerData = dataBuffer => {
  // parses data format 3
  // TODO!!!
  return { humidity: 40, temperature: 30 };
};
