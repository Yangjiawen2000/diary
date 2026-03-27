import os
try:
    from PIL import Image
except ImportError:
    import subprocess, sys
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pillow"])
    from PIL import Image

def compress_images(directory, max_size=600, limit_kb=150):
    for filename in os.listdir(directory):
        if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
            path = os.path.join(directory, filename)
            original_size = os.path.getsize(path)
            if original_size > limit_kb * 1024:
                print(f"Compressing {filename} ({original_size/1024:.1f} KB)...")
                try:
                    with Image.open(path) as img:
                        img.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
                        if filename.lower().endswith('.png'):
                            img.save(path, format='PNG', optimize=True)
                        else:
                            img.save(path, format='JPEG', quality=85, optimize=True)
                    print(f" -> Reduced to {os.path.getsize(path)/1024:.1f} KB")
                except Exception as e:
                    print(f"Failed to compress {filename}: {e}")

compress_images('images')
