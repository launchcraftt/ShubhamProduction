# Shubham Production — Website + Client/Admin Portal

```
/                     public pages (all .html stay here)
  index.html  about.html  contact.html  portfolio.html
  pre-wedding.html  wedding.html  404.html
  login.html          <- single portal page: login, client portal, admin dashboard
/css                  style.css (site), portfolio.css, offer-popup.css, portal.css
/js                   script.js, contact.js, portfolio.js, offer-popup.js, portal.js
/img                  logos, favicon and all portfolio photos
/config               firestore.rules  (paste into Firebase console > Firestore > Rules)
```

- Open the site through any web server (or Live Server in VS Code). `login.html` loads Firebase as an ES module, so it will not work from `file://`.
- Firebase config lives at the top of `js/portal.js`.
- The person-icon in the header of every page links to `login.html`.
