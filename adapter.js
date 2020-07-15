const noble = require('@abandonware/noble');
const EventEmitter = require('events').EventEmitter;

class Adapter extends EventEmitter {
  constructor () {
    super();

    noble.on('discover', (peripheral) => {
      this.emit('discover', peripheral);
    });

    noble.on('warning', (warning) => {
      this.emit('warning', warning);
    });

    // start scanning
    if (noble.state === 'poweredOn') {
      this.start();
    } else {
      noble.once('stateChange', (state) => {
        if (state === 'poweredOn') {
          this.start();
        } else {
          this.stop();
        }
        this.emit('stateChange', state);
      });
    }
  }

  start () {
    if (this._scanning) {
      return;
    }
    this._scanning = true;
    noble.startScanning([], true);
  }

  stop () {
    if (!this._scanning) {
      return;
    }
    this._scanning = false;
    noble.stopScanning();
  }
}

module.exports = new Adapter();
