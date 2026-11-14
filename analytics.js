(() => {
  if (!["beachdawgsnco.com", "www.beachdawgsnco.com"].includes(location.hostname)) return;

  const measurementId = "G-NPC8LT4WYR";
  window.dataLayer = window.dataLayer || [];
  const gtag = function () {
    window.dataLayer.push(arguments);
  };

  gtag("js", new Date());
  gtag("config", measurementId, {
    allow_google_signals: false,
    allow_ad_personalization_signals: false
  });

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://www.googletagmanager.com/gtag/js?id=" + measurementId;
  document.head.appendChild(script);

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");
    if (link?.hostname === "app.urable.com" && link.pathname.startsWith("/virtual-shop/")) {
      gtag("event", "urable_booking_click", { send_to: measurementId });
    }
  });
})();
