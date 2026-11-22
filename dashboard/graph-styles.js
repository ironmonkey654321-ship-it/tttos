// ============================================
// TTTOS - display styles for the brain graph.
//
// Two independent choices: a SKIN (colours and effects) and a LAYOUT (how notes are arranged).
// The pair "default skin + network layout" is the original force-graph view and is left
// completely untouched: this file then draws nothing. Any other pair hides #graph2d and draws
// the SAME live data (window.__javisGraph.graph.graphData()) on its own canvas, so there is no
// second fetch and no second copy of the notes.
//
// Every visible string comes from the dictionary (graph.style.*), never from this file.
// ============================================
(function () {
  "use strict";
  if (typeof window === "undefined" || typeof document === "undefined") return;

  var KEY = "tttos.graphStyle";
  var TAU = Math.PI * 2;
  var FONT = '"Be Vietnam Pro", system-ui, -apple-system, "Segoe UI", sans-serif';
  var MONO = "ui-monospace, Menlo, Consolas, monospace";
  var MAX_GROUPS = 10;          // biggest folders keep their own group, the rest merge into "other"
  var FRAME_MS = 32;            // about 30 frames a second: these views animate all the time

  function T(k, v) { return window.t ? window.t(k, v) : k; }

  // ---------- skins ----------
  var SKINS = [
    { id: "goc" },
    { id: "neon", bg: ["#0b1026", "#04050c"], pal: ["#00e5ff", "#ff3df0", "#7cff6b", "#ffd23d", "#8f7bff", "#ff7a45"], edge: "rgba(120,160,255,.20)", lw: 0.8, glow: 1, add: 1, node: "glow", pulse: "#ffffff" },
    { id: "holo", bg: ["#031a26", "#01060b"], pal: ["#35f2ff", "#35f2ff", "#7df9ff", "#35f2ff", "#b8fdff", "#35f2ff"], edge: "rgba(53,242,255,.22)", lw: 0.7, glow: 0.7, add: 1, node: "ring", pulse: "#eaffff", grid: "rgba(53,242,255,.07)" },
    { id: "tim", bg: ["#150a2e", "#05030c"], pal: ["#ff5fd2", "#a66bff", "#5fb8ff", "#ff8fa3", "#c9a2ff", "#6ff2e0"], edge: "rgba(190,140,255,.18)", lw: 0.7, glow: 0.9, add: 1, node: "glow", pulse: "#ffffff" },
    { id: "plasma", bg: ["#1a0626", "#050208"], pal: ["#ff2e88", "#ff7b00", "#ffd500", "#b14dff", "#ff4d6d", "#ff9e3d"], edge: "grad", lw: 1.1, glow: 1.3, add: 1, node: "glow", pulse: "#fff7d6" },
    { id: "vang", bg: ["#1c1405", "#060402"], pal: ["#ffd76a", "#ffb52e", "#fff1b8", "#e89b1c", "#ffe08a", "#ffc94d"], edge: "rgba(255,200,90,.18)", lw: 0.8, glow: 1.1, add: 1, node: "spark", pulse: "#fffbe6", dust: 1 },
    { id: "tinhvan", bg: ["#0a0d1f", "#030409"], pal: ["#4cc9f0", "#f72585", "#80ed99", "#ffd166", "#9b5de5", "#ff9770"], edge: "rgba(255,255,255,.10)", lw: 0.6, glow: 0.6, add: 1, node: "dot", pulse: "#ffffff", neb: 1 },
    { id: "mach", bg: ["#04140f", "#010504"], pal: ["#19f5a5", "#19f5a5", "#9dffd9", "#19f5a5", "#3ddcff", "#19f5a5"], edge: "rgba(25,245,165,.24)", lw: 1, glow: 0.6, add: 1, node: "square", pulse: "#eafff6", ortho: 1, grid: "rgba(25,245,165,.05)" },
    { id: "toigian", bg: ["#ffffff", "#f1f3f7"], pal: ["#2f5bff", "#10131a", "#10131a", "#2f5bff", "#10131a", "#10131a"], edge: "rgba(16,19,26,.16)", lw: 0.8, glow: 0, add: 0, node: "dot", pulse: "#2f5bff", light: 1 },
    { id: "chomsao", bg: ["#0a1230", "#02030a"], pal: ["#ffffff", "#cfe3ff", "#ffffff", "#ffe9c2", "#d7d2ff", "#ffffff"], edge: "rgba(190,215,255,.34)", lw: 0.6, glow: 0.7, add: 1, node: "star", pulse: null, stars: 1, nearOnly: 1 },
    { id: "xung", bg: ["#06141c", "#020508"], pal: ["#19d3c5", "#19d3c5", "#3aa8ff", "#19d3c5", "#3aa8ff", "#19d3c5"], edge: "rgba(60,190,200,.16)", lw: 0.8, glow: 0.8, add: 1, node: "glow", pulse: null, wave: "#ffb347" },
    { id: "matran", bg: ["#0b0d0c", "#040505"], pal: ["#d8ffe9", "#d8ffe9", "#d8ffe9", "#8dffc0", "#d8ffe9", "#d8ffe9"], edge: "rgba(200,255,225,.09)", lw: 0.6, glow: 0.4, add: 1, node: "square", pulse: null, dots: "rgba(200,255,225,.10)", breath: 1, small: 1 },
    { id: "kinh", bg: ["#2a2360", "#0d1030"], pal: ["#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff"], edge: "rgba(255,255,255,.26)", lw: 0.8, glow: 0, add: 0, node: "glass", pulse: "#ffffff", blobs: ["#ff5fa2", "#5f8bff", "#3de0c8"] },
    { id: "thietke", bg: ["#0d4aa6", "#082f6e"], pal: ["#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff"], edge: "rgba(255,255,255,.42)", lw: 0.8, glow: 0, add: 0, node: "cross", pulse: "#ffe27a", grid: "rgba(255,255,255,.10)", dash: [5, 4], mono: 1 },
    { id: "giaymuc", bg: ["#f6eedb", "#eadfc6"], pal: ["#1f1a14", "#1f1a14", "#1f1a14", "#1f1a14", "#1f1a14", "#1f1a14"], edge: "rgba(40,30,20,.30)", lw: 0.9, glow: 0, add: 0, node: "ink", pulse: "#b3261e", light: 1, seal: "#b3261e" }
  ];
  var LAYOUTS = ["luoi", "nao", "cau", "xoan", "vong", "cung", "hive", "dong", "the", "trong"];
  var CUSTOM = { dong: 1, the: 1 };

  function themeLight() {
    return document.documentElement.getAttribute("data-theme") === "light";
  }
  // The default skin follows the app theme and keeps each note's own folder colour.
  function skinNow() {
    var s = SKINS[0], i;
    for (i = 0; i < SKINS.length; i++) if (SKINS[i].id === st.skin) s = SKINS[i];
    if (s.id !== "goc") return s;
    var L = themeLight();
    return {
      id: "goc", bg: null, pal: null, light: L ? 1 : 0, add: L ? 0 : 1, glow: L ? 0 : 0.8,
      edge: L ? "rgba(96,60,180,.24)" : "rgba(165,150,240,.17)", lw: 0.7,
      node: L ? "dot" : "glow", pulse: L ? "#603cb4" : "#ffffff"
    };
  }

  // ---------- state ----------
  var st = { skin: "goc", layout: "luoi" };
  try {
    var saved = JSON.parse(localStorage.getItem(KEY) || "null");
    if (saved && typeof saved.skin === "string" && typeof saved.layout === "string") {
      if (SKINS.some(function (s) { return s.id === saved.skin; })) st.skin = saved.skin;
      if (LAYOUTS.indexOf(saved.layout) >= 0) st.layout = saved.layout;
    }
  } catch (e) {}
  function isAlt() { return !(st.skin === "goc" && st.layout === "luoi"); }

  var root, cv, g, btn, panel, bar, barNow, raf = 0, lastDraw = 0, paused = false;
  var W = 0, H = 0, D = 1, sc = 1, cx = 0, cy = 0, fk = 1;
  var NODES = [], A = [], E = [], GR = [], FLOW = [], GAPS = [], PAIRS = [], sig = "", sizeK = 1, edgeK = 1;
  var pulses = [], hov = null, rot = 0, drag = null, moved = false, hits = [], hotHit = null;
  var wave = { t0: -99, mx: 0 }, tNow = 0, t0 = 0;

  // ---------- helpers ----------
  // Ids are paths that share long prefixes, so the bits are mixed at the end (murmur finaliser);
  // without it every note of one folder gets nearly the same jitter and they pile up on one spot.
  function hash(s) {
    var h = 0, i; s = String(s || "");
    for (i = 0; i < s.length; i++) h = (Math.imul(h, 31) + s.charCodeAt(i)) | 0;
    h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b); h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35); h ^= h >>> 16;
    return h >>> 0;
  }
  var _rgba = {};
  function hexA(hex, a) {
    var k = hex + "|" + a, m, r, gg, b;
    if (_rgba[k]) return _rgba[k];
    m = String(hex || "#b98cff").replace("#", "");
    r = parseInt(m.substring(0, 2), 16); gg = parseInt(m.substring(2, 4), 16); b = parseInt(m.substring(4, 6), 16);
    return (_rgba[k] = "rgba(" + (r || 0) + "," + (gg || 0) + "," + (b || 0) + "," + a + ")");
  }
  var _spr = {};
  // Glow as a cached sprite: one drawImage per note instead of a canvas shadow blur per note.
  function sprite(col) {
    if (_spr[col]) return _spr[col];
    var s = 64, c = document.createElement("canvas"), x, gr;
    c.width = c.height = s; x = c.getContext("2d");
    gr = x.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    gr.addColorStop(0, hexA(col, 0.85)); gr.addColorStop(0.3, hexA(col, 0.32));
    gr.addColorStop(0.65, hexA(col, 0.08)); gr.addColorStop(1, hexA(col, 0));
    x.fillStyle = gr; x.fillRect(0, 0, s, s);
    return (_spr[col] = c);
  }
  function rrect(x, y, w, h, r) {
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
  }
  function fit(str, maxW) {
    str = String(str == null ? "" : str);
    if (g.measureText(str).width <= maxW) return str;
    var lo = 0, hi = str.length, mid;
    while (lo < hi) { mid = (lo + hi + 1) >> 1; if (g.measureText(str.slice(0, mid) + "...").width <= maxW) lo = mid; else hi = mid - 1; }
    return lo > 0 ? str.slice(0, lo) + "..." : "";
  }
  function ink(s) { return s.light ? "#10131a" : "#ffffff"; }
  function colOf(a, s) {
    if (a.hub && s.seal) return s.seal;
    return s.pal ? s.pal[a.g % s.pal.length] : (a.n.__c || "#b98cff");
  }
  function grCol(gi, s) {
    if (s.pal) return s.pal[gi % s.pal.length];
    var h = GR[gi] && GR[gi].hub; return (h && h.n.__c) || "#b98cff";
  }
  function graphData() {
    var jg = window.__javisGraph;
    if (!jg || !jg.graph) return null;
    try { return jg.graph.graphData(); } catch (e) { return null; }
  }

  // ---------- derived structure, rebuilt only when the data changes ----------
  function rebuild(d) {
    var nodes = d.nodes || [], links = d.links || [], byId = {}, cnt = {}, cats, gi = {}, i, n, a, l, s, t, sa, ta;
    NODES = nodes; A = []; E = []; GR = [];
    for (i = 0; i < nodes.length; i++) { n = nodes[i]; cnt[n.__cat || "root"] = (cnt[n.__cat || "root"] || 0) + 1; }
    cats = Object.keys(cnt).sort(function (x, y) { return cnt[y] - cnt[x] || (x < y ? -1 : 1); });
    cats.forEach(function (c, k) {
      var idx = Math.min(k, MAX_GROUPS);
      gi[c] = idx;
      if (!GR[idx]) GR[idx] = { name: k < MAX_GROUPS ? c : null, count: 0, hub: null, top: [] };
      GR[idx].count += cnt[c];
    });
    for (i = 0; i < nodes.length; i++) {
      n = nodes[i];
      a = n.__ga || (n.__ga = { px: null, py: null });
      a.n = n; a.g = gi[n.__cat || "root"] || 0; a.d = 0; a.nb = []; a.hub = false; a.w = 0; a.wd = 99; a.skip = false;
      var h = hash(n.id);
      a.ph = (h % 628) / 100; a.j1 = (h & 1023) / 1023 - 0.5; a.j2 = ((h >>> 10) & 1023) / 1023 - 0.5; a.j3 = ((h >>> 20) & 1023) / 1023 - 0.5;
      A.push(a); byId[n.id] = a;
    }
    for (i = 0; i < links.length; i++) {
      l = links[i]; s = (l.source && l.source.id != null) ? l.source.id : l.source; t = (l.target && l.target.id != null) ? l.target.id : l.target;
      sa = byId[s]; ta = byId[t];
      if (!sa || !ta || sa === ta) continue;
      E.push([sa, ta]); sa.d++; ta.d++; sa.nb.push(ta); ta.nb.push(sa);
    }
    var K = GR.length || 1, N = A.length || 1, k;
    A.forEach(function (x) { var G = GR[x.g]; if (!G.hub || x.d > G.hub.d) G.hub = x; });
    GR.forEach(function (G) { if (G.hub) G.hub.hub = true; });
    // order: by group, strongest note first; used by the ring, arc, axis, spiral and sphere layouts
    var ord = A.slice().sort(function (x, y) { return x.g - y.g || y.d - x.d; }), seen = [];
    for (k = 0; k < K; k++) seen[k] = 0;
    ord.forEach(function (x, o) {
      var c = GR[x.g].count;
      x.oi = o; x.ri = c > 1 ? seen[x.g] / (c - 1) : 0;
      if (seen[x.g] < 3) GR[x.g].top.push(x);
      seen[x.g]++;
      x.oa = (o + x.g * (N * 0.02 + 1)) / (N + K * (N * 0.02 + 1)) * TAU - Math.PI / 2;
      var y = 1 - (o + 0.5) * 2 / N, r = Math.sqrt(Math.max(0, 1 - y * y)), th = o * 2.39996;
      x.s3 = [r * Math.cos(th), y, r * Math.sin(th)];
      // brain shape: clusters spread on a sphere, squashed to an ellipsoid with a gap between two halves
      var u = 1 - (x.g + 0.5) * 2 / K, tg = x.g * 2.39996, s0 = Math.sqrt(Math.max(0, 1 - u * u));
      var v = [s0 * Math.cos(tg) + x.j1 * 0.9, u + x.j2 * 0.9, s0 * Math.sin(tg) + x.j3 * 0.9];
      var len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]) || 1, rr = 0.42 + Math.sqrt(x.j3 + 0.5) * 0.58;
      x.q = [v[0] / len * rr + (v[0] > 0 ? 0.08 : -0.08), v[1] / len * rr * 0.74, v[2] / len * rr * 0.86];
    });
    // link counts between groups: source group -> target group
    FLOW = []; for (i = 0; i < K; i++) { FLOW[i] = []; for (k = 0; k < K; k++) FLOW[i][k] = 0; }
    E.forEach(function (e) { FLOW[e[0].g][e[1].g]++; });
    PAIRS = [];
    for (i = 0; i < K; i++) for (k = i + 1; k < K; k++) PAIRS.push({ a: i, b: k, n: FLOW[i][k] + FLOW[k][i] });
    // gaps: among folders that hold real content, the pairs with the fewest links
    GAPS = PAIRS.filter(function (p) { return GR[p.a].name && GR[p.b].name && GR[p.a].count >= 3 && GR[p.b].count >= 3; })
      .sort(function (x, y) { return x.n - y.n || GR[y.a].count * GR[y.b].count - GR[x.a].count * GR[x.b].count; }).slice(0, 3);
    PAIRS = PAIRS.filter(function (p) { return p.n > 0; }).sort(function (x, y) { return y.n - x.n; });
    sizeK = Math.max(0.45, Math.min(1, Math.sqrt(170 / N)));
    edgeK = Math.max(0.35, Math.min(1, Math.sqrt(340 / (E.length || 1))));
    pulses = [];
    var np = Math.min(70, Math.floor(E.length / 3));
    for (i = 0; i < np; i++) pulses.push({ e: Math.floor(Math.random() * E.length), t: Math.random(), v: 0.25 + Math.random() * 0.5 });
    if (hov && A.indexOf(hov) < 0) hov = null;
    wave.t0 = -99;
  }
  function grName(G) { return (G.name == null ? T("graph.style.other") : G.name).toUpperCase(); }

  function fire(src, t) {
    var q = [src], h, u, i, v;
    for (i = 0; i < A.length; i++) A[i].wd = 99;
    src.wd = 0; wave.mx = 0;
    for (h = 0; h < q.length; h++) {
      u = q[h];
      for (i = 0; i < u.nb.length; i++) { v = u.nb[i]; if (v.wd > u.wd + 1) { v.wd = u.wd + 1; if (v.wd > wave.mx) wave.mx = v.wd; q.push(v); } }
    }
    wave.t0 = t;
  }

  // ---------- positions ----------
  var box = { x: 0, y: 0, k: 1 };
  function forceBox() {
    var x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9, i, n, any = false;
    for (i = 0; i < NODES.length; i++) {
      n = NODES[i]; if (n.x == null || n.y == null) continue;
      any = true; if (n.x < x0) x0 = n.x; if (n.x > x1) x1 = n.x; if (n.y < y0) y0 = n.y; if (n.y > y1) y1 = n.y;
    }
    if (!any) { box.k = 0; return; }
    var k = Math.min(W * 0.86 / Math.max(1, x1 - x0), H * 0.8 / Math.max(1, y1 - y0));
    box.x = (x0 + x1) / 2; box.y = (y0 + y1) / 2; box.k = Math.min(k, 6);
  }
  function place(a, t, L) {
    var n = a.n, x, y, ps = 1, pa = 1, tx, ty, ang, r, p, K = GR.length || 1, N = A.length || 1;
    a.skip = false;
    if (L === "luoi" || L === "trong") {
      if (n.x == null || n.y == null || !box.k) { a.skip = true; return; }
      tx = cx + (n.x - box.x) * box.k; ty = cy + (n.y - box.y) * box.k;
    } else {
      if (L === "nao" || L === "cau") {
        var src = L === "nao" ? a.q : a.s3, an = t * 0.28 + rot, ca = Math.cos(an), sa = Math.sin(an), ti = L === "cau" ? 0.38 : 0;
        var X = src[0] * ca + src[2] * sa, Z = -src[0] * sa + src[2] * ca, Y = src[1] * Math.cos(ti) - Z * Math.sin(ti);
        Z = src[1] * Math.sin(ti) + Z * Math.cos(ti);
        p = 1.9 / (2.6 - Z); var kk = L === "cau" ? 0.92 : 1.15;
        x = X * kk * p; y = Y * kk * p; ps = p * (L === "cau" ? 0.95 : 1.15); pa = 0.2 + 0.8 * (Z + 1) / 2;
      } else if (L === "xoan") {
        ang = a.g / K * TAU + a.ri * 2.7 + t * 0.07 + a.j1 * 0.22; r = 0.1 + 0.86 * a.ri + a.j2 * 0.07;
        x = Math.cos(ang) * r * 1.3; y = Math.sin(ang) * r * 0.62; ps = 0.85 + 0.35 * (y + 0.6); pa = 0.55 + 0.45 * (1 - a.ri * 0.6);
      } else if (L === "vong") {
        x = Math.cos(a.oa) * 0.74; y = Math.sin(a.oa) * 0.74; ps = 0.8;
      } else if (L === "cung") {
        x = (a.oi / Math.max(1, N - 1) - 0.5) * 2 * (W * 0.45 / sc); y = 0.5; ps = 0.75;
      } else {   // hive
        ang = a.g / K * TAU - Math.PI / 2; r = 0.12 + 0.68 * a.ri; x = Math.cos(ang) * r * 1.12; y = Math.sin(ang) * r; ps = 0.85;
      }
      tx = cx + x * sc; ty = cy + y * sc;
    }
    if (a.px == null) { a.px = tx; a.py = ty; }
    a.px += (tx - a.px) * 0.22; a.py += (ty - a.py) * 0.22; a.ps = ps; a.pa = pa;
  }

  // edge geometry: gt 0 = straight, 1 = one-control curve (gx, gy), 2 = right-angle
  var gt = 0, gx = 0, gy = 0;
  function geo(a, b, s, L) {
    var mx = (a.px + b.px) / 2, my = (a.py + b.py) / 2, f;
    gt = 0;
    if (L === "vong") { f = a.g === b.g ? 0.55 : 0.12; gt = 1; gx = cx + (mx - cx) * f; gy = cy + (my - cy) * f; }
    else if (L === "cung") { gt = 1; gx = mx; gy = a.py - Math.min(Math.abs(b.px - a.px) * 0.9, H * 0.62); }
    else if (L === "hive") {
      gt = 1;
      if (a.g === b.g) { gx = mx - (b.py - a.py) * 0.45; gy = my + (b.px - a.px) * 0.45; }
      else { gx = cx + (mx - cx) * 0.45; gy = cy + (my - cy) * 0.45; }
    } else if (s.ortho && (L === "luoi" || L === "trong")) gt = 2;
  }
  function onEdge(a, b, q, out) {
    var u = 1 - q;
    if (gt === 1) { out[0] = u * u * a.px + 2 * u * q * gx + q * q * b.px; out[1] = u * u * a.py + 2 * u * q * gy + q * q * b.py; }
    else if (gt === 2) {
      var l1 = Math.abs(b.px - a.px), l2 = Math.abs(b.py - a.py), d = q * (l1 + l2);
      if (d <= l1) { out[0] = a.px + (b.px - a.px) * (l1 ? d / l1 : 0); out[1] = a.py; }
      else { out[0] = b.px; out[1] = a.py + (b.py - a.py) * (l2 ? (d - l1) / l2 : 0); }
    } else { out[0] = a.px + (b.px - a.px) * q; out[1] = a.py + (b.py - a.py) * q; }
  }

  // ---------- backdrop ----------
  function backdrop(s, t) {
    var x, y, i, bgd;
    g.setLineDash([]); g.globalCompositeOperation = "source-over"; g.shadowBlur = 0; g.globalAlpha = 1;
    g.clearRect(0, 0, W, H);
    if (!s.bg) return;
    bgd = g.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.75);
    bgd.addColorStop(0, s.bg[0]); bgd.addColorStop(1, s.bg[1]);
    g.fillStyle = bgd; g.fillRect(0, 0, W, H);
    if (s.blobs) s.blobs.forEach(function (c, i) {
      var bx = W * (0.2 + 0.3 * i) + Math.sin(t * 0.2 + i) * 40, by = H * (0.3 + 0.2 * ((i * 7) % 3)) + Math.cos(t * 0.17 + i) * 30, r = Math.max(W, H) * 0.38;
      var b = g.createRadialGradient(bx, by, 0, bx, by, r); b.addColorStop(0, hexA(c, 0.4)); b.addColorStop(1, hexA(c, 0));
      g.fillStyle = b; g.fillRect(0, 0, W, H);
    });
    if (s.grid) {
      g.strokeStyle = s.grid; g.lineWidth = 1; g.beginPath();
      for (x = cx % 40; x < W; x += 40) { g.moveTo(x, 0); g.lineTo(x, H); }
      for (y = cy % 40; y < H; y += 40) { g.moveTo(0, y); g.lineTo(W, y); }
      g.stroke();
    }
    if (s.dots) { g.fillStyle = s.dots; for (x = cx % 26; x < W; x += 26) for (y = cy % 26; y < H; y += 26) g.fillRect(x, y, 1.5, 1.5); }
    if (s.stars) {
      g.fillStyle = "#ffffff";
      for (i = 0; i < 170; i++) {
        var px = Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1, py = Math.abs(Math.sin(i * 78.233) * 12543.21) % 1;
        g.globalAlpha = 0.15 + 0.35 * Math.abs(Math.sin(t * 0.7 + i)); g.fillRect(px * W, py * H, i % 9 === 0 ? 1.8 : 1, i % 9 === 0 ? 1.8 : 1);
      }
      g.globalAlpha = 1;
    }
    if (s.dust) {
      g.globalCompositeOperation = "lighter"; g.fillStyle = "#ffe7a3";
      for (i = 0; i < 90; i++) {
        var dx = Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1, dy = Math.abs(Math.sin(i * 78.233) * 12543.21) % 1;
        g.globalAlpha = 0.5 * (0.5 + 0.5 * Math.sin(t * 1.6 + i)); g.fillRect(dx * W, ((dy * H - t * 8 - i) % H + H) % H, 1.4, 1.4);
      }
      g.globalAlpha = 1; g.globalCompositeOperation = "source-over";
    }
  }

  // ---------- one note ----------
  function nodeDraw(a, s, t, al, lvl) {
    var col = colOf(a, s), r = (1.7 + Math.sqrt(Math.min(55, a.d)) * 1.25 + (a.hub ? 2.6 : 0)) * a.ps * sizeK * lvl, x = a.px, y = a.py, L2;
    if (a === hov) r *= 1.35;
    if (s.small) r *= 0.6;
    if (s.breath) al *= 0.55 + 0.45 * Math.sin(t * 0.9 + a.ph);
    if (s.wave) { al *= 0.3 + 0.7 * a.w; r *= 1 + 0.9 * a.w; if (a.w > 0.25) col = s.wave; }
    al = Math.max(0, Math.min(1, al)); if (al < 0.02) return;
    if (s.glow) {
      var gs = r * (a.hub ? 7 : 5.2) * s.glow * (0.9 + 0.1 * Math.sin(t * 2 + a.ph)) * (s.wave ? 0.6 + 1.6 * a.w : 1);
      g.globalAlpha = al * 0.9; g.drawImage(sprite(col), x - gs / 2, y - gs / 2, gs, gs);
    }
    g.globalAlpha = al; g.fillStyle = col; g.strokeStyle = col;
    if (s.node === "ring") {
      g.lineWidth = 1.2; g.beginPath(); g.arc(x, y, r + 1, 0, TAU); g.stroke();
      g.beginPath(); g.arc(x, y, Math.max(0.8, r * 0.3), 0, TAU); g.fill();
      if (a.hub) { g.globalAlpha = al * 0.5; g.beginPath(); g.arc(x, y, r + 6 + Math.sin(t * 2 + a.ph) * 2, t + a.ph, t + a.ph + 4); g.stroke(); }
    } else if (s.node === "square") {
      g.fillRect(x - r, y - r, r * 2, r * 2);
      if (a.hub) { g.lineWidth = 1; g.strokeRect(x - r - 4, y - r - 4, r * 2 + 8, r * 2 + 8); }
    } else if (s.node === "spark") {
      g.beginPath(); g.arc(x, y, r * 0.8, 0, TAU); g.fill();
      if (a.d > 2) { L2 = r * 2.6 * (0.8 + 0.2 * Math.sin(t * 3 + a.ph)); g.lineWidth = 0.8; g.beginPath(); g.moveTo(x - L2, y); g.lineTo(x + L2, y); g.moveTo(x, y - L2); g.lineTo(x, y + L2); g.stroke(); }
    } else if (s.node === "star") {
      g.globalAlpha = al * (0.6 + 0.4 * Math.sin(t * 2.2 + a.ph));
      g.beginPath(); g.arc(x, y, Math.max(0.9, r * 0.42), 0, TAU); g.fill();
      if (a.hub || a.d > 4) { L2 = r * 2.2; g.lineWidth = 0.7; g.beginPath(); g.moveTo(x - L2, y); g.lineTo(x + L2, y); g.moveTo(x, y - L2); g.lineTo(x, y + L2); g.stroke(); }
    } else if (s.node === "glass") {
      r += 1.5; g.globalAlpha = al * 0.22; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
      g.globalAlpha = al * 0.9; g.lineWidth = 1; g.stroke();
      g.globalAlpha = al * 0.7; g.beginPath(); g.arc(x - r * 0.3, y - r * 0.3, Math.max(0.7, r * 0.22), 0, TAU); g.fill();
    } else if (s.node === "cross") {
      g.lineWidth = 1; g.beginPath(); g.arc(x, y, r + 1, 0, TAU); g.stroke();
      if (a.hub || a.d > 3 || a === hov) { L2 = r + 5; g.beginPath(); g.moveTo(x - L2, y); g.lineTo(x + L2, y); g.moveTo(x, y - L2); g.lineTo(x, y + L2); g.stroke(); }
    } else if (s.node === "ink") {
      if (a.hub) { g.fillRect(x - r, y - r, r * 2, r * 2); g.globalAlpha = al * 0.9; g.fillStyle = s.bg ? s.bg[0] : "#ffffff"; g.fillRect(x - r * 0.45, y - r * 0.45, r * 0.9, r * 0.9); }
      else { g.beginPath(); g.arc(x, y, r * 0.75, 0, TAU); g.fill(); }
    } else {
      g.beginPath(); g.arc(x, y, s.node === "glow" ? r * 0.8 : r, 0, TAU); g.fill();
      if (s.node === "glow" && r > 1.6) { g.globalAlpha = al * 0.9; g.fillStyle = "#ffffff"; g.beginPath(); g.arc(x, y, r * 0.3, 0, TAU); g.fill(); }
    }
  }

  // ---------- network-type layouts ----------
  var pt = [0, 0];
  function graph(s, L, t, lvl) {
    var dim = L === "trong" ? 0.4 : 1, curve = L === "vong" || L === "cung" || L === "hive";
    var three = L === "nao" || L === "cau" || L === "xoan", i, a, b, e, al, col, key, bk, B = {}, m, d, k, x;
    if (L === "luoi" || L === "trong") forceBox();
    for (i = 0; i < A.length; i++) place(A[i], t, L);
    if (s.wave) {
      if (A.length && (t - wave.t0) * 1.3 > wave.mx + 2.5) fire(GR[Math.floor(Math.random() * GR.length)].hub || A[0], t);
      for (i = 0; i < A.length; i++) { x = (t - wave.t0) * 1.3 - A[i].wd; A[i].w = Math.exp(-x * x * 1.5); }
    }
    if (s.neb) {
      g.globalCompositeOperation = "lighter";
      GR.forEach(function (G, gi) {
        var h = G.hub; if (!h || h.skip) return;
        var r = sc * 0.42, ng = g.createRadialGradient(h.px, h.py, 0, h.px, h.py, r);
        ng.addColorStop(0, hexA(grCol(gi, s), 0.23)); ng.addColorStop(1, hexA(grCol(gi, s), 0));
        g.globalAlpha = dim; g.fillStyle = ng; g.fillRect(h.px - r, h.py - r, r * 2, r * 2);
      });
    }
    g.globalCompositeOperation = s.add ? "lighter" : "source-over";
    // edges are grouped by colour and opacity, so a brain of thousands of links is a few strokes
    for (i = 0; i < E.length; i++) {
      e = E[i]; a = e[0]; b = e[1]; if (a.skip || b.skip) continue;
      al = dim * edgeK * (curve ? 0.75 : 1); col = s.edge;
      if (hov) al *= (a === hov || b === hov) ? 2.6 / edgeK : 0.12;
      if (three) { m = Math.min(a.pa, b.pa); al *= m < 0.5 ? 0.35 : (m < 0.75 ? 0.65 : 1); }
      if (s.nearOnly && !curve) {
        d = Math.abs(a.px - b.px) + Math.abs(a.py - b.py); k = 1 - d / (sc * 0.46);
        if (k <= 0) continue; al *= k > 0.6 ? 1.5 : (k > 0.3 ? 0.9 : 0.4);
      }
      if (s.wave) { m = Math.min(a.w, b.w); if (m > 0.3) { col = s.wave; al *= 2.2 / edgeK; } else al *= 0.6; }
      if (s.edge === "grad") col = hexA(colOf(a, s), 0.4);
      al = Math.min(1, al); if (al < 0.02) continue;
      key = col + "|" + al.toFixed(2);
      bk = B[key] || (B[key] = { p: new Path2D(), c: col, a: al });
      geo(a, b, s, L); bk.p.moveTo(a.px, a.py);
      if (gt === 1) bk.p.quadraticCurveTo(gx, gy, b.px, b.py);
      else if (gt === 2) { bk.p.lineTo(b.px, a.py); bk.p.lineTo(b.px, b.py); }
      else bk.p.lineTo(b.px, b.py);
    }
    g.lineWidth = s.lw; g.lineJoin = "round"; g.setLineDash(s.dash || []);
    for (key in B) { bk = B[key]; g.globalAlpha = bk.a; g.strokeStyle = bk.c; g.stroke(bk.p); }
    g.setLineDash([]);
    if (s.pulse && E.length) {
      g.fillStyle = s.pulse;
      for (i = 0; i < pulses.length; i++) {
        var q = pulses[i]; q.t += q.v * 0.024;
        if (q.t > 1 || q.e >= E.length) { q.t = 0; q.e = Math.floor(Math.random() * E.length); }
        e = E[q.e]; a = e[0]; b = e[1];
        if (a.skip || b.skip || (hov && a !== hov && b !== hov)) continue;
        geo(a, b, s, L); onEdge(a, b, q.t, pt);
        g.globalAlpha = Math.min(a.pa, b.pa) * Math.sin(q.t * Math.PI) * dim;
        g.beginPath(); g.arc(pt[0], pt[1], 1.6 * Math.min(a.ps, b.ps), 0, TAU); g.fill();
      }
    }
    for (i = 0; i < A.length; i++) {
      a = A[i]; if (a.skip) continue;
      nodeDraw(a, s, t, a.pa * ((!hov || a === hov || hov.nb.indexOf(a) >= 0) ? 1 : 0.15) * dim, lvl);
    }
    // labels: one per folder (on its strongest note) plus the note under the pointer
    g.globalCompositeOperation = "source-over"; g.textAlign = "center"; g.textBaseline = "alphabetic";
    var rows = [];
    for (i = 0; i < A.length; i++) {
      a = A[i]; if (a.skip || !(a.hub || a === hov)) continue;
      var off = (9 + Math.sqrt(Math.min(55, a.d)) * 1.25 + (a.hub ? 4 : 0)) * a.ps * sizeK + 3, lx = a.px, ly = a.py - off;
      if (L === "cung") ly = a.py + off + 12 * fk;
      // spiral: the strongest note sits in the core, so the folder name goes out along its arm
      if (L === "xoan" && a !== hov) {
        var ax = a.g / (GR.length || 1) * TAU + 0.72 * 2.7 + t * 0.07;
        lx = cx + Math.cos(ax) * 0.82 * 1.3 * sc; ly = cy + Math.sin(ax) * 0.82 * 0.62 * sc;
      }
      if (L === "vong") {
        var ang = Math.atan2(a.py - cy, a.px - cx);
        lx = a.px + Math.cos(ang) * 34 * fk; ly = a.py + Math.sin(ang) * 34 * fk + 4;
      }
      // axes: the strongest note sits at the centre, so the folder name goes to the outer end
      if (L === "hive" && a !== hov) {
        var ah = a.g / (GR.length || 1) * TAU - Math.PI / 2;
        lx = cx + Math.cos(ah) * 0.93 * 1.12 * sc; ly = cy + Math.sin(ah) * 0.93 * sc + 4;
      }
      var isH = a === hov, lab = isH ? (a.n.label || a.n.id) : grName(GR[a.g]);
      g.font = (isH ? "600 " + Math.round(12.5 * fk) : "600 " + Math.round(11 * fk)) + "px " + (s.mono ? MONO : FONT);
      lab = fit(lab, Math.min(260, W * 0.5));
      if (isH) lx = Math.max(g.measureText(lab).width / 2 + 6, Math.min(W - g.measureText(lab).width / 2 - 6, lx));
      if (L === "cung" && !isH) {   // small folders sit close together on the line: drop to a free row
        var lw2 = g.measureText(lab).width / 2 + 5, row = 0, c2;
        for (c2 = 0; c2 < rows.length; c2++) if (rows[c2][2] === row && lx - lw2 < rows[c2][1] && lx + lw2 > rows[c2][0]) { row++; c2 = -1; }
        rows.push([lx - lw2, lx + lw2, row]); ly += row * 15 * fk;
      }
      g.globalAlpha = Math.max(0.4, a.pa) * ((!hov || isH) ? 0.95 : 0.2) * (dim < 1 ? 0.8 : 1);
      if (isH) { g.lineWidth = 3; g.strokeStyle = s.light ? "rgba(255,255,255,.85)" : "rgba(4,6,12,.8)"; g.strokeText(lab, lx, ly); }
      g.fillStyle = ink(s); g.fillText(lab, lx, ly);
    }
    if (L === "trong") gapsDraw(s, t);
  }

  function gapsDraw(s, t) {
    var col = s.light ? "#d9480f" : "#ffcf33", used = [];
    g.globalCompositeOperation = "source-over";
    GAPS.forEach(function (gp, i) {
      var a = GR[gp.a].hub, b = GR[gp.b].hub; if (!a || !b || a.skip || b.skip) return;
      var mx = (a.px + b.px) / 2, my = (a.py + b.py) / 2, kx = mx - (b.py - a.py) * 0.22, ky = my + (b.px - a.px) * 0.22;
      var q = (4 + i * 3) / 14, u = 1 - q, lx = u * u * a.px + 2 * u * q * kx + q * q * b.px, ly = u * u * a.py + 2 * u * q * ky + q * q * b.py;
      g.globalAlpha = 0.95; g.strokeStyle = col; g.lineWidth = 2; g.setLineDash([7, 7]); g.lineDashOffset = -t * 18;
      g.beginPath(); g.moveTo(a.px, a.py); g.quadraticCurveTo(kx, ky, b.px, b.py); g.stroke();
      g.setLineDash([]); g.lineDashOffset = 0;
      [a, b].forEach(function (n) { g.beginPath(); g.arc(n.px, n.py, 14 * fk + Math.sin(t * 3 + i) * 2, 0, TAU); g.stroke(); });
      var names = { a: grName(GR[gp.a]), b: grName(GR[gp.b]), n: gp.n };
      g.font = "600 " + Math.round(12 * fk) + "px " + FONT;
      var lab = fit(gp.n ? T("graph.style.gap_few", names) : T("graph.style.gap_none", names), W * 0.7), w = g.measureText(lab).width + 34;
      used.forEach(function (y) { if (Math.abs(ly - y) < 30) ly = y + 30; }); used.push(ly);
      lx = Math.max(w / 2 + 6, Math.min(W - w / 2 - 6, lx)); ly = Math.max(20, Math.min(H - 20, ly));
      g.fillStyle = s.light ? "#ffffff" : "#14110a"; rrect(lx - w / 2, ly - 13, w, 26, 13); g.fill(); g.lineWidth = 1.2; g.stroke();
      g.fillStyle = col; g.beginPath(); g.arc(lx - w / 2 + 14, ly, 8, 0, TAU); g.fill();
      g.fillStyle = s.light ? "#ffffff" : "#14110a"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("?", lx - w / 2 + 14, ly + 0.5);
      g.fillStyle = col; g.textAlign = "left"; g.fillText(lab, lx - w / 2 + 27, ly + 0.5);
    });
    g.textBaseline = "alphabetic";
  }

  // ---------- flow layout: how many links run from one folder to another ----------
  function dong(s, t) {
    var K = GR.length, top = H * 0.16, bot = H * 0.92, xl = W * 0.3, xr = W * 0.7, bw = Math.max(8, 14 * fk), gap = Math.max(4, 12 * fk), tc = ink(s);
    var out = [], inn = [], tot = 0, i, j, v;
    for (i = 0; i < K; i++) { out[i] = 0; inn[i] = 0; }
    for (i = 0; i < K; i++) for (j = 0; j < K; j++) { out[i] += FLOW[i][j]; inn[j] += FLOW[i][j]; tot += FLOW[i][j]; }
    g.textBaseline = "middle"; g.globalCompositeOperation = "source-over";
    if (!tot) { g.globalAlpha = 0.7; g.fillStyle = tc; g.textAlign = "center"; g.font = Math.round(13 * fk) + "px " + FONT; g.fillText(T("graph.style.no_links"), cx, cy); g.textBaseline = "alphabetic"; return; }
    var rowsL = [], rowsR = [];
    for (i = 0; i < K; i++) { if (out[i]) rowsL.push(i); if (inn[i]) rowsR.push(i); }
    function lay(rows, val) {
      var unit = (bot - top - gap * (rows.length - 1)) / tot, y = top, pos = {};
      rows.forEach(function (gi) { pos[gi] = { y: y, h: Math.max(1.5, val[gi] * unit), o: 0, u: unit }; y += val[gi] * unit + gap; });
      return pos;
    }
    var PL = lay(rowsL, out), PR = lay(rowsR, inn), x0 = xl + bw / 2, x1 = xr - bw / 2, mx = (x0 + x1) / 2;
    g.globalCompositeOperation = s.add ? "lighter" : "source-over";
    rowsL.forEach(function (a) {
      rowsR.forEach(function (b) {
        v = FLOW[a][b]; if (!v) return;
        var Aa = PL[a], Bb = PR[b], h = v * Aa.u, y0 = Aa.y + Aa.o, y1 = Bb.y + Bb.o; Aa.o += h; Bb.o += h;
        var lg = g.createLinearGradient(x0, 0, x1, 0);
        lg.addColorStop(0, hexA(grCol(a, s), s.light ? 0.3 : 0.38)); lg.addColorStop(1, hexA(grCol(b, s), s.light ? 0.3 : 0.38));
        g.globalAlpha = 1; g.fillStyle = lg; g.beginPath(); g.moveTo(x0, y0); g.bezierCurveTo(mx, y0, mx, y1, x1, y1);
        g.lineTo(x1, y1 + h); g.bezierCurveTo(mx, y1 + h, mx, y0 + h, x0, y0 + h); g.closePath(); g.fill();
        if ((s.pulse || s.wave) && h > 2.5) {
          var q = (t * 0.22 + a * 0.31 + b * 0.17) % 1, u = 1 - q, ya = y0 + h / 2, yb = y1 + h / 2;
          var px = u * u * u * x0 + 3 * u * u * q * mx + 3 * u * q * q * mx + q * q * q * x1, py = u * u * u * ya + 3 * u * u * q * ya + 3 * u * q * q * yb + q * q * q * yb;
          g.fillStyle = s.pulse || s.wave; g.globalAlpha = Math.sin(q * Math.PI); g.beginPath(); g.arc(px, py, 2, 0, TAU); g.fill();
        }
      });
    });
    g.globalCompositeOperation = "source-over";
    var fs = Math.round(12.5 * fk), fs2 = Math.round(11 * fk), maxW = xl - bw - 16;
    [[rowsL, PL, out, xl, "right", -1, "graph.style.flow_from"], [rowsR, PR, inn, xr, "left", 1, "graph.style.flow_to"]].forEach(function (c) {
      g.globalAlpha = 0.6; g.fillStyle = tc; g.font = "600 " + fs2 + "px " + FONT; g.textAlign = "center";
      g.fillText(T(c[6]).toUpperCase(), c[3], top - 16 * fk);
      c[0].forEach(function (gi) {
        var P = c[1][gi], col = grCol(gi, s), lx = c[3] + c[5] * (bw / 2 + 9), my = P.y + P.h / 2, two = P.h + gap > fs + fs2 + 4;
        g.globalAlpha = 1; g.fillStyle = col; rrect(c[3] - bw / 2, P.y, bw, P.h, 4); g.fill();
        if (P.h + gap < fs * 0.9) return;
        g.fillStyle = tc; g.textAlign = c[4]; g.globalAlpha = 0.95; g.font = "600 " + fs + "px " + (s.mono ? MONO : FONT);
        g.fillText(fit(grName(GR[gi]), maxW), lx, two ? my - fs2 * 0.6 : my);
        if (two) { g.globalAlpha = 0.6; g.font = fs2 + "px " + FONT; g.fillText(T("graph.style.links_n", { n: c[2][gi] }), lx, my + fs * 0.7); }
      });
    });
    g.textBaseline = "alphabetic"; g.globalAlpha = 1;
  }

  // ---------- card board: the biggest folders, each with its three most linked notes ----------
  function the(s, t) {
    var tc = ink(s), n = Math.min(6, GR.length), cols = W > H * 1.25 ? Math.min(3, n) : Math.min(2, n), rows = Math.ceil(n / cols) || 1;
    var top = H * 0.1, areaH = H * 0.86, gapY = Math.max(8, 20 * fk), bw = Math.min(310, (W - 24) / cols - 14), bh = Math.min(220, (areaH - gapY * (rows - 1)) / rows);
    var gxp = (W - bw * cols) / (cols + 1), y0 = top + (areaH - (bh * rows + gapY * (rows - 1))) / 2, ctr = [], k, i, x, y;
    var fs = Math.round(Math.max(9.5, 12.5 * fk)), fs2 = Math.round(Math.max(8.5, 10.5 * fk));
    hits = [];
    g.globalCompositeOperation = "source-over"; g.globalAlpha = 1;
    if (s.bg && !s.dots && !s.grid) { g.fillStyle = s.light ? "rgba(0,0,0,.10)" : "rgba(255,255,255,.09)"; for (x = 12; x < W; x += 24) for (y = 12; y < H; y += 24) g.fillRect(x, y, 1.5, 1.5); }
    for (k = 0; k < n; k++) ctr.push([gxp + (k % cols) * (bw + gxp), y0 + Math.floor(k / cols) * (bh + gapY) + Math.sin(t * 0.6 + k) * 1.5]);
    PAIRS.filter(function (p) { return p.a < n && p.b < n; }).slice(0, 6).forEach(function (p, i) {
      var a = ctr[p.a], b = ctr[p.b], ax = a[0] + bw / 2, ay = a[1] + bh / 2, bx = b[0] + bw / 2, by = b[1] + bh / 2;
      var kx = (ax + bx) / 2 + (ay - by) * 0.15, ky = (ay + by) / 2 + (bx - ax) * 0.15 + 20;
      g.globalAlpha = 0.55; g.strokeStyle = s.edge === "grad" ? grCol(p.a, s) : String(s.edge).replace(/[\d.]+\)$/, "0.7)"); g.lineWidth = 1.4; g.setLineDash(s.dash || []);
      g.beginPath(); g.moveTo(ax, ay); g.quadraticCurveTo(kx, ky, bx, by); g.stroke(); g.setLineDash([]);
      if (s.pulse) { var q = (t * 0.25 + i * 0.2) % 1, u = 1 - q; g.globalAlpha = 0.9; g.fillStyle = s.pulse; g.beginPath(); g.arc(u * u * ax + 2 * u * q * kx + q * q * bx, u * u * ay + 2 * u * q * ky + q * q * by, 2.5, 0, TAU); g.fill(); }
    });
    for (k = 0; k < n; k++) {
      var G = GR[k], bx2 = ctr[k][0], by2 = ctr[k][1], col = grCol(k, s), head = Math.max(22, 34 * fk), dark = !s.light;
      if (s.light && col === "#ffffff") col = "#10131a";
      g.globalAlpha = 1; g.fillStyle = dark ? "rgba(12,14,22,.93)" : "rgba(255,255,255,.9)"; rrect(bx2, by2, bw, bh, 14); g.fill();
      g.globalAlpha = 0.45; g.strokeStyle = col; g.lineWidth = 1.2; g.stroke();
      g.globalAlpha = 0.95; g.fillStyle = col; g.beginPath(); g.arc(bx2 + 16, by2 + head / 2 + 2, 4.5, 0, TAU); g.fill();
      g.fillStyle = tc; g.font = "600 " + fs + "px " + (s.mono ? MONO : FONT); g.textAlign = "left"; g.textBaseline = "middle";
      g.fillText(fit(grName(G), bw - 96), bx2 + 28, by2 + head / 2 + 2.5);
      g.globalAlpha = 0.55; g.font = fs2 + "px " + FONT; g.textAlign = "right"; g.fillText(T("graph.style.notes_n", { n: G.count }), bx2 + bw - 12, by2 + head / 2 + 2.5);
      g.textAlign = "left";
      var ch = (bh - head - 10) / 3 - 6;
      for (i = 0; i < G.top.length; i++) {
        var a = G.top[i], cyy = by2 + head + 4 + i * (ch + 6), cxo = bx2 + 10, cw = bw - 20, hot = hotHit === a;
        g.globalAlpha = 1; g.fillStyle = dark ? (hot ? "rgba(255,255,255,.18)" : "rgba(255,255,255,.08)") : (hot ? "#eef1f8" : "#ffffff"); rrect(cxo, cyy, cw, ch, 8); g.fill();
        g.globalAlpha = hot ? 0.7 : 0.28; g.strokeStyle = dark ? "#ffffff" : "#10131a"; g.lineWidth = 1; g.stroke();
        g.globalAlpha = 1; g.fillStyle = col; rrect(cxo, cyy, 4, ch, 2); g.fill();
        var two = ch > fs + fs2 + 6;
        g.fillStyle = tc; g.globalAlpha = 0.95; g.font = "600 " + fs + "px " + FONT; g.fillText(fit(a.n.label || a.n.id, cw - 24), cxo + 13, cyy + ch / 2 - (two ? fs2 * 0.55 : 0));
        if (two) { g.globalAlpha = 0.5; g.font = fs2 + "px " + FONT; g.fillText(T("graph.style.links_n", { n: a.d }), cxo + 13, cyy + ch / 2 + fs * 0.65); }
        hits.push({ x: cxo, y: cyy, w: cw, h: ch, a: a });
      }
    }
    g.textBaseline = "alphabetic"; g.globalAlpha = 1;
  }

  // ---------- frame ----------
  function measure() {
    var w = root.clientWidth, h = root.clientHeight, d = Math.min(window.devicePixelRatio || 1, A.length > 1500 ? 1.5 : 2);
    if (w !== W || h !== H || d !== D) { W = w; H = h; D = d; cv.width = Math.round(W * D); cv.height = Math.round(H * D); }
    g.setTransform(D, 0, 0, D, 0, 0);
    sc = Math.min(W, H) * 0.47; cx = W / 2; cy = H / 2; fk = Math.max(0.72, Math.min(1, Math.min(W, H) / 520));
  }
  function draw(now) {
    var d = graphData(); if (!d) { g.clearRect(0, 0, cv.width, cv.height); return; }
    var nn = d.nodes || [], ll = d.links || [], sg = nn.length + ":" + ll.length + ":" + (nn.length ? nn[0].id + "|" + nn[nn.length - 1].id : "");
    if (sg !== sig || nn !== NODES) { sig = sg; rebuild(d); }
    measure(); if (W < 4 || H < 4) return;
    if (!t0) t0 = now;
    var t = tNow = (now - t0) / 1000, s = skinNow(), L = st.layout, jg = window.__javisGraph, lvl = 1;
    if (jg) lvl = jg._thinking ? 1 + (0.05 + 0.08 * (jg.level || 0)) * Math.sin(t * 2.4) : 1 + 0.1 * (jg.level || 0);
    backdrop(s, t);
    if (!A.length) return;
    if (L === "dong") dong(s, t); else if (L === "the") the(s, t); else graph(s, L, t, lvl);
    g.globalAlpha = 1; g.setLineDash([]); g.globalCompositeOperation = "source-over";
  }
  function shown() { return !paused && !document.hidden && root && root.clientWidth > 0 && isAlt(); }
  function loop(now) {
    raf = 0;
    if (!isAlt()) return;
    raf = requestAnimationFrame(loop);
    if (now - lastDraw < FRAME_MS || !shown()) return;
    lastDraw = now;
    try { draw(now); } catch (e) { if (window.console) console.error("graph-styles", e); }
  }
  function kick() { if (!raf && cv && isAlt()) raf = requestAnimationFrame(loop); }

  // ---------- pointer ----------
  function pos(e) { var r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
  function pick(e) {
    var p = pos(e), i, a, b = null, bd = 18, d;
    if (st.layout === "the") {
      hotHit = null;
      for (i = 0; i < hits.length; i++) { var h = hits[i]; if (p[0] >= h.x && p[0] <= h.x + h.w && p[1] >= h.y && p[1] <= h.y + h.h) hotHit = h.a; }
      hov = null; cv.style.cursor = hotHit ? "pointer" : "default"; return;
    }
    if (CUSTOM[st.layout]) { hov = null; cv.style.cursor = "default"; return; }
    for (i = 0; i < A.length; i++) { a = A[i]; if (a.skip || a.px == null) continue; d = Math.abs(a.px - p[0]) + Math.abs(a.py - p[1]); if (d < bd) { bd = d; b = a; } }
    if (b && b !== hov && skinNow().wave) fire(b, tNow);
    hov = b;
    cv.style.cursor = hov ? "pointer" : ((st.layout === "nao" || st.layout === "cau") ? "grab" : "default");
  }
  function bindPointer() {
    cv.addEventListener("pointerdown", function (e) { drag = { x: e.clientX, r: rot }; moved = false; });
    window.addEventListener("pointerup", function () { drag = null; });
    cv.addEventListener("pointermove", function (e) {
      if (drag && (st.layout === "nao" || st.layout === "cau")) {
        if (Math.abs(e.clientX - drag.x) > 4) moved = true;
        rot = drag.r + (e.clientX - drag.x) * 0.008; return;
      }
      pick(e);
    });
    cv.addEventListener("pointerleave", function () { hov = null; hotHit = null; });
    cv.addEventListener("click", function (e) {
      if (moved) { moved = false; return; }
      pick(e);
      var a = st.layout === "the" ? hotHit : hov;
      if (a && window.onGraphNodeClick) window.onGraphNodeClick(a.n);
    });
  }

  // ---------- picker ----------
  function apply(save) {
    var alt = isAlt(), s = skinNow();
    root.classList.toggle("graph-alt-on", alt);
    root.classList.toggle("graph-alt-bg", alt && !!s.bg);
    root.classList.toggle("graph-alt-light", alt && !!s.bg && !!s.light);
    root.classList.toggle("graph-alt-dark", alt && !!s.bg && !s.light);
    cv.style.display = alt ? "block" : "none";
    btn.classList.toggle("on", alt);
    hov = null; hotHit = null; hits = [];
    A.forEach(function (a) { a.px = null; });
    if (save) { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} }
    if (alt) kick();
    // back on the original view: wake it so it repaints after having been hidden
    else { try { var jg = window.__javisGraph; if (jg && jg.refit && !paused) jg.refit(0); } catch (e) {} }
    mark();
  }
  // The labelled bar under the Node / Link counter: the icon button alone is too easy to miss.
  function step(d) {
    var i = LAYOUTS.indexOf(st.layout);
    st.layout = LAYOUTS[(i + d + LAYOUTS.length) % LAYOUTS.length];
    apply(true);
  }
  function buildBar() {
    bar.textContent = "";
    function mk(cls, text, aria, fn) {
      var b = document.createElement("button"); b.type = "button"; b.className = cls;
      if (text) b.textContent = text;
      if (aria) { b.setAttribute("aria-label", aria); b.title = aria; }
      b.addEventListener("click", function (e) { e.stopPropagation(); fn(); });
      bar.appendChild(b); return b;
    }
    mk("gsb-arrow", "\u2039", T("graph.style.prev"), function () { step(-1); });
    var mid = mk("gsb-main", "", T("graph.style.btn_title"), function () { openPanel(panel.hidden); });
    var cap = document.createElement("span"); cap.className = "gsb-cap"; cap.textContent = T("graph.style.bar_label"); mid.appendChild(cap);
    barNow = document.createElement("span"); barNow.className = "gsb-now"; mid.appendChild(barNow);
    mk("gsb-arrow", "\u203a", T("graph.style.next"), function () { step(1); });
    mark();
  }
  function mark() {
    if (barNow) barNow.textContent = T("graph.style.skin." + st.skin) + " \u00b7 " + T("graph.style.layout." + st.layout);
    if (!panel) return;
    [].forEach.call(panel.querySelectorAll("button[data-k]"), function (b) {
      b.classList.toggle("on", st[b.getAttribute("data-k")] === b.getAttribute("data-v"));
    });
  }
  function build() {
    panel.textContent = "";
    function sec(titleKey, k, items, nameOf) {
      var h = document.createElement("div"); h.className = "gsp-title"; h.textContent = T(titleKey); panel.appendChild(h);
      var box2 = document.createElement("div"); box2.className = "gsp-list"; panel.appendChild(box2);
      items.forEach(function (v) {
        var b = document.createElement("button"); b.type = "button"; b.setAttribute("data-k", k); b.setAttribute("data-v", v);
        b.textContent = nameOf(v);
        b.addEventListener("click", function () { st[k] = v; apply(true); });
        box2.appendChild(b);
      });
    }
    sec("graph.style.skins", "skin", SKINS.map(function (s) { return s.id; }), function (v) { return T("graph.style.skin." + v); });
    sec("graph.style.layouts", "layout", LAYOUTS, function (v) { return T("graph.style.layout." + v); });
    var note = document.createElement("div"); note.className = "gsp-note"; note.textContent = T("graph.style.note"); panel.appendChild(note);
    var reset = document.createElement("button"); reset.type = "button"; reset.className = "gsp-reset"; reset.textContent = T("graph.style.reset");
    reset.addEventListener("click", function () { st.skin = "goc"; st.layout = "luoi"; apply(true); });
    panel.appendChild(reset);
    mark();
  }
  function openPanel(on) {
    panel.hidden = !on; btn.setAttribute("aria-expanded", on ? "true" : "false");
    if (on) build();
  }

  function init() {
    root = document.querySelector(".hud-center");
    btn = document.getElementById("graphStyleBtn");
    if (!root || !btn || !document.getElementById("graph2d")) return;
    cv = document.createElement("canvas"); cv.id = "graphAlt"; cv.style.display = "none";
    root.insertBefore(cv, document.getElementById("graph2d").nextSibling);
    g = cv.getContext("2d");
    panel = document.createElement("div"); panel.id = "graphStylePanel"; panel.className = "graph-style-panel"; panel.hidden = true;
    root.appendChild(panel);
    bar = document.createElement("div"); bar.id = "graphStyleBar"; bar.className = "graph-style-bar";
    root.appendChild(bar); buildBar();
    bindPointer();
    btn.addEventListener("click", function (e) { e.stopPropagation(); openPanel(panel.hidden); });
    panel.addEventListener("click", function (e) { e.stopPropagation(); });
    document.addEventListener("click", function () { if (!panel.hidden) openPanel(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !panel.hidden) openPanel(false); });
    window.addEventListener("javis:i18n", function () { buildBar(); if (!panel.hidden) build(); });
    window.addEventListener("javis-theme-change", function () { if (isAlt()) apply(false); });
    window.addEventListener("storage", function (e) {
      if (e.key !== KEY) return;
      try { var v = JSON.parse(e.newValue || "null"); if (v && LAYOUTS.indexOf(v.layout) >= 0 && SKINS.some(function (s) { return s.id === v.skin; })) { st.skin = v.skin; st.layout = v.layout; apply(false); } } catch (err) {}
    });
    document.addEventListener("visibilitychange", function () { if (!document.hidden) kick(); });
    // The app pauses the graph when another page is open: follow it, so nothing is drawn off screen.
    var P = window.JavisGraph && window.JavisGraph.prototype;
    if (P && !P.__altHooked) {
      var op = P.pause, ow = P.wake; P.__altHooked = true;
      P.pause = function () { paused = true; return op.apply(this, arguments); };
      P.wake = function () { paused = false; kick(); return ow.apply(this, arguments); };
    }
    apply(false);
  }

  window.JavisGraphStyles = {
    skins: SKINS.map(function (s) { return s.id; }), layouts: LAYOUTS.slice(),
    get: function () { return { skin: st.skin, layout: st.layout }; },
    set: function (skin, layout) {
      if (SKINS.some(function (s) { return s.id === skin; })) st.skin = skin;
      if (LAYOUTS.indexOf(layout) >= 0) st.layout = layout;
      if (root) apply(true);
    }
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
