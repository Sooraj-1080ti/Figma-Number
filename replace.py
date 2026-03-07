import re

with open('src/components/NumberTracing.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('LETTER_CONFIG', 'NUMBER_CONFIG')

config_pattern = re.compile(r'const NUMBER_CONFIG = \{.*?\n\};\n', re.DOTALL)
new_config = """const NUMBER_CONFIG = {
  '0': { baseFreq: 440, color: "#ef4444", icon: Star, waveType: "triangle" as OscillatorType },
  '1': { baseFreq: 466, color: "#f97316", icon: Heart, waveType: "sine" as OscillatorType },
  '2': { baseFreq: 494, color: "#eab308", icon: Sun, waveType: "square" as OscillatorType },
  '3': { baseFreq: 523, color: "#22c55e", icon: Flower, waveType: "triangle" as OscillatorType },
  '4': { baseFreq: 554, color: "#06b6d4", icon: Sparkles, waveType: "sine" as OscillatorType },
  '5': { baseFreq: 587, color: "#3b82f6", icon: Music, waveType: "square" as OscillatorType },
  '6': { baseFreq: 622, color: "#8b5cf6", icon: Smile, waveType: "triangle" as OscillatorType },
  '7': { baseFreq: 659, color: "#ec4899", icon: Zap, waveType: "sine" as OscillatorType },
  '8': { baseFreq: 698, color: "#f43f5e", icon: Star, waveType: "square" as OscillatorType },
  '9': { baseFreq: 740, color: "#84cc16", icon: Heart, waveType: "triangle" as OscillatorType },
  '10': { baseFreq: 784, color: "#10b981", icon: Sun, waveType: "sine" as OscillatorType }
};
"""

text = config_pattern.sub(new_config, text)
text = text.replace('NUMBER_CONFIG.A;', "NUMBER_CONFIG['0'];")

with open('src/components/NumberTracing.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
