import sys
import os
import requests
from io import BytesIO
from PIL import Image
import datetime

# 定数
MAX_IMAGES = 6
TARGET_SHORT = 685
FINAL_WIDTH, FINAL_HEIGHT = 1502, 2104
GAP = 10  # 画像間および余白の隙間

# グリッドレイアウト（縦3行×横2列）
ROWS = 3
COLS = 2

# セルサイズの計算（上下左右の隙間を含む）
cell_width = (FINAL_WIDTH - (COLS + 1) * GAP) // COLS
cell_height = (FINAL_HEIGHT - (ROWS + 1) * GAP) // ROWS

def download_image(url):
    try:
        response = requests.get(url)
        response.raise_for_status()
        return Image.open(BytesIO(response.content)).convert("RGBA")
    except Exception as e:
        print(f"URL {url} の画像取得に失敗しました: {e}")
        return None

def crop_to_square(img):
    w, h = img.size
    short = min(w, h)
    left = (w - short) // 2
    top = (h - short) // 2
    return img.crop((left, top, left + short, top + short))

def resize_image(img):
    # まず短辺で中央トリミングして正方形化
    sq = crop_to_square(img)
    # 正方形を TARGET_SHORT x TARGET_SHORT にリサイズ
    return sq.resize((TARGET_SHORT, TARGET_SHORT), Image.LANCZOS)

def main(urls):
    images = []
    for url in urls[:MAX_IMAGES]:
        print(f"Downloading: {url}")
        img = download_image(url)
        if img:
            img = resize_image(img)
            images.append(img)
    
    if not images:
        print("有効な画像がありません。")
        return

    # 合成画像のキャンバスを作成（白背景）
    canvas = Image.new("RGBA", (FINAL_WIDTH, FINAL_HEIGHT), (255, 255, 255, 255))
    
    # 画像をグリッド状に配置（左上から順に配置）
    for idx, img in enumerate(images):
        row = idx // COLS
        col = idx % COLS

        cell_x = GAP + col * (cell_width + GAP)
        cell_y = GAP + row * (cell_height + GAP)
        img_w, img_h = img.size
        offset_x = cell_x + (cell_width - img_w) // 2
        offset_y = cell_y + (cell_height - img_h) // 2

        canvas.paste(img, (offset_x, offset_y), img)
    
    # 出力ファイル名：タイムスタンプを利用
    timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
    filename = f"join_image_{timestamp}.png"
    canvas.save(filename)
    print(f"保存完了: {filename}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python script.py <URL1> <URL2> ... (最大6つ)")
    else:
        main(sys.argv[1:])
