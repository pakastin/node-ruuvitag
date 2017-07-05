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
        let emitted = false;
        tags[0].on('updated', data => emitted = true);
        setTimeout(() => {
          expect(emitted).toBeTruthy();
          done();
        }, eddystoneBeaconScannerMock.mock.advertiseInterval);
        jasmine.clock().tick(eddystoneBeaconScannerMock.mock.advertiseInterval);
      });

      it('should emit "updated" with sensor data', (done) => {
        let receivedData;
        tags[0].on('updated', data => receivedData = data);
        setTimeout(() => {
          if (!receivedData) {
            return done.fail('No data received');
          }
          expect("url" in receivedData).toBeTruthy();
          expect("humidity" in receivedData).toBeTruthy();
          done();
        }, eddystoneBeaconScannerMock.mock.advertiseInterval);
        jasmine.clock().tick(eddystoneBeaconScannerMock.mock.advertiseInterval);
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