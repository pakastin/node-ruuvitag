const parseRawRuuvi = function(data) {
    let robject = {};

/***************************************************************************
 * Modifications by pbfulmar:
 *  - added handling of invalid data received from ruuvitags to fully implement
 *    the Ruuvi Dataformat v5 specification
 *  - parseRawRuuvi returns null in case of invalid data received
 *  - fixed small calculation inaccuracy (~ 0.02 degree Celsius) in the temperature conversion
 *  - added code for manual testing (now commented out)
 *
 * Testing:
 * Unfortunately I've got no idea how to automate this, so I fell back
 * to modifying the code. 
 * If you uncomment the code below, no matter what data was originally received,
 * parseRawRuuvi() returns constantly one of the test vectors.
 *
 * Instructions:   
 *     - uncomment one of the test vectors
 *     - uncomment the code to replace the received data with the test data
 *
 * Detailed spec for RUUVI DATAFORMAT V5:
 *     see github ruuvi/ruuvi-sensor-protocols
 *     * Test vectors for format v5:
 */

//const hex = '0512FC5394C37C0004FFFC040CAC364200CDCBB8334C884F'; // valid data
//const hex = '057FFFFFFEFFFE7FFF7FFF7FFFFFDEFEFFFECBB8334C884F'; // maximum values
//const hex = '058001000000008001800180010000000000CBB8334C884F'; // minimum values
//const hex = '058000FFFFFFFF800080008000FFFFFFFFFFFFFFFFFFFFFF'; // invalid data

/* Uncomment the following two lines to replace the received data with the test data.
 * The hex string is converted to bytes and loaded into data[], starting at data[2].
 */
//data = []; data.push(null); data.push(null);
//for (c = 0; c < hex.length; c += 2) data.push(parseInt('0x' + hex.substr(c, 2), 16));
  
/* End Testing
 *************************************************************************
 */

    
    /* my binary arithmetic got a bit rusty ... so:
	0x8000 = 32768  := invalid by Ruuvi
	0x7fff = 32767
	0xffff = 65535 resp. -1 in 2's complement
	0x8001 = 32769 resp. -32767 in 2s complement  
	old temperature converversion: 
	    32768 - 65534 = -32766, but should be invalid, 
            32769 - 65534 = -32765, is not correct, should be -32769
    */

    let temperature = (data[3] << 8) | (data[4] & 0xff);
    if (temperature == 32768) { // ruuvi spec := 'invalid/not available'
	robject.temperature = null;
    }
    else if (temperature > 32768) { // two's complement
	robject.temperature = (temperature - 65536) * 0.005;
    }
    else {
	robject.temperature = temperature * 0.005;
    }
    
    let humidity = ((data[5] & 0xff) << 8) | (data[6] & 0xff);
    if (humidity == 65535) { // ruuvi spec := 'invalid/not available'
	robject.humidity = null;
    }
    else {
	robject.humidity = humidity * 0.0025; // 0% .. 100%; >100% := faulty/miscalibrated sensor
    }
    
    let pressure = ((data[7] & 0xff) << 8) | (data[8] & 0xff);
    if (pressure == 65535) { // ruuvi spec := 'invalid/not available'
	robject.pressure = null;
    }
    else {
	robject.pressure = pressure + 50000;
    }
    
    let accelerationX = (data[9] << 8) | (data[10] & 0xff);
    if (accelerationX == 32768) { // ruuvi spec := 'invalid/not available'
	robject.accelerationX = null;
    }
    else if (accelerationX > 32768) { // two's complement
	robject.accelerationX = (accelerationX - 65536);
    }
    else {
	robject.accelerationX = accelerationX;
    }

    let accelerationY = (data[11] << 8) | (data[12] & 0xff);
    if (accelerationY == 32768) { // ruuvi spec := 'invalid/not available'
	robject.accelerationY = null;
    }
    else if (accelerationY > 32768) { // two's complement
	robject.accelerationY = (accelerationY - 65536);
    }
    else {
	robject.accelerationY = accelerationY;
    }

    let accelerationZ = (data[13] << 8) | (data[14] & 0xff);
    if (accelerationZ == 32768) { // ruuvi spec := 'invalid/not available'
	robject.accelerationZ = null;
    }
    else if (accelerationZ > 32768) { // two's complement
	robject.accelerationZ = (accelerationZ - 65536);
    }
    else {
	robject.accelerationZ = accelerationZ;
    }

    let powerInfo = ((data[15] & 0xff) << 8) | (data[16] & 0xff);
    let battery = powerInfo >>> 5;
    if (battery == 2047) { // ruuvi spec := 'invalid/not available'
	robject.battery = null;
    }
    else {
	robject.battery = battery + 1600;
    }
    let txPower = powerInfo & 0b11111;
    if (txPower == 31) { // ruuvi spec := 'invalid/not available'
	robject.txPower = null;
    }
    else {
	robject.txPower = txPower * 2 - 40;
    }

    let movementCounter = data[17] & 0xff;
    if (movementCounter == 255) { // ruuvi spec := 'invalid/not available'
	robject.movementCounter = null;
    }
    else {
	robject.movementCounter = movementCounter;
    }
    
    let measurementSequenceNumber = ((data[18] & 0xff) << 8) | (data[19] & 0xff);
    if (measurementSequenceNumber == 65535) {  // ruuvi spec := 'invalid/not available'
	robject.measurementSequenceNumber = null;
    }
    else {
	robject.measurementSequenceNumber = measurementSequenceNumber;
    }

    return robject;
};

module.exports = {
  parse: buffer => parseRawRuuvi(buffer),
};
