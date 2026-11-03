/* =========================================================
   SHUBHAM PRODUCTION
   CONTACT FORM — contact.js

   FORM SE EMAIL ME YE SAB JAYEGA:
   --------------------------------
   1. Name
   2. Phone Number
   3. Email
   4. Main Event Date
   5. Main Event Type
   6. Additional Events (max 3)
      - Date
      - Location
      - Event Type
   7. Approximate Budget

   🔥 FIX NOTE: Pehle "Add More Event" ka ek copy script.js me bhi
   tha jo inhi buttons (addEventBtn/saveEventBtn/etc.) par apne
   listeners laga raha tha — isse click karne par DONO scripts ek
   saath chal jaate the (double entries, alag-alag hidden-input
   format). Wo duplicate ab script.js se hata diya gaya hai — ye
   file (contact.js) hi is feature ka single/final source hai.
   Isme wo missing "isValidEventDate" function bhi add kar di gayi
   hai (pehle wo kahin defined hi nahi thi, isliye "Save Event"
   click karte hi silently error aata tha) aur script.js wala
   "max 3 events" cap bhi yahin merge kar diya hai.
   ========================================================= */

/* =========================================================
   🔴 EMAILJS CONFIGURATION
   ========================================================= */

const EMAILJS_PUBLIC_KEY = "q5yiQFpTvc-JalprQ";

const EMAILJS_SERVICE_ID = "service_gxveh6d";

const EMAILJS_TEMPLATE_ID = "template_ddshxbd";

/* =========================================================
   ADDITIONAL EVENTS LIMIT
   ========================================================= */

const MAX_EVENTS = 3;

/* =========================================================
   PAGE LOAD
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  /* =======================================================
     CHECK EMAILJS
     ======================================================= */

  if (typeof emailjs === "undefined") {
    console.error(
      "EmailJS SDK is not loaded. Please add EmailJS SDK in contact.html.",
    );

    return;
  }

  /* =======================================================
     INITIALIZE EMAILJS
     ======================================================= */

  emailjs.init({
    publicKey: EMAILJS_PUBLIC_KEY,
  });

  /* =======================================================
     FORM ELEMENTS
     ======================================================= */

  const bookingForm = document.getElementById("bookingForm");

  const formNote = document.getElementById("formNote");

  const submitButton = bookingForm
    ? bookingForm.querySelector(".form-submit")
    : null;

  /* =======================================================
     BUDGET ELEMENTS
     ======================================================= */

  const budgetSlider = document.getElementById("fbudget");

  const budgetValue = document.getElementById("budgetValue");

  /* =======================================================
     ADDITIONAL EVENT ELEMENTS
     ======================================================= */

  const addEventBtn = document.getElementById("addEventBtn");

  const addedEvents = document.getElementById("addedEvents");

  const additionalEventsInput = document.getElementById(
    "additionalEventsInput",
  );

  /* =======================================================
     EVENT MODAL ELEMENTS
     ======================================================= */

  const eventModal = document.getElementById("eventModal");

  const closeEventModal = document.getElementById("closeEventModal");

  const saveEventBtn = document.getElementById("saveEventBtn");

  const extraEventDate = document.getElementById("extraEventDate");

  const extraEventLocation = document.getElementById("extraEventLocation");

  const extraEventType = document.getElementById("extraEventType");

  /* =======================================================
     ADDITIONAL EVENTS STORAGE
     ======================================================= */

  let additionalEvents = [];

  /* =======================================================
     FORMAT BUDGET
     ======================================================= */

  function formatBudget(value) {
    return Number(value).toLocaleString("en-IN");
  }

  /* =======================================================
     INITIAL BUDGET DISPLAY
     ======================================================= */

  if (budgetSlider && budgetValue) {
    budgetValue.textContent = "₹" + formatBudget(budgetSlider.value);
  }

  /* =======================================================
     BUDGET SLIDER UPDATE
     ======================================================= */

  if (budgetSlider && budgetValue) {
    budgetSlider.addEventListener("input", function () {
      budgetValue.textContent = "₹" + formatBudget(this.value);
    });
  }

  /* =======================================================
     🔥 VALIDATE EVENT DATE (pehle missing thi — ab defined hai)
     Aaj ki date se pehle ki date select nahi hone deta.
     ======================================================= */

  function isValidEventDate(dateStr) {
    if (!dateStr) return false;

    const selected = new Date(dateStr);
    const today = new Date();

    selected.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    return selected >= today;
  }

  /* =======================================================
     OPEN ADD EVENT MODAL
     (🔥 max 3 events wala cap yahan check hota hai)
     ======================================================= */

  if (addEventBtn && eventModal) {
    addEventBtn.addEventListener("click", function () {
      if (additionalEvents.length >= MAX_EVENTS) {
        alert("You can add maximum " + MAX_EVENTS + " additional events.");
        return;
      }

      eventModal.classList.add("active");
    });
  }

  /* =======================================================
     CLOSE EVENT MODAL
     ======================================================= */

  function closeModal() {
    if (eventModal) {
      eventModal.classList.remove("active");
    }
  }

  if (closeEventModal) {
    closeEventModal.addEventListener("click", closeModal);
  }

  /* =======================================================
     CLOSE MODAL WHEN CLICKING OUTSIDE
     ======================================================= */

  if (eventModal) {
    eventModal.addEventListener("click", function (event) {
      if (event.target === eventModal) {
        closeModal();
      }
    });
  }

  /* =======================================================
   SAVE ADDITIONAL EVENT
   ======================================================= */

  if (saveEventBtn) {
    /* IMPORTANT — NEVER ALLOW THIS BUTTON TO SUBMIT FORM */
    saveEventBtn.setAttribute("type", "button");

    saveEventBtn.onclick = function (event) {
      /* Stop every possible form action */
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      /* -----------------------------------------------
       MAX EVENTS CHECK (defensive — button already
       disabled at this point, but just in case)
       ----------------------------------------------- */

      if (additionalEvents.length >= MAX_EVENTS) {
        alert("You can add maximum " + MAX_EVENTS + " additional events.");
        closeModal();
        return;
      }

      /* -----------------------------------------------
       GET POPUP VALUES
       ----------------------------------------------- */

      const date = extraEventDate ? extraEventDate.value.trim() : "";

      const location = extraEventLocation
        ? extraEventLocation.value.trim()
        : "";

      const type = extraEventType ? extraEventType.value : "";

      /* -----------------------------------------------
       VALIDATION — DATE
       ----------------------------------------------- */

      if (!date) {
        alert("Please select the event date.");

        return;
      }

      /* -----------------------------------------------
       VALIDATION — PAST DATE
       ----------------------------------------------- */

      if (!isValidEventDate(date)) {
        alert("Please select a valid date. Past dates are not allowed.");

        return;
      }

      if (!location) {
        alert("Please enter the event location.");
        return false;
      }

      if (!type) {
        alert("Please select the event type.");
        return false;
      }

      /* -----------------------------------------------
       ADD EVENT
       ----------------------------------------------- */

      additionalEvents.push({
        date: date,
        location: location,
        type: type,
      });

      /* -----------------------------------------------
       UPDATE DISPLAY
       ----------------------------------------------- */

      renderAdditionalEvents();

      updateAdditionalEventsInput();

      /* -----------------------------------------------
       CLEAR POPUP
       ----------------------------------------------- */

      if (extraEventDate) {
        extraEventDate.value = "";
      }

      if (extraEventLocation) {
        extraEventLocation.value = "";
      }

      if (extraEventType) {
        extraEventType.value = "";
      }

      /* -----------------------------------------------
       CLOSE POPUP
       ----------------------------------------------- */

      closeModal();

      /* -----------------------------------------------
       DISABLE "ADD EVENT" BUTTON AFTER MAX REACHED
       ----------------------------------------------- */

      if (addEventBtn && additionalEvents.length >= MAX_EVENTS) {
        addEventBtn.textContent = "Maximum " + MAX_EVENTS + " Events Added";
        addEventBtn.disabled = true;
      }

      return false;
    };
  }

  /* =======================================================
     RENDER ADDITIONAL EVENTS
     ======================================================= */

  function renderAdditionalEvents() {
    if (!addedEvents) return;

    /* Clear previous events */

    addedEvents.innerHTML = "";

    /* -----------------------------------------------
       CREATE EVERY ADDITIONAL EVENT
       ----------------------------------------------- */

    additionalEvents.forEach(function (event, index) {
      const eventBox = document.createElement("div");

      /* 🔥 FIX: original class names wapas — inhi se CSS match karta hai */
      eventBox.className = "added-event";

      /* -----------------------------------------------
         EVENT HTML
         ----------------------------------------------- */

      eventBox.innerHTML =
        '<div class="added-event-title">' +
        "Additional Event " +
        (index + 1) +
        "</div>" +
        '<div class="added-event-info">' +
        "<strong>" +
        escapeHTML(event.type) +
        "</strong><br>" +
        escapeHTML(event.date) +
        "<br>" +
        escapeHTML(event.location) +
        "</div>" +
        "<button " +
        'type="button" ' +
        'class="remove-added-event" ' +
        'data-index="' +
        index +
        '">' +
        "Remove" +
        "</button>";

      /* -----------------------------------------------
         ADD EVENT TO PAGE
         ----------------------------------------------- */

      addedEvents.appendChild(eventBox);
    });

    /* =================================================
       REMOVE EVENT BUTTONS
       ================================================= */

    const removeButtons = addedEvents.querySelectorAll(".remove-added-event");

    removeButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        const index = Number(this.dataset.index);

        /* Remove selected event */

        additionalEvents.splice(index, 1);

        /* Refresh events */

        renderAdditionalEvents();

        /* Refresh hidden field */

        updateAdditionalEventsInput();

        /* -----------------------------------------------
           RE-ENABLE "ADD EVENT" BUTTON (agar max se neeche
           aa gaye ho)
           ----------------------------------------------- */

        if (addEventBtn && additionalEvents.length < MAX_EVENTS) {
          addEventBtn.disabled = false;
          addEventBtn.textContent = "+ Add More Event";
        }
      });
    });
  }

  /* =======================================================
     ESCAPE HTML
     ======================================================= */

  function escapeHTML(value) {
    return String(value)
      .replace(/&/g, "&amp;")

      .replace(/</g, "&lt;")

      .replace(/>/g, "&gt;")

      .replace(/"/g, "&quot;")

      .replace(/'/g, "&#039;");
  }

  /* =======================================================
     UPDATE HIDDEN ADDITIONAL EVENTS FIELD
     ======================================================= */

  function updateAdditionalEventsInput() {
    if (!additionalEventsInput) return;

    const formattedEvents = additionalEvents

      .map(function (event, index) {
        return (
          "Event " +
          (index + 2) +
          "\n" +
          "Date: " +
          event.date +
          "\n" +
          "Location: " +
          event.location +
          "\n" +
          "Type: " +
          event.type
        );
      })

      .join("\n\n");

    additionalEventsInput.value = formattedEvents;
  }

  /* =======================================================
     FORM SUBMIT
     ======================================================= */

  if (bookingForm) {
    bookingForm.addEventListener("submit", function (event) {
      /* ---------------------------------------------
           STOP NORMAL FORM SUBMISSION
           --------------------------------------------- */

      event.preventDefault();

      /* ---------------------------------------------
           UPDATE ADDITIONAL EVENTS
           --------------------------------------------- */

      updateAdditionalEventsInput();

      /* ---------------------------------------------
           GET FORM VALUES
           --------------------------------------------- */

      const name = document.getElementById("fname")?.value.trim();

      const phone = document.getElementById("fphone")?.value.trim();

      const email = document.getElementById("femail")?.value.trim();

      const date = document.getElementById("fdate")?.value;

      const type = document.getElementById("ftype")?.value;

      /* ---------------------------------------------
           VALIDATION — NAME
           --------------------------------------------- */

      if (!name) {
        showMessage("Please enter your name.", "error");

        return;
      }

      /* ---------------------------------------------
           VALIDATION — PHONE
           --------------------------------------------- */

      if (!phone) {
        showMessage("Please enter your phone number.", "error");

        return;
      }

      /* ---------------------------------------------
           VALIDATION — EMAIL
           --------------------------------------------- */

      if (!email) {
        showMessage("Please enter your email address.", "error");

        return;
      }

      /* ---------------------------------------------
           VALIDATION — EVENT TYPE
           --------------------------------------------- */

      if (!type) {
        showMessage("Please select your event type.", "error");

        return;
      }

      /* ---------------------------------------------
           DISABLE SUBMIT BUTTON
           --------------------------------------------- */

      if (submitButton) {
        submitButton.disabled = true;

        submitButton.textContent = "Sending...";
      }

      /* ---------------------------------------------
           SHOW SENDING MESSAGE
           --------------------------------------------- */

      showMessage("Sending your enquiry...", "loading");

      /* =================================================
           SEND FORM USING EMAILJS
           ================================================= */

      emailjs
        .sendForm(
          EMAILJS_SERVICE_ID,

          EMAILJS_TEMPLATE_ID,

          bookingForm,
        )

        /* =================================================
           SUCCESS
           ================================================= */

        .then(function (response) {
          console.log("Email sent successfully:", response);

          /* -------------------------------------------
             SUCCESS MESSAGE
             ------------------------------------------- */

          showMessage(
            "Thank you! Your enquiry has been sent successfully. We will contact you within 24 hours.",
            "success",
          );

          /* =================================================
             🔄 COMPLETE FORM RESET
             ================================================= */

          /* -------------------------------------------
             RESET ALL NORMAL FORM FIELDS
             ------------------------------------------- */

          bookingForm.reset();

          /* -------------------------------------------
             RESET ADDITIONAL EVENTS ARRAY
             ------------------------------------------- */

          additionalEvents = [];

          /* -------------------------------------------
             REMOVE ADDITIONAL EVENTS FROM SCREEN
             ------------------------------------------- */

          renderAdditionalEvents();

          /* -------------------------------------------
             CLEAR HIDDEN ADDITIONAL EVENTS INPUT
             ------------------------------------------- */

          updateAdditionalEventsInput();

          /* -------------------------------------------
             CLEAR ADDITIONAL EVENT POPUP FIELDS
             ------------------------------------------- */

          if (extraEventDate) {
            extraEventDate.value = "";
          }

          if (extraEventLocation) {
            extraEventLocation.value = "";
          }

          if (extraEventType) {
            extraEventType.value = "";
          }

          /* -------------------------------------------
             CLOSE EVENT MODAL
             ------------------------------------------- */

          closeModal();

          /* -------------------------------------------
             RESET BUDGET DISPLAY
             ------------------------------------------- */

          if (budgetSlider && budgetValue) {
            budgetValue.textContent = "₹" + formatBudget(budgetSlider.value);
          }

          /* -------------------------------------------
             RE-ENABLE "ADD EVENT" BUTTON
             ------------------------------------------- */

          if (addEventBtn) {
            addEventBtn.disabled = false;
            addEventBtn.textContent = "+ Add More Event";
          }

          /* -------------------------------------------
             ENABLE SUBMIT BUTTON
             ------------------------------------------- */

          if (submitButton) {
            submitButton.disabled = false;

            submitButton.textContent = "Send Enquiry";
          }
        })

        /* =================================================
           ERROR
           ================================================= */

        .catch(function (error) {
          console.error("EmailJS Error:", error);

          /* -------------------------------------------
             ERROR MESSAGE
             ------------------------------------------- */

          showMessage(
            "Something went wrong. Please try again or contact us directly.",
            "error",
          );

          /* -------------------------------------------
             ENABLE BUTTON AGAIN
             ------------------------------------------- */

          if (submitButton) {
            submitButton.disabled = false;

            submitButton.textContent = "Send Enquiry";
          }
        });
    });
  }

  /* =======================================================
     FORM MESSAGE
     ======================================================= */

  function showMessage(message, type) {
    if (!formNote) return;

    formNote.textContent = message;

    /* -----------------------------------------------
       REMOVE OLD CLASSES
       ----------------------------------------------- */

    formNote.classList.remove("success", "error", "loading");

    /* -----------------------------------------------
       ADD NEW CLASS
       ----------------------------------------------- */

    if (type) {
      formNote.classList.add(type);
    }
  }
});