const EventEmitter = require('events').EventEmitter;

const generateRandomUrl = () => {
  return 'https://ruu.vi/#' + new Buffer([ 1, 2, 3, 4, 5, 6, 7 ].map(item => Math.floor(Math.random() * 256)))
      .toString('base64');
};

const ruuviTags = [
  { 'id': 'aa1bb2cc3dd4' },
  { 'id': 'aa1bb2cc3dd4' },
  { 'id': '11a22b33c44d '}
];

class EddystoneBeaconScannerMock extends EventEmitter {

  constructor() {
    super();
    this.tagsAvailable = false;
    this.advertiseInterval = 1000;
  }

  startScanning() {
    if (this.tagsAvailable) {
      ruuviTags.forEach(tag => {
        const self = this;
        this.emit('found', { id: tag.id, url: generateRandomUrl() });
        setInterval(() => {
          self.emit('updated', { id: tag.id, url: generateRandomUrl() });
        }, this.advertiseInterval);
      });
    }
  }

  disableTagFinding() {
    this.tagsAvailable = false;
  }

  enableTagFinding() {
    this.tagsAvailable = true;
  }

}

const obj = module.exports = {

  eddystoneBeaconScannerMock: {
    mock: new EddystoneBeaconScannerMock()
  }

};