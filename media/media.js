/* ============================================================
   BEAM'S MOBILE MECHANIC — GALLERY MEDIA LIST
   ------------------------------------------------------------
   Add / remove / reorder your photos and videos here.

   HOW TO ADD YOUR OWN MEDIA:
   1. Drop your file into media/photos or media/videos
   2. Add one line to the list below, like:

        { type: "image", src: "media/photos/brake-job.jpg",  title: "Brake job — 2015 F-150" },
        { type: "video", src: "media/videos/radiator.mp4",   title: "Radiator replacement" },

      - type:      "image" for photos, "video" for videos
      - src:       the file path
      - title:     the caption shown on the slide (can be "")
   3. Save and refresh the page. That's it — the slider,
      thumbnails and Photos/Videos tabs update automatically.
   ============================================================ */
window.BEAM_MEDIA = [
  { type: "image", src: "media/photos/photo1.svg", title: "Alternator swap — job 01" },
  { type: "image", src: "media/photos/photo2.svg", title: "No-start diagnosis — job 02" },
  { type: "video", src: "media/videos/clip1.mp4",  title: "Charging system test on site" },
  { type: "image", src: "media/photos/photo3.svg", title: "Radiator & coolant flush — job 03" },
  { type: "image", src: "media/photos/photo4.svg", title: "Full synthetic oil change — job 04" },
  { type: "video", src: "media/videos/clip2.mp4",  title: "Starter removal, no-start fix" },
  { type: "image", src: "media/photos/photo5.svg", title: "Starter replacement — job 05" },
  { type: "video", src: "media/videos/clip3.mp4",  title: "Radiator install in the driveway" },
  { type: "image", src: "media/photos/photo6.svg", title: "Serpentine belt & tensioner — job 06" },
  { type: "video", src: "media/videos/clip4.mp4",  title: "Oil change where you park" },
];
