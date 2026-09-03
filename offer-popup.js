(function () {
  'use strict';

  /* ============================================================
     CONFIG — YAHI LINES BADALNI HAIN
     ============================================================ */

  var CONFIG = {

    whatsappNumber: '918802389087',

    offers: [
      { title: 'Free Pre-Wedding Shoot in Delhi',  subtitle: 'when you book any Wedding package', codePrefix: 'PREWED' },
      { title: 'Early-Bird Discount',              subtitle: 'Book 3+ months in advance & save more', codePrefix: 'EARLY' },
      { title: 'Upto ₹25,000 OFF',                 subtitle: 'on all Wedding Photography Packages', codePrefix: 'DIS' },
      { title: 'Free Extra Edited Data',           subtitle: 'on Premium & Signature packages', codePrefix: 'EDIT' },
      { title: 'Get Upto 30% OFF',                 subtitle: 'on your total package — all bookings', codePrefix: 'DIS' },
    ],

    codePrefix: 'WED',
    codeMin: 1,
    codeMax: 10,

    disclaimerText: 'Valid for new bookings only.',

    // Pehli baar popup kab dikhega (page load ke kitne ms baad) — bashart user active ho
    firstDelayMs: 10000,

    // Ek offer close/action hone ke BAAD kitni der wait karke agla dikhana hai
    repeatMs: 30000,

    // Kitni der tak koi mouse/keyboard/scroll activity na ho to user ko "idle" maan lo
    idleTimeoutMs: 30000
  };


  var whatsappIconSvg =
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="#08210f">' +
    '<path d="M17.5 14.4c-.3-.1-1.7-.8-1.9-.9-.3-.1-.4-.1-.6.1-.2.3-.7.9-.8 1-.2.2-.3.2-.5.1-1.5-.7-2.5-1.3-3.5-3-.3-.5.3-.4.7-1.4.1-.2 0-.4 0-.5C11 9.5 10.5 8.1 10.2 7.5c-.2-.5-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.2 3.4 5.3 4.7.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4 0-.1-.2-.2-.4-.3z"/>' +
    '<path d="M12 2C6.5 2 2 6.5 2 12c0 1.9.5 3.6 1.4 5.1L2 22l5.1-1.3C8.5 21.5 10.2 22 12 22c5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18.2c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-3.1.8.8-3-.2-.3C4 14.9 3.6 13.5 3.6 12 3.6 7.4 7.4 3.6 12 3.6S20.4 7.4 20.4 12 16.6 20.2 12 20.2z"/>' +
    '</svg>';


  /* ============================================================
     RANDOM PROMO CODE GENERATOR
     ============================================================ */

  function generatePromoCode(offer) {
    var prefix = (offer && offer.codePrefix) || CONFIG.codePrefix;
    var num = Math.floor(Math.random() * (CONFIG.codeMax - CONFIG.codeMin + 1)) + CONFIG.codeMin;
    return prefix + num;
  }


  /* ============================================================
     BUILD POPUP
     ============================================================ */

  function buildPopup() {

    var overlay = document.createElement('div');
    overlay.className = 'op-overlay';
    overlay.id = 'opOverlay';

    overlay.innerHTML =
      '<div class="op-card">' +
        '<button class="op-close" id="opClose" aria-label="Close">&times;</button>' +
        '<span class="op-pill">Limited Time Offer</span>' +
        '<h3 class="op-title" id="opTitle"></h3>' +
        '<p class="op-subtitle" id="opSubtitle"></p>' +
        '<div class="op-code-row">' +
          '<span class="op-code op-masked" id="opCodeText">XXXXX</span>' +
          '<button class="op-gen-btn" id="opGenBtn">Generate Code</button>' +
        '</div>' +
        '<a class="op-whatsapp-btn" id="opWhatsappBtn" href="#" target="_blank" rel="noopener">' +
          whatsappIconSvg +
          '<span>Claim on WhatsApp</span>' +
        '</a>' +
        (CONFIG.disclaimerText ? '<p class="op-disclaimer">' + CONFIG.disclaimerText + '</p>' : '') +
      '</div>';

    document.body.appendChild(overlay);

    return overlay;
  }


  /* ============================================================
     WHATSAPP LINK
     ============================================================ */

  function buildWhatsappHref(offer, generatedCode) {

    var message = generatedCode
      ? 'Hi! I saw your ' + offer.title + ' offer on your website. ' +
        'My promo code is ' + generatedCode + ' — please share more details.'
      : 'Hi! I saw your ' + offer.title + ' offer on your website. ' +
        'Please share more details.';

    return 'https://wa.me/' + CONFIG.whatsappNumber + '?text=' + encodeURIComponent(message);
  }


  /* ============================================================
     COPY TO CLIPBOARD
     ============================================================ */

  function copyToClipboard(text, onDone) {

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(onDone, function () { fallbackCopy(); });
    } else {
      fallbackCopy();
    }

    function fallbackCopy() {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      try {
        document.execCommand('copy');
        onDone();
      } catch (e) {}
      document.body.removeChild(ta);
    }
  }


  /* ============================================================
     SHOW / HIDE + ACTIVITY-AWARE SCHEDULING
     ============================================================ */

  function init() {

    if (!CONFIG.offers || CONFIG.offers.length === 0) return;

    var overlay = buildPopup();
    var converted = false;      // WhatsApp button dab gaya
    var userIdle = false;       // koi activity na ho to true ho jaayega
    var idleTimer = null;
    var waitingToShow = false;  // "dikhaana hai lekin abhi user active/visible nahi hai"
    var nextShowTimer = null;

    var titleEl = document.getElementById('opTitle');
    var subtitleEl = document.getElementById('opSubtitle');
    var codeText = document.getElementById('opCodeText');
    var genBtn = document.getElementById('opGenBtn');
    var whatsappBtn = document.getElementById('opWhatsappBtn');

    var offerIndex = -1;
    var currentOffer = null;
    var currentCode = null;

    function nextOffer() {
      offerIndex = (offerIndex + 1) % CONFIG.offers.length;
      return CONFIG.offers[offerIndex];
    }

    function resetCodeUI() {
      currentCode = null;
      codeText.textContent = 'XXXXX';
      codeText.classList.add('op-masked');
      genBtn.textContent = 'Generate Code';
      genBtn.classList.remove('op-copied');
      whatsappBtn.href = buildWhatsappHref(currentOffer, null);
    }

    genBtn.addEventListener('click', function () {
      if (!currentCode) {
        currentCode = generatePromoCode(currentOffer);
        codeText.textContent = currentCode;
        codeText.classList.remove('op-masked');
        genBtn.textContent = 'Copy Code';
        whatsappBtn.href = buildWhatsappHref(currentOffer, currentCode);
      } else {
        copyToClipboard(currentCode, function () {
          genBtn.textContent = 'Copied!';
          genBtn.classList.add('op-copied');
          setTimeout(function () {
            genBtn.textContent = 'Copy Code';
            genBtn.classList.remove('op-copied');
          }, 1500);
        });
      }
    });

    /* ---------- Activity / visibility tracking ---------- */

    function isPageUsable() {
      return document.visibilityState === 'visible' && !userIdle;
    }

    function armIdleTimer() {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(function () {
        userIdle = true;
      }, CONFIG.idleTimeoutMs);
    }

    function onUserActive() {
      userIdle = false;
      armIdleTimer();

      // agar koi popup dikhana pending tha aur ab conditions match ho gayi
      if (waitingToShow && isPageUsable() && !converted) {
        waitingToShow = false;
        show();
      }
    }

    ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'].forEach(function (evt) {
      document.addEventListener(evt, onUserActive, { passive: true });
    });

    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'visible') {
        onUserActive();
      }
    });

    armIdleTimer(); // start karte hi ek idle-window de do

    /* ---------- Show / hide ---------- */

    function show() {
      currentOffer = nextOffer();
      titleEl.textContent = currentOffer.title;
      subtitleEl.textContent = currentOffer.subtitle;
      resetCodeUI();
      overlay.classList.add('op-open');
    }

    function hide() {
      overlay.classList.remove('op-open');
    }

    function isOpen() {
      return overlay.classList.contains('op-open');
    }

    // Popup dikhaane ki koshish — agar user active/visible nahi hai to wait karo,
    // jaise hi activity aayegi, apne aap dikh jaayega.
    function attemptShow() {
      if (converted || isOpen()) return;
      if (isPageUsable()) {
        show();
      } else {
        waitingToShow = true;
      }
    }

    // Sirf popup band hone ke BAAD (close / bahar click) agla show schedule hota hai —
    // isliye agla offer tab tak nahi aayega jab tak current wala "cross" na ho jaaye.
    function scheduleNextAfterDismiss() {
      if (converted) return;
      clearTimeout(nextShowTimer);
      nextShowTimer = setTimeout(attemptShow, CONFIG.repeatMs);
    }

    document.getElementById('opClose').addEventListener('click', function () {
      hide();
      scheduleNextAfterDismiss();
    });

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) {
        hide();
        scheduleNextAfterDismiss();
      }
    });

    whatsappBtn.addEventListener('click', function () {
      converted = true;
      hide();
      clearTimeout(nextShowTimer);
      waitingToShow = false;
    });

    // Pehli baar
    setTimeout(attemptShow, CONFIG.firstDelayMs);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();