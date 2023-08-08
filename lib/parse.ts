import { formats_2_and_4, format_3, format_5 } from "../dataformats/index";

function stripUrl(url: string) {
  const match = url.match(/#(.+)$/);
  return match ? match[1] : new Error("Invalid url");
}

function getReadings(encodedData: string) {
  function addPaddingIfNecessary(str: string) {
    // if encoded data is truncated (data format 4), add some random padding
    return str.length === 9 ? str + "a==" : str;
  }

  const buffer = Buffer.from(addPaddingIfNecessary(encodedData), "base64");

  // validate
  if (buffer.length < 6 || buffer.length > 7) {
    return new Error("Invalid data");
  }
  const dataFormat = buffer[0];

  return dataFormat === 2 || dataFormat === 4
    ? Object.assign({ dataFormat: dataFormat }, formats_2_and_4(buffer))
    : new Error("Unsupported data format: " + dataFormat);
}

export const parseUrl = (url: string) => {
  if (!url.match(/ruu\.vi/)) {
    return new Error("Not a ruuviTag url");
  }

  const encodedData = stripUrl(url);

  return encodedData instanceof Error ? encodedData : getReadings(encodedData);
};

export const parseManufacturerData = (dataBuffer: Buffer) => {
  let dataFormat = dataBuffer[2];
  switch (dataFormat) {
    case 3:
      return format_3(dataBuffer);
    case 5:
      return format_5(dataBuffer);
    default:
      return new Error("Data format not supported");
  }
};
