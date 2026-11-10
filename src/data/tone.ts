/**
 * Generates a short sine-wave WAV file encoded as a base64 data URI.
 * Used by the speaker test so we don't need to bundle an audio asset.
 */
export function makeToneDataUri(freq = 660, seconds = 1.2, sampleRate = 44100): string {
  const numSamples = Math.floor(seconds * sampleRate);
  const bytesPerSample = 2;
  const dataSize = numSamples * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeStr = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
  };

  // RIFF header
  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeStr(8, 'WAVE');
  // fmt chunk
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true); // chunk size
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * bytesPerSample, true); // byte rate
  view.setUint16(32, bytesPerSample, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  // data chunk
  writeStr(36, 'data');
  view.setUint32(40, dataSize, true);

  const fade = Math.floor(sampleRate * 0.02); // 20ms fade in/out
  for (let i = 0; i < numSamples; i++) {
    let amp = 0.6;
    if (i < fade) amp *= i / fade;
    else if (i > numSamples - fade) amp *= (numSamples - i) / fade;
    const sample = Math.sin((2 * Math.PI * freq * i) / sampleRate) * amp;
    view.setInt16(44 + i * bytesPerSample, sample * 0x7fff, true);
  }

  return `data:audio/wav;base64,${base64FromArrayBuffer(buffer)}`;
}

function base64FromArrayBuffer(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';
  let i = 0;
  for (; i + 2 < bytes.length; i += 3) {
    const n = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
    result += chars[(n >> 18) & 63] + chars[(n >> 12) & 63] + chars[(n >> 6) & 63] + chars[n & 63];
  }
  // remaining bytes + padding
  if (i < bytes.length) {
    const rem = bytes.length - i;
    if (rem === 1) {
      const n = bytes[i] << 16;
      result += chars[(n >> 18) & 63] + chars[(n >> 12) & 63] + '==';
    } else {
      const n = (bytes[i] << 16) | (bytes[i + 1] << 8);
      result += chars[(n >> 18) & 63] + chars[(n >> 12) & 63] + chars[(n >> 6) & 63] + '=';
    }
  }
  return result;
}
