const parser = require('../parse');

fdescribe('parse.js', () => {

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

});