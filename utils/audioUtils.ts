
export const decodeBase64 = (base64: string): Uint8Array => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

export const playAudioData = async (
  base64Data: string, 
  audioContext: AudioContext | null,
  playbackRate: number = 1.0 // Default to 1.0, but we can speed it up
): Promise<void> => {
  if (!audioContext || !base64Data) return;

  try {
    // 1. Decode Base64 string to Uint8Array
    const audioBytes = decodeBase64(base64Data);

    // 2. Setup audio buffer parsing
    const sampleRate = 24000;
    const numChannels = 1;
    
    const dataInt16 = new Int16Array(audioBytes.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = audioContext.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        // Convert Int16 to Float32 [-1.0, 1.0]
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }

    // 3. Play the buffer
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    
    // IMPORTANT: Set playback rate. 
    // Higher value = Faster and Higher Pitch (Chipmunk effect if too high, but 'street' effect if subtle)
    source.playbackRate.value = playbackRate; 

    source.connect(audioContext.destination);
    source.start();

  } catch (error) {
    console.error("Error playing audio:", error);
  }
};