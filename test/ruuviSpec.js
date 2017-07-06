const mockery = require('mockery');
const sinon = require('sinon');
const mocks = require('./mocks');
const eddystoneBeaconScannerMock = mocks.eddystoneBeaconScannerMock;
const nobleMock = mocks.nobleMock;
const EventEmitter = require('events').EventEmitter;

const catchFail = done => { return (err) => done.fail(err); };

describe('module ruuvi', () => {

  const findTagsScanTime = 2500;

  let ruuvi;

  beforeEach(() => {
    mockery.enable();
    mockery.registerMock('eddystone-beacon-scanner', eddystoneBeaconScannerMock.mock);
    mockery.registerMock('noble', nobleMock.mock);
    mockery.registerAllowable('../ruuvi');
    mockery.registerAllowable('./parse');
    mockery.registerAllowable('events');
    eddystoneBeaconScannerMock.mock.enableTagFinding();
    nobleMock.mock.enableTagFinding();
    ruuvi = require('../ruuvi');
  });

  describe('method findTags', () => {

    beforeEach(() => {
      jasmine.clock().install();
      nobleMock.mock.initialize();
    });

    it('should return a promise which is resolved with an array of ruuviTag objects', (done) => {
      ruuvi.findTags()
        .then(tags => {
          expect(tags).toEqual(jasmine.any(Array));
          expect(tags.length).toBe(2);
          // We'll test if objects are instances of EventEmitter, perhaps a better test will be written later
          tags.forEach(tag => {
            expect(tag).toEqual(jasmine.any(EventEmitter));
          });
          done();
        })
        .catch(catchFail(done));
      jasmine.clock().tick(findTagsScanTime);
    });

    it('should return a promise which is rejected if no tags were found', (done) => {
      eddystoneBeaconScannerMock.mock.disableTagFinding();
      nobleMock.mock.disableTagFinding();
      ruuvi.findTags()
        .then(data => done.fail('Should have returned an error'))
        .catch(err => {
          expect(err.message).toBe('No beacons found');
          done();
        });
      jasmine.clock().tick(findTagsScanTime);
    });

    afterEach(function () {
      jasmine.clock().uninstall();
    });
  });

  describe('class RuuviTag', () => {

    let tags;

    beforeEach((done) => {
      jasmine.clock().install();
      nobleMock.mock.initialize();
      ruuvi.findTags()
        .then(result => {
          tags = result;
          done();
        })
        .catch(err => done.fail(err));
      jasmine.clock().tick(findTagsScanTime);
    });

    describe('instantiated object', () => {

      it('should have property "id"', () => {
        expect("id" in tags[0]).toBeTruthy();
      });

      it('should emit "updated" when ruuvitag signal is received', (done) => {
        tags.forEach(tag => tag.on('updated', data => tag.hasEmitted = true));
        setTimeout(() => {
          expect(tags.filter(tag => tag.hasEmitted).length).toBe(2);
          done();
        }, eddystoneBeaconScannerMock.mock.advertiseInterval);
        jasmine.clock().tick(eddystoneBeaconScannerMock.mock.advertiseInterval);
      });

      describe('emitted data', () => {

        beforeEach((done) => {
          const waitTime = eddystoneBeaconScannerMock.mock.advertiseInterval;
          tags.forEach(tag => tag.on('updated', data => tag.receivedData = data));
          setTimeout(() => {
            done();
          }, waitTime);
          jasmine.clock().tick(waitTime + 1);
        });

        it('should have sensor data', () => {

          const expectedDataKeys = (function () {
            const tag_0_keys = [ "humidity", "temperature", "pressure" ];
            return {
              tag_0: tag_0_keys,
              tag_1: tag_0_keys.concat([ 'accelerationX', 'accelerationY', 'accelerationZ', 'battery' ])
            };
          })();

          expectedDataKeys.tag_0.forEach(key => expect(key in tags[0].receivedData).toBeTruthy());
          expectedDataKeys.tag_1.forEach(key => expect(key in tags[1].receivedData).toBeTruthy());
        });
      });

    });

    afterEach(function () {
      jasmine.clock().uninstall();
    });
  });

  afterEach(function () {
    mockery.deregisterAll();
    mockery.disable();
  });

});