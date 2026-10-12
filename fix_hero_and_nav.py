import os

styles_path = os.path.join("frontend", "src", "styles.css")
with open(styles_path, "r", encoding="utf-8") as f:
    text = f.read()

# 1. Update body overflow to clip so sticky navbar works reliably without scroll-container disruption
old_body = "body{margin:0;min-width:320px;overflow-x:hidden}"
new_body = "body{margin:0;min-width:320px;overflow-x:clip}"

if old_body in text:
    text = text.replace(old_body, new_body)
    print("Replaced body overflow-x to clip")
else:
    print("Warning: old_body not found")

# 2. Update site-header sticky properties
old_header = ".site-header{position:sticky;z-index:1000;top:0;height:82px;background:rgba(245,241,232,.97);border-bottom:1px solid rgba(98,81,58,.12);transition:height .25s,box-shadow .25s,background .25s}"
new_header = ".site-header{position:sticky;position:-webkit-sticky;z-index:1100;top:0;height:78px;background:rgba(245,241,232,.98);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border-bottom:1px solid rgba(98,81,58,.14);transition:height .2s ease,box-shadow .2s ease,background .2s ease}"

if old_header in text:
    text = text.replace(old_header, new_header)
    print("Replaced site-header sticky")
else:
    print("Warning: old_header not found")

# 3. Update hero height & padding
old_hero = ".hero{position:relative;display:flex;align-items:center;min-height:clamp(780px,100svh,980px);padding:130px 0 100px;overflow:hidden;background:#3d4033;color:#fff7e9}"
new_hero = ".hero{position:relative;display:flex;align-items:center;min-height:clamp(660px,calc(100svh - 78px),820px);padding:60px 0 60px;overflow:hidden;background:#3d4033;color:#fff7e9}"

if old_hero in text:
    text = text.replace(old_hero, new_hero)
    print("Replaced hero dimensions")
else:
    print("Warning: old_hero not found")

# 4. Update hero h1 font size & margin
old_h1 = ".hero h1{max-width:860px;margin:34px 0 23px;font-family:var(--serif);font-size:clamp(58px,8.1vw,117px);font-weight:500;line-height:.98;letter-spacing:-.045em}"
new_h1 = ".hero h1{max-width:820px;margin:20px 0 16px;font-family:var(--serif);font-size:clamp(44px,6.2vw,88px);font-weight:600;line-height:1.02;letter-spacing:-.03em}"

if old_h1 in text:
    text = text.replace(old_h1, new_h1)
    print("Replaced hero h1")
else:
    print("Warning: old_h1 not found")

# 5. Update hero-actions margin
old_actions = ".hero-actions{display:flex;flex-wrap:wrap;align-items:center;gap:14px;margin-top:36px;margin-bottom:24px}"
new_actions = ".hero-actions{display:flex;flex-wrap:wrap;align-items:center;gap:14px;margin-top:28px;margin-bottom:14px}"

if old_actions in text:
    text = text.replace(old_actions, new_actions)
    print("Replaced hero-actions")
else:
    print("Warning: old_actions not found")

with open(styles_path, "w", encoding="utf-8") as f:
    f.write(text)

print("Finished updating styles.css!")
