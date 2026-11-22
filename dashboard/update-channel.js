// tttos: update channel picker. Adds a dropdown under the version line in Settings and Overview
// so each machine chooses which line of updates it follows (general, service, commerce).
// Own file on purpose: the upstream update panel code stays untouched.
(function () {
  var data = null, loading = null;

  function load(force) {
    if (data && !force) return Promise.resolve(data);
    if (loading) return loading;
    loading = fetch("/update/channel", { cache: "no-store" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { data = j; loading = null; return j; })
      .catch(function () { loading = null; return null; });
    return loading;
  }

  function build(meta) {
    var box = document.createElement("div");
    box.className = "tttos-upd-channel";
    box.style.cssText = "margin-top:8px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:13px";
    var label = document.createElement("span");
    function T(k) { return window.t ? window.t(k) : k; }
    function lab() { label.textContent = T("update.channel.label"); }
    lab(); window.addEventListener("javis:i18n", lab);
    var sel = document.createElement("select");
    sel.style.cssText = "padding:4px 8px;border-radius:6px";
    var note = document.createElement("span");
    note.style.opacity = "0.75";
    box.appendChild(label); box.appendChild(sel); box.appendChild(note);
    meta.parentNode.insertBefore(box, meta.nextSibling);

    load(false).then(function (j) {
      if (!j || !j.channels) { box.remove(); return; }
      j.channels.forEach(function (c) {
        var o = document.createElement("option");
        o.value = c.id; o.textContent = c.label;
        if (c.id === j.current) o.selected = true;
        sel.appendChild(o);
      });
      if (j.locked_by_env) {
        sel.disabled = true;
        note.textContent = T("update.channel.locked");
      }
    });

    sel.addEventListener("change", function () {
      note.textContent = T("update.channel.saving");
      fetch("/update/channel", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel: sel.value })
      }).then(function (r) { return r.json(); }).then(function (j) {
        if (j && j.ok) {
          data = j;
          note.textContent = T("update.channel.saved");
        } else { note.textContent = T("update.channel.save_failed"); }
      }).catch(function () { note.textContent = T("update.channel.network_error"); });
    });
  }

  function scan() {
    ["updVerMeta", "ovVerMeta"].forEach(function (id) {
      var meta = document.getElementById(id);
      if (!meta || !meta.parentNode) return;
      var next = meta.nextElementSibling;
      if (next && next.classList && next.classList.contains("tttos-upd-channel")) return;
      build(meta);
    });
  }

  function start() {
    scan();
    var pending = false;
    new MutationObserver(function () {
      if (pending) return;
      pending = true;
      setTimeout(function () { pending = false; scan(); }, 300);
    }).observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
