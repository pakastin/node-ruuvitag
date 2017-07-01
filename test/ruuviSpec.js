const mockery = require('mockery');
const sinon = require('sinon');
const mocks = require('./mocks');
const eddystoneBeaconScannerMock = mocks.eddystoneBeaconScannerMock;
const EventEmitter = require('events').EventEmitter;

const catchFail = done => { return (err) => done.fail(err); };

describe('module ruuvi', () => {

  let ruuvi;

  beforeEach(() => {
    mockery.enable();
    mockery.registerMock('eddystone-beacon-scanner', eddystoneBeaconScannerMock.mock);
    mockery.registerAllowable('../ruuvi');
    mockery.registerAllowable('events');
    eddystoneBeaconScannerMock.mock.enableTagFinding();
    ruuvi = require('../ruuvi');
  });

  describe('method findTags', () => {

    beforeEach(() => {
      jasmine.clock().install();
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
      jasmine.clock().tick(5000);
    });

    it('should return a promise which is rejected if no tags were found', (done) => {
      eddystoneBeaconScannerMock.mock.disableTagFinding();
      ruuvi.findTags()
        .then(data => done.fail('Should have returned an error'))
        .catch(err => {
          expect(err.message).toBe('No beacons found');
          done();
        });
      jasmine.clock().tick(5000);
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