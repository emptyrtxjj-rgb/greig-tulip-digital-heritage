# Қызғалдақ мұрасы: Түркістаннан әлемге

Өлкемнің цифрлық шежіресі — Грейг қызғалдағы (*Tulipa greigii*) мен Оңтүстік Қазақстанның табиғи, тарихи және ғылыми мұрасы туралы көптілді веб-музей. Негізгі мазмұны қазақ тілінде; орыс және ағылшын тілдері де қолжетімді.

## Жобаны іске қосу

```powershell
cd frontend
npm install
npm run dev
```

Vite әдетте `http://127.0.0.1:5173/` мекенжайында ашылады. Өндірістік жинақ: `npm run build`. Негізгі мазмұн React арқылы беріледі, картада Leaflet және OpenStreetMap, ал бет өтпелері мен скролл-анимацияларында GSAP қолданылады.

## Құрылымы

- `frontend/src/App.jsx` — навигация, маршруттар және музей тараулары.
- `frontend/src/locales/index.js` — KZ / RU / EN интерфейсі мен бет мәтіндері.
- `frontend/src/data/collections.js`, `timeline.js`, `facts.js`, `media.js`, `reviews.js` — жерлер, дереккөздер, реттелген хронология, анықтамалық, фотоматериалдар және сарапшылық пікірлердің редакциялық мазмұндамалары.
- `frontend/src/data/exhibitNarratives.js` — тарих, ғылым, табиғатты қорғау, Шымкент және Жібек жолы бойынша дереккөздері көрсетілген кеңейтілген мәтіндер.
- `frontend/src/components/MapExperience.jsx` — карта мен орын карточкалары.
- `frontend/public/images/` — оңтайландырылған жергілікті фотолар.
- `backend/` — Laravel API және медиа/дереккөздер дерекқоры.

## Фото деректері мен лицензиялар

Фотолар браузерден тікелей сыртқы хосттарға сұралмайды: сайт жергілікті WebP көшірмелерін пайдаланады. Әр суреттің авторы, бастапқы беті және лицензиясы `frontend/src/data/media.js` пен `frontend/src/data/collections.js` файлдарында тіркелген; галереяның фотосурет жазбасында өңделгені көрсетіледі.

- Грейг қызғалдағы, Ақсу-Жабағылы — V. A. Kovshar, CC BY-SA 4.0. [Бастапқы бет](https://commons.wikimedia.org/wiki/File:Tulipa_greigii_(Aksu_Zhabagly_Nature_Reserve,_Kazakhstan).png)
- Ақсу-Жабағылы таулары — Jack Bartovsky, CC BY-SA 4.0. [Бастапқы бет](https://commons.wikimedia.org/wiki/File:Aksu_Zhabagly_mountains.jpg)
- Отырар әуе фотосы — GaiJorayev, CC BY 4.0. [Бастапқы бет](https://commons.wikimedia.org/wiki/File:Otrar-aerial-view-May-2016-2.jpg)
- Қожа Ахмет Ясауи кесенесі — Petar Milošević, CC BY-SA 4.0. [Бастапқы бет](https://commons.wikimedia.org/wiki/File:Mausoleum_of_Khoja_Ahmed_Yasawi_in_Hazrat-e_Turkestan,_Kazakhstan.jpg)
- Шымкент орталығы — Rassim, CC BY-SA 3.0. [Бастапқы бет](https://commons.wikimedia.org/wiki/File:Shymkent_city_downtown.jpg)
- `Gartenflora` (1873) цифрланған беті — Biodiversity Heritage Library, Public Domain Mark 1.0. [Бастапқы бет](https://www.biodiversitylibrary.org/page/47574892)

Карта OpenStreetMap деректерін пайдаланады. Көрсетілген координаттар өңірді бағдарлауға арналған; олар жабайы өсімдіктің нақты популяция нүктелері ретінде белгіленбейді.

## Негізгі маршруттар

Басты бет, тарих, мәліметтер, хронология, карта, ғылым, табиғи мұра, медиа, Шымкент, шетелдік сарапшылар мен саяхатшылардың дерекке негізделген пікірлері, Жібек жолы, дереккөздер, жоба туралы, орын карточкалары және мақалалар бар. Хронология жыл және нақты күні белгілі оқиғалар бойынша өсу ретімен беріледі. Бұрынғы `/3d` мекенжайы табиғатты қорғау тарауына қайта бағытталады.
