import sys
import re
import json
from playwright.sync_api import sync_playwright

def extract_username(input_str: str, debug: bool = False) -> str:
    if input_str.startswith("http"):
        match = re.search(r"x\.com/([A-Za-z0-9_]+)", input_str)
        if match:
            return match.group(1)
        if debug:
            print(f"[DEBUG] 無効なURL形式です: {input_str}")
        raise ValueError("無効なURL形式です: " + input_str)
    else:
        return input_str.lstrip('@')

def clean_profile_image_url(url: str) -> str:
    # _normal, _bigger, _400x400 などを除去 → オリジナル画像に
    return re.sub(r'_(normal|bigger|\d+x\d+)\.(jpg|png)', r'.\2', url)

def get_profile_image_url_from_photo_page(page, username: str, debug: bool = False) -> str:
    url = f"https://x.com/{username}/photo"
    page.goto(url, timeout=15000)

    if debug:
        print(f"[DEBUG] アクセス中: {url}")
        print("[DEBUG] ページHTMLの一部表示:")
        print(page.content()[:2000])  # HTML先頭だけ表示

    try:
        page.wait_for_selector('img[src^="https://pbs.twimg.com/profile_images/"]', timeout=10000)
        img = page.query_selector('img[src^="https://pbs.twimg.com/profile_images/"]')
        if img:
            src = img.get_attribute('src')
            return clean_profile_image_url(src)
        raise Exception("プロフィール画像が見つかりませんでした。")
    except Exception as e:
        if debug:
            print("[DEBUG] エラー詳細:", str(e))
        raise e

def main():
    args = sys.argv[1:]
    output_json = False
    debug_mode = False

    if '--json' in args:
        output_json = True
        args.remove('--json')
    if '--debug' in args:
        debug_mode = True
        args.remove('--debug')

    if not args:
        print("使い方: python script.py [ユーザー名 or https://x.com/xxx/photo] ... [--json] [--debug]")
        sys.exit(1)

    results = {}

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                       "(KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
        )
        page = context.new_page()

        for input_str in args:
            try:
                username = extract_username(input_str, debug=debug_mode)
                image_url = get_profile_image_url_from_photo_page(page, username, debug=debug_mode)
                results[username] = {"profile_image_url": image_url}
            except Exception as e:
                results[input_str] = {"error": str(e)}

        browser.close()

    if output_json:
        print(json.dumps(results, ensure_ascii=False, indent=2))
    else:
        for key, value in results.items():
            if "profile_image_url" in value:
                print(f"[{key}] プロフィール画像URL: {value['profile_image_url']}")
            else:
                print(f"[{key}] エラー: {value['error']}")

if __name__ == "__main__":
    main()
