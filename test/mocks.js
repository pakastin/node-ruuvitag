const EventEmitter = require("events").EventEmitter;

const generateRandomUrl = () => {
  const dataFormat = 4;
  const randomValues = [1, 2, 3, 4, 5].map(item => Math.floor(Math.random() * 256));
  return "https://ruu.vi/#" + Buffer.from([dataFormat].concat(randomValues)).toString("base64");
};

const manufacturerData = Buffer.from("990403501854c2c60042ffe503ef0b8300000000", "hex");

const ruuviTags = [
  {
    id: "c283c5a63ccb",
    address: "c2:83:c5:a6:3c:cb",
    addressType: "random",
    connectable: false,
    dataFormat: 3,
    manufacturerData: manufacturerData,
  },
  {
    id: "fbf6df2d6abe",
    address: "fb:f6:df:2d:6a:be",
    addressType: "random",
    connectable: false,
    dataFormat: 4,
  },
  {
    id: "fbf6df2d6abe",
    address: "fb:f6:df:2d:6a:be",
    addressType: "random",
    connectable: false,
    dataFormat: 4,
  },
];

class NobleMock extends EventEmitter {
  constructor() {
    super();
    this.state = "unknown";
    this.tagsAvailable = false;
    this.advertiseInterval = 900;
  }

  startScanning() {
    setInterval(() => {
      if (!this.tagsAvailable) {
        return;
      }
      ruuviTags.forEach(tag => {
        if (tag.dataFormat === 3) {
          this.emit("discover", {
            id: tag.id,
            advertisement: { manufacturerData: tag.manufacturerData },
          });
        } else {
          this.emit("discover", {
            id: tag.id,
            advertisement: {
              serviceData: [
                {
                  uuid: "feaa",
                  data: Buffer.from([
                    0x10,
                    0xf9,
                    0x03,
                    0x72,
                    0x75,
                    0x75,
                    0x2e,
                    0x76,
                    0x69,
                    0x2f,
                    0x23,
                    0x42,
                    0x45,
                    0x51,
                    0x5a,
                    0x41,
                    0x4d,
                    0x4c,
                    0x73,
                    0x4f,
                  ]),
                },
              ],
            },
          });
        }
      });
    }, this.advertiseInterval);
  }

  disableTagFinding() {
    this.tagsAvailable = false;
  }

  enableTagFinding() {
    this.tagsAvailable = true;
  }
}

const obj = (module.exports = {
  nobleMock: {
    mock: new NobleMock(),
  },
});
