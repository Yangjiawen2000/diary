from duckduckgo_search import DDGS
import requests
import os

queries = [
    ("樱桃小丸子 透明背景 png", "maruko.png"),
    ("樱桃小丸子 花轮同学 透明背景 png", "hanawa.png"),
    ("樱桃小丸子 小玉 透明背景 png", "tama.png")
]

out_dir = "/Users/yangjiawen/Desktop/wxapp/images/splash"
os.makedirs(out_dir, exist_ok=True)

with DDGS() as ddgs:
    for q, filename in queries:
        print(f"Searching for {q}...")
        try:
            results = list(ddgs.images(q, max_results=10))
            for res in results:
                url = res['image']
                print(f"Downloading {url}...")
                try:
                    headers = {'User-Agent': 'Mozilla/5.0'}
                    img_data = requests.get(url, headers=headers, timeout=10).content
                    with open(os.path.join(out_dir, filename), 'wb') as f:
                        f.write(img_data)
                    print(f"Saved {filename}")
                    break
                except Exception as e:
                    print(f"Failed to download {url}: {e}")
        except Exception as e:
            print(f"Search failed for {q}: {e}")
