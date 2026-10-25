/* Shared by the public sliders and the photo editor. Framing never changes the file. */
(function () {
  function number(value, fallback, min, max) {
    return typeof value === 'number' && Number.isFinite(value)
      ? Math.min(max, Math.max(min, value)) : fallback;
  }
  function normalize(value) {
    const t = value || {};
    return {
      scale: number(t.scale, 1, 0.5, 3),
      offsetX: number(t.offsetX, 0, -100, 100),
      offsetY: number(t.offsetY, 0, -100, 100),
      rotate: number(t.rotate, 0, -180, 180)
    };
  }
  function style(value) {
    const t = normalize(value);
    return `transform:translate(${t.offsetX}%,${t.offsetY}%) scale(${t.scale}) rotate(${t.rotate}deg);transform-origin:center;`;
  }
  window.BDPhoto = { normalize, style };
})();
