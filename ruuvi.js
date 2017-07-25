const noble = require('noble');
const EventEmitter = require('events').EventEmitter;
const parser = require('./lib/parse');
const parseEddystoneBeacon = require('./lib/eddystone');

let listenerAttached = false;

class RuuviTag extends EventEmitter {

  constructor(data) {
    super();
    this.id = data.id;
  }

}

function onDiscover(peripheral) {

  // Scan for new RuuviTags, add them to the array of found tags
  if (ruuvi.scanning) {

    // is it a RuuviTag in RAW mode?
    const manufacturerData = peripheral.advertisement ? peripheral.advertisement.manufacturerData : undefined;
    if (manufacturerData && manufacturerData[0] === 0x99 && manufacturerData[1] === 0x04) {
      if (!ruuvi._foundTags.find(tag => tag.id === peripheral.id)) {
        ruuvi._foundTags.push(new RuuviTag({
          id: peripheral.id,
        }));
      }
    }

    // is it a RuuviTag in Eddystone mode?
    else {
      const serviceDataArray = peripheral.advertisement ? peripheral.advertisement.serviceData : undefined;
      const serviceData = serviceDataArray && serviceDataArray.length ? serviceDataArray[0] : undefined;
      if (serviceData && serviceData.uuid === 'feaa') {
        const url = parseEddystoneBeacon(serviceData.data);
        if (url && url.match(/ruu\.vi/)) {
          if (!ruuvi._foundTags.find(tag => tag.id === peripheral.id)) {
            ruuvi._foundTags.push(new RuuviTag({
              id: peripheral.id
            }));
          }
        }
      }
    }
  }

  // Check if it is an advertisement by an already found RuuviTag, emit "updated" event
  ruuvi._foundTags.forEach(ruuviTag => {
    if (peripheral.id === ruuviTag.id) {
      if (peripheral.advertisement && peripheral.advertisement.manufacturerData) {
        // is data format 3
        return ruuviTag.emit('updated', parser.parseManufacturerData(peripheral.advertisement.manufacturerData));
      }

      // is data format 2 or 4

      const serviceDataArray = peripheral.advertisement.serviceData;
      const serviceData = serviceDataArray && serviceDataArray.length ? serviceDataArray[0] : undefined;
      const url = serviceData ? parseEddystoneBeacon(serviceData.data) : undefined;
      const parsed = url ? parser.parseUrl(url) : undefined;
      if (parsed && !(parsed instanceof Error)) {
        ruuviTag.emit('updated', {
          url: url,
          dataFormat: parsed.dataFormat,
          humidity: parsed.humidity,
          temperature: parsed.temperature,
          pressure: parsed.pressure
        });
      }
    }
  });
}

const ruuvi = module.exports = {

  _foundTags: [], // this array will contain registered RuuviTags

  scanning: false,

  findTags: () => new Promise((resolve, reject) => {

    ruuvi.scanning = true;

    // Only attach one listener to noble
    if (!listenerAttached) {
      noble.on('discover', onDiscover);
      listenerAttached = true;
    }

    setTimeout(() => {
      ruuvi.scanning = false;
      if (ruuvi._foundTags.length) {
        return resolve(ruuvi._foundTags);
      }
      reject(new Error('No beacons found'));
    }, 5000);

    if (noble.state === 'poweredOn') {
      noble.startScanning([], true);
    }
    else {
      noble.once('stateChange', () => {
        noble.startScanning([], true);
      });
    }

  })

};
