const prefixes = ["http://www.", "https://www.", "http://", "https://"];

const suffixes = [
  ".com/",
  ".org/",
  ".edu/",
  ".net/",
  ".info/",
  ".biz/",
  ".gov/",
  ".com",
  ".org",
  ".edu",
  ".net",
  ".info",
  ".biz",
  ".gov",
];

module.exports = function parseEddystoneBeacon(serviceDataBuffer) {
  // Parse url from an Eddystone beacon
  //
  // Returns undefined if it's not an Eddystone URL packet
  // Otherwise returns url as a string

  const frameType = serviceDataBuffer.readUInt8(0);

  // Check  that this is a URL frame type
  if (frameType !== 0x10) {
    return;
  }

  const prefix = serviceDataBuffer.readUInt8(2);
  if (prefix > prefixes.length) {
    return;
  }

  let url = prefixes[prefix];

  for (let i = 3; i < serviceDataBuffer.length; i++) {
    if (serviceDataBuffer[i] < suffixes.length) {
      url += suffixes[serviceDataBuffer[i]];
    } else {
      url += String.fromCharCode(serviceDataBuffer[i]);
    }
  }

  return url;
};
