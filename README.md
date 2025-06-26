# badge_img_maker

バッジ用のデータを作成するスクリプト

58mmの円形の缶バッジ用の原稿を作成します。
セブンイレブンの写真印刷で2Lで１枚６人分の原稿になります。

パラメータでー指定する最大６つのURLから画像をダウンロードして、それぞれの短辺を685として並べ、6つの画像を 1502x2104 の画像ファイル隙間を付けて並べて、join_image_[timestamp].pngで保存します。

## 概要

指定した画像 URL（最大 6 つ）をダウンロードし、正方形にクロップ→685 × 685 px へリサイズ→3 行 × 2 列のグリッドに配置して 1502 × 2104 px の PNG にまとめて保存します。ファイル名は `join_image_YYYYMMDDhhmmss.png` 形式になります。

---

## 前提条件

| 項目      | 推奨                                                               |
| ------- | ---------------------------------------------------------------- |
| Python  | 3.8 以上                                                           |
| 追加ライブラリ | Pillow `pip install pillow` <br> requests `pip install requests` |
| 実行環境    | インターネット接続が必要（各 URL から画像を取得するため）                                  |

---

## インストール手順

```bash
# 1. スクリプトを保存（例: join_image.py）
# 2. 依存ライブラリをインストール
python -m pip install --upgrade pillow requests
```

---

## 基本的な使い方

```bash
python join_image.py <URL1> <URL2> ... <URL6>
```

* `<URL1> … <URL6>` に画像の直リンクを指定します（最大 6 個まで。7 個以上渡しても 6 個だけ処理）。
* 1 個未満の場合は Usage が表示され実行されません。

### 例

```bash
python join_image.py \
  https://example.com/img01.jpg \
  https://example.com/img02.png \
  https://example.com/img03.webp
```

実行ログ（例）:

```
Downloading: https://example.com/img01.jpg
Downloading: https://example.com/img02.png
Downloading: https://example.com/img03.webp
保存完了: join_image_20250626091530.png
```

同じディレクトリに `join_image_20250626091530.png` が生成されます。

---
