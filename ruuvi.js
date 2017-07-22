const noble = require('noble');
const EventEmitter = require('events').EventEmitter;
const parser = require('./lib/parse');
const parseEddystoneBeacon = require('./lib/eddystone');

class RuuviTag extends EventEmitter {

  constructor(data) {
    super();
    this.id = data.id;

    //listen to "updated" and "discover" events
    noble.on('discover', this.onDiscover.bind(this));
  }

  onDiscover(peripheral) {

    if (peripheral.id === this.id) {
      if (peripheral.advertisement && peripheral.advertisement.manufacturerData) {
        // is data format 3
        return this.emit('updated', parser.parseManufacturerData(peripheral.advertisement.manufacturerData));
      }

      // is data format 2 or 4

      const serviceDataArray = peripheral.advertisement.serviceData;
      const serviceData = serviceDataArray && serviceDataArray.length ? serviceDataArray[0] : undefined;
      const url = serviceData ? parseEddystoneBeacon(serviceData.data) : undefined;
      const parsed = url ? parser.parseUrl(url) : undefined;
      if (parsed && !(parsed instanceof Error)) {
        this.emit('updated', {
          url: url,
          dataFormat: parsed.dataFormat,
          humidity: parsed.humidity,
          temperature: parsed.temperature,
          pressure: parsed.pressure
        });
      }
    }
  }
}

const ruuvi = module.exports = {
  findTags: () => new Promise((resolve, reject) => {

    const foundTags = [];

    function onDiscover(peripheral) {

      // is it a RuuviTag in RAW mode?
      const manufacturerData = peripheral.advertisement ? peripheral.advertisement.manufacturerData : undefined;
      if (manufacturerData && manufacturerData[0] === 0x99 && manufacturerData[1] === 0x04) {
        if (!foundTags.find(tag => tag.id === peripheral.id)) {
          foundTags.push(new RuuviTag({
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
            if (!foundTags.find(tag => tag.id === peripheral.id)) {
              foundTags.push(new RuuviTag({
                id: peripheral.id
              }));
            }
          }
        }
      }
    }

    noble.on('discover', onDiscover);

    setTimeout(() => {
      noble.removeListener('discover', onDiscover);
      if (foundTags.length) {
        return resolve(foundTags);
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
