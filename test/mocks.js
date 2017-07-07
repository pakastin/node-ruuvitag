const EventEmitter = require('events').EventEmitter;

const generateRandomUrl = () => {
  const dataFormat = 4;
  const randomValues = [ 1, 2, 3, 4, 5 ].map(item => Math.floor(Math.random() * 256));
  return 'https://ruu.vi/#' + Buffer.from([ dataFormat ].concat(randomValues)).toString('base64');
};

const manufacturerData = Buffer.from('990403501854c2c60042ffe503ef0b8300000000', 'hex');

const ruuviTags = [
  { 'id': 'c283c5a63ccb', dataFormat: 3, manufacturerData: manufacturerData },
  { 'id': 'fbf6df2d6abe', dataFormat: 4 },
  { 'id': 'fbf6df2d6abe', dataFormat: 4 }
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
        if (tag.dataFormat !== 3) {
          this.emit('found', { id: tag.id, url: generateRandomUrl() });
          setInterval(() => {
            self.emit('updated', { id: tag.id, url: generateRandomUrl() });
          }, this.advertiseInterval);
        }
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

class NobleMock extends EventEmitter {
  constructor() {
    super();
    this.state = 'unknown';
    this.tagsAvailable = false;
    this.advertiseInterval = 900;
  }

  startScanning() {
    if (!this.tagsAvailable) return;
    setInterval(() => {
      ruuviTags.filter(tag => tag.dataFormat === 3).forEach(tag => {
        this.emit('discover', { id: tag.id, advertisement: { manufacturerData: tag. manufacturerData }});
      });
    }, this.advertiseInterval);
  }

  initialize() {
    setTimeout(() => {
      this.emit('stateChange');
    }, 50);
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
  },

  nobleMock: {
    mock: new NobleMock()
  }

};