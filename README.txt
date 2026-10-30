BEAM'S MOBILE MECHANIC — SITE NOTES
====================================

Open "index.html" in any browser to view the site.
To publish later, upload this whole folder to any web host
(Netlify, GitHub Pages, your domain host's file manager, etc.)
— no build step required.

EDIT THESE PLACEHOLDERS
-----------------------
- Phone number:  (555) 123-4567 is used in index.html
  (search for "555" and "+15551234567" and replace with your
  real number — it appears in the header, hero, contact and footer).
- Service area:  "Your City & 30 miles around" in the contact
  section of index.html.
- Hours:         contact section of index.html.

LOGO
----
Your logo lives at  assets/logo.png  (header, footer and favicon
all use it). To change it, just overwrite that file with a new
square-ish PNG and keep the same name. The site pulls small
orange accents (nav highlights, gallery progress, active
thumbnails) from the logo — to change the accent color, edit
--accent at the top of css/styles.css.

FACEBOOK
--------
The Facebook icon (footer circle button + contact section) links
to your page:
  https://www.facebook.com/matthew.beam.675048
To change where it points, search index.html for "facebook.com"
and replace the link. There is also a standalone reusable icon:
  assets/facebook.png   (orange circle — profile-pic size)
  assets/facebook.svg   (same icon as vector)

GALLERY — ADD YOUR PHOTOS & VIDEOS
----------------------------------
1. Drop files into   media/photos   or   media/videos
2. Open media/media.js and add one line per file:

     { type: "image", src: "media/photos/mypic.jpg",  title: "Brake job — 2015 Civic" },
     { type: "video", src: "media/videos/mystuff.mp4", title: "Radiator replacement" },

3. Save, refresh the browser. The slider, thumbnails, and the
   Photos / Videos filter tabs rebuild automatically.

The 6 SVG photos and 4 mp4 clips currently in there are just
placeholder samples I generated so the design is visible — swap
them out for real job photos/videos whenever you're ready.

GALLERY FEATURES
----------------
- Slide-over effect: incoming photo/video glides in ON TOP of
  the previous one (what you asked for)
- Autoplays; slides after photos ~5s, moves on when a video ends
- Arrows, thumbnail strip, swipe/drag, keyboard arrows
- Photos / Videos / All filter tabs
- Videos auto-play muted with their own progress bar

TIP: shoot your phone videos vertically? They still work, the
stage crops to fill. Keep clips short (10-30s) for best flow.
