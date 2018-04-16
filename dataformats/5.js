const parseRawRuuvi = function(data){
    let robject = {};
  
    let temperature = (data[3] << 8 | data[4] & 0xFF) / 200.0;
    if(temperature > 128){           // Ruuvi format, sign bit + value
      temperature = temperature-128;
      temperature = 0 - temperature;
    }
    robject.temperature = temperature;
  
    robject.humidity = ((data[5] & 0xFF) << 8 | data[6] & 0xFF) / 400.0;
    robject.pressure = ((data[7] & 0xFF) << 8 | data[8] & 0xFF) + 50000;
  
    let accelerationX = (data[9] << 8 | data[10] & 0xFF);
    if (accelerationX > 32767) { accelerationX -= 65536;}  //two's complement
    robject.accelerationX = accelerationX;
  
    let accelerationY = (data[11] << 8 | data[12] & 0xFF);
    if (accelerationY > 32767) { accelerationY -= 65536;}  //two's complement
    robject.accelerationY = accelerationY;
  
    let accelerationZ = (data[13] << 8 | data[14] & 0xFF);
    if (accelerationZ > 32767) { accelerationZ -= 65536;}  //two's complement
    robject.accelerationZ = accelerationZ;
  
    let powerInfo = (data[15] & 0xFF) << 8 | data[16] & 0xFF;
    robject.battery = (powerInfo >>> 5) + 1600;
    robject.txPower = (powerInfo & 0b11111) * 2 - 40;
    robject.movementCounter = data[17] & 0xFF;
    robject.measurementSequenceNumber = (data[18] & 0xFF) << 8 | data[19] & 0xFF;
  
    return robject;
  };
  
  module.exports = {
    parse: buffer => parseRawRuuvi(buffer)
  };