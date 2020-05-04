const parser = require("../lib/parse");

const createManufacturerData = function() {
  const values = {
    humidity: 58.5,
    temperature: 21.58,
    pressure: 101300,
    accelerationX: 14850,
    accelerationY: -9235,
    accelerationZ: 580,
    battery: 2958,
  };
  const manufacturerId = [0x99, 0x04];
  const dataFormat = [0x03];
  const valuesArray = [0x75, 21, 58, 0xc8, 0x64, 0x3a, 0x02, 0xdb, 0xed, 0x02, 0x44, 0x0b, 0x8e];
  return {
    values: values,
    buffer: Buffer.from(manufacturerId.concat(dataFormat).concat(valuesArray)),
  };
};

describe("parse.js", () => {
  const data = [0x98, 0x15, 0x00, 0xc0, 0x30];
  const dataBuffer_format_2 = Buffer.from([0x02].concat(data));
  const dataBuffer_format_4 = Buffer.from([0x04].concat(data).concat([0x3e]));
  const testUrl_dataFormat_2 = "ruu.vi/#" + dataBuffer_format_2.toString("base64");
  const testUrl_dataFormat_4 = ("ruu.vi/#" + dataBuffer_format_4.toString("base64")).slice(0, 17);

  it("should return error if not a ruuviTag url", done => {
    const result = parser.parseUrl("https://bad.url.com/#foo");
    if (!(result instanceof Error)) {
      return done.fail("Should have got an error");
    }
    expect(result.message).toMatch(/not a ruuvitag url/i);
    done();
  });

  it("should return error if url doesn't contain data", done => {
    const result = parser.parseUrl("https://ruu.vi/foo");
    if (!(result instanceof Error)) {
      return done.fail("Should have got an error");
    }
    expect(result.message).toMatch(/invalid url/i);
    done();
  });

  it("should return error if url contains invalid data", done => {
    const result = parser.parseUrl("https://ruu.vi/#foo");
    if (!(result instanceof Error)) {
      return done.fail("Should have got an error");
    }
    expect(result.message).toMatch(/invalid data/i);
    done();
  });

  it("should return error if data format is unsupported", done => {
    const result = parser.parseUrl("https://ruu.vi/#" + Buffer.from([5, 6, 7, 8, 9, 10]).toString("base64"));
    if (!(result instanceof Error)) {
      return done.fail("Should have got an error");
    }
    expect(result.message).toMatch(/unsupported data format: 5/i);
    done();
  });

  describe("parsing data format 2", () => {
    const result = parser.parseUrl(testUrl_dataFormat_2);
    it("should parse humidity value", () => {
      expect(result.humidity).toBe(76);
    });
    it("should parse temperature value", () => {
      expect(result.temperature).toBe(21);
    });
    it("should parse pressure value", () => {
      expect(result.pressure).toBe(992);
    });
  });

  describe("parsing data format 3", () => {
    const data = createManufacturerData();
    const testValues = Object.keys(data.values).map(key => key);

    it("should parse all values correctly", () => {
      const result = parser.parseManufacturerData(data.buffer);
      testValues.forEach(key => {
        expect(result[key]).toBe(data.values[key]);
      });
    });
  });

  describe("parsing data format 4", () => {
    const result = parser.parseUrl(testUrl_dataFormat_4);

    it("shouldn't return error", () => {
      expect(result instanceof Error).toBeFalsy();
    });

    it("should parse humidity value", () => {
      expect(result.humidity).toBe(76);
    });
    it("should parse temperature value", () => {
      expect(result.temperature).toBe(21);
    });
    it("should parse pressure value", () => {
      expect(result.pressure).toBe(992);
    });
    it("should parse eddystoneId", () => {
      expect(result.eddystoneId).toBeTruthy();
    });
  });
});
