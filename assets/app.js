/* Pustaka Digital CERMAT
   Daftar folder dibaca dari data.json. Mode Admin (tombol "Admin" di bawah halaman)
   mengubah daftar itu dan menyimpannya kembali ke data.json di GitHub. */
(function () {
  'use strict';

  var P = {
    folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    materi: '<path d="M2 5h6a4 4 0 0 1 4 4v11a3 3 0 0 0-3-3H2z"/><path d="M22 5h-6a4 4 0 0 0-4 4v11a3 3 0 0 1 3-3h7z"/>',
    soal: '<rect x="5" y="3" width="14" height="18" rx="2.5"/><path d="M8.5 7.5h7"/><path d="M9 12h.01M12 12h.01M15 12h.01M9 16h.01M12 16h.01M15 16h.01" stroke-width="2.6"/>',
    foto: '<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="1.8"/><path d="M21 16l-5-5-8 8"/>',
    laporan: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h4"/>',
    template: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18M9 9v12"/>',
    tayang: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M12 16v4M8 20h8"/><path d="M10 8.5l4 2-4 2z"/>',
    unggah: '<path d="M12 16V4M7 9l5-5 5 5M4 20h16"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>'
  };
  var UI = {
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
    up: '<path d="M6 15l6-6 6 6"/>',
    down: '<path d="M6 9l6 6 6-6"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    eyeoff: '<path d="M3 3l18 18"/><path d="M10.6 5.1A9.7 9.7 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4M6.5 6.6C3.7 8.4 2 12 2 12s3.5 7 10 7c1.6 0 3-.4 4.3-1"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
    plus: '<path d="M12 5v14M5 12h14"/>'
  };
  var ICON_NAMES = ['folder', 'materi', 'soal', 'foto', 'laporan', 'template', 'tayang', 'unggah', 'link'];
  var ICON_LABEL = {
    folder: 'Folder', materi: 'Buku / materi', soal: 'Soal / latihan', foto: 'Foto', laporan: 'Laporan',
    template: 'Lembar kerja / tabel', tayang: 'Bahan tayang', unggah: 'Unggah', link: 'Tautan'
  };

  var DEFAULT_DATA = {
    site: {
      kicker: 'Portal Berkas Digital',
      title: 'Pustaka Digital CERMAT',
      subtitle: 'Akses seluruh materi dan berkas program CERMAT dengan satu ketukan. Pilih folder untuk membukanya di Google Drive.',
      announcement: ''
    },
    links: [
      { title: 'Silabus dan Modul', desc: 'Silabus dan modul pembelajaran', url: '', icon: 'materi', access: 'publik', primary: false, hidden: false },
      { title: 'Lembar Kerja', desc: 'Lembar kerja peserta', url: '', icon: 'template', access: 'publik', primary: false, hidden: false },
      { title: 'Bahan Tayang', desc: 'Slide dan bahan presentasi', url: '', icon: 'tayang', access: 'publik', primary: false, hidden: false },
      { title: 'Upload Foto', desc: 'Unggah foto kegiatan', url: '', icon: 'foto', access: 'publik', primary: false, hidden: false },
      { title: 'Laporan Fasil', desc: 'Laporan kegiatan', url: '', icon: 'laporan', access: 'terbatas', primary: false, hidden: false }
    ]
  };

  var FILE = 'data.json';
  var API = 'https://api.github.com';
  var CRED_KEY = 'cermat-admin';

  var state = clone(DEFAULT_DATA);
  var admin = false;
  var dirty = false;
  var fileSha = null;
  var repo = '';
  var token = '';
  var saving = false;

  /* ---------- util ---------- */

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function str(v) { return typeof v === 'string' ? v : ''; }

  function normalize(d) {
    var out = clone(DEFAULT_DATA);
    if (!d || typeof d !== 'object') return out;
    var s = d.site && typeof d.site === 'object' ? d.site : {};
    ['kicker', 'title', 'subtitle', 'announcement'].forEach(function (k) {
      if (typeof s[k] === 'string') out.site[k] = s[k];
    });
    if (Array.isArray(d.links)) {
      out.links = d.links.filter(function (l) { return l && typeof l === 'object' && str(l.title).trim(); })
        .map(function (l) {
          return {
            title: str(l.title).trim(),
            desc: str(l.desc).trim(),
            url: str(l.url).trim(),
            icon: ICON_NAMES.indexOf(l.icon) !== -1 ? l.icon : 'folder',
            access: l.access === 'terbatas' ? 'terbatas' : 'publik',
            primary: l.primary === true,
            hidden: l.hidden === true
          };
        });
    }
    return out;
  }

  function validUrl(u) { return typeof u === 'string' && /^https:\/\/[^\s<>"']+$/i.test(u.trim()); }

  function h(tag, attrs, kids) {
    var e = document.createElement(tag), k, v;
    attrs = attrs || {};
    for (k in attrs) {
      v = attrs[k];
      if (v === false || v === null || v === undefined) continue;
      if (k === 'class') e.className = v;
      else if (k === 'text') e.textContent = v;
      else if (k.indexOf('on') === 0) e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v === true ? '' : v);
    }
    (kids || []).forEach(function (c) {
      if (c === null || c === undefined) return;
      e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return e;
  }

  function ic(name, size, w) {
    var s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('width', size || 22);
    s.setAttribute('height', size || 22);
    s.setAttribute('viewBox', '0 0 24 24');
    s.setAttribute('fill', 'none');
    s.setAttribute('stroke', 'currentColor');
    s.setAttribute('stroke-width', w || 1.8);
    s.setAttribute('stroke-linecap', 'round');
    s.setAttribute('stroke-linejoin', 'round');
    s.setAttribute('aria-hidden', 'true');
    s.innerHTML = P[name] || UI[name] || P.folder;
    return s;
  }

  function $(id) { return document.getElementById(id); }

  var toastTimer = null;
  function toast(msg, bad) {
    var t = $('toast');
    if (!t) return;
    t.textContent = msg;
    t.className = 'toast' + (bad ? ' bad' : '');
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.hidden = true; }, bad ? 7000 : 4500);
  }

  /* ---------- tampilan publik ---------- */

  function tag(cls, iconName, text) {
    return h('span', { class: 'tag ' + cls }, [iconName ? ic(iconName, 12, 2.2) : null, text]);
  }

  function accessTag(l) {
    return l.access === 'terbatas' ? tag('lim', 'lock', 'Terbatas') : tag('pub', 'globe', 'Publik');
  }

  function publicCard(l) {
    var ok = validUrl(l.url);
    var cls = 'card' + (l.primary ? ' primary' : '') + (ok ? '' : ' empty');
    var kids, meta;
    if (l.primary) {
      kids = [ic(l.icon, 22, 2), h('span', { text: l.title })];
      if (!ok) kids.push(tag('hid', null, 'Segera hadir'));
    } else {
      meta = [];
      if (l.desc) meta.push(h('span', { text: l.desc }));
      meta.push(accessTag(l));
      if (!ok) meta.push(tag('hid', null, 'Segera hadir'));
      kids = [
        h('div', { class: 'chipicon' }, [ic(l.icon, 22)]),
        h('div', { class: 'txt' }, [h('span', { class: 'ttl', text: l.title }), h('div', { class: 'meta' }, meta)])
      ];
      if (ok) kids.push(h('div', { class: 'go' }, [ic('arrow', 16, 2)]));
    }
    if (ok) return h('a', { class: cls, href: l.url.trim(), target: '_blank', rel: 'noopener noreferrer' }, kids);
    return h('div', { class: cls, 'aria-disabled': 'true' }, kids);
  }

  function ctlBtn(icon, label, fn, disabled) {
    return h('button', { type: 'button', class: 'ib', 'aria-label': label, title: label, disabled: !!disabled, onclick: fn }, [ic(icon, 17, 2)]);
  }

  function adminCard(l, i) {
    var ok = validUrl(l.url), meta = [];
    meta.push(ok ? tag('pub', 'link', 'Tautan terpasang') : tag('hid', null, 'Belum ada tautan'));
    if (l.hidden) meta.push(tag('hid', 'eyeoff', 'Disembunyikan'));
    if (l.primary) meta.push(tag('lim', null, 'Tombol utama'));
    var n = state.links.length;
    return h('div', { class: 'card adm' + (l.hidden ? ' off' : '') }, [
      h('div', { class: 'chipicon' }, [ic(l.icon, 22)]),
      h('div', { class: 'txt' }, [
        h('span', { class: 'ttl', text: l.title }),
        h('div', { class: 'meta' }, meta)
      ]),
      h('div', { class: 'ctl' }, [
        ctlBtn('up', 'Naikkan', function () { move(i, -1); }, i === 0),
        ctlBtn('down', 'Turunkan', function () { move(i, 1); }, i === n - 1),
        ctlBtn(l.hidden ? 'eye' : 'eyeoff', l.hidden ? 'Tampilkan' : 'Sembunyikan', function () { state.links[i].hidden = !state.links[i].hidden; changed(); }),
        h('button', { type: 'button', class: 'ib main', 'aria-label': 'Ubah ' + l.title, title: 'Ubah tautan', onclick: function () { editLink(i); } }, [ic('edit', 17, 2), h('span', { text: 'Ubah' })])
      ])
    ]);
  }

  function renderList() {
    var list = $('list'), shown = 0;
    list.textContent = '';
    state.links.forEach(function (l, i) {
      if (admin) { list.appendChild(adminCard(l, i)); shown++; return; }
      if (l.hidden) return;
      shown++;
      list.appendChild(publicCard(l));
    });
    if (!shown) list.appendChild(h('div', { class: 'empty-note', text: admin ? 'Belum ada folder. Tekan "Tambah folder".' : 'Belum ada folder yang ditampilkan.' }));
    var aw = $('addwrap');
    aw.textContent = '';
    if (admin) {
      aw.appendChild(h('button', { type: 'button', class: 'btn ghost wide', onclick: addLink }, [ic('plus', 18, 2.2), h('span', { text: 'Tambah folder' })]));
    }
  }

  function renderSite() {
    var s = state.site;
    var set = function (id, v) { var el = $(id); if (el && v) el.textContent = v; };
    set('kicker', s.kicker);
    set('title', s.title);
    set('subtitle', s.subtitle);
    if (s.title) document.title = s.title;
    var n = $('notice');
    n.textContent = '';
    if (s.announcement) {
      n.appendChild(h('strong', { text: 'Pengumuman' }));
      n.appendChild(h('span', { text: s.announcement }));
      n.hidden = false;
    } else { n.hidden = true; }
  }

  function renderAll() {
    renderSite();
    renderList();
    renderBar();
  }

  function renderSkeleton() {
    var list = $('list');
    list.textContent = '';
    for (var i = 0; i < 5; i++) list.appendChild(h('div', { class: 'skel', 'aria-hidden': 'true' }));
  }

  /* ---------- memuat data ---------- */

  function loadPublic() {
    renderSkeleton();
    var ctrl = typeof AbortController === 'function' ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 8000);
    return fetch(FILE + '?t=' + Date.now(), { cache: 'no-store', signal: ctrl ? ctrl.signal : undefined })
      .then(function (r) {
        clearTimeout(timer);
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (d) { state = normalize(d); })
      .catch(function (err) {
        clearTimeout(timer);
        if (window.console && console.warn) console.warn('Pustaka CERMAT: memakai data bawaan.', err && err.message ? err.message : err);
        state = clone(DEFAULT_DATA);
      })
      .then(renderAll);
  }

  /* ---------- GitHub ---------- */

  function guessRepo() {
    var host = location.hostname;
    if (/\.github\.io$/i.test(host)) {
      var owner = host.split('.')[0];
      var first = location.pathname.split('/')[1];
      return owner + '/' + (first && first.indexOf('.') === -1 ? first : owner + '.github.io');
    }
    return '';
  }

  function utf8ToB64(s) {
    var bytes = new TextEncoder().encode(s), bin = '', i;
    for (i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
  }

  function b64ToUtf8(b) {
    var bin = atob(String(b).replace(/\s/g, '')), bytes = new Uint8Array(bin.length), i;
    for (i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }

  function gh(method, path, body) {
    return fetch(API + '/repos/' + repo + '/contents/' + path, {
      method: method,
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': 'Bearer ' + token,
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json'
      },
      cache: 'no-store',
      body: body ? JSON.stringify(body) : undefined
    }).then(function (r) {
      return r.text().then(function (t) {
        var j = null;
        try { j = t ? JSON.parse(t) : null; } catch (e) { j = null; }
        if (!r.ok) {
          var e2 = new Error(j && j.message ? j.message : 'HTTP ' + r.status);
          e2.status = r.status;
          throw e2;
        }
        return j;
      });
    });
  }

  function explain(err) {
    var s = err && err.status;
    if (s === 401) return 'Token ditolak (salah, kedaluwarsa, atau dicabut). Buat token baru lalu masuk lagi.';
    if (s === 403) return 'Token tidak punya izin menulis ke repositori ini. Pastikan izin "Contents" diatur ke Read and write.';
    if (s === 404) return 'Repositori atau berkas data.json tidak ditemukan, atau token tidak mencakup repositori ini. Periksa nama repositori dan akses token.';
    if (s === 409 || s === 422) return 'Data di GitHub sudah berubah sejak Anda masuk. Muat ulang halaman, masuk lagi, lalu ulangi perubahan.';
    if (err && err.name === 'TypeError') return 'Tidak bisa terhubung ke GitHub. Periksa koneksi internet.';
    return 'Gagal: ' + (err && err.message ? err.message : 'kesalahan tidak dikenal');
  }

  function fetchRemote() {
    return gh('GET', FILE).then(function (j) {
      fileSha = j.sha;
      return normalize(JSON.parse(b64ToUtf8(j.content)));
    });
  }

  function serialize() {
    return JSON.stringify({ site: state.site, links: state.links }, null, 2) + '\n';
  }

  function save() {
    if (saving) return;
    for (var i = 0; i < state.links.length; i++) {
      var u = state.links[i].url;
      if (u && !validUrl(u)) { toast('Tautan "' + state.links[i].title + '" tidak valid. Harus diawali https://', true); return; }
    }
    saving = true;
    renderBar();
    gh('PUT', FILE, {
      message: 'Perbarui daftar folder (mode admin)',
      content: utf8ToB64(serialize()),
      sha: fileSha
    }).then(function (j) {
      fileSha = j.content && j.content.sha ? j.content.sha : fileSha;
      dirty = false;
      toast('Tersimpan. Pengunjung akan melihat perubahan dalam 1 sampai 2 menit.');
    }).catch(function (err) {
      toast(explain(err), true);
    }).then(function () {
      saving = false;
      renderBar();
    });
  }

  /* ---------- kredensial ---------- */

  function readCred() {
    var raw = null;
    try { raw = sessionStorage.getItem(CRED_KEY) || localStorage.getItem(CRED_KEY); } catch (e) { raw = null; }
    if (!raw) return null;
    try {
      var c = JSON.parse(raw);
      return c && c.repo && c.token ? c : null;
    } catch (e2) { return null; }
  }

  function writeCred(remember) {
    var raw = JSON.stringify({ repo: repo, token: token });
    try {
      sessionStorage.removeItem(CRED_KEY);
      localStorage.removeItem(CRED_KEY);
      (remember ? localStorage : sessionStorage).setItem(CRED_KEY, raw);
    } catch (e) { /* penyimpanan tidak tersedia: tidak masalah */ }
  }

  function clearCred() {
    try { sessionStorage.removeItem(CRED_KEY); localStorage.removeItem(CRED_KEY); } catch (e) { /* abaikan */ }
  }

  /* ---------- dialog ---------- */

  function field(label, input, hint) {
    return h('label', { class: 'fld' }, [h('span', { class: 'fl', text: label }), input, hint ? h('span', { class: 'fh', text: hint }) : null]);
  }

  function openDialog(title, body, buttons, onClose) {
    var dlg = h('dialog', { class: 'dlg' });
    var form = h('form', { method: 'dialog', novalidate: true }, [
      h('h2', { text: title }),
      h('div', { class: 'dbody' }, body),
      h('div', { class: 'dbtn' }, buttons)
    ]);
    dlg.appendChild(form);
    document.body.appendChild(dlg);
    dlg.addEventListener('close', function () {
      if (dlg.parentNode) dlg.parentNode.removeChild(dlg);
      if (onClose) onClose();
    });
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
    return { dlg: dlg, form: form, close: function () { if (dlg.close) dlg.close(); else dlg.removeAttribute('open'); } };
  }

  function btn(text, cls, attrs) {
    var a = attrs || {};
    a.class = 'btn ' + (cls || '');
    if (!a.type) a.type = 'button';
    a.text = text;
    return h('button', a);
  }

  function errBox() { return h('div', { class: 'ferr', role: 'alert', hidden: true }); }
  function showErr(box, msg) { box.textContent = msg; box.hidden = !msg; }

  function loginDialog() {
    var inRepo = h('input', { type: 'text', value: repo || guessRepo(), placeholder: 'akun/nama-repositori', autocapitalize: 'none', autocomplete: 'off', spellcheck: 'false' });
    var inTok = h('input', { type: 'password', placeholder: 'github_pat_...', autocomplete: 'off', spellcheck: 'false' });
    var inRem = h('input', { type: 'checkbox' });
    var err = errBox();
    var go = btn('Masuk', 'pri', { type: 'submit' });
    var cancel = btn('Batal', 'ghost', { onclick: function () { d.close(); } });
    var d = openDialog('Masuk Mode Admin', [
      h('p', { class: 'dnote', text: 'Mode admin menyimpan perubahan langsung ke repositori GitHub situs ini. Anda memerlukan token akses dari akun GitHub pemilik repositori (lihat README, bagian "Membuat token").' }),
      field('Repositori', inRepo, 'Format: akun/nama-repositori'),
      field('Token GitHub', inTok, 'Token tidak dikirim ke tempat lain selain GitHub.'),
      h('label', { class: 'chk' }, [inRem, h('span', { text: 'Ingat di perangkat ini' })]),
      err
    ], [cancel, go]);
    d.form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var r = inRepo.value.trim().replace(/^https?:\/\/github\.com\//i, '').replace(/\.git$/i, '').replace(/\/+$/, '');
      var t = inTok.value.trim();
      if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(r)) { showErr(err, 'Nama repositori harus berbentuk akun/nama-repositori.'); return; }
      if (!t) { showErr(err, 'Token belum diisi.'); return; }
      showErr(err, '');
      go.disabled = true;
      go.textContent = 'Memeriksa...';
      repo = r; token = t;
      fetchRemote().then(function (data) {
        state = data;
        writeCred(inRem.checked);
        d.close();
        enterAdmin();
      }).catch(function (e) {
        go.disabled = false;
        go.textContent = 'Masuk';
        showErr(err, explain(e));
      });
    });
    inTok.focus();
  }

  function editLink(i) {
    var l = state.links[i];
    var inName = h('input', { type: 'text', value: l.title, maxlength: '60' });
    var inDesc = h('input', { type: 'text', value: l.desc, maxlength: '100' });
    var inUrl = h('input', { type: 'url', value: l.url, placeholder: 'https://drive.google.com/drive/folders/...', autocapitalize: 'none', spellcheck: 'false' });
    var inIcon = h('select', {}, ICON_NAMES.map(function (n) { return h('option', { value: n, text: ICON_LABEL[n], selected: n === l.icon }); }));
    var inAcc = h('select', {}, [
      h('option', { value: 'publik', text: 'Publik', selected: l.access !== 'terbatas' }),
      h('option', { value: 'terbatas', text: 'Terbatas', selected: l.access === 'terbatas' })
    ]);
    var inPri = h('input', { type: 'checkbox', checked: l.primary });
    var inHid = h('input', { type: 'checkbox', checked: l.hidden });
    var err = errBox();
    var del = btn('Hapus', 'danger');
    var armed = false;
    del.addEventListener('click', function () {
      if (!armed) { armed = true; del.textContent = 'Yakin hapus?'; return; }
      state.links.splice(i, 1);
      changed();
      d.close();
    });
    var d = openDialog('Ubah folder', [
      field('Nama tombol', inName),
      field('Keterangan', inDesc, 'Teks kecil di bawah nama. Boleh kosong.'),
      field('Tautan Google Drive', inUrl, 'Salin dari Google Drive: klik kanan folder, Bagikan, atur "Siapa saja yang memiliki link", Salin link. Kosongkan bila belum ada.'),
      h('div', { class: 'two' }, [field('Ikon', inIcon), field('Label akses', inAcc)]),
      h('label', { class: 'chk' }, [inPri, h('span', { text: 'Tampilkan sebagai tombol besar yang menonjol' })]),
      h('label', { class: 'chk' }, [inHid, h('span', { text: 'Sembunyikan dari pengunjung' })]),
      err
    ], [del, btn('Batal', 'ghost', { onclick: function () { d.close(); } }), btn('Simpan', 'pri', { type: 'submit' })]);
    d.form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var name = inName.value.trim(), url = inUrl.value.trim();
      if (!name) { showErr(err, 'Nama tombol tidak boleh kosong.'); return; }
      if (url && !validUrl(url)) { showErr(err, 'Tautan harus diawali https:// dan tanpa spasi.'); return; }
      state.links[i] = {
        title: name, desc: inDesc.value.trim(), url: url, icon: inIcon.value,
        access: inAcc.value, primary: inPri.checked, hidden: inHid.checked
      };
      changed();
      d.close();
    });
    inUrl.focus();
  }

  function addLink() {
    state.links.push({ title: 'Folder baru', desc: '', url: '', icon: 'folder', access: 'publik', primary: false, hidden: false });
    changed();
    editLink(state.links.length - 1);
  }

  function settingsDialog() {
    var s = state.site;
    var a = h('input', { type: 'text', value: s.kicker, maxlength: '40' });
    var b = h('input', { type: 'text', value: s.title, maxlength: '60' });
    var c = h('textarea', { rows: '3', maxlength: '300', text: s.subtitle });
    var e = h('textarea', { rows: '3', maxlength: '300', placeholder: 'Kosongkan bila tidak ada pengumuman', text: s.announcement });
    var d = openDialog('Pengaturan halaman', [
      field('Teks pita atas', a),
      field('Judul', b),
      field('Kalimat pengantar', c),
      field('Pengumuman', e, 'Muncul di atas daftar folder.')
    ], [btn('Batal', 'ghost', { onclick: function () { d.close(); } }), btn('Simpan', 'pri', { type: 'submit' })]);
    d.form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      state.site = {
        kicker: a.value.trim() || DEFAULT_DATA.site.kicker,
        title: b.value.trim() || DEFAULT_DATA.site.title,
        subtitle: c.value.trim() || DEFAULT_DATA.site.subtitle,
        announcement: e.value.trim()
      };
      changed();
      d.close();
    });
  }

  function copyDialog() {
    var ta = h('textarea', { rows: '10', readonly: true, class: 'mono', text: serialize() });
    var d = openDialog('Salin data', [
      h('p', { class: 'dnote', text: 'Cadangan bila penyimpanan otomatis tidak bisa dipakai. Di GitHub, buka berkas data.json, tekan ikon pensil, ganti seluruh isinya dengan teks ini, lalu Commit changes.' }),
      ta
    ], [btn('Tutup', 'ghost', { onclick: function () { d.close(); } }), btn('Salin', 'pri', {
      onclick: function (ev) {
        var b = ev.currentTarget;
        ta.select();
        var done = function () { b.textContent = 'Tersalin'; };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(ta.value).then(done, function () { document.execCommand('copy'); done(); });
        else { document.execCommand('copy'); done(); }
      }
    })]);
  }

  /* ---------- mode admin ---------- */

  function changed() { dirty = true; renderAll(); }

  function move(i, dir) {
    var j = i + dir;
    if (j < 0 || j >= state.links.length) return;
    var t = state.links[i]; state.links[i] = state.links[j]; state.links[j] = t;
    changed();
  }

  function renderBar() {
    var bar = $('adminbar');
    bar.textContent = '';
    bar.hidden = !admin;
    document.body.classList.toggle('is-admin', admin);
    if (!admin) return;
    bar.appendChild(h('div', { class: 'abtns' }, [
      btn('Pengaturan', 'ghost sm', { onclick: settingsDialog }),
      btn('Salin data', 'ghost sm', { onclick: copyDialog }),
      btn('Keluar', 'ghost sm', { onclick: exitAdmin })
    ]));
    bar.appendChild(btn(saving ? 'Menyimpan...' : (dirty ? 'Simpan ke GitHub' : 'Tidak ada perubahan'), 'pri', { disabled: saving || !dirty, onclick: save }));
  }

  function enterAdmin() {
    admin = true;
    dirty = false;
    $('adminlink').hidden = true;
    renderAll();
    window.scrollTo(0, 0);
  }

  function exitAdmin() {
    if (dirty && !window.confirm('Ada perubahan yang belum disimpan. Keluar dan buang perubahan?')) return;
    admin = false;
    dirty = false;
    token = '';
    fileSha = null;
    clearCred();
    $('adminlink').hidden = false;
    loadPublic();
  }

  function adminEntry() {
    var c = readCred();
    if (!c) { loginDialog(); return; }
    repo = c.repo; token = c.token;
    toast('Membuka mode admin...');
    fetchRemote().then(function (data) {
      state = data;
      $('toast').hidden = true;
      enterAdmin();
    }).catch(function (e) {
      clearCred();
      token = '';
      toast(explain(e), true);
      loginDialog();
    });
  }

  window.addEventListener('beforeunload', function (ev) {
    if (admin && dirty) { ev.preventDefault(); ev.returnValue = ''; }
  });

  function start() {
    $('adminlink').addEventListener('click', adminEntry);
    loadPublic();
  }

  if (typeof document !== 'undefined' && document.getElementById('list')) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
    else start();
  }
})();
