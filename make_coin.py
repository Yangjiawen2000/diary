import wave
import math
import struct
import os

os.makedirs('/Users/yangjiawen/Desktop/wxapp/audio', exist_ok=True)
SAMPLE_RATE = 8000

def save_wav(filename, samples):
    with wave.open(filename, 'w') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SAMPLE_RATE)
        for s in samples:
            w.writeframesraw(struct.pack('<h', int(max(-32768, min(32767, s * 32767)))))

def make_coin():
    duration = 1.5
    samples = []
    f1, f2 = 4000, 6000 # High pitch metallic
    for i in range(int(SAMPLE_RATE * duration)):
        t = i / SAMPLE_RATE
        env = math.exp(-t * 3) # Envelope
        v1 = math.sin(2 * math.pi * f1 * t)
        v2 = math.sin(2 * math.pi * f2 * t)
        
        # Tremolo to simulate flipping in the air (fast amplitude modulation)
        # Starts fast, maybe slows down? Or constant 15Hz
        tremolo = 0.5 + 0.5 * math.sin(2 * math.pi * 15 * t)
        
        val = ((v1 + v2) / 2.0) * env * tremolo
        samples.append(val * 0.4)
    return samples

save_wav('/Users/yangjiawen/Desktop/wxapp/audio/coin.wav', make_coin())
print("Coin sound generated.")
