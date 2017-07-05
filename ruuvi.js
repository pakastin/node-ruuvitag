const ebs = require('eddystone-beacon-scanner');
const noble = require('noble');
const EventEmitter = require('events').EventEmitter;
const parser = require('./parse');

class RuuviTag extends EventEmitter {

  constructor(data) {
    super();
    this.id = data.id;
    this.beaconScanner = data.beaconScanner;

    // listen to "updated" events
    this.beaconScanner.on('updated', data => {
      if (data.id === this.id) {
        const parsed = parser.parseUrl(data.url);
        if (!(parsed instanceof Error)) {
          this.emit('updated', {
            url: data.url,
            dataFormat: parsed.dataFormat,
            humidity: parsed.humidity,
            temperature: parsed.temperature,
            pressure: parsed.pressure
          });
        }
      }
    });
  }
}

const ruuvi = module.exports = {
  findTags: () => new Promise((resolve, reject) => {

    const foundTags = [];

    ebs.on('found', data => {
      if (!foundTags.find(tag => tag.id === data.id)) {
        foundTags.push(new RuuviTag({
          id: data.id,
          beaconScanner: ebs
        }));
      }
    });

    noble.on('discovered', peripheral => {
      // is it a RuuviTag in high-precision sensor mode?
      const data = peripheral.advertisement ? peripheral.advertisement.manufacturerData : undefined;
      if (data && data[0] === 0x99 && data[1] === 0x04) {
        if (!foundTags.find(tag => tag.id === data.id)) {
          foundTags.push(new RuuviTag({
            id: data.id,
            noble: noble
          }));
        }
      }
    });

    setTimeout(() => {
      if (foundTags.length) {
        return resolve(foundTags);
      }
      reject(new Error('No beacons found'));

    }, 2500);

    ebs.startScanning(true);

    if (noble.state === 'poweredOn') {
      noble.startScanning([], true);
    }
    else {
      noble.once('stateChange', () => {
        noble.startScanning([], true);
      });
    }

  }),

};
