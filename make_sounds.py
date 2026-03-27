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

def make_click():
    duration = 0.05
    samples = []
    for i in range(int(SAMPLE_RATE * duration)):
        t = i / SAMPLE_RATE
        env = math.exp(-t * 60)
        val = math.sin(2 * math.pi * 800 * t) * env
        samples.append(val * 0.5)
    return samples

def make_tick():
    duration = 0.02
    samples = []
    for i in range(int(SAMPLE_RATE * duration)):
        t = i / SAMPLE_RATE
        env = math.exp(-t * 100)
        val = math.sin(2 * math.pi * 400 * t) * env
        samples.append(val * 0.3)
    return samples

def make_reveal():
    duration = 1.0
    samples = []
    f1, f2, f3 = 1046.50, 1318.51, 1567.98
    for i in range(int(SAMPLE_RATE * duration)):
        t = i / SAMPLE_RATE
        env = math.exp(-t * 3)
        v1 = math.sin(2 * math.pi * f1 * t)
        v2 = math.sin(2 * math.pi * f2 * t)
        v3 = math.sin(2 * math.pi * f3 * t)
        val = (v1 + v2 + v3) / 3.0 * env
        samples.append(val * 0.6)
    return samples

save_wav('/Users/yangjiawen/Desktop/wxapp/audio/click.wav', make_click())
save_wav('/Users/yangjiawen/Desktop/wxapp/audio/tick.wav', make_tick())
save_wav('/Users/yangjiawen/Desktop/wxapp/audio/reveal.wav', make_reveal())
print("Sound effects generated successfully.")
