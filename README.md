# ARCSLAB × SSSLAB — Interactive Research Showcase

An English dashboard that presents the interactive models built by students of
**ARCSLAB** (Advanced Robotics and Control Systems Laboratory) and **S³ Lab / SSSLAB**
(Smart Small Systems Laboratory), Department of Mechanical Engineering, University of Torbat Heydarieh.

- **Landing page:** the two lab names as portals; click one to see its models.
- **Gallery:** filter by lab, search, open a card for the abstract, features and podcast.
- **Viewer:** each model opens full-screen with a top bar (podcast, About panel, previous/next model, standalone, full screen).
- **Podcasts:** drop `podcast.mp3` into a model's folder and it plays automatically. No code changes needed.

## Folder structure

```
index.html              ← landing page + gallery
viewer.html             ← full-screen model viewer (viewer.html?id=<model-id>)
assets/css/main.css     ← all styles
assets/js/app.js        ← landing animation, gallery, details window
assets/js/podcast.js    ← podcast auto-detection and player
assets/img/             ← lab marks, favicon
models/registry.js      ← ★ the list of models (edit this to add one)
models/<model-id>/      ← one folder per model
    index.html          ← the simulation
    cover.svg           ← card image (16:10, e.g. 800×500)
    podcast.mp3         ← optional (.m4a .aac .ogg .opus .wav .webm also work)
models/_template/       ← copy this to start a new model
.nojekyll               ← tells GitHub Pages to serve every file as-is
```

## Run it on your laptop

Double-click `index.html`. It works directly from disk: the registry is a `.js` file, so no server is needed.
An internet connection is needed for the fonts, the GSAP animations and the libraries the models load
(Three.js, MediaPipe). The gallery itself still works offline.

For webcam gesture control, a local server is more reliable than `file://`:

```bash
cd lab-showcase
python -m http.server 8000      # then open http://localhost:8000
```

## Publish with GitHub Pages

```bash
cd lab-showcase
git init
git add .
git commit -m "Interactive research showcase"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

Then on GitHub, open **Settings → Pages → Build and deployment**, set **Source: Deploy from a branch**,
choose **main / (root)**, and save. The site appears at `https://<your-username>.github.io/<repo-name>/`.

## Add a new model

1. Copy `models/_template` to `models/<new-id>` (lower-case letters and dashes).
2. Replace `index.html` with the simulation and add `cover.svg`.
3. Optional: add `podcast.mp3`.
4. Copy one entry in `models/registry.js`, set `id` to the folder name and `lab` to `'arcslab'` or `'sss'`,
   and fill in the title, authors, abstract, features and tags.

## Add a podcast

Name the file `podcast.mp3` and put it in the model's folder, for example
`models/s3-cnw-nanotweezer-twin/podcast.mp3`. Reload the page. A "Podcast" badge appears on the card,
and the player appears in the details window and the viewer's top bar.
For another file name, set `podcast: 'my-file.m4a'` in that model's registry entry.
Keep podcasts below about 25 MB for GitHub (MP3 at 64–96 kbps is plenty for speech).

---

## راهنمای سریع (فارسی)

- **اجرا روی لپ‌تاپ:** روی `index.html` دوبار کلیک کنید.
- **افزودن پادکست:** فایل را با نام `podcast.mp3` داخل پوشهٔ همان مدل بگذارید (مثلاً `models/s3-cnw-nanotweezer-twin/`). پادکست خودکار شناسایی و پخش می‌شود.
- **افزودن مدل جدید:** پوشهٔ `models/_template` را کپی کنید، فایل شبیه‌سازی را با نام `index.html` در آن بگذارید و یک ورودی در `models/registry.js` اضافه کنید.
- **انتشار در گیت‌هاب:** دستورهای بالا را اجرا کنید و در تنظیمات مخزن، بخش Pages را روی شاخهٔ `main` و پوشهٔ ریشه فعال کنید.
