/* Owner/manager framing dialog. Apply updates the draft; the portal saves through its existing RPC. */
(function () {
  const el = (tag, props = {}) => Object.assign(document.createElement(tag), props);
  function open({ photos, paired = false, onApply }) {
    const draft = photos.map(photo => ({ ...photo, transform: BDPhoto.normalize(photo.transform) }));
    let active = 0;
    const dialog = el('dialog', { className: 'bd-photo-dialog' });
    const title = el('h2', { id: 'bd-photo-title', textContent: paired ? 'Align before / after photos' : 'Frame your photo' });
    dialog.setAttribute('aria-labelledby', title.id);
    const description = el('p', { textContent: 'Drag the photo to position it. Use zoom and rotation to match the framing. Apply keeps your changes in the homepage draft.' });
    const header = el('div', { className: 'bd-photo-header' });
    const close = el('button', { type: 'button', className: 'alt', textContent: 'Cancel' });
    header.append(title, close);
    const layout = el('div', { className: 'bd-photo-layout' });
    const left = el('div');
    const toolbar = el('div', { className: 'bd-photo-toolbar' });
    const select = (label, options) => {
      const wrap = el('label', { textContent: label });
      const input = el('select');
      input.setAttribute('aria-label', label);
      options.forEach(([value, textContent]) => input.append(el('option', { value, textContent })));
      wrap.append(input); toolbar.append(wrap); return input;
    };
    const mode = select('Preview', paired ? [['split', 'Split view'], ['overlay', 'Transparent overlay'], ['single', 'Selected photo']] : [['single', 'Selected photo']]);
    const size = select('Frame', paired ? [['desktop', 'Desktop'], ['mobile', 'Phone']] : [['slide', 'Photo slide (4:3)']]);
    const gridLabel = el('label', { className: 'bd-grid-toggle' });
    const grid = el('input', { type: 'checkbox', checked: true });
    gridLabel.append(grid, document.createTextNode(' Alignment grid')); toolbar.append(gridLabel);
    const preview = el('div', { className: 'bd-photo-preview', tabIndex: 0 });
    preview.setAttribute('aria-label', 'Photo position preview. Drag to move the selected photo, or use the arrow keys.');
    const layers = draft.map(photo => {
      const layer = el('div', { className: 'bd-photo-layer' });
      const image = el('img', { src: photo.src, alt: photo.label, draggable: false });
      layer.append(image); return { layer, image };
    });
    // Before stays above After; clipping is on the frame, never the transformed image.
    [...layers].reverse().forEach(({ layer }) => preview.append(layer));
    const guides = el('div', { className: 'bd-photo-grid' });
    const line = el('div', { className: 'bd-photo-split' });
    preview.append(guides, line);
    const mixLabel = el('label');
    const mixText = el('span');
    const mix = el('input', { type: 'range', min: '0', max: '100', value: '50' });
    mixLabel.append(mixText, mix);
    const notice = el('p', { className: 'small', textContent: 'The frame clips the edges. Zooming out or moving too far can reveal the dark background. Check both desktop and phone framing.' });
    if (!paired) notice.textContent = 'The frame clips the edges. Zooming out or moving too far can reveal the dark background.';
    left.append(toolbar, preview, mixLabel, notice);
    const controls = el('div', { className: 'bd-photo-controls' });
    const target = el('div', { className: 'tabs' });
    const targets = draft.map((photo, index) => {
      const button = el('button', { type: 'button', textContent: photo.label });
      button.onclick = () => { active = index; render(); };
      target.append(button); return button;
    });
    controls.append(el('h3', { textContent: paired ? 'Adjust one photo at a time' : 'Photo adjustments' }), target);
    const fields = [];
    for (const [key, label, min, max, step, unit] of [
      ['scale', 'Zoom', 0.5, 3, 0.01, '×'],
      ['offsetX', 'Move left / right', -100, 100, 0.1, '%'],
      ['offsetY', 'Move up / down', -100, 100, 0.1, '%'],
      ['rotate', 'Rotation', -180, 180, 0.5, '°']
    ]) {
      const wrap = el('div', { className: 'bd-photo-field' });
      const labelEl = el('label', { textContent: label });
      const range = el('input', { type: 'range', min: String(min), max: String(max), step: String(step) });
      const numeric = el('input', { type: 'number', min: String(min), max: String(max), step: String(step) });
      range.setAttribute('aria-label', label);
      numeric.setAttribute('aria-label', label + ' value');
      labelEl.append(range);
      const readout = el('div', { className: 'bd-photo-value' });
      readout.append(numeric, el('span', { textContent: unit }));
      range.oninput = () => update({ [key]: Number(range.value) });
      numeric.onchange = () => update({ [key]: numeric.value === '' ? BDPhoto.normalize()[key] : Number(numeric.value) });
      wrap.append(labelEl, readout); controls.append(wrap); fields.push({ key, range, numeric });
    }
    const actions = el('div', { className: 'bd-photo-actions' });
    const button = (textContent, onclick) => el('button', { type: 'button', className: 'alt', textContent, onclick });
    actions.append(button('Center photo', () => update({ offsetX: 0, offsetY: 0 })), button('Reset photo', () => update(BDPhoto.normalize())));
    if (paired) actions.append(button('Match other photo’s zoom', () => update({ scale: draft[1 - active].transform.scale })), button('Reset both', () => { draft.forEach(p => { p.transform = BDPhoto.normalize(); }); render(); }));
    const apply = el('button', { type: 'button', textContent: 'Apply to homepage draft' });
    actions.append(apply); controls.append(actions);
    layout.append(left, controls); dialog.append(header, description, layout); document.body.append(dialog);
    const previousFocus = document.activeElement;
    const cleanup = () => { dialog.close(); dialog.remove(); previousFocus?.focus(); };
    close.onclick = cleanup;
    dialog.addEventListener('cancel', e => { e.preventDefault(); cleanup(); });
    apply.onclick = () => { onApply(draft.map(p => BDPhoto.normalize(p.transform))); cleanup(); };
    function update(patch) {
      draft[active].transform = BDPhoto.normalize({ ...draft[active].transform, ...patch }); render();
    }
    function render() {
      preview.style.aspectRatio = paired ? (size.value === 'mobile' ? '1.1' : '3 / 3.6') : '4 / 3';
      preview.style.width = `min(100%, ${56 * (paired ? (size.value === 'mobile' ? 1.1 : 3 / 3.6) : 4 / 3)}vh)`;
      targets.forEach((b, i) => { b.className = i === active ? 'on' : ''; b.setAttribute('aria-pressed', String(i === active)); });
      layers.forEach(({ layer, image }, i) => {
        image.style.cssText = BDPhoto.style(draft[i].transform);
        layer.style.display = mode.value === 'single' && i !== active ? 'none' : '';
        layer.style.opacity = mode.value === 'overlay' && i === 0 ? String(Number(mix.value) / 100) : '1';
        layer.style.clipPath = mode.value === 'split' && i === 0 ? `inset(0 ${100 - Number(mix.value)}% 0 0)` : '';
      });
      guides.hidden = !grid.checked;
      line.hidden = mode.value !== 'split'; line.style.left = mix.value + '%';
      mixLabel.hidden = mode.value === 'single';
      mixText.textContent = mode.value === 'overlay' ? 'Before photo opacity' : 'Before / after divider';
      mix.setAttribute('aria-label', mixText.textContent);
      fields.forEach(({ key, range, numeric }) => { range.value = draft[active].transform[key]; numeric.value = draft[active].transform[key]; });
    }
    [mode, size, grid, mix].forEach(control => control.addEventListener('input', render));
    let drag;
    preview.onpointerdown = e => {
      if (e.button !== 0 || drag) return;
      e.preventDefault(); preview.focus(); preview.setPointerCapture(e.pointerId);
      drag = { id: e.pointerId, x: e.clientX, y: e.clientY, ...draft[active].transform };
    };
    preview.onpointermove = e => {
      if (!drag || e.pointerId !== drag.id) return;
      const box = preview.getBoundingClientRect();
      update({ offsetX: Math.round((drag.offsetX + (e.clientX - drag.x) / box.width * 100) * 10) / 10,
        offsetY: Math.round((drag.offsetY + (e.clientY - drag.y) / box.height * 100) * 10) / 10 });
    };
    preview.onpointerup = preview.onpointercancel = e => { if (drag?.id === e.pointerId) { drag = null; if (preview.hasPointerCapture(e.pointerId)) preview.releasePointerCapture(e.pointerId); } };
    preview.onlostpointercapture = () => { drag = null; };
    preview.onkeydown = e => {
      const moves = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
      if (!moves[e.key]) return;
      e.preventDefault(); const [x, y] = moves[e.key], t = draft[active].transform, step = e.shiftKey ? 5 : 1;
      update({ offsetX: t.offsetX + x * step, offsetY: t.offsetY + y * step });
    };
    render(); dialog.showModal(); close.focus();
  }
  window.BDPhotoEditor = { open };
})();
