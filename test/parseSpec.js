const parser = require('../parse');

describe('parse.js', () => {

  const testUrl = 'https://ruu.vi/#ApgVAMAw';

  it('should return error if not a ruuviTag url', (done) => {
    const result = parser.parseUrl('https://bad.url.com/#foo');
    if (!(result instanceof Error)) {
      return done.fail('Should have got an error');
    }
    expect(result.message).toMatch(/not a ruuvitag url/i);
    done();
  });

  it('should return error if url doesn\'t contain data', (done) => {
    const result = parser.parseUrl('https://ruu.vi/foo');
    if (!(result instanceof Error)) {
      return done.fail('Should have got an error');
    }
    expect(result.message).toMatch(/invalid url/i);
    done();
  });

  it('should return error if url contains invalid data', (done) => {
    const result = parser.parseUrl('https://ruu.vi/#foo');
    if (!(result instanceof Error)) {
      return done.fail('Should have got an error');
    }
    expect(result.message).toMatch(/invalid data/i);
    done();
  });

  it('should return error if data format is unsupported', (done) => {
    const result = parser.parseUrl('https://ruu.vi/#' + Buffer.from([5,6,7,8,9,10]).toString('base64'));
    if (!(result instanceof Error)) {
      return done.fail('Should have got an error');
    }
    expect(result.message).toMatch(/unsupported data format: 5/i);
    done();
  });

  describe('parsing data format 2', () => {
    const result = parser.parseUrl(testUrl_dataFormat_2);
    it('should parse humidity value', () => {
      expect(result.humidity).toBe(76);
    });
    it('should parse temperature value', () => {
      expect(result.temperature).toBe(21);
    });
    it('should parse pressure value', () => {
      expect(result.pressure).toBe(992);
    });
  });
  
  
});