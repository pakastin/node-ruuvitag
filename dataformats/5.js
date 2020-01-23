const parseRawRuuvi = function(data) {
  let robject = {};

  let temperature = (data[3] << 8) | (data[4] & 0xff);
  if (temperature > 32767) {
    temperature -= 65534;
  }
  robject.temperature = temperature / 200.0;

  robject.humidity = (((data[5] & 0xff) << 8) | (data[6] & 0xff)) / 400.0;
  robject.pressure = (((data[7] & 0xff) << 8) | (data[8] & 0xff)) + 50000;

  let accelerationX = (data[9] << 8) | (data[10] & 0xff);
  if (accelerationX > 32767) accelerationX -= 65536; //two's complement
  robject.accelerationX = accelerationX;

  let accelerationY = (data[11] << 8) | (data[12] & 0xff);
  if (accelerationY > 32767) accelerationY -= 65536; //two's complement
  robject.accelerationY = accelerationY;

  let accelerationZ = (data[13] << 8) | (data[14] & 0xff);
  if (accelerationZ > 32767) accelerationZ -= 65536; //two's complement
  robject.accelerationZ = accelerationZ;

  let powerInfo = ((data[15] & 0xff) << 8) | (data[16] & 0xff);
  robject.battery = (powerInfo >>> 5) + 1600;
  robject.txPower = (powerInfo & 0b11111) * 2 - 40;
  robject.movementCounter = data[17] & 0xff;
  robject.measurementSequenceNumber = ((data[18] & 0xff) << 8) | (data[19] & 0xff);

  return robject;
};

module.exports = {
  parse: buffer => parseRawRuuvi(buffer),
};
