const noble = require("@abandonware/noble");
const EventEmitter = require("events").EventEmitter;
const parser = require("./lib/parse");
const parseEddystoneBeacon = require("./lib/eddystone");

class RuuviTag extends EventEmitter {
  constructor(data) {
    super();
    this.id = data.id;
    this.address = data.address;
    this.addressType = data.addressType;
    this.connectable = data.connectable;
  }
}

class Ruuvi extends EventEmitter {
  constructor() {
    super();
    this._foundTags = []; // this array will contain registered RuuviTags
    this._tagLookup = {};
    this.scanning = false;
    this.listenerAttached = false;

    const registerTag = tag => {
      this._foundTags.push(tag);
      this._tagLookup[tag.id] = tag;
    };

    const onDiscover = peripheral => {
      let newRuuviTag;

      // Scan for new RuuviTags, add them to the array of found tags
      // is it a RuuviTag in RAW mode?
      const manufacturerData = peripheral.advertisement ? peripheral.advertisement.manufacturerData : undefined;
      if (manufacturerData && manufacturerData[0] === 0x99 && manufacturerData[1] === 0x04) {
        if (!this._tagLookup[peripheral.id]) {
          newRuuviTag = new RuuviTag({
            id: peripheral.id,
            address: peripheral.address,
            addressType: peripheral.addressType,
            connectable: peripheral.connectable,
          });
          registerTag(newRuuviTag);
          this.emit("found", newRuuviTag);
        }
      } else {
        // is it a RuuviTag in Eddystone mode?

        const serviceDataArray = peripheral.advertisement ? peripheral.advertisement.serviceData : undefined;
        const serviceData = serviceDataArray && serviceDataArray.length ? serviceDataArray[0] : undefined;
        if (serviceData && serviceData.uuid === "feaa") {
          const url = parseEddystoneBeacon(serviceData.data);
          if (url && url.match(/ruu\.vi/)) {
            if (!this._tagLookup[peripheral.id]) {
              newRuuviTag = new RuuviTag({
                id: peripheral.id,
                address: peripheral.address,
                addressType: peripheral.addressType,
                connectable: peripheral.connectable,
              });
              registerTag(newRuuviTag);
              this.emit("found", newRuuviTag);
            }
          }
        }
      }

      // Check if it is an advertisement by an already found RuuviTag, emit "updated" event
      const ruuviTag = this._tagLookup[peripheral.id];

      if (ruuviTag) {
        if (peripheral.advertisement && peripheral.advertisement.manufacturerData) {
          let dataFormat = peripheral.advertisement.manufacturerData[2];
          return ruuviTag.emit(
            "updated",
            Object.assign(
              { dataFormat: dataFormat, rssi: peripheral.rssi },
              parser.parseManufacturerData(peripheral.advertisement.manufacturerData),
            ),
          );
        }

        // is data format 2 or 4

        const serviceDataArray = peripheral.advertisement.serviceData;
        const serviceData = serviceDataArray && serviceDataArray.length ? serviceDataArray[0] : undefined;
        const url = serviceData ? parseEddystoneBeacon(serviceData.data) : undefined;
        const parsed = url ? parser.parseUrl(url) : undefined;
        if (parsed && !(parsed instanceof Error)) {
          ruuviTag.emit("updated", {
            url: url,
            dataFormat: parsed.dataFormat,
            rssi: peripheral.rssi,
            humidity: parsed.humidity,
            temperature: parsed.temperature,
            pressure: parsed.pressure,
            eddystoneId: parsed.eddystoneId,
          });
        }
      }
    };

    noble.on("discover", onDiscover);

    // start scanning
    if (noble.state === "poweredOn") {
      noble.startScanning([], true);
    } else {
      noble.once("stateChange", () => {
        noble.startScanning([], true);
      });
    }
  }

  findTags() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (this._foundTags.length) {
          return resolve(this._foundTags);
        }
        reject(new Error("No beacons found"));
      }, 5000);
    });
  }
}

module.exports = new Ruuvi();
