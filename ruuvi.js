const ebs = require('eddystone-beacon-scanner');
const EventEmitter = require('events').EventEmitter;

class RuuviTag extends EventEmitter {

  constructor(data) {
    super();
    this.id = data.id;
    this.beaconScanner = data.beaconScanner;

    // listen to "updated" events
    this.beaconScanner.on('updated', data => {
      if (data.id === this.id) {
        this.emit('updated', data);
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

    }, 2500);

    ebs.startScanning(true);

  }),




};
