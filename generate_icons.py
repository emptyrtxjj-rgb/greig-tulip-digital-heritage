import cv2
import base64
import os

src = r"C:\Users\user\.gemini\antigravity\brain\df374984-30f0-47e8-bce8-e6b0d4765a92\.user_uploaded\media_1791712954601_355e1b91.jpg"
img = cv2.imread(src)

if img is None:
    raise SystemExit("Source image not found: " + src)

public_dir = r"frontend\public"

cv2.imwrite(os.path.join(public_dir, "favicon.png"), cv2.resize(img, (64, 64), interpolation=cv2.INTER_AREA))
cv2.imwrite(os.path.join(public_dir, "favicon-32.png"), cv2.resize(img, (32, 32), interpolation=cv2.INTER_AREA))
cv2.imwrite(os.path.join(public_dir, "apple-touch-icon.png"), cv2.resize(img, (180, 180), interpolation=cv2.INTER_AREA))
cv2.imwrite(os.path.join(public_dir, "brand-logo.png"), cv2.resize(img, (256, 256), interpolation=cv2.INTER_AREA))

_, buffer = cv2.imencode('.png', cv2.resize(img, (256, 256), interpolation=cv2.INTER_AREA))
png_b64 = base64.b64encode(buffer).decode('utf-8')

svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="100%" height="100%">
  <image width="256" height="256" href="data:image/png;base64,{png_b64}"/>
</svg>
'''

with open(os.path.join(public_dir, "favicon.svg"), "w", encoding="utf-8") as f:
    f.write(svg_content)

with open(os.path.join(public_dir, "brand-logo.svg"), "w", encoding="utf-8") as f:
    f.write(svg_content)

print("Icons generated successfully!")
