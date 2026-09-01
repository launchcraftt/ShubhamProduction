/* =========================================================
   PORTFOLIO JS — portfolio.js
   ========================================================= */

(function () {
  'use strict';


  /* ============================================================
     0. CONFIG
     ============================================================ */

  var TAG_LABELS = {
    bridal: 'Bridal',
    groom: 'Groom',
    couple: 'Couple',
    haldi: 'Haldi',
    mehndi: 'Mehndi',
    engagement: 'Engagement',
    family: 'Family',

    /* Generic "All Pre-Wedding" bucket (no specific location folder) */
    preWedding: 'Pre-Wedding',

    /* Location-specific pre-wedding tags — jinke liye alag folder hai,
       unka apna hi naam badge me dikhega (Jaipur/Delhi/Rishikesh/Agra). */
    jaipur: 'Jaipur',
    delhi: 'Delhi',
    rishikesh: 'Rishikesh',
    agra: 'Agra',

    /* Extra location tags — abhi PREWEDDING_CATS me use nahi ho rahe,
       lekin future me add karo to seedha inka naam dikhega. */
    udaipur: 'Udaipur',
    goa: 'Goa',
    manali: 'Manali'
  };


  /* Video filter tag labels — Wedding / Pre-Wedding / Destination */
  var VTAG_LABELS = {
    wedding: 'Wedding',
    prewedding: 'Pre-Wedding',
    destination: 'Destination'
  };
  

  /* ============================================================
     1. IMages Path Here
     ============================================================ */

  var IMAGE_PATHS = {

    /* ==========================================================
       BRIDAL PHOTOS
       ========================================================== */

    bridal: [
      "img/portfolio/bridal/1.webp",
      "img/portfolio/bridal/2.webp",
      "img/portfolio/bridal/3.webp",
      "img/portfolio/bridal/4.webp",
      "img/portfolio/bridal/5.webp",
      "img/portfolio/bridal/6.webp",
      "img/portfolio/bridal/7.webp",
      "img/portfolio/bridal/8.webp",
      "img/portfolio/bridal/9.webp",
      "img/portfolio/bridal/10.webp",
      "img/portfolio/bridal/11.webp",
      "img/portfolio/bridal/12.webp",
      "img/portfolio/bridal/13.webp",
      "img/portfolio/bridal/14.webp",
      "img/portfolio/bridal/15.webp",
      "img/portfolio/bridal/16.webp",
      "img/portfolio/bridal/17.webp",
      "img/portfolio/bridal/18.webp",
      "img/portfolio/bridal/19.webp",
      "img/portfolio/bridal/20.webp",
      "img/portfolio/bridal/21.webp",
      "img/portfolio/bridal/22.webp",
      "img/portfolio/bridal/23.webp",
      "img/portfolio/bridal/24.webp",
      "img/portfolio/bridal/25.webp",
      "img/portfolio/bridal/26.webp",
      "img/portfolio/bridal/27.webp",
      "img/portfolio/bridal/28.webp",
      "img/portfolio/bridal/29.webp",
      "img/portfolio/bridal/30.webp",

    ],


    /* ==========================================================
       GROOM PHOTOS
       ========================================================== */

    groom: [

      "img/portfolio/groom/1.jpg",
      "img/portfolio/groom/2.jpg",
      "img/portfolio/groom/3.jpg",
      "img/portfolio/groom/4.jpg",
      "img/portfolio/groom/5.jpg",
      "img/portfolio/groom/6.jpg",
      "img/portfolio/groom/7.jpg",
      "img/portfolio/groom/8.jpg",
      "img/portfolio/groom/9.jpg",
      "img/portfolio/groom/10.jpg",
      "img/portfolio/groom/11.jpg",
      "img/portfolio/groom/12.jpg",
      "img/portfolio/groom/13.jpg",
      "img/portfolio/groom/14.jpg",
      "img/portfolio/groom/15.jpg",
      "img/portfolio/groom/16.jpg",
      "img/portfolio/groom/17.jpg",
      "img/portfolio/groom/18.jpg",
      "img/portfolio/groom/19.jpg",
      "img/portfolio/groom/20.jpg",
      "img/portfolio/groom/21.jpg",
      "img/portfolio/groom/22.jpg",
      "img/portfolio/groom/23.jpg",
      "img/portfolio/groom/24.jpg",
      "img/portfolio/groom/25.jpg",
      "img/portfolio/groom/26.jpg",
      "img/portfolio/groom/27.jpg",
      "img/portfolio/groom/28.jpg",
      "img/portfolio/groom/29.jpg",
      "img/portfolio/groom/30.jpg",

    ],


    /* ==========================================================
       COUPLE PHOTOS
       ========================================================== */

    couple: [
      "img/portfolio/couple/1.jpg",
      "img/portfolio/couple/2.jpg",
      "img/portfolio/couple/3.jpg",
      "img/portfolio/couple/4.jpg",
      "img/portfolio/couple/5.jpg",
      "img/portfolio/couple/6.jpg",
      "img/portfolio/couple/7.jpg",
      "img/portfolio/couple/8.jpg",
      "img/portfolio/couple/9.jpg",
      "img/portfolio/couple/10.jpg",
      "img/portfolio/couple/11.jpg",
      "img/portfolio/couple/12.jpg",
      "img/portfolio/couple/13.jpg",
      "img/portfolio/couple/14.jpg",
      "img/portfolio/couple/15.jpg",
      "img/portfolio/couple/16.jpg",
      "img/portfolio/couple/17.jpg",
      "img/portfolio/couple/18.jpg",
      "img/portfolio/couple/19.jpg",
      "img/portfolio/couple/20.jpg",
      "img/portfolio/couple/21.jpg",
      "img/portfolio/couple/22.jpg",
      "img/portfolio/couple/23.jpg",
      "img/portfolio/couple/24.jpg",
      "img/portfolio/couple/25.jpg",
      "img/portfolio/couple/26.jpg",
      "img/portfolio/couple/27.jpg",
      "img/portfolio/couple/28.jpg",
      "img/portfolio/couple/29.jpg",
      "img/portfolio/couple/30.jpg",
      "img/portfolio/couple/31.jpg",
      "img/portfolio/couple/32.jpg",
      "img/portfolio/couple/33.jpg",
      "img/portfolio/couple/34.jpg",
      "img/portfolio/couple/35.jpg",

    ],


    /* ==========================================================
       HALDI PHOTOS
       ========================================================== */

    haldi: [
      "img/portfolio/haldi/1.jpg",
      "img/portfolio/haldi/2.jpg",
      "img/portfolio/haldi/3.jpg",
      "img/portfolio/haldi/4.jpg",
      "img/portfolio/haldi/5.jpg",
      "img/portfolio/haldi/6.jpg",
      "img/portfolio/haldi/7.jpg",
      "img/portfolio/haldi/8.jpg",
      "img/portfolio/haldi/9.jpg",
      "img/portfolio/haldi/10.jpg",
      "img/portfolio/haldi/11.jpg",
      "img/portfolio/haldi/12.jpg",
      "img/portfolio/haldi/13.jpg",
      "img/portfolio/haldi/14.jpg",
      "img/portfolio/haldi/15.jpg",
      "img/portfolio/haldi/16.jpg",
      "img/portfolio/haldi/17.jpg",
      "img/portfolio/haldi/18.jpg",
      "img/portfolio/haldi/19.jpg",
      "img/portfolio/haldi/20.jpg",
      "img/portfolio/haldi/21.jpg",
      "img/portfolio/haldi/22.jpg",
      "img/portfolio/haldi/23.jpg",
      "img/portfolio/haldi/24.jpg",
      "img/portfolio/haldi/25.jpg",
      "img/portfolio/haldi/26.jpg",
      "img/portfolio/haldi/27.jpg",
      "img/portfolio/haldi/28.jpg",
      "img/portfolio/haldi/29.jpg",
      "img/portfolio/haldi/30.jpg",
    ],


    /* ==========================================================
       MEHNDI PHOTOS
       ========================================================== */

    mehndi: [
      "img/portfolio/mehndi/1.jpg",
      "img/portfolio/mehndi/2.jpg",
      "img/portfolio/mehndi/3.jpg",
      "img/portfolio/mehndi/4.jpg",
      "img/portfolio/mehndi/5.jpg",
      "img/portfolio/mehndi/6.jpg",
      "img/portfolio/mehndi/7.jpg",
      "img/portfolio/mehndi/8.jpg",
      "img/portfolio/mehndi/9.jpg",
      "img/portfolio/mehndi/10.jpg",
      "img/portfolio/mehndi/11.jpg",
      "img/portfolio/mehndi/12.jpg",
      "img/portfolio/mehndi/13.jpg",
      "img/portfolio/mehndi/14.jpg",
      "img/portfolio/mehndi/15.jpg",
      "img/portfolio/mehndi/16.jpg",
      "img/portfolio/mehndi/17.jpg",
      "img/portfolio/mehndi/18.jpg",
      "img/portfolio/mehndi/19.jpg",
      "img/portfolio/mehndi/20.jpg",
      "img/portfolio/mehndi/21.jpg",
      "img/portfolio/mehndi/22.jpg",
      "img/portfolio/mehndi/23.jpg",
      "img/portfolio/mehndi/24.jpg",
      "img/portfolio/mehndi/25.jpg",
      "img/portfolio/mehndi/26.jpg",
      "img/portfolio/mehndi/27.jpg",
      "img/portfolio/mehndi/28.jpg",
      "img/portfolio/mehndi/29.jpg",
      "img/portfolio/mehndi/30.jpg",

    ],


    /* ==========================================================
        ENGAGEMENT PHOTOS
       ========================================================== */

    engagement: [

      "img/portfolio/engagement/1.jpg",
      "img/portfolio/engagement/2.jpg",
      "img/portfolio/engagement/3.jpg",
      "img/portfolio/engagement/4.jpg",
      "img/portfolio/engagement/5.jpg",
      "img/portfolio/engagement/6.jpg",
      "img/portfolio/engagement/7.jpg",
      "img/portfolio/engagement/8.jpg",
      "img/portfolio/engagement/9.jpg",
      "img/portfolio/engagement/10.jpg",
      "img/portfolio/engagement/11.jpg",
      "img/portfolio/engagement/12.jpg",
      "img/portfolio/engagement/13.jpg",
      "img/portfolio/engagement/14.jpg",
      "img/portfolio/engagement/15.jpg",
      "img/portfolio/engagement/16.jpg",
      "img/portfolio/engagement/17.jpg",
      "img/portfolio/engagement/18.jpg",
      "img/portfolio/engagement/19.jpg",
      "img/portfolio/engagement/20.jpg",
      "img/portfolio/engagement/21.jpg",
      "img/portfolio/engagement/22.jpg",
      "img/portfolio/engagement/23.jpg",
      "img/portfolio/engagement/24.jpg",
      "img/portfolio/engagement/25.jpg",
      "img/portfolio/engagement/26.jpg",
      "img/portfolio/engagement/27.jpg",
      "img/portfolio/engagement/28.jpg",
      "img/portfolio/engagement/29.jpg",
      "img/portfolio/engagement/30.jpg",

    ],


    /* ==========================================================
        FAMILY PHOTOS
       ========================================================== */

    family: [

      "img/portfolio/family/1.jpg",
      "img/portfolio/family/2.jpg",
      "img/portfolio/family/3.jpg",
      "img/portfolio/family/4.jpg",
      "img/portfolio/family/5.jpg",
      "img/portfolio/family/6.jpg",
      "img/portfolio/family/7.jpg",
      "img/portfolio/family/8.jpg",
      "img/portfolio/family/9.jpg",
      "img/portfolio/family/10.jpg",
      "img/portfolio/family/11.jpg",
      "img/portfolio/family/12.jpg",
      "img/portfolio/family/13.jpg",
      "img/portfolio/family/14.jpg",
      "img/portfolio/family/15.jpg",
      "img/portfolio/family/16.jpg",
      "img/portfolio/family/17.jpg",
      "img/portfolio/family/18.jpg",
      "img/portfolio/family/19.jpg",
      "img/portfolio/family/20.jpg",
      "img/portfolio/family/21.jpg",
      "img/portfolio/family/22.jpg",
      "img/portfolio/family/23.jpg",
      "img/portfolio/family/24.jpg",
      "img/portfolio/family/25.jpg",
      "img/portfolio/family/26.jpg",
      "img/portfolio/family/27.jpg",
      "img/portfolio/family/28.jpg",
      "img/portfolio/family/29.jpg",
      "img/portfolio/family/30.jpg",

    ],


    /* ==========================================================
       All Pre-Wedding
       ========================================================== */

    preWedding: [

      "img/portfolio/preWedding/1.jpg",
      "img/portfolio/preWedding/2.jpg",
      "img/portfolio/preWedding/3.jpg",
      "img/portfolio/preWedding/4.jpg",
      "img/portfolio/preWedding/5.jpg",
      "img/portfolio/preWedding/6.jpg",
      "img/portfolio/preWedding/7.jpg",
      "img/portfolio/preWedding/8.jpg",
      "img/portfolio/preWedding/9.jpg",
      "img/portfolio/preWedding/10.jpg",
      "img/portfolio/preWedding/11.jpg",
      "img/portfolio/preWedding/13.jpg",
      "img/portfolio/preWedding/12.jpg",
      "img/portfolio/preWedding/14.jpg",
      "img/portfolio/preWedding/15.jpg",
      "img/portfolio/preWedding/16.jpg",
      "img/portfolio/preWedding/17.jpg",
      "img/portfolio/preWedding/18.jpg",
      "img/portfolio/preWedding/19.jpg",
      "img/portfolio/preWedding/20.jpg",
      "img/portfolio/preWedding/21.jpg",
      "img/portfolio/preWedding/22.jpg",
      "img/portfolio/preWedding/23.jpg",
      "img/portfolio/preWedding/24.jpg",
      "img/portfolio/preWedding/25.jpg",
      "img/portfolio/preWedding/26.jpg",
      "img/portfolio/preWedding/27.jpg",
      "img/portfolio/preWedding/28.jpg",
      "img/portfolio/preWedding/29.jpg",
      "img/portfolio/preWedding/30.jpg",
      "img/portfolio/preWedding/31.jpg",
      "img/portfolio/preWedding/32.jpg",
      "img/portfolio/preWedding/33.jpg",
      "img/portfolio/preWedding/34.jpg",
      "img/portfolio/preWedding/35.jpg",
      "img/portfolio/preWedding/36.jpg",
      "img/portfolio/preWedding/37.jpg",
      "img/portfolio/preWedding/38.jpg",
      "img/portfolio/preWedding/39.jpg",
      "img/portfolio/preWedding/40.jpg",
      "img/portfolio/preWedding/41.jpg",
      "img/portfolio/preWedding/42.jpg",
      "img/portfolio/preWedding/43.jpg",
      "img/portfolio/preWedding/44.jpg",
      "img/portfolio/preWedding/45.jpg",
      "img/portfolio/preWedding/46.jpg",
      "img/portfolio/preWedding/47.jpg",
      "img/portfolio/preWedding/48.jpg",
      "img/portfolio/preWedding/49.jpg",
      "img/portfolio/preWedding/50.jpg",
      "img/portfolio/preWedding/51.jpg",
      "img/portfolio/preWedding/52.jpg",
      "img/portfolio/preWedding/53.jpg",
    ],

    /* ==========================================================
       JAIPUR PRE-WEDDING
       ========================================================== */

    jaipur: [


      "img/portfolio/preWedding/jaipur/1.jpg",
      "img/portfolio/preWedding/jaipur/2.jpg",
      "img/portfolio/preWedding/jaipur/3.jpg",
      "img/portfolio/preWedding/jaipur/4.jpg",
      "img/portfolio/preWedding/jaipur/5.jpg",
      "img/portfolio/preWedding/jaipur/6.jpg",
      "img/portfolio/preWedding/jaipur/7.jpg",
      "img/portfolio/preWedding/jaipur/8.jpg",
      "img/portfolio/preWedding/jaipur/9.jpg",
      "img/portfolio/preWedding/jaipur/10.jpg",
      "img/portfolio/preWedding/jaipur/11.jpg",
      "img/portfolio/preWedding/jaipur/12.jpg",
      "img/portfolio/preWedding/jaipur/13.jpg",
      "img/portfolio/preWedding/jaipur/14.jpg",
      "img/portfolio/preWedding/jaipur/15.jpg",
      "img/portfolio/preWedding/jaipur/16.jpg",
      "img/portfolio/preWedding/jaipur/17.jpg",
      "img/portfolio/preWedding/jaipur/18.jpg",
      "img/portfolio/preWedding/jaipur/19.jpg",
      "img/portfolio/preWedding/jaipur/20.jpg",
      "img/portfolio/preWedding/jaipur/21.jpg",
      "img/portfolio/preWedding/jaipur/22.jpg",
      "img/portfolio/preWedding/jaipur/23.jpg",
      "img/portfolio/preWedding/jaipur/24.jpg",
      "img/portfolio/preWedding/jaipur/25.jpg",
      "img/portfolio/preWedding/jaipur/26.jpg",
      "img/portfolio/preWedding/jaipur/27.jpg",
      "img/portfolio/preWedding/jaipur/28.jpg",
      "img/portfolio/preWedding/jaipur/29.jpg",
      "img/portfolio/preWedding/jaipur/30.jpg",
      "img/portfolio/preWedding/jaipur/31.jpg",
      "img/portfolio/preWedding/jaipur/32.jpg",
      "img/portfolio/preWedding/jaipur/33.jpg",
      "img/portfolio/preWedding/jaipur/34.jpg",
      "img/portfolio/preWedding/jaipur/35.jpg",
      "img/portfolio/preWedding/jaipur/36.jpg",
    ],


    /* ==========================================================
       DELHI PRE-WEDDING
       ========================================================== */

    delhi: [
      "img/portfolio/preWedding/delhi/1.jpg",
      "img/portfolio/preWedding/delhi/2.jpg",
      "img/portfolio/preWedding/delhi/3.jpg",
      "img/portfolio/preWedding/delhi/4.jpg",
      "img/portfolio/preWedding/delhi/5.jpg",
      "img/portfolio/preWedding/delhi/6.jpg",
      "img/portfolio/preWedding/delhi/7.jpg",
      "img/portfolio/preWedding/delhi/8.jpg",
      "img/portfolio/preWedding/delhi/9.jpg",
      "img/portfolio/preWedding/delhi/10.jpg",
      "img/portfolio/preWedding/delhi/11.jpg",
      "img/portfolio/preWedding/delhi/12.jpg",
      "img/portfolio/preWedding/delhi/13.jpg",
      "img/portfolio/preWedding/delhi/14.jpg",
      "img/portfolio/preWedding/delhi/15.jpg",
      "img/portfolio/preWedding/delhi/16.jpg",
      "img/portfolio/preWedding/delhi/17.jpg",
      "img/portfolio/preWedding/delhi/18.jpg",
      "img/portfolio/preWedding/delhi/19.jpg",
      "img/portfolio/preWedding/delhi/20.jpg",
      "img/portfolio/preWedding/delhi/21.jpg",
      "img/portfolio/preWedding/delhi/22.jpg",
      "img/portfolio/preWedding/delhi/23.jpg",
      "img/portfolio/preWedding/delhi/24.jpg",
      "img/portfolio/preWedding/delhi/25.jpg",
      "img/portfolio/preWedding/delhi/26.jpg",
      "img/portfolio/preWedding/delhi/27.jpg",
      "img/portfolio/preWedding/delhi/28.jpg",
      "img/portfolio/preWedding/delhi/29.jpg",
      "img/portfolio/preWedding/delhi/30.jpg",
      "img/portfolio/preWedding/delhi/31.jpg",
      "img/portfolio/preWedding/delhi/32.jpg",
      "img/portfolio/preWedding/delhi/33.jpg",
      "img/portfolio/preWedding/delhi/34.jpg",
      "img/portfolio/preWedding/delhi/35.jpg",
      "img/portfolio/preWedding/delhi/36.jpg",
      "img/portfolio/preWedding/delhi/37.jpg",
      "img/portfolio/preWedding/delhi/38.jpg",
      "img/portfolio/preWedding/delhi/39.jpg",
      "img/portfolio/preWedding/delhi/40.jpg",
      "img/portfolio/preWedding/delhi/41.jpg",
      "img/portfolio/preWedding/delhi/42.jpg",
      "img/portfolio/preWedding/delhi/43.jpg",
      "img/portfolio/preWedding/delhi/44.jpg",
      "img/portfolio/preWedding/delhi/45.jpg",
      "img/portfolio/preWedding/delhi/46.jpg",
      "img/portfolio/preWedding/delhi/47.jpg",
      "img/portfolio/preWedding/delhi/48.jpg",
      "img/portfolio/preWedding/delhi/49.jpg",
      "img/portfolio/preWedding/delhi/50.jpg",

    ],


    /* ==========================================================
       RISHIKESH PRE-WEDDING
       ========================================================== */

    rishikesh: [
      "img/portfolio/preWedding/rishikesh/1.jpg",
      "img/portfolio/preWedding/rishikesh/2.jpg",
      "img/portfolio/preWedding/rishikesh/3.jpg",
      "img/portfolio/preWedding/rishikesh/4.jpg",
      "img/portfolio/preWedding/rishikesh/5.jpg",
      "img/portfolio/preWedding/rishikesh/6.jpg",
      "img/portfolio/preWedding/rishikesh/7.jpg",
      "img/portfolio/preWedding/rishikesh/8.jpg",
      "img/portfolio/preWedding/rishikesh/9.jpg",
      "img/portfolio/preWedding/rishikesh/10.jpg",
      "img/portfolio/preWedding/rishikesh/11.jpg",
      "img/portfolio/preWedding/rishikesh/12.jpg",
      "img/portfolio/preWedding/rishikesh/13.jpg",
      "img/portfolio/preWedding/rishikesh/14.jpg",
      "img/portfolio/preWedding/rishikesh/15.jpg",
      "img/portfolio/preWedding/rishikesh/16.jpg",
      "img/portfolio/preWedding/rishikesh/17.jpg",
      "img/portfolio/preWedding/rishikesh/18.jpg",
      "img/portfolio/preWedding/rishikesh/19.jpg",
      "img/portfolio/preWedding/rishikesh/20.jpg",
      "img/portfolio/preWedding/rishikesh/21.jpg",
      "img/portfolio/preWedding/rishikesh/22.jpg",
      "img/portfolio/preWedding/rishikesh/23.jpg",
      "img/portfolio/preWedding/rishikesh/24.jpg",
      "img/portfolio/preWedding/rishikesh/25.jpg",
      "img/portfolio/preWedding/rishikesh/26.jpg",
      "img/portfolio/preWedding/rishikesh/27.jpg",
      "img/portfolio/preWedding/rishikesh/28.jpg",
      "img/portfolio/preWedding/rishikesh/29.jpg",
      "img/portfolio/preWedding/rishikesh/30.jpg",
      "img/portfolio/preWedding/rishikesh/31.jpg",
      "img/portfolio/preWedding/rishikesh/32.jpg",
      "img/portfolio/preWedding/rishikesh/33.jpg",

    ],

    /* ==========================================================
       AGRA PRE-WEDDING
       ========================================================== */

    agra: [
      "img/portfolio/preWedding/agra/1.jpg",
      "img/portfolio/preWedding/agra/2.jpg",
      "img/portfolio/preWedding/agra/3.jpg",
      "img/portfolio/preWedding/agra/4.jpg",
      "img/portfolio/preWedding/agra/5.jpg",
      "img/portfolio/preWedding/agra/6.jpg",
      "img/portfolio/preWedding/agra/7.jpg",
      "img/portfolio/preWedding/agra/8.jpg",
      "img/portfolio/preWedding/agra/9.jpg",
      "img/portfolio/preWedding/agra/10.jpg",
      "img/portfolio/preWedding/agra/11.jpg",
      "img/portfolio/preWedding/agra/12.jpg",
      "img/portfolio/preWedding/agra/13.jpg",
      "img/portfolio/preWedding/agra/14.jpg",
      "img/portfolio/preWedding/agra/15.jpg",
      "img/portfolio/preWedding/agra/16.jpg",
      "img/portfolio/preWedding/agra/17.jpg",
      "img/portfolio/preWedding/agra/18.jpg",
      "img/portfolio/preWedding/agra/19.jpg",
      "img/portfolio/preWedding/agra/20.jpg",
      "img/portfolio/preWedding/agra/21.jpg",
      "img/portfolio/preWedding/agra/22.jpg",
      "img/portfolio/preWedding/agra/23.jpg",
      "img/portfolio/preWedding/agra/24.jpg",
      "img/portfolio/preWedding/agra/25.jpg",
      "img/portfolio/preWedding/agra/26.jpg",
      "img/portfolio/preWedding/agra/27.jpg",
      "img/portfolio/preWedding/agra/28.jpg",
      "img/portfolio/preWedding/agra/29.jpg",
      "img/portfolio/preWedding/agra/30.jpg"

    ]

  };


  /* ============================================================
     SECTION AL — ALBUM (folder-style photo albums)
     ============================================================

     YAHAN PAR APNE ALBUM "DESIGNS" (folders) DEFINE KARO.
     Kam se kam 10 hain, har ek me kam se kam 40 photos.

     Har album ke liye:
       tag        → unique internal id (URLs/keys me safe rakho, spaces mat use karo)
       label      → jo naam card par aur photo-badge me dikhega (BAS YE BADLO agar
                     sirf naam change karna hai)
       folder     → us album ki photos jis folder me hain
       photoCount → us folder me kitni photos hain (minimum 40, jitni chaho utni badha do)

     PATH: har album folder ke andar photos "1.jpg", "2.jpg" ... is tarah
     numbered honi chahiye, aur ek "cover.jpg" bhi honi chahiye (card ka thumbnail).

     Example:
       img/portfolio/album/royal/cover.jpg
       img/portfolio/album/royal/1.jpg
       img/portfolio/album/royal/2.jpg
       ... 1 se 40 (ya jitni bhi photoCount di hai) tak

     NAYA ALBUM ADD KARNA HO to bas neeche list me ek aur
     { tag:..., label:..., folder:..., photoCount:... } add kar do.
     ============================================================ */

  var ALBUM_CATS = [
    { tag: 'album-royal', label: 'Royal Wedding Album', folder: 'img/portfolio/album/royal', photoCount: 40 },
    { tag: 'album-destination', label: 'Destination Story', folder: 'img/portfolio/album/destination', photoCount: 40 },
    { tag: 'album-vintage', label: 'Vintage Charm', folder: 'img/portfolio/album/vintage', photoCount: 40 },
    { tag: 'album-modern', label: 'Modern Minimal', folder: 'img/portfolio/album/modern', photoCount: 40 },
    { tag: 'album-traditional', label: 'Traditional Rasam', folder: 'img/portfolio/album/traditional', photoCount: 40 },
    { tag: 'album-cinematic', label: 'Cinematic Moments', folder: 'img/portfolio/album/cinematic', photoCount: 40 },
    { tag: 'album-pastel', label: 'Pastel Dreams', folder: 'img/portfolio/album/pastel', photoCount: 40 },
    { tag: 'album-golden', label: 'Golden Hour', folder: 'img/portfolio/album/golden', photoCount: 40 },
    { tag: 'album-heritage', label: 'Heritage Palace', folder: 'img/portfolio/album/heritage', photoCount: 40 },
    { tag: 'album-beach', label: 'Boho Beach', folder: 'img/portfolio/album/beach', photoCount: 40 }
  ];

  // Album labels ko TAG_LABELS me bhi daal dete hain, taaki jab
  // lightbox me koi album-photo khule to uska badge sahi naam dikhaye.
  ALBUM_CATS.forEach(function (cat) {
    TAG_LABELS[cat.tag] = cat.label;
  });


  /* ============================================================
     2. TEASER / CINEMATIC VIDEOS
     ============================================================ */

  var VIDEO_DATA = [

    /* ==========================================================
       TEASER
       ========================================================== */

    {
      media: 'teaser',
      vtag: 'prewedding',
      title: 'Mohit & Himani',
      iframe: '<iframe width="560" height="315" src="https://www.youtube.com/embed/S6FvG61BGoY?si=AunH-KTLprgneXX_" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>'
    },

    {
      media: 'teaser',
      vtag: 'wedding',
      title: 'Amit & Anureet',
      iframe: '<iframe width="560" height="315" src="https://www.youtube.com/embed/lDuJwZf2tUU?si=ug3O2Nda3zBm46mO" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>'
    },
    {
      media: 'teaser',
      vtag: 'wedding',
      title: 'Naveen & Susmita',
      iframe: '<iframe width="560" height="315" src="https://www.youtube.com/embed/vOxI3eDASBk?si=JomC2AQckzepJQI5" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>'
    },

    {
      media: 'teaser',
      vtag: 'prewedding',
      title: 'Rittika & Narayana',
      iframe: '<iframe width="560" height="315" src="https://www.youtube.com/embed/T4BdJTkR1PM?si=VF_vdBdFQ94L8OlS" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>'
    },

    {
      media: 'teaser',
      vtag: 'wedding',
      title: 'Saurabh & Anjali',
      iframe: '<iframe width="560" height="315" src="https://www.youtube.com/embed/Lbcryj300eU?si=-yjqj4Vyg0ROXtM3" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>'
    },

    {
      media: 'teaser',
      vtag: 'prewedding',
      title: 'Sakshi & Pulkit',
      iframe: '<iframe width="560" height="315" src="https://www.youtube.com/embed/f6hmlwJ2MSc?si=ZT8W9hhmOLsc6yXK" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>'
    },
    {
      media: 'teaser',
      vtag: 'prewedding',
      title: 'Mahi & Manish',
      iframe: '<iframe width="560" height="315" src="https://www.youtube.com/embed/vv0kmhCrTao?si=PKGCUv0Q19j_hkaR" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>'
    },

    {
      media: 'teaser',
      vtag: 'wedding',
      title: 'Yash & Priya',
      iframe: '<iframe width="560" height="315" src="https://www.youtube.com/embed/cCAw_1lclLI?si=Dg08RGeKEv1G3uJw" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>'
    },

    {
      media: 'teaser',
      vtag: 'prewedding',
      title: 'Vishal & Gunjan',
      iframe: '<iframe width="560" height="315" src="https://www.youtube.com/embed/AJF0wZe6CZc?si=H-qvsI_vNRX9Wzec" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>'
    },
    {
      media: 'teaser',
      vtag: 'wedding',
      title: 'Akshat & Samridhi',
      iframe: '<iframe width="560" height="315" src="https://www.youtube.com/embed/NQFJTniygjo?si=81dwjInxYQTXFkLM" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>'
    },

    {
      media: 'teaser',
      vtag: 'wedding',
      title: 'Abhishek & Divya',
      iframe: '<iframe width="560" height="315" src="https://www.youtube.com/embed/jYbn-Y92PEM?si=_yF1Be4D7AgqNrrQ" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>'
    },

    {
      media: 'teaser',
      vtag: 'prewedding',
      title: 'Vipul & Akansha',
      iframe: '<iframe width="560" height="315" src="https://www.youtube.com/embed/APYVntbT5zM?si=8YoHZG6-L-Oi9oR0" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>'
    },

    {
      media: 'cinematic',
      vtag: 'prewedding',
      title: 'Deeksha & Apporva',
      iframe: '<iframe width="560" height="315" src="https://www.youtube.com/embed/ptmo0Xkv7eU?si=ZDoVC_yKZ5m83P_z" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>'
    },

    {
      media: 'teaser',
      vtag: 'wedding',
      title: 'Tushar & Rashi',
      iframe: '<iframe width="560" height="315" src="https://www.youtube.com/embed/JRgOMbmNfn8?si=GZMQlBLZDj8IIVUk" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>'
    },
    {
      media: 'teaser',
      vtag: 'wedding',
      title: 'Rohit & Nikita',
      iframe: '<iframe width="560" height="315" src="https://www.youtube.com/embed/EyGhpkIEeKA?si=ctYKnanIzXrEObkE" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>'
    },
    {
      media: 'teaser',
      vtag: 'prewedding',
      title: 'Rakhi & Shankar',
      iframe: '<iframe width="560" height="315" src="https://www.youtube.com/embed/CjiGvd2qM6g?si=ls5WvGQRbOqqiJo3" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>'
    },
    {
      media: 'teaser',
      vtag: 'prewedding',
      title: 'Rakesh & Sambhavi',
      iframe: '<iframe width="560" height="315" src="https://www.youtube.com/embed/A06IEkol9n8?si=IzaED0BRzCnvt-IG" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>'
    },
    {
      media: 'teaser',
      vtag: 'prewedding',
      title: 'Muskan & Ronny',
      iframe: '<iframe width="560" height="315" src="https://www.youtube.com/embed/4gufs374Ins?si=1Dlcuqd3IZ6CO0Rw" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>'
    },

    /* ==========================================================
       CINEMATIC
       ========================================================== */

    {
      media: 'cinematic',
      vtag: 'wedding',
      title: 'Rinki & Kanishq',
      iframe: '<iframe width="560" height="315" src="https://www.youtube.com/embed/MfMkih85Jqk?si=Tjzqq4yky2IMI_FB" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>'
    },

    {
      media: 'cinematic',
      vtag: 'prewedding',
      title: 'Saurabh & Shaudual',
      iframe: '<iframe width="560" height="315" src="https://www.youtube.com/embed/xjkGx_I0OrY?si=5iqmR2W6P5zbHhWm" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>'
    },
    {
      media: 'cinematic',
      vtag: 'wedding',
      title: 'Gaurav & Priya',
      iframe: '<iframe width="560" height="315" src="https://www.youtube.com/embed/HiLsnKROKzM?si=VFPZzkOQy_HDeO5u" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>'
    },
    {
      media: 'cinematic',
      vtag: 'wedding',
      title: 'Rahul & Shraddha',
      iframe: '<iframe width="560" height="315" src="https://www.youtube.com/embed/7HaLvm69Y1k?si=ACc4tscS8LSBejZK" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>'
    },
    {
      media: 'cinematic',
      vtag: 'wedding',
      title: 'Pranav & Sikha',
      iframe: '<iframe width="560" height="315" src="https://www.youtube.com/embed/JXRVpR_hag8?si=8ZlKUarkYNPaMKrl" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>'
    },

    {
      media: 'cinematic',
      vtag: 'prewedding',
      title: 'Rashi & Vinod',
      iframe: '<iframe width="560" height="315" src="https://www.youtube.com/embed/8qFYQ4UqkBQ?si=tLol6jJbgqdW7an8" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>'
    },
    {
      media: 'cinematic',
      vtag: 'wedding',
      title: 'Niyati & Jeet',
      iframe: '<iframe width="560" height="315" src="https://www.youtube.com/embed/YQpglsbMlTU?si=r4doIYw13fiUDAql" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>'
    },
    {
      media: 'cinematic',
      vtag: 'prewedding',
      title: "prateek & Ujaya",
      iframe: '<iframe width="560" height="315" src="https://www.youtube.com/embed/vR6JmfP3jPA?si=QOZ_0rbTSZfbvmh-" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>'
    },
    {
      media: 'cinematic',
      vtag: 'wedding',
      title: 'Raghudev & Priyanka',
      iframe: '<iframe width="560" height="315" src="https://www.youtube.com/embed/9qJsSraFkW4?si=nIgLIMoyP9QVXGgh" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>'
    },

    {
      media: 'cinematic',
      vtag: 'prewedding',
      title: 'Harshita & Rahul',
      iframe: '<iframe width="560" height="315" src="https://www.youtube.com/embed/qngWoipQFpc?si=dHmwhWMlmT_k7q5S" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>'
    },
    {
      media: 'cinematic',
      vtag: 'wedding',
      title: 'Khushi & Zayad',
      iframe: '<iframe width="560" height="315" src="https://www.youtube.com/embed/BAsWLtn8Suo?si=D_45CN02djoZiTHL" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>'
    },


    {
      media: 'cinematic',
      vtag: 'prewedding',
      title: 'Vishal & Gunjan',
      iframe: '<iframe width="560" height="315" src="https://www.youtube.com/embed/JIEI6kUX-r0?si=_dqibJ_INUI7kuX0" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>'
    },

    {
      media: 'cinematic',
      vtag: 'prewedding',
      title: 'Jatin & Chunmun',
      iframe: '<iframe width="560" height="315" src="https://www.youtube.com/embed/mNJtnLoOops?si=2j0FiTTdO46Srp5o" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>'
    },
    {
      media: 'cinematic',
      vtag: 'prewedding',
      title: 'Shefali & Ranjan',
      iframe: '<iframe width="560" height="315" src="https://www.youtube.com/embed/geFZen9c5iU?si=eiUVVznvvSJz5Dbp" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>'
    },


  ];


  /* ============================================================
     SECTION R — REEL VIDEOS
     ============================================================ */

  var REEL_DATA = {

    /* ========== WEDDING REELS ========== */
    wedding: [
      { kind: 'youtube', src: 'sMyX-D9w67A?si=A8ZqDkxGWCT0mB7c', title: 'Aadhya' },
      { kind: 'youtube', src: '9W4yYwmxFI0?si=93hPGU-TJoazJBk5', title: 'Kritika' },
      { kind: 'youtube', src: 'neFZ74WnWYs?si=W7BQYqInaoVGDRSF', title: 'Priya' },
      { kind: 'youtube', src: 'x_iaGyO32Co?si=Q3uZ6XRJTrWyNcna', title: 'Rahul & Sikha' },
      { kind: 'youtube', src: 'Zc2awQiVGYI?si=w3XCXC5en01NqDiY', title: 'Saanvi' },
      { kind: 'youtube', src: 'tO17eJSS-hk?si=CYU2GlmKf-BdhhEJ', title: 'Priya & Vikash' },
      { kind: 'youtube', src: 'fUd_2O18IOU?si=UiKlFyGlSYPBseOh', title: 'Diya' },
      { kind: 'youtube', src: 'clq3Tst-oVA?si=VZ2RdClY79-PsexH', title: 'Shubham & Ruhi' },
      { kind: 'youtube', src: 'Y1Fq7JgndAg?si=1IZ68tZWwwko-Xif', title: 'Ananya' },
      { kind: 'youtube', src: 't1_veJatcvI?si=Co8nL01Kzjl_T4oD', title: 'Nandini' },
      { kind: 'youtube', src: 'slwyI0R3Pg4?si=OXxjw8QzhZZJIx4L', title: 'Riya' },
      { kind: 'youtube', src: '_8NtBrvMWmA?si=oMPxYDiy6jzgz-Aq', title: 'Simran' },
      { kind: 'youtube', src: 'qFm0IVwgf3w?si=XzA4lQcQg_qhAtzq', title: 'Saanvi' },
      { kind: 'youtube', src: 'aPw7QvkOm7o?si=7DGUAnTDTG1wgSt6', title: 'Isha' },
      { kind: 'youtube', src: 's5gs2Xbpr5k?si=tgLm2AvQhiAKmnG9', title: 'Sunidhi & Arun' },
      { kind: 'youtube', src: 'sagh1oVsneA?si=uHe8V3IuXvVi5AJ2', title: 'Vardan & Priya' },
      { kind: 'youtube', src: '3txasw0b0Ec?si=oqj6Z09Ix-AGPnho', title: 'Kavya' },
      { kind: 'youtube', src: 'z-sNDoj63YY?si=uS9qdDH_8AWmp-CK', title: 'Shreya' },
      { kind: 'youtube', src: 'UIZRNBLkEm4?si=IgHkgxoN_Qza3HLC', title: 'Vanya' },
    ],

    /* ==========PRE-WEDDING REELS ========== */
    prewedding: [
      { kind: 'youtube', src: 'Yy1jKu4doNU?si=NYGC5jIEvmw3r9Ov', title: 'Shalu & Tarun' },
      { kind: 'youtube', src: 'kPxTz4Zx-90?si=_AKTrofc19s7CUOW', title: 'Arjun & Riya' },
      { kind: 'youtube', src: 'TfWnxeLxr9M?si=1FTdYJz_QWUvfvg-', title: 'Vihaan & Saanvi' },
      { kind: 'youtube', src: 'HRsYZQUq-RY?si=PRDukcFc6K-UAmPx', title: 'Rohan & Simran' },
      { kind: 'youtube', src: 'EXRY1QU8UiM?si=749GMxgb8Gvi7sOF', title: 'Akshay & Radhika' },
      { kind: 'youtube', src: '2TTM9W-uIAw?si=E7zhRq2EP5xB--Yk', title: 'Dev & Nandini' },
      { kind: 'youtube', src: 'UhnEPthr2z4?si=zmDr0t9-Bgnwc92b', title: 'Kunal & Kavya' },
      { kind: 'youtube', src: 'wuibtAIpXa4?si=sIUJGp5dBBulPHcw', title: 'Rahul & Priya' },
      { kind: 'youtube', src: 'pycEFzen32Y?si=onNoUEgwTuag_VtH', title: 'Gaurav & Annu' },
      { kind: 'youtube', src: 'EX0CIxQQmds?si=MJIDmG49bb_G_m8e', title: 'Varun & Tanvi' },
      { kind: 'youtube', src: 'Ak_CCan8l7A?si=3g2k-7NZswSyAEIX', title: 'Aayush & Sakshi' },
      { kind: 'youtube', src: 'B4p6nozB6Zw?si=wq8mfroCLxh8-bIb', title: 'Manav & Avni' },
      { kind: 'youtube', src: 'aZ8UlBWpXTc?si=JJirwZZNUresOAuD', title: 'Harsh & Pooja' },
      { kind: 'youtube', src: '9mvafPFzj60?si=ezGVo1G-ygDwzMUm', title: 'Ankit & Neha' },
      { kind: 'youtube', src: 'oqW6VN5xh00?si=FtgNk2WTWSP8Efax', title: 'Raj & Kiara' },
      { kind: 'youtube', src: 'uvK_SiaEuTU?si=YNVjX_f_NKJd8JiG', title: 'Abhishek & Vanya' },
      { kind: 'youtube', src: 'i8v01ET-r1U?si=5y9Tkj7mfbTBDpGn', title: 'Siddharth & Kritika' },

    ],

  };


  /* ============================================================
     3. PHOTO / VIDEO CATEGORY CONFIG
     ============================================================ */

  var WEDDING_CATS = [
    { tag: 'bridal', count: 30 },
    { tag: 'groom', count: 30 },
    { tag: 'couple', count: 50 },
    { tag: 'haldi', count: 30 },
    { tag: 'mehndi', count: 30 },
    { tag: 'engagement', count: 30 },
    { tag: 'family', count: 30 }
  ];


  var PREWEDDING_CATS = [
    { tag: 'preWedding', count: 53 },
    { tag: 'jaipur', count: 30 },
    { tag: 'delhi', count: 50 },
    { tag: 'rishikesh', count: 30 },
    { tag: 'agra', count: 30 }
  ];


  var REEL_INCREMENT = 12;


  /* ============================================================
     4. DESIGN CONFIG
     ============================================================ */

  var RATIOS = [
    1.4,
    1.0,
    1.25,
    0.95,
    1.3,
    0.85,
    1.15,
    1.2,
    1.5,
    0.9,
    1.1,
    0.8,
    1.35
  ];


  var GRADIENTS = [
    ['#2b2b2b', '#7a9d6e'],
    ['#1a1a1a', '#5c7d52'],
    ['#111111', '#9cb98f'],
    ['#2e2e2e', '#7a9d6e'],
    ['#0d0d0d', '#5c7d52'],
    ['#1a1a1a', '#3a3a3a'],
    ['#2b2b2b', '#9cb98f'],
    ['#111111', '#5c7d52'],
    ['#1a1a1a', '#7a9d6e'],
    ['#2e2e2e', '#9cb98f'],
    ['#0d0d0d', '#5c7d52'],
    ['#3d5236', '#1a1a1a'],
    ['#5c7d52', '#111111'],
    ['#2e3d28', '#7a9d6e']
  ];


  function pad(n) {
    return n < 10 ? '0' + n : '' + n;
  }


  /* ============================================================
     5. BUILD PHOTO DATA
     ============================================================ */

  function buildPhotos() {

    var out = [];


    WEDDING_CATS.forEach(function (cat) {

      var images = IMAGE_PATHS[cat.tag] || [];

      for (var i = 1; i <= images.length; i++) {

        out.push({
          id: 'w-' + cat.tag + '-' + pad(i),
          tag: cat.tag,
          tags: [cat.tag, 'wedding'],
          title: ' ',
          ratio: RATIOS[(i + cat.tag.length) % RATIOS.length],
          gradient: GRADIENTS[(i + cat.tag.length) % GRADIENTS.length],
          src: images[i - 1]
        });

      }

    });


    PREWEDDING_CATS.forEach(function (cat) {

      var images = IMAGE_PATHS[cat.tag] || [];

      for (var i = 1; i <= images.length; i++) {

        out.push({
          id: 'pw-' + cat.tag + '-' + pad(i),
          tag: cat.tag,
          tags: [cat.tag, 'prewedding'],
          title: '',
          ratio: RATIOS[(i + cat.tag.length) % RATIOS.length],
          gradient: GRADIENTS[(i + cat.tag.length) % GRADIENTS.length],
          src: images[i - 1]
        });

      }

    });


    return out;
  }


  /* ============================================================
     BUILD ALBUM PHOTO DATA
     Ek album (ALBUM_CATS ka ek entry) ke andar ki saari photos
     ko photo-jaisa object bana deta hai, taaki common lightbox
     ke saath compatible ho (src/gradient/ratio/tag/title).
     ============================================================ */

  function buildAlbumPhotos(cat) {

    var out = [];

    for (var i = 1; i <= cat.photoCount; i++) {

      out.push({
        tag: cat.tag,
        tags: [cat.tag],
        title: cat.label + ' ' + i,
        ratio: 0.33,   // 12x36 jaisa panoramic — asal display CSS se control hota hai
        gradient: GRADIENTS[(i + cat.tag.length) % GRADIENTS.length],
        src: cat.folder + '/' + i + '.jpg'
      });

    }

    return out;
  }


  /* ============================================================
     6. BUILD VIDEO DATA — Teaser/Cinematic
        + Reel (buildReels() se aata hai)
     ============================================================ */

  function buildVideos() {

    var fixedVideos = VIDEO_DATA.map(function (video, i) {

      return {
        id: 'v-' + video.media + '-' + video.vtag + '-' + pad(i + 1),
        media: video.media,
        vtag: video.vtag,
        title: video.title,
        iframe: video.iframe
      };

    });

    return fixedVideos.concat(buildReels());

  }



  /* ============================================================
     SECTION R ka data yahan se actual video-objects me convert
     hota hai. Har category (wedding/prewedding/destination) ke
     array ko loop karke card banata hai — jitne bhi objects
     array me honge utne cards ban jayenge, isliye 10 se zyada
     bhi add kar sakte ho.
     ============================================================ */

  function buildReels() {

    var out = [];

    ['wedding', 'prewedding', 'destination'].forEach(function (cat) {

      var list = REEL_DATA[cat] || [];

      for (var i = 1; i <= list.length; i++) {

        var r = list[i - 1] || {};

        out.push({
          id: 'v-reel-' + cat + '-' + pad(i),
          media: 'reel',
          vtag: cat,
          title: r.title || (VTAG_LABELS[cat] + i),
          iframe: r.iframe || null,
          kind: r.kind || null,
          src: r.src || null
        });

      }

    });

    return out;
  }


  var PHOTOS = buildPhotos();

  var VIDEOS = buildVideos();


  /* ============================================================
     7. GLOBAL VARIABLES
     ============================================================ */

  var INIT_COUNT = 12;

  var INCREMENT = 12;

  var currentlyLoaded = 0;

  var filtered = [];

  /* Reel tab ki apni alag pagination state (photos wali
     currentlyLoaded/filtered se clash na ho isliye separate hai) */
  var reelLoaded = 0;
  var reelFilteredList = [];

  var activeTag = 'all';

  var activeVTag = 'all';

  var activeMedia = 'photos';

  var searchQuery = '';

  var lightboxIndex = 0;

  var lightboxItems = [];


  var pfGrid,
    pfVideoGrid,
    pfLoadMore,
    pfPhotosSection,
    pfVideosSection;

  var pfPhotoFilters,
    pfVideoFilters;

  var pfResultCount,
    pfEmpty,
    pfClearAll,
    pfSearchClear;

  var pfLightbox,
    pfLbImgWrap,
    pfLbMeta,
    pfLbCounter,
    pfLbThumbs;

  /* Reel ke "Load More" button ke references */
  var pfVideoLoadMoreWrap,
    pfVideoLoadMore;

  /* Album section ke DOM references */
  var pfAlbumSection,
    pfAlbumCovers,
    pfAlbumDetail,
    pfAlbumDetailTitle,
    pfAlbumGrid,
    pfAlbumBack;


  /* ============================================================
     8. DOM READY
     ============================================================ */

  document.addEventListener(
    'DOMContentLoaded',
    function () {

      pfGrid = document.getElementById('pfGrid');
      pfVideoGrid = document.getElementById('pfVideoGrid');
      pfLoadMore = document.getElementById('pfLoadMore');
      pfPhotosSection = document.getElementById('pfPhotosSection');
      pfVideosSection = document.getElementById('pfVideosSection');
      pfPhotoFilters = document.getElementById('pfPhotoFilters');
      pfVideoFilters = document.getElementById('pfVideoFilters');
      pfResultCount = document.getElementById('pfResultCount');
      pfEmpty = document.getElementById('pfEmpty');
      pfClearAll = document.getElementById('pfClearAll');
      pfSearchClear = document.getElementById('pfSearchClear');
      pfLightbox = document.getElementById('pfLightbox');
      pfLbImgWrap = document.getElementById('pfLbImgWrap');
      pfLbMeta = document.getElementById('pfLbMeta');
      pfLbCounter = document.getElementById('pfLbCounter');
      pfLbThumbs = document.getElementById('pfLbThumbs');
      pfVideoLoadMoreWrap = document.getElementById('pfVideoLoadMoreWrap');
      pfVideoLoadMore = document.getElementById('pfVideoLoadMore');

      pfAlbumSection = document.getElementById('pfAlbumSection');
      pfAlbumCovers = document.getElementById('pfAlbumCovers');
      pfAlbumDetail = document.getElementById('pfAlbumDetail');
      pfAlbumDetailTitle = document.getElementById('pfAlbumDetailTitle');
      pfAlbumGrid = document.getElementById('pfAlbumGrid');
      pfAlbumBack = document.getElementById('pfAlbumBack');


      bindSearch();
      bindMediaTabs();
      bindPhotoTags();
      bindVideoTags();
      bindLoadMore();
      bindVideoLoadMore();
      bindAlbumBack();
      bindLightbox();
      bindQueryForm();
      bindStickyBar();


      document.getElementById('pfClearAll').addEventListener('click', clearAllFilters);
      document.getElementById('pfEmptyReset').addEventListener('click', clearAllFilters);


      applyFilters();

    }
  );


  /* ============================================================
     9. STICKY BAR
     ============================================================ */

  function bindStickyBar() {

    var bar = document.getElementById('pfStickyBar');

    window.addEventListener(
      'scroll',
      function () {
        bar.classList.toggle('elevated', window.scrollY > 80);
      },
      { passive: true }
    );

  }


  /* ============================================================
     10. SEARCH
     ============================================================ */

  function bindSearch() {

    var input = document.getElementById('pfSearch');

    input.addEventListener(
      'input',
      function () {

        searchQuery = this.value.trim().toLowerCase();

        pfSearchClear.classList.toggle('visible', searchQuery.length > 0);

        activeTag = 'all';

        resetTagUI('.pf-tag[data-tag]', 'all');

        applyFilters();

      }
    );


    document.getElementById('pfSearchClear').addEventListener(
      'click',
      function () {

        document.getElementById('pfSearch').value = '';
        searchQuery = '';
        pfSearchClear.classList.remove('visible');
        applyFilters();

      }
    );

  }


  /* ============================================================
     11. MEDIA TABS
      3 tarah ke tabs handle hote hain:
       'photos'                     → photo grid
       'album'                      → folder-style albums
       'reel'/'teaser'/'cinematic'  → video grid
     ============================================================ */

  function bindMediaTabs() {

    document.querySelectorAll('.pf-mtab').forEach(
      function (btn) {

        btn.addEventListener(
          'click',
          function () {

            document.querySelectorAll('.pf-mtab').forEach(
              function (b) { b.classList.remove('active'); }
            );

            this.classList.add('active');

            activeMedia = this.dataset.media;


            if (activeMedia === 'photos') {

              pfPhotoFilters.style.display = '';
              pfVideoFilters.style.display = 'none';
              pfPhotosSection.style.display = '';
              pfVideosSection.style.display = 'none';
              pfAlbumSection.style.display = 'none';

              pfVideoGrid.classList.remove('is-reels');
              pfVideoLoadMoreWrap.style.display = 'none';

              applyFilters();

            } else if (activeMedia === 'album') {

              pfPhotoFilters.style.display = 'none';
              pfVideoFilters.style.display = 'none';
              pfPhotosSection.style.display = 'none';
              pfVideosSection.style.display = 'none';
              pfAlbumSection.style.display = '';

              pfVideoGrid.classList.remove('is-reels');
              pfVideoLoadMoreWrap.style.display = 'none';

              pfAlbumDetail.style.display = 'none';
              pfAlbumCovers.style.display = '';

              renderAlbumCovers();

            } else {

              // reel / teaser / cinematic
              pfPhotoFilters.style.display = 'none';
              pfVideoFilters.style.display = '';
              pfPhotosSection.style.display = 'none';
              pfVideosSection.style.display = '';
              pfAlbumSection.style.display = 'none';

              activeVTag = 'all';

              resetTagUI('.pf-tag[data-vtag]', 'all');

              renderVideos();

            }

            scrollToTopOfResults();

          }
        );

      }
    );

  }


  /* ============================================================
     12. PHOTO FILTERS
     ============================================================ */

  function bindPhotoTags() {

    document.querySelectorAll('.pf-tag[data-tag]').forEach(
      function (btn) {

        btn.addEventListener(
          'click',
          function () {

            activeTag = this.dataset.tag;

            resetTagUI('.pf-tag[data-tag]', activeTag);

            searchQuery = '';

            document.getElementById('pfSearch').value = '';

            pfSearchClear.classList.remove('visible');

            applyFilters();

            scrollToTopOfResults();

          }
        );

      }
    );

  }


  /* ============================================================
     13. VIDEO FILTERS
     (Wedding / Pre-Wedding / Destination — Reel ke liye bhi
     yehi filters chalte hain, sirf render/pagination alag hai)
     ============================================================ */

  function bindVideoTags() {

    document.querySelectorAll('.pf-tag[data-vtag]').forEach(
      function (btn) {

        btn.addEventListener(
          'click',
          function () {

            activeVTag = this.dataset.vtag;

            resetTagUI('.pf-tag[data-vtag]', activeVTag);

            renderVideos();

            scrollToTopOfResults();

          }
        );

      }
    );

  }


  function resetTagUI(selector, activeVal) {

    document.querySelectorAll(selector).forEach(
      function (b) {

        b.classList.toggle(
          'active',
          b.dataset.tag === activeVal || b.dataset.vtag === activeVal
        );

      }
    );

  }


  /* ============================================================
     SCROLL TO TOP OF RESULTS
     Jab bhi koi filter/tab trigger ho (photo tag, video tag,
     media tab, clear-all), user jahan bhi scroll kiya hua ho,
     page ko us section ke top par le aata hai — taaki naye
     (filtered) results turant dikhein, na ki user apne aap neeche
     scroll karke dhoondhta rahe. Load More par ye call NAHI hota,
     kyunki wahan user wahin bane rehna chahta hai.
     ============================================================ */

  function scrollToTopOfResults() {

    var target =
      activeMedia === 'photos' ? pfPhotosSection :
        activeMedia === 'album' ? pfAlbumSection :
          pfVideosSection;

    if (!target) return;

    var stickyOffset = 310; // sticky filter bar ke neeche thoda gap rahe -----------------------------------------------

    var top =
      target.getBoundingClientRect().top +
      window.pageYOffset -
      stickyOffset;

    window.scrollTo({
      top: top < 0 ? 0 : top,
      behavior: 'smooth'
    });

  }


  /* ============================================================
     14. APPLY PHOTO FILTERS
     ============================================================ */

  function applyFilters() {

    if (activeMedia !== 'photos') {
      return;
    }


    filtered = PHOTOS.filter(
      function (p) {

        var tagMatch =
          activeTag === 'all' ||
          p.tags.indexOf(activeTag) !== -1;

        var searchMatch =
          !searchQuery ||
          p.title.toLowerCase().indexOf(searchQuery) !== -1 ||
          p.tags.some(function (t) { return t.indexOf(searchQuery) !== -1; });

        return (tagMatch && searchMatch);

      }
    );


    filtered = shuffle(filtered);

    currentlyLoaded = 0;

    pfGrid.innerHTML = '';

    var hasFilters = activeTag !== 'all' || searchQuery.length > 0;

    pfClearAll.classList.toggle('visible', hasFilters);


    if (filtered.length === 0) {

      pfEmpty.style.display = '';
      pfPhotosSection.querySelector('.pf-load-more-wrap').style.display = 'none';
      pfResultCount.textContent = '0 results';
      return;

    }


    pfEmpty.style.display = 'none';
    pfPhotosSection.querySelector('.pf-load-more-wrap').style.display = '';

    loadBatch();

  }


  /* ============================================================
     15. LOAD MORE PHOTOS
     ============================================================ */

  function loadBatch() {

    var batch = filtered.slice(currentlyLoaded, currentlyLoaded + INCREMENT);

    batch.forEach(
      function (photo, i) {
        pfGrid.appendChild(buildPhotoCard(photo, currentlyLoaded + i));
      }
    );

    currentlyLoaded += batch.length;

    pfResultCount.textContent = currentlyLoaded + ' of ' + filtered.length + ' photos';

    pfLoadMore.disabled = currentlyLoaded >= filtered.length;

    pfLoadMore.textContent =
      currentlyLoaded >= filtered.length ? 'All photos loaded' : 'Load More Photos';

  }


  function bindLoadMore() {

    pfLoadMore.addEventListener(
      'click',
      function () {
        if (currentlyLoaded < filtered.length) {
          loadBatch();
        }
      }
    );

  }


  /* ============================================================
     LOAD MORE REELS
     ============================================================ */

  function loadReelBatch() {

    var batch = reelFilteredList.slice(reelLoaded, reelLoaded + REEL_INCREMENT);

    batch.forEach(function (video) {
      pfVideoGrid.appendChild(buildVideoCard(video));
    });

    reelLoaded += batch.length;

    pfResultCount.textContent = reelLoaded + ' of ' + reelFilteredList.length + ' reels';

    pfVideoLoadMore.disabled = reelLoaded >= reelFilteredList.length;

    pfVideoLoadMore.textContent =
      reelLoaded >= reelFilteredList.length ? 'All reels loaded' : 'Load More Reels';
  }


  function bindVideoLoadMore() {

    pfVideoLoadMore.addEventListener('click', function () {
      if (reelLoaded < reelFilteredList.length) {
        loadReelBatch();
      }
    });

  }


  /* ============================================================
     16. BUILD PHOTO CARD 
     ============================================================ */

  function buildPhotoCard(photo, idx) {

    var card = document.createElement('div');

    card.className = 'pf-card';

    card.dataset.idx = idx;

    card.style.animationDelay = (Math.min(idx % 10, 9) * 0.04) + 's';

    var paddingPct = Math.round(photo.ratio * 100);

    var bgStyle =
      photo.src
        ? 'background-image:url(\'' + photo.src + '\'); background-size:cover; background-position:center;'
        : 'background: linear-gradient(150deg, ' + photo.gradient[0] + ', ' + photo.gradient[1] + ');';

    var thumbStyle =
      bgStyle + 'display:block; width:100%; padding-bottom:' + paddingPct + '%; position:relative;';


    /*
     * Badge text priority:
     * 1) exact TAG_LABELS entry (Bridal, Jaipur, Delhi, Rishikesh, Agra, ...)
     * 2) agar wedding photo hai to raw tag dikha do
     * 3) agar pre-wedding photo hai (jiska specific label nahi mila),
     *    to seedha generic "Pre-Wedding" dikha do
     */
    var badge =
      TAG_LABELS[photo.tag] ||
      (photo.tags.indexOf('prewedding') !== -1 ? 'Pre-Wedding' : photo.tag);


    card.innerHTML =
      '<div style="' + thumbStyle + '"></div>' +
      '<div class="pf-card-overlay">' +
      '<div class="pf-card-info">' +
      '<div class="pf-card-title">' + photo.title + '</div>' +
      '<div class="pf-card-tags">' +
      '<span class="pf-card-tag">' + badge + '</span>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '<div class="pf-card-zoom">⤢</div>';


    card.addEventListener('click', function () {
      openLightbox(idx);
    });


    return card;

  }


  /* ============================================================
     SECTION AL: ALBUM RENDER / OPEN / BACK
     ============================================================ */

  function renderAlbumCovers() {

    pfAlbumCovers.innerHTML = '';

    ALBUM_CATS.forEach(function (cat, idx) {

      var card = document.createElement('div');
      card.className = 'pf-card';
      card.style.animationDelay = (Math.min(idx % 10, 9) * 0.04) + 's';

      var thumbStyle =
        'background-image:url(\'' + cat.folder + '/cover.jpg\'); ' +
        'background-size:cover; background-position:center; ' +
        'display:block; width:100%; padding-bottom:125%; position:relative;';

      card.innerHTML =
        '<div style="' + thumbStyle + '"></div>' +
        '<div class="pf-card-overlay">' +
        '<div class="pf-card-info">' +
        '<div class="pf-card-title">' + cat.label + '</div>' +
        '<div class="pf-card-tags">' +
        '<span class="pf-card-tag">' + cat.photoCount + ' Photos</span>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<div class="pf-card-zoom">⤢</div>';

      card.addEventListener('click', function () {
        openAlbum(cat);
      });

      pfAlbumCovers.appendChild(card);

    });

    pfResultCount.textContent = ALBUM_CATS.length + ' albums';
    pfEmpty.style.display = 'none';

  }


  function openAlbum(cat) {

    pfAlbumCovers.style.display = 'none';
    pfAlbumDetail.style.display = '';
    pfAlbumDetailTitle.textContent = cat.label;

    var photos = buildAlbumPhotos(cat);

    pfAlbumGrid.innerHTML = '';

    photos.forEach(function (photo, idx) {

      var tile = document.createElement('div');
      tile.className = 'pf-album-photo';
      tile.style.backgroundImage = "url('" + photo.src + "')";

      tile.addEventListener('click', function () {
        openLightbox(idx, photos);
      });

      pfAlbumGrid.appendChild(tile);

    });

    pfResultCount.textContent = photos.length + ' photos';

  }


  function bindAlbumBack() {

    pfAlbumBack.addEventListener('click', function () {
      pfAlbumDetail.style.display = 'none';
      pfAlbumCovers.style.display = '';
      pfResultCount.textContent = ALBUM_CATS.length + ' albums';
    });

  }


  /* ============================================================
     17. LIGHTBOX
     openLightbox() ek optional "itemsOverride" leta hai, taaki
     Album ki photos bhi isi lightbox me khul sakein (Photos tab
     ke normal behavior me koi farak nahi padta).
     ============================================================ */

  function openLightbox(startIdx, itemsOverride) {

    lightboxItems = itemsOverride || filtered.slice(0, currentlyLoaded);

    lightboxIndex = startIdx;

    pfLightbox.classList.add('open');

    document.body.style.overflow = 'hidden';

    renderLightboxSlide();
    renderLightboxThumbs();

  }


  function closeLightbox() {

    pfLightbox.classList.remove('open');
    document.body.style.overflow = '';

  }


  function renderLightboxSlide() {

    var photo = lightboxItems[lightboxIndex];

    if (!photo) return;


    if (photo.src) {

      pfLbImgWrap.innerHTML =
        '<img src="' + photo.src + '" alt="' + photo.title + '" ' +
        'style="max-width:88vw;max-height:72vh;object-fit:contain;border-radius:6px;animation:pfLbIn .3s ease;">';

    } else {

      pfLbImgWrap.innerHTML =
        '<div style="width:560px;max-width:80vw;height:380px;max-height:65vh;' +
        'background:linear-gradient(150deg,' + photo.gradient[0] + ',' + photo.gradient[1] + ');' +
        'border-radius:8px;animation:pfLbIn .3s ease;"></div>';

    }


    var badge =
      TAG_LABELS[photo.tag] ||
      (photo.tags.indexOf('prewedding') !== -1 ? 'Pre-Wedding' : photo.tag);


    pfLbMeta.textContent = photo.title + ' · ' + badge;

    pfLbCounter.textContent = (lightboxIndex + 1) + ' / ' + lightboxItems.length;


    var thumbs = pfLbThumbs.querySelectorAll('.pf-lb-thumb');

    thumbs.forEach(function (t, i) {
      t.classList.toggle('active', i === lightboxIndex);
    });

  }


  function renderLightboxThumbs() {

    pfLbThumbs.innerHTML = '';

    lightboxItems.forEach(function (photo, i) {

      var t = document.createElement('div');

      t.className = 'pf-lb-thumb' + (i === lightboxIndex ? ' active' : '');

      var thumbBg =
        photo.src
          ? 'background-image:url(\'' + photo.src + '\');background-size:cover;background-position:center;'
          : 'background:linear-gradient(150deg,' + photo.gradient[0] + ',' + photo.gradient[1] + ');';

      t.innerHTML = '<div style="width:48px;height:36px;' + thumbBg + '"></div>';

      t.addEventListener('click', function () {

        lightboxIndex = i;

        renderLightboxSlide();

        pfLbThumbs.querySelectorAll('.pf-lb-thumb').forEach(function (el, j) {
          el.classList.toggle('active', j === i);
        });

      });

      pfLbThumbs.appendChild(t);

    });

  }


  function bindLightbox() {

    document.getElementById('pfLbClose').addEventListener('click', closeLightbox);

    pfLightbox.addEventListener('click', function (e) {
      if (e.target === pfLightbox) {
        closeLightbox();
      }
    });

    document.getElementById('pfLbPrev').addEventListener('click', function () {
      lightboxIndex = (lightboxIndex - 1 + lightboxItems.length) % lightboxItems.length;
      renderLightboxSlide();
    });

    document.getElementById('pfLbNext').addEventListener('click', function () {
      lightboxIndex = (lightboxIndex + 1) % lightboxItems.length;
      renderLightboxSlide();
    });

    document.addEventListener('keydown', function (e) {

      if (!pfLightbox.classList.contains('open')) return;

      if (e.key === 'ArrowLeft') {
        document.getElementById('pfLbPrev').click();
      }

      if (e.key === 'ArrowRight') {
        document.getElementById('pfLbNext').click();
      }

      if (e.key === 'Escape') {
        closeLightbox();
      }

    });


    var touchStartX = 0;

    pfLightbox.addEventListener('touchstart', function (e) {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    pfLightbox.addEventListener('touchend', function (e) {

      var dx = e.changedTouches[0].screenX - touchStartX;

      if (Math.abs(dx) > 50) {
        if (dx < 0) {
          document.getElementById('pfLbNext').click();
        } else {
          document.getElementById('pfLbPrev').click();
        }
      }

    }, { passive: true });

  }


  /* ============================================================
     YOUTUBE ID EXTRACTOR
     Handles:
       - full watch URLs   (...watch?v=ID...)
       - short youtu.be URLs (youtu.be/ID...)
       - embed URLs        (.../embed/ID...)
       - shorts URLs        (.../shorts/ID...)
       - bare ID, with or without a trailing "?si=..." tracking
         param (this is the format used everywhere in REEL_DATA,
         e.g. "sMyX-D9w67A?si=A8ZqDkxGWCT0mB7c")

     PEHLE ISME BUG THA: regex sirf "youtu.be/", "v=" ya "embed/"
     prefix wale format ko match karta tha. REEL_DATA me saare IDs
     bina kisi prefix ke seedhe likhe hain ("ID?si=..."), isliye
     regex kabhi match hi nahi hota tha aur poora raw string
     (ID + "?si=...") bina process kiye return ho jata tha. Ye
     "https://www.youtube.com/embed/ID?si=..." bante hue chalta
     zaroor tha, lekin galti se — asal me ID kabhi extract hi
     nahi ho raha tha. Ab dono cases (prefixed URL aur bare ID)
     properly handle hote hain.
     ============================================================ */

  function extractYouTubeId(input) {

    if (!input) return '';

    input = String(input).trim();

    // Full/short YouTube URLs — watch?v=, youtu.be/, embed/, shorts/
    var urlMatch = input.match(/(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/)([A-Za-z0-9_-]{6,})/);

    if (urlMatch) {
      return urlMatch[1];
    }

    // Bare ID, optionally followed by "?si=..." or any other query/hash
    var bareMatch = input.match(/^([A-Za-z0-9_-]{6,})(?:[?#].*)?$/);

    return bareMatch ? bareMatch[1] : input;

  }


  /* ============================================================
     BUILD VIDEO CARD (Reel aur Teaser/Cinematic dono ke liye,
     taaki code duplicate na ho). Teaser/Cinematic ka look/behavior
     bilkul waisa hi rehta hai jaisa pehle tha.
     ============================================================ */

  function buildVideoCard(v, idx) {

    var card = document.createElement('div');

    card.className = 'pf-video-card' + (v.media === 'reel' ? ' is-reel' : '');

    card.style.animationDelay = ((idx || 0) * 0.1) + 's';

    var badge = VTAG_LABELS[v.vtag] || v.vtag;

    var wrap = document.createElement('div');

    wrap.className =
      'pf-video-iframe-wrap' +
      (v.media === 'reel' ? ' is-reel' : '') +
      (v.kind === 'instagram' && !v.iframe ? ' is-instagram' : '');

    card.appendChild(wrap);

    var meta = document.createElement('div');
    meta.className = 'pf-video-meta';
    meta.innerHTML =
      '<div class="pf-video-name">' + v.title + '</div>' +
      '<div class="pf-video-type">' + badge + '</div>';

    card.appendChild(meta);

    observeForLazyLoad(wrap, v);

    return card;

  }


  /* ============================================================
     INSTAGRAM PERMALINK NORMALIZER
     (Reel URL ya shortcode diya ho, dono se full permalink bana deta hai)
     ============================================================ */

  function extractInstagramPermalink(input) {
    if (!input) return '';
    input = input.trim();

    if (/^https?:\/\//i.test(input)) {
      var clean = input.split('?')[0];
      if (clean.charAt(clean.length - 1) !== '/') clean += '/';
      return clean;
    }

    // sirf shortcode diya gaya hai → reel URL bana do
    return 'https://www.instagram.com/reel/' + input + '/';
  }


  /* ============================================================
     INSTAGRAM EMBED SCRIPT (sirf ek baar load hota hai,
     wo bhi tabhi jab pehla Instagram reel screen par aaye)
     ============================================================ */

  var igScriptLoaded = false;
  var igScriptLoading = false;

  function ensureInstagramEmbedScript(callback) {

    if (igScriptLoaded && window.instgrm) {
      callback();
      return;
    }

    if (igScriptLoading) {
      var iv = setInterval(function () {
        if (window.instgrm) {
          clearInterval(iv);
          igScriptLoaded = true;
          callback();
        }
      }, 150);
      return;
    }

    igScriptLoading = true;

    var s = document.createElement('script');
    s.src = 'https://www.instagram.com/embed.js';
    s.async = true;

    s.onload = function () {
      igScriptLoaded = true;
      igScriptLoading = false;
      callback();
    };

    document.body.appendChild(s);
  }


  /* ============================================================
     LAZY LOAD ENGINE
     Card sirf tabhi actually load hota hai jab user scroll karke
     uske paas (300px pehle) pahunche — na ki page load hote hi
     sab 12-30 videos ek saath.
     ============================================================ */

  var lazyObserver = null;

  function getLazyObserver() {

    if (lazyObserver) return lazyObserver;

    lazyObserver = new IntersectionObserver(
      function (entries) {

        entries.forEach(function (entry) {

          if (entry.isIntersecting) {

            var wrap = entry.target;

            loadVideoIntoWrap(wrap, wrap._videoData);

            lazyObserver.unobserve(wrap);

          }

        });

      },
      {
        root: null,
        rootMargin: '300px 0px',
        threshold: 0.01
      }
    );

    return lazyObserver;
  }

  function observeForLazyLoad(wrap, v) {

    wrap._videoData = v;

    if ('IntersectionObserver' in window) {

      getLazyObserver().observe(wrap);

    } else {

      // purane browsers me fallback — turant load
      loadVideoIntoWrap(wrap, v);

    }

  }


  /* ============================================================
     ACTUAL PLAYER INJECT KARNA
     ============================================================ */

  /* ============================================================
     CLICK-TO-PLAY THUMBNAIL FACADE
     ============================================================
     PROBLEM: har video card ke liye seedha real YouTube/Instagram
     player (heavy iframe + unka apna JS) load ho raha tha, chahe
     user ne us video ko dekha bhi na ho. Isi wajah se page "wait"
     jaisa feel deta tha jab user Video tab par jata tha.

     FIX: ab sirf ek halka sa thumbnail image + play button dikhaya
     jata hai (YouTube khud jo thumbnail deta hai — koi extra load
     nahi). Asal player (bhaari iframe) TABHI banta hai jab user
     khud us specific video par click karta hai. Baaki sab cards
     halke thumbnail hi rehte hain — isse page turant open hota hai.
     ============================================================ */

  function buildYoutubeFacade(wrap, id, title) {

    var safeTitle = title || 'YouTube video';

    wrap.innerHTML =
      '<div class="pf-yt-facade" style="position:relative;width:100%;height:100%;' +
      'cursor:pointer;background:#000;overflow:hidden;">' +
      '<img src="https://i.ytimg.com/vi/' + id + '/maxresdefault.jpg" alt="' + safeTitle + '" ' +
      'loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block;" ' +
      'onerror="this.onerror=null;this.src=\'https://i.ytimg.com/vi/' + id + '/sddefault.jpg\';">' +
      '<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;">' +
      '<div style="width:56px;height:56px;border-radius:50%;background:rgba(0,0,0,.65);' +
      'display:flex;align-items:center;justify-content:center;">' +
      '<div style="width:0;height:0;border-top:11px solid transparent;' +
      'border-bottom:11px solid transparent;border-left:18px solid #fff;margin-left:4px;"></div>' +
      '</div>' +
      '</div>' +
      '</div>';

    wrap.querySelector('.pf-yt-facade').addEventListener(
      'click',
      function () {

        wrap.innerHTML =
          '<iframe src="https://www.youtube.com/embed/' + id + '?autoplay=1" title="' + safeTitle + '" ' +
          'frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" ' +
          'referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>';

      },
      { once: true }
    );

  }

  function buildInstagramFacade(wrap, src, title) {

    wrap.innerHTML =
      '<div class="pf-ig-facade" style="position:relative;width:100%;height:100%;cursor:pointer;' +
      'display:flex;align-items:center;justify-content:center;color:#fff;text-align:center;' +
      'background:linear-gradient(135deg,#405de6,#5851db,#833ab4,#c13584,#e1306c,#fd1d1d);">' +
      '<div>' +
      '<div style="font-size:30px;line-height:1;">&#9658;</div>' +
      '<div style="margin-top:6px;font-size:13px;opacity:.9;">Tap to load Reel</div>' +
      '</div>' +
      '</div>';

    wrap.querySelector('.pf-ig-facade').addEventListener(
      'click',
      function () {

        var permalink = extractInstagramPermalink(src);

        wrap.innerHTML =
          '<blockquote class="instagram-media" data-instgrm-permalink="' +
          permalink +
          '" data-instgrm-version="14" style="margin:0;width:100%;"></blockquote>';

        ensureInstagramEmbedScript(function () {
          if (window.instgrm && window.instgrm.Embeds) {
            window.instgrm.Embeds.process();
          }
        });

      },
      { once: true }
    );

  }


  /* ============================================================
     ACTUAL PLAYER FACADE INJECT KARNA
     (real player nahi — sirf thumbnail facade banata hai; asal
     player click hone par facade ke andar khud ban jata hai)
     ============================================================ */

  function loadVideoIntoWrap(wrap, v) {

    if (wrap.dataset.loaded === '1') return;
    wrap.dataset.loaded = '1';

    // Tarika: teaser/cinematic ka pura <iframe...> HTML string diya hua hai —
    // usme se YouTube ID nikaal ke thumbnail facade banao
    if (v.iframe) {

      var idFromIframe = extractYouTubeId(v.iframe);

      if (idFromIframe) {
        buildYoutubeFacade(wrap, idFromIframe, v.title);
      } else {
        // ID na mile (bahut rare case) to purana fallback — seedha iframe
        wrap.innerHTML = v.iframe;
      }

      return;

    }

    // Tarika: Instagram Reel
    if (v.kind === 'instagram' && v.src) {
      buildInstagramFacade(wrap, v.src, v.title);
      return;
    }

    // Tarika: YouTube (bare ID, ID+?si=..., ya poora link — sab handle hote hain)
    if (v.kind === 'youtube' && v.src) {

      var ytId = extractYouTubeId(v.src);

      buildYoutubeFacade(wrap, ytId, v.title);

      return;

    }

    // Tarika: Local / hosted video file
    if (v.kind === 'file' && v.src) {
      wrap.innerHTML =
        '<video src="' + v.src + '" controls preload="none" style="width:100%;height:100%;object-fit:cover;"></video>';
      return;
    }

    // kuch nahi diya gaya
    wrap.innerHTML = '';

  }

  /* ============================================================
     18. VIDEO GRID
     Reel = shuffle + pagination. Teaser/Cinematic = sab ek saath
     render (bilkul pehle jaisa, unchanged).
     ============================================================ */

  function renderVideos() {

    var vFiltered = VIDEOS.filter(
      function (v) {

        var mediaMatch = v.media === activeMedia;
        var tagMatch = activeVTag === 'all' || v.vtag === activeVTag;

        return (mediaMatch && tagMatch);

      }
    );


    /* REEL — random 12 se shuru, phir Load More */
    if (activeMedia === 'reel') {

      pfVideoGrid.classList.add('is-reels');
      pfVideoGrid.innerHTML = '';

      reelFilteredList = shuffle(vFiltered);
      reelLoaded = 0;

      if (reelFilteredList.length === 0) {
        pfEmpty.style.display = '';
        pfVideoLoadMoreWrap.style.display = 'none';
        pfResultCount.textContent = '0 videos';
        return;
      }

      pfEmpty.style.display = 'none';
      pfVideoLoadMoreWrap.style.display = '';
      loadReelBatch();
      return;
    }


    /* ---- TEASER / CINEMATIC — sab ek saath ---- */

    pfVideoGrid.classList.remove('is-reels');
    pfVideoLoadMoreWrap.style.display = 'none';
    pfVideoGrid.innerHTML = '';

    pfResultCount.textContent = vFiltered.length + ' videos';

    vFiltered.forEach(function (v, i) {
      pfVideoGrid.appendChild(buildVideoCard(v, i));
    });

    pfEmpty.style.display = vFiltered.length === 0 ? '' : 'none';

  }


  /* ============================================================
     19. CLEAR ALL FILTERS
     ============================================================ */

  function clearAllFilters() {

    activeTag = 'all';
    searchQuery = '';

    document.getElementById('pfSearch').value = '';

    pfSearchClear.classList.remove('visible');
    pfClearAll.classList.remove('visible');

    resetTagUI('.pf-tag[data-tag]', 'all');

    applyFilters();

    scrollToTopOfResults();

  }


  /* ============================================================
     20. QUERY FORM
     ============================================================ */

  function bindQueryForm() {

    document.getElementById('pfQueryForm').addEventListener(
      'submit',
      function (e) {

        e.preventDefault();

        var query = document.getElementById('pfQueryInput').value.trim();
        var name = document.getElementById('pfQueryName').value.trim();
        var phone = document.getElementById('pfQueryPhone').value.trim();
        var note = document.getElementById('pfQueryNote');

        if (!query || !name || !phone) {
          note.textContent = 'Please fill in all fields.';
          note.style.color = '#c0392b';
          return;
        }


        /* ======================================================
           BACKEND / WHATSAPP API
           ======================================================
           Yahan future me apna WhatsApp API/backend laga sakte ho.
           ====================================================== */

        console.log('Portfolio sample request:', { name: name, phone: phone, query: query });

        note.textContent = 'Thank you, ' + name + '! We\'ll share matching samples with you shortly.';
        note.style.color = 'var(--green-dark)';

        this.reset();

      }
    );

  }


  /* ============================================================
     21. SHUFFLE (Reel ke random-12 ke liye bhi yehi function
     reuse hota hai)
     ============================================================ */

  function shuffle(arr) {

    var a = arr.slice();

    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i];
      a[i] = a[j];
      a[j] = tmp;
    }

    return a;

  }


  /* ============================================================
     22. CURRENT YEAR
     ============================================================ */

  var yearEl = document.getElementById('year');

  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }


})();