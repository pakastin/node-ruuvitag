import noble from '@abandonware/noble';
import { EventEmitter } from "events";

export class Adapter extends EventEmitter {
  private _scanning = false;

  constructor() {
    super();

    noble.on('discover', (peripheral) => {
      this.emit('discover', peripheral);
    });

    // TODO: Fix any
    noble.on('warning', (warning: any) => {
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

  start() {
    if (this._scanning) {
      return;
    }
    this._scanning = true;
    noble.startScanning([], true);
  }

  stop() {
    if (!this._scanning) {
      return;
    }
    this._scanning = false;
    noble.stopScanning();
  }
}
