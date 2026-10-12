import os

styles_path = os.path.join("frontend", "src", "styles.css")
with open(styles_path, "r", encoding="utf-8") as f:
    text = f.read()

# 1. Update base hero height and spacing
old_hero = ".hero{position:relative;display:flex;align-items:center;min-height:min(790px,calc(100svh - 70px));height:clamp(650px,calc(100svh - 70px),820px);overflow:hidden;background:#3d4033;color:#fff7e9}"
new_hero = ".hero{position:relative;display:flex;align-items:center;min-height:clamp(780px,100svh,980px);padding:130px 0 100px;overflow:hidden;background:#3d4033;color:#fff7e9}"

if old_hero in text:
    text = text.replace(old_hero, new_hero)
    print("Replaced base hero!")
else:
    print("Warning: old_hero not matched")

# 2. Update hero-actions
old_actions = ".hero-actions{display:flex;gap:12px;margin-top:33px}"
new_actions = ".hero-actions{display:flex;flex-wrap:wrap;align-items:center;gap:14px;margin-top:36px;margin-bottom:24px}"
if old_actions in text:
    text = text.replace(old_actions, new_actions)
    print("Replaced hero-actions!")
else:
    print("Warning: old_actions not matched")

# 3. Update button-ghost
old_ghost = ".button-ghost{color:#fff7e9;border-color:rgba(255,247,233,.4);background:rgba(40,35,27,.16)}"
new_ghost = ".button-ghost{color:#fff7e9;border-color:rgba(255,247,233,.45);background:rgba(30,34,26,.65);backdrop-filter:blur(8px)}"
if old_ghost in text:
    text = text.replace(old_ghost, new_ghost)
    print("Replaced button-ghost!")
else:
    print("Warning: old_ghost not matched")

# 4. Update 990px hero
old_990_hero = ".hero{min-height:670px;height:calc(88svh - 65px)}"
new_990_hero = ".hero{min-height:740px;height:auto;padding:115px 0 90px}"
if old_990_hero in text:
    text = text.replace(old_990_hero, new_990_hero)
    print("Replaced 990px hero!")
else:
    print("Warning: old_990_hero not matched")

# 5. Update 720px hero
old_720_hero = ".hero{min-height:670px;height:calc(91svh - 65px);max-height:800px}.hero-image{background-position:60% center}.hero-shade{background:linear-gradient(90deg,#222720c9,#2b2d2573 66%,#292d2650),linear-gradient(0deg,#243026a6,transparent 58%)}.hero-content{padding-top:0}.hero h1{margin:27px 0 19px;font-size:clamp(54px,12vw,79px);line-height:1.01}.hero-intro{max-width:405px;font-size:13px}.hero-actions{align-items:flex-start;flex-direction:column;gap:9px;margin-top:26px}.hero-actions .button{min-height:45px}.hero-note{right:20px;bottom:22px;font-size:7px}.hero-note i{width:23px}.hero-scroll{bottom:17px;left:24px;transform:none}"
new_720_hero = ".hero{min-height:640px;height:auto;padding:100px 0 85px}.hero-image{background-position:60% center}.hero-shade{background:linear-gradient(180deg,rgba(25,28,23,.78) 0%,rgba(32,34,27,.65) 50%,rgba(23,28,22,.9) 100%)}.hero-content{padding-top:0}.hero h1{margin:22px 0 16px;font-size:clamp(38px,9vw,64px);line-height:1.06}.hero-intro{max-width:100%;font-size:13px}.hero-actions{display:flex;flex-direction:row;flex-wrap:wrap;gap:10px;margin-top:26px;margin-bottom:18px}.hero-actions .button{min-height:45px;padding:0 18px}.hero-note{right:20px;bottom:18px;font-size:7px}.hero-note i{width:23px}.hero-scroll{bottom:15px;right:20px;left:auto;transform:none}"
if old_720_hero in text:
    text = text.replace(old_720_hero, new_720_hero)
    print("Replaced 720px hero!")
else:
    print("Warning: old_720_hero not matched")

# 6. Update 385px hero
old_385 = ".hero h1{font-size:51px}.hero-intro{font-size:12px}"
new_385 = ".hero h1{font-size:36px;line-height:1.08}.hero-intro{font-size:12px}.hero-actions{flex-direction:column;width:100%}.hero-actions .button{width:100%}"
if old_385 in text:
    text = text.replace(old_385, new_385)
    print("Replaced 385px hero!")
else:
    print("Warning: old_385 not matched")

with open(styles_path, "w", encoding="utf-8") as f:
    f.write(text)

print("styles.css successfully updated!")
