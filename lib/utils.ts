export function x25crc(buffer: Buffer, start = 0, trim = 0, magic = null) {
  let crc = 0xffff;

  for (let i = start; i < buffer.length - trim; i++) {
    const byte = buffer[i]
    let tmp = (byte & 0xff) ^ (crc & 0xff);
    tmp ^= tmp << 4;
    tmp &= 0xff;
    crc = (crc >> 8) ^ (tmp << 8) ^ (tmp << 3) ^ (tmp >> 4);
    crc &= 0xffff;
  }

  if (magic !== null) {
    let tmp = (magic & 0xff) ^ (crc & 0xff);
    tmp ^= tmp << 4;
    tmp &= 0xff;
    crc = (crc >> 8) ^ (tmp << 8) ^ (tmp << 3) ^ (tmp >> 4);
    crc &= 0xffff;
  }

  return crc;
}

export function dump(buffer: Buffer, lineWidth = 28) {
  const line = []
  for (let i = 0; i < buffer.length; i++) {
    line.push(buffer[i].toString(16).padStart(2, '0') + ' ')
    if (line.length === lineWidth) {
      console.error(line.join(' '))
      line.length = 0
    }
  }
  if (line.length > 0) {
    console.error(line.join(' '))
  }
}

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
