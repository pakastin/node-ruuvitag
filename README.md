# node-ruuvitag
Node.js module for reading data from a [Ruuvitag](http://tag.ruuvi.com) 
weather station to Raspberry Pi.

Depends on [eddystone-beacon-scanner](https://github.com/sandeepmistry/node-eddystone-beacon-scanner). See [instructions](https://github.com/sandeepmistry/noble) on
 how to enable BLE on RasPi and how to run without root.


### Installation

```
npm install node-ruuvitag
```


### API

##### ruuvi.findTags()

Finds available ruuvitags. Returns a promise which is resolved with an
array of ```ruuviTag``` objects.
