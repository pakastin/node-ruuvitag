const ebs = require('eddystone-beacon-scanner');
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

    setTimeout(() => {
      if (foundTags.length) {
        return resolve(foundTags);
      }
      reject(new Error('No beacons found'));

    }, 5000);

    ebs.startScanning(true);

  }),

};
