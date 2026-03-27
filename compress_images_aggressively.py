import os
from PIL import Image

def compress_images_aggressively(directory, max_size=150):
    for filename in os.listdir(directory):
        if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
            path = os.path.join(directory, filename)
            original_size = os.path.getsize(path)
            print(f"Crushing {filename} (was {original_size/1024:.1f} KB)...")
            try:
                with Image.open(path) as img:
                    img.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
                    if filename.lower().endswith('.png'):
                        if img.mode != 'P':
                            img = img.quantize(colors=32)
                        img.save(path, format='PNG', optimize=True)
                    else:
                        if img.mode != 'RGB':
                            img = img.convert('RGB')
                        img.save(path, format='JPEG', quality=35, optimize=True)
                print(f" -> Reduced to {os.path.getsize(path)/1024:.1f} KB")
            except Exception as e:
                print(f"Failed to compress {filename}: {e}")

compress_images_aggressively('images')
