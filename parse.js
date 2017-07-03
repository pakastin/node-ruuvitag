function stripUrl(url) {
  const match = url.match(/#(.+)$/);
  return match ? match[1] : new Error('Invalid url');
}

const that = module.exports = {};

that.parseUrl = url => {

  if (!url.match(/ruu\.vi/)) {
    return new Error('Not a ruuviTag url');
  }

  return stripUrl(url);
};
