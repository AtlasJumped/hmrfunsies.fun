(function () {
  "use strict";
  var SITES = ["universemodel.ai", "claudebomb.com", "hmrfamily.life", "reactionapp.life", "endgame.life", "chronomath.ai", "hmrphysics.life", "hmrmath.life", "hmrscience.life", "hmruniverse.life", "hmrfascia.life", "hmrlanguage.life", "personaldash.life", "workdash.life"];
  var EFFECTS = [["float","Float"],["tilt","Tilt"],["drop","Drop"],["magnet","Magnet"],["balls","Balls"],["bubbles","Bubbles"],["tensegrity","Tensegrity toy"],["lightning","Lightning"],["missiles","Missiles"],["rocket","Rocket"],["burn","Burn"],["dragons","Dragons"],["drones","Drones"],["meteors","Meteors"],["ufo","UFO"],["sea","Sea"],["bees","Bees"],["melt","Melt"],["spartans","Marchers"],["ants","Ants"],["blackhole","Black hole"],["earthquake","Earthquake"],["tornado","Tornado"],["snow","Snow"],["confetti","Confetti"],["fireworks","Fireworks"],["paint","Paint"],["flip","Flip"],["words","Words"],["laser","Laser"],["rubber","Rubber"],["wreck","Wreck"],["slime","Slime"],["disco","Disco"]];
  function el(t, a, kids) {
    var e = document.createElement(t), k;
    for (k in (a || {})) { if (k === "text") e.textContent = a[k]; else e.setAttribute(k, a[k]); }
    (kids || []).forEach(function (c) { e.appendChild(c); });
    return e;
  }
  function store(get, k, v) { try { return get ? localStorage.getItem(k) : localStorage.setItem(k, v); } catch (e) { return null; } }

  /* footer */
  var foot = document.getElementById("footlinks");
  SITES.forEach(function (h) {
    foot.appendChild(el("li", {}, [el("a", { href: "https://" + h, text: h })]));
  });

  /* play overlay: the dock's own full screen overlay (has open in new tab) */
  Array.prototype.forEach.call(document.querySelectorAll("[data-open]"), function (b) {
    b.addEventListener("click", function () {
      if (window.HMRDock && window.HMRDock.play) window.HMRDock.play(b.getAttribute("data-open"));
      else window.open(b.nextElementSibling.href, "_blank", "noopener");
    });
  });

  /* wreck buttons: each calls a dock effect by name; if the dock lacks it, open the Funsies menu */
  var wreck = document.getElementById("wreck");
  EFFECTS.forEach(function (f) {
    var b = el("button", { type: "button", "class": "wbtn", "data-fx": f[0], text: f[1] });
    b.addEventListener("click", function () {
      var d = window.HMRDock;
      if (!d) return;
      if (d.effects && d.effects.indexOf(f[0]) >= 0) d.funsies(f[0]); else d.openFunsies();
    });
    wreck.appendChild(b);
  });
  wreck.appendChild(function () {
    var b = el("button", { type: "button", "class": "wbtn", text: "More fun menu" });
    b.addEventListener("click", function () { if (window.HMRDock) window.HMRDock.openFunsies(); });
    return b;
  }());

  /* design picker: 3 looks, four-level rating */
  var DESIGNS = ["Sunrise", "Meadow", "Grape"];
  var LEVELS = [["strong like", "Strong like"], ["like", "Like"], ["dislike", "Dislike"], ["strong dislike", "Strong dislike"]];
  var KEY = "hmrfunsies.ratings.v1", ratings = {};
  try { ratings = JSON.parse(store(true, KEY) || "{}") || {}; } catch (e) { ratings = {}; }
  var design = parseInt(new URLSearchParams(location.search).get("design"), 10);
  if (!(design >= 1 && design <= 3)) design = parseInt(store(true, "hmrfunsies.design"), 10);
  if (!(design >= 1 && design <= 3)) design = 1;
  var pk = document.getElementById("picker");
  var openBtn = el("button", { type: "button", "class": "pk-open", "aria-expanded": "false", "aria-controls": "pk-panel", text: "Design" });
  var panel = el("div", { "class": "pk-panel", id: "pk-panel", role: "region", "aria-label": "Design picker", hidden: "" });
  pk.appendChild(panel); pk.appendChild(openBtn);
  function save() { store(false, KEY, JSON.stringify(ratings)); }
  function msg(t) { var m = document.getElementById("pk-msg"); if (m) m.textContent = t; }
  function closePanel() { panel.setAttribute("hidden", ""); openBtn.setAttribute("aria-expanded", "false"); openBtn.focus(); }
  function copyAll() {
    var out = ["hmrfunsies.fun design ratings"];
    DESIGNS.forEach(function (n, i) { var r = ratings[i + 1] || {}; out.push((i + 1) + " " + n + ": " + (r.level || "not rated") + (r.note ? " | note: " + r.note : "")); });
    var t = out.join("\n");
    function fb() { var ta = el("textarea", { "aria-hidden": "true" }); ta.value = t; ta.style.cssText = "position:fixed;left:-999px"; document.body.appendChild(ta); ta.select(); var ok = false; try { ok = document.execCommand("copy"); } catch (e) {} document.body.removeChild(ta); msg(ok ? "Copied." : "Could not copy. Select the text in the note box instead."); }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(function () { msg("Copied."); }, fb); else fb();
  }
  function render() {
    document.documentElement.setAttribute("data-design", String(design));
    store(false, "hmrfunsies.design", String(design));
    panel.textContent = "";
    var top = el("div", { "class": "pk-top" }, [el("b", { text: "Pick a design" }), el("button", { type: "button", "class": "btn", text: "Close" })]);
    top.lastChild.addEventListener("click", closePanel);
    panel.appendChild(top);
    var row = el("div", { "class": "pk-designs", role: "group", "aria-label": "Designs" });
    DESIGNS.forEach(function (n, i) {
      var b = el("button", { type: "button", "aria-pressed": String(design === i + 1), text: (i + 1) + " " + n });
      b.addEventListener("click", function () {
        design = i + 1;
        try { history.replaceState(null, "", "?design=" + design); } catch (e) {}
        render(); panel.querySelector(".pk-designs button[aria-pressed=true]").focus();
      });
      row.appendChild(b);
    });
    panel.appendChild(row);
    var r = ratings[design] || {};
    var fs = el("fieldset"); fs.appendChild(el("legend", { text: "Your rating of design " + design }));
    LEVELS.forEach(function (l) {
      var inp = el("input", { type: "radio", name: "rate", value: l[0] });
      if (r.level === l[0]) inp.checked = true;
      inp.addEventListener("change", function () { ratings[design] = ratings[design] || {}; ratings[design].level = l[0]; save(); msg("Saved."); });
      fs.appendChild(el("label", {}, [inp, document.createTextNode(" " + l[1])]));
    });
    panel.appendChild(fs);
    var ta = el("textarea", { id: "pk-note", maxlength: "500" }); ta.value = r.note || "";
    ta.addEventListener("input", function () { ratings[design] = ratings[design] || {}; ratings[design].note = ta.value; save(); });
    panel.appendChild(el("label", { "for": "pk-note", text: "Note (optional)" })); panel.appendChild(ta);
    var cp = el("button", { type: "button", "class": "btn primary", text: "Copy all ratings" });
    cp.addEventListener("click", copyAll);
    panel.appendChild(el("p", {}, [cp]));
    panel.appendChild(el("p", { "class": "pk-msg", id: "pk-msg", role: "status" }));
  }
  openBtn.addEventListener("click", function () {
    var open = panel.hasAttribute("hidden");
    if (open) { panel.removeAttribute("hidden"); openBtn.setAttribute("aria-expanded", "true"); } else closePanel();
  });
  render();
})();
