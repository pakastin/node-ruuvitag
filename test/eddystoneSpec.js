const parseEddystoneBeacon = require("../lib/eddystone");

const dataBuffers = {
  ruuviTag: Buffer.from([
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
  telemetryFrame: Buffer.from([
    0x20,
    0xf9,
    0x03,
    0x73,
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
};

describe("Module eddystone", () => {
  it("should return undefined if it's not an Eddystone URL packet", () => {
    expect(parseEddystoneBeacon(dataBuffers.telemetryFrame)).toBe(undefined);
  });

  it("should return url if it's an Eddystone URL packet", () => {
    const result = parseEddystoneBeacon(dataBuffers.ruuviTag);
    expect(result).toMatch(/^https:\/\/ruu\.vi\//);
  });
});
