import wave
import math
import struct
import os

SAMPLE_RATE = 8000

def save_wav(filename, samples):
    with wave.open(filename, 'w') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SAMPLE_RATE)
        for s in samples:
            w.writeframesraw(struct.pack('<h', int(max(-32768, min(32767, s * 32767)))))

def make_tada():
    duration = 1.5
    samples = []
    # Ta-Da! Two notes: G5 (783.99Hz) short, C6 (1046.50Hz) long
    for i in range(int(SAMPLE_RATE * duration)):
        t = i / SAMPLE_RATE
        val = 0
        if t < 0.15:
            # First note G5
            env = math.exp(-t * 10)
            val = math.sin(2 * math.pi * 783.99 * t) * env
        elif t >= 0.15:
            # Second note C6
            t2 = t - 0.15
            env = math.exp(-t2 * 3)
            # Add a major third (E6) to make it richer
            v1 = math.sin(2 * math.pi * 1046.50 * t2)
            v2 = math.sin(2 * math.pi * 1318.51 * t2)
            val = ((v1 + v2) / 2.0) * env
        samples.append(val * 0.5)
    return samples

save_wav('/Users/yangjiawen/Desktop/wxapp/audio/tada.wav', make_tada())
print("Tada sound generated successfully.")
