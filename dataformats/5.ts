function int2Hex(value: number) {
  return ('0' + value.toString(16).toUpperCase()).slice(-2);
}

const parseRawRuuvi = function (data: Buffer) {
  let temperature = (data[3] << 8) | (data[4] & 0xff);
  if (temperature > 32767) {
    temperature -= 65534;
  }
  temperature = temperature / 200.0;

  const humidity = (((data[5] & 0xff) << 8) | (data[6] & 0xff)) / 400.0;
  const pressure = (((data[7] & 0xff) << 8) | (data[8] & 0xff)) + 50000;

  let accelerationX = (data[9] << 8) | (data[10] & 0xff);
  if (accelerationX > 32767) accelerationX -= 65536; // two's complement

  let accelerationY = (data[11] << 8) | (data[12] & 0xff);
  if (accelerationY > 32767) accelerationY -= 65536; // two's complement

  let accelerationZ = (data[13] << 8) | (data[14] & 0xff);
  if (accelerationZ > 32767) accelerationZ -= 65536; // two's complement

  const powerInfo = ((data[15] & 0xff) << 8) | (data[16] & 0xff);
  const battery = (powerInfo >>> 5) + 1600;
  const txPower = (powerInfo & 0b11111) * 2 - 40;
  const movementCounter = data[17] & 0xff;
  const measurementSequenceNumber = ((data[18] & 0xff) << 8) | (data[19] & 0xff);
  const mac = [
    int2Hex(data[20]),
    int2Hex(data[21]),
    int2Hex(data[22]),
    int2Hex(data[23]),
    int2Hex(data[24]),
    int2Hex(data[25])
  ].join(':');

  return { temperature, humidity, pressure, accelerationX, accelerationY, accelerationZ, battery, txPower, movementCounter, measurementSequenceNumber, mac };
};

export const parse = (buffer: Buffer) => parseRawRuuvi(buffer)
