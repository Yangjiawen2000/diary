import os
import subprocess
import sys

def install_and_import():
    try:
        import rembg
        from PIL import Image
    except ImportError:
        print("Installing rembg and pillow...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "rembg", "pillow", "onnxruntime"])
        import rembg
        from PIL import Image
    return rembg, Image

rembg, Image = install_and_import()

input_dir = 'images'
output_dir = 'images_cutout'
if not os.path.exists(output_dir):
    os.makedirs(output_dir)

for i in range(1, 5):
    input_path = os.path.join(input_dir, f'char{i}.png')
    output_path = os.path.join(output_dir, f'char{i}.png')
    if os.path.exists(input_path):
        print(f"Processing {input_path}...")
        try:
            with open(input_path, 'rb') as i_f:
                input_data = i_f.read()
            output_data = rembg.remove(input_data)
            with open(output_path, 'wb') as o_f:
                o_f.write(output_data)
            print(f"Saved beautifully cut out image to {output_path}")
        except Exception as e:
            print(f"Failed to process {input_path}: {e}")
