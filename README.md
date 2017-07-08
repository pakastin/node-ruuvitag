# node-ruuvitag
Node.js module for reading data from a [Ruuvitag](http://tag.ruuvi.com) 
weather station.

Tested on Raspberry Pi 3. Depends on [eddystone-beacon-scanner](https://github.com/sandeepmistry/node-eddystone-beacon-scanner). See [instructions](https://github.com/sandeepmistry/noble) on
 how to enable BLE on RasPi and how to run without root.

### Installation

```
npm install node-ruuvitag
```


### Usage example
```
const ruuvi = require('node-ruuvitag');

ruuvi.findTags()
    .then(tags => {
        // tags is now array of found ruuvitags
        tags[0].on('updated', data => {
            console.log(data.temperature);
        }
    }
    .catch(err => {
        // error is returned if no tags are found
        console.log(err);
    }
```

### API

##### ruuvi.findTags()

Finds available ruuvitags. Returns a promise which is resolved with an
array of ```ruuviTag``` objects.

### ```ruuviTag``` object

Is an ```eventEmitter``` .

**Properties:**

```id```: id of beacon

**Events:**

```updated```: emitted when weather station data is received.
Object ```data``` has
following properties:

* ```url``` -- original broadcasted url if any
* ```temperature```
* ```pressure```
* ```humidity```
* ```barrery``` (battery voltage)
* ```accelerationX```
* ```accelerationY```
* ```accelerationZ```

See [data formats](https://github.com/ruuvi/ruuvi-sensor-protocols) for
info about RuuviTag sensor values.



