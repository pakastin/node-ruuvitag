const mockery = require("mockery");
const sinon = require("sinon");
const mocks = require("./mocks");
const nobleMock = mocks.nobleMock;
const EventEmitter = require("events").EventEmitter;

const catchFail = done => {
  return err => done.fail(err);
};

describe("module ruuvi", () => {
  const findTagsScanTime = 5000;
  const numberOfRuuviTags = 2;

  let ruuvi;

  beforeEach(() => {
    mockery.enable();
    mockery.registerMock("noble", nobleMock.mock);
    mockery.registerAllowable("../ruuvi");
    mockery.registerAllowable("./lib/parse");
    mockery.registerAllowable("./lib/eddystone");
    mockery.registerAllowable("events");
    nobleMock.mock.enableTagFinding();
    ruuvi = require("../ruuvi");
    jasmine.clock().install();
    nobleMock.mock.startScanning();
  });

  it("should be eventEmitter", () => {
    const EventEmitter = require("events").EventEmitter;
    expect(ruuvi instanceof EventEmitter).toBeTruthy();
  });

  describe("method findTags", () => {
    beforeEach(() => {
      ruuvi._foundTags = [];
      ruuvi._tagLookup = {};
    });

    it("should return a promise which is resolved with an array of ruuviTag objects", done => {
      ruuvi
        .findTags()
        .then(tags => {
          expect(tags).toEqual(jasmine.any(Array));
          expect(tags.length).toBe(numberOfRuuviTags);
          // We'll test if objects are instances of EventEmitter, perhaps a better test will be written later
          tags.forEach(tag => {
            expect(tag).toEqual(jasmine.any(EventEmitter));
          });
          done();
        })
        .catch(catchFail(done));
      jasmine.clock().tick(findTagsScanTime);
    });

    it("should return a promise which is rejected if no tags were found", done => {
      nobleMock.mock.disableTagFinding();
      ruuvi
        .findTags()
        .then(data => done.fail("Should have returned an error"))
        .catch(err => {
          expect(err.message).toBe("No beacons found");
          done();
        });
      jasmine.clock().tick(findTagsScanTime);
    });
  });

  describe("events: ", () => {
    it('should emit "found" when a new RuuviTag is found', done => {
      ruuvi._foundTags = [];
      ruuvi._tagLookup = {};
      let count = 0;

      ruuvi.on("found", data => {
        count++;
        expect("id" in data).toBeTruthy();
        expect("address" in data).toBeTruthy();
        expect("addressType" in data).toBeTruthy();
        expect("connectable" in data).toBeTruthy();
        expect(data instanceof EventEmitter).toBeTruthy();
      });

      setTimeout(function() {
        expect(count).toBe(numberOfRuuviTags);
        done();
      }, 5000);

      jasmine.clock().tick(5000);
    });
  });

  describe("class RuuviTag", () => {
    let tags;

    beforeEach(done => {
      ruuvi
        .findTags()
        .then(result => {
          tags = result;
          done();
        })
        .catch(err => done.fail(err));
      jasmine.clock().tick(findTagsScanTime);
    });

    describe("instantiated object", () => {
      it('should have properties "id", "address", "addressType", "connectable"', () => {
        expect("id" in tags[0]).toBeTruthy();
        expect("address" in tags[0]).toBeTruthy();
        expect("addressType" in tags[0]).toBeTruthy();
        expect("connectable" in tags[0]).toBeTruthy();
      });

      it('should emit "updated" when ruuvitag signal is received', done => {
        tags.forEach(tag => tag.on("updated", data => (tag.hasEmitted = true)));
        setTimeout(() => {
          expect(tags.filter(tag => tag.hasEmitted).length).toBe(2);
          done();
        }, nobleMock.mock.advertiseInterval);
        jasmine.clock().tick(nobleMock.mock.advertiseInterval);
      });

      describe("emitted data", () => {
        beforeEach(done => {
          const waitTime = nobleMock.mock.advertiseInterval;
          tags.forEach(tag => tag.on("updated", data => (tag.receivedData = data)));
          setTimeout(() => {
            done();
          }, waitTime);
          jasmine.clock().tick(waitTime + 1);
        });

        it("should have sensor data", () => {
          const expectedDataKeys = (function() {
            const tag_1_keys = ["humidity", "temperature", "pressure", "rssi"];
            return {
              tag_1: tag_1_keys,
              tag_0: tag_1_keys.concat(["accelerationX", "accelerationY", "accelerationZ", "battery"]),
            };
          })();

          expectedDataKeys.tag_0.forEach(key => expect(key in tags[0].receivedData).toBeTruthy());
          expectedDataKeys.tag_1.forEach(key => expect(key in tags[1].receivedData).toBeTruthy());
        });
      });
    });
  });

  afterEach(function() {
    jasmine.clock().uninstall();
    mockery.deregisterAll();
    mockery.disable();
  });
});
