/* =====================================================================
   JULE-SWEATERS — B2B Jule-Konfigurator
   Vanilla JavaScript. Ingen afhængigheder.
   Initialiseres automatisk på alle elementer med [data-jsk].
   ===================================================================== */
(function () {
  'use strict';

  /* ---- Hjælpere ---- */
  var daDK = new Intl.NumberFormat('da-DK');
  function fmt(n) { return daDK.format(Math.round(n)); }

  /* Basispris pr. stk: 249 kr v. 100 stk → falder lineært til 135 kr v. 1000+ stk */
  function basePrice(vol) {
    if (vol <= 100)  return 249;
    if (vol >= 1000) return 135;
    return 249 - (249 - 135) * ((vol - 100) / (1000 - 100));
  }

  /* Produkt-prisfaktor — sæt/strik koster mere, t-shirts mindre */
  var PRODUCT_FACTOR = { sweater: 1, pyjamas: 1.25, paaske: 0.95, sommer: 0.8 };
  var PRODUCT_LABEL  = { sweater: 'Julesweater', pyjamas: 'Jule- & nattøjssæt', paaske: 'Påske-kollektion', sommer: 'Sommer & hyggetøj' };
  var ADDON_LABEL    = { kort: 'Personligt hilsen-kort', gave: 'Individuel gaveindpakning', navn: 'Navn & nummer', hjem: 'Levering til hjemmeadresser', stoerrelse: 'Digital størrelses-indsamling', lager: 'Lagerføring + genbestilling' };

  /* Sæt jeres booking-link (fx Calendly). Er den tom, vises blot en kvittering. */
  var BOOKING_URL = '';

  function pricePerUnit(vol, product) {
    var factor = PRODUCT_FACTOR[product] || 1;
    return Math.round(basePrice(vol) * factor);
  }

  function init(root) {
    var $  = function (s) { return root.querySelector(s); };
    var $$ = function (s) { return Array.prototype.slice.call(root.querySelectorAll(s)); };

    /* ---- Tilstand ---- */
    var state = {
      segment:  null,   // 'company' | 'club'
      volume:   500,
      product:  null,   // 'sweater' | 'pyjamas' | 'paaske' | 'sommer'
      material: null,   // 'gots' | 'rpet'
      month:    null,
      color:    null,
      addons:   [],     // ['kort','lager', …]
      mode:     'pdf'   // 'pdf' | 'meeting'
    };

    var TOTAL_STEPS = 5;
    var current = 1;

    /* Gemmes fra showResult, så tilvalg kan genberegne totalen live */
    var calc = { unit: 0, vol: 0, prodLower: '' };

    /* ---- Elementer ---- */
    var fill      = $('.jsk__progress-fill');
    var labels    = $$('.jsk__progress-labels span');
    var steps     = $$('.jsk__step');
    var resultEl  = $('.jsk__result');

    /* ===========================================================
       NAVIGATION
       =========================================================== */
    function showStep(n) {
      current = n;
      steps.forEach(function (s) {
        s.classList.toggle('is-active', +s.dataset.step === n);
      });
      resultEl.classList.remove('is-active');
      fill.style.width = (n / TOTAL_STEPS * 100) + '%';
      labels.forEach(function (l, i) {
        l.classList.toggle('is-active', i === n - 1);
        l.classList.toggle('is-done',   i <  n - 1);
      });
      updateNavState();
      scrollIntoView();
    }

    function scrollIntoView() {
      try { root.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) {}
    }

    /* Aktivér/deaktivér "Næste"-knapper alt efter om trinnet er udfyldt */
    function stepComplete(n) {
      if (n === 1) return !!state.segment;
      if (n === 2) return !!state.product;
      if (n === 3) return !!state.material;
      if (n === 4) return !!state.month;
      if (n === 5) return !!state.color;
      return true;
    }
    function updateNavState() {
      var nextBtn = root.querySelector('.jsk__step[data-step="' + current + '"] .jsk__next');
      if (nextBtn) nextBtn.disabled = !stepComplete(current);
    }

    $$('.jsk__next').forEach(function (b) {
      b.addEventListener('click', function () {
        if (!stepComplete(current)) return;
        if (current < TOTAL_STEPS) showStep(current + 1);
        else showResult();
      });
    });
    $$('.jsk__prev').forEach(function (b) {
      b.addEventListener('click', function () {
        if (current > 1) showStep(current - 1);
      });
    });

    /* ===========================================================
       TRIN 1 — Segment & Volumen
       =========================================================== */
    var learn1 = $('#jsk-learn-1');
    var LEARN = {
      company: '<strong>Vidste du,</strong> at medarbejdergaver, der kan bruges socialt på kontoret, øger følelsen af tilhørsforhold med op til <strong>40%</strong>? Og via Happy Seasons’ <strong>Red Barnet-samarbejde</strong> donerer I samtidig et måltid til en familie i nød for hvert stk. — en CSR-historie I kan dele med hele organisationen.',
      club:    'Branded tøj er i <strong>top-3</strong> over bedst sælgende fanklub-merchandise. Det giver høj værdi for fans og en markant bedre profitmargin end standard t-shirts — og styrker klubbens identitet hele året.'
    };

    $$('[data-segment]').forEach(function (opt) {
      opt.addEventListener('click', function () {
        state.segment = opt.dataset.segment;
        $$('[data-segment]').forEach(function (o) { o.classList.remove('is-selected'); });
        opt.classList.add('is-selected');
        learn1.innerHTML = LEARN[state.segment];
        learn1.parentElement.style.display = 'flex';
        updateNavState();
      });
    });

    var range  = $('.jsk__range');
    var volOut  = $('#jsk-vol-value');
    function renderVolume() {
      var v = +range.value;
      state.volume = v;
      volOut.innerHTML = (v >= 5000 ? '5.000+' : fmt(v)) + ' <small>stk.</small>';
    }
    range.addEventListener('input', renderVolume);
    renderVolume();

    /* ===========================================================
       TRIN 2 — Produkt
       =========================================================== */
    $$('[data-product]').forEach(function (opt) {
      opt.addEventListener('click', function () {
        state.product = opt.dataset.product;
        $$('[data-product]').forEach(function (o) { o.classList.remove('is-selected'); });
        opt.classList.add('is-selected');
        updateNavState();
      });
    });

    /* ===========================================================
       TRIN 3 — Materiale & CSR
       =========================================================== */
    $$('[data-material]').forEach(function (opt) {
      opt.addEventListener('click', function () {
        state.material = opt.dataset.material;
        $$('[data-material]').forEach(function (o) { o.classList.remove('is-selected'); });
        opt.classList.add('is-selected');
        updateNavState();
      });
    });

    /* ===========================================================
       TRIN 4 — Timing
       =========================================================== */
    $$('[data-month]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.month = btn.dataset.month;
        $$('[data-month]').forEach(function (b) { b.classList.remove('is-selected'); });
        btn.classList.add('is-selected');
        updateNavState();
      });
    });

    /* ===========================================================
       TRIN 5 — Visuel præference (farve + logo)
       =========================================================== */
    $$('.jsk__swatch').forEach(function (sw) {
      sw.addEventListener('click', function () {
        state.color = sw.dataset.color;
        $$('.jsk__swatch').forEach(function (s) { s.classList.remove('is-selected'); });
        sw.classList.add('is-selected');
        updateNavState();
      });
    });

    var customInput = $('#jsk-custom-color');
    if (customInput) {
      customInput.addEventListener('input', function () {
        state.color = customInput.value;
        $$('.jsk__swatch').forEach(function (s) { s.classList.remove('is-selected'); });
        customInput.closest('.jsk__swatch-custom').style.background = customInput.value;
        customInput.closest('.jsk__swatch-custom').style.borderStyle = 'solid';
        updateNavState();
      });
    }

    /* Drag & drop logo (valgfrit) */
    var drop    = $('.jsk__drop');
    var fileIn  = $('#jsk-logo');
    var preview = $('.jsk__drop-preview');
    var defaultDropText = drop ? drop.querySelector('.jsk__drop-default') : null;

    function handleFile(file) {
      if (!file || !/^image\//.test(file.type)) return;
      var reader = new FileReader();
      reader.onload = function (e) {
        preview.querySelector('img').src = e.target.result;
        preview.querySelector('span').textContent = file.name;
        preview.style.display = 'flex';
        if (defaultDropText) defaultDropText.style.display = 'none';
      };
      reader.readAsDataURL(file);
    }
    if (drop) {
      drop.addEventListener('click', function (e) {
        if (e.target.closest('.jsk__drop-preview')) return;
        fileIn.click();
      });
      fileIn.addEventListener('change', function () { handleFile(fileIn.files[0]); });
      ['dragenter', 'dragover'].forEach(function (ev) {
        drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('is-drag'); });
      });
      ['dragleave', 'drop'].forEach(function (ev) {
        drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove('is-drag'); });
      });
      drop.addEventListener('drop', function (e) {
        if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
      });
    }

    /* ===========================================================
       TILVALG (add-ons) — opdaterer estimatet live
       =========================================================== */
    function selectedAddons() {
      return $$('.jsk__addon.is-selected').map(function (a) { return a.dataset.addon; });
    }
    function addonsPerUnit() {
      return $$('.jsk__addon.is-selected').reduce(function (sum, a) {
        return sum + (parseInt(a.dataset.price, 10) || 0);
      }, 0);
    }
    function recomputeTotal() {
      var add  = addonsPerUnit();
      var eff  = calc.unit + add;
      var volTxt = calc.vol >= 5000 ? '5.000+' : fmt(calc.vol);
      var txt = 'Estimeret samlet ordre: ' + fmt(eff * calc.vol) + ' kr. ekskl. moms (' +
                volTxt + ' stk. ' + calc.prodLower + ')';
      if (add > 0) txt += ' · inkl. tilvalg (+' + fmt(add) + ' kr./stk.)';
      $('#jsk-total-est').textContent = txt;
    }

    $$('.jsk__addon').forEach(function (a) {
      a.setAttribute('aria-pressed', 'false');
      a.addEventListener('click', function () {
        var on = a.classList.toggle('is-selected');
        a.setAttribute('aria-pressed', on ? 'true' : 'false');
        state.addons = selectedAddons();
        recomputeTotal();
      });
    });

    /* ===========================================================
       PDF vs. MØDE-bestilling
       =========================================================== */
    /* ===========================================================
       To adskilte spor: PDF  vs.  personligt møde
       =========================================================== */
    var modeTabs = $('.jsk__mode');
    var panels   = $$('.jsk__panel');
    var pdfForm  = root.querySelector('.jsk__lead-form[data-type="pdf"]');

    function setMode(mode) {
      state.mode = mode;
      $$('.jsk__mode button').forEach(function (b) {
        b.classList.toggle('is-active', b.dataset.mode === mode);
      });
      panels.forEach(function (p) {
        p.hidden = p.dataset.panel !== mode;
        p.style.display = '';
      });
    }
    $$('.jsk__mode button').forEach(function (b) {
      b.addEventListener('click', function () { setMode(b.dataset.mode); });
    });

    /* ===========================================================
       RESULTATSIDE
       =========================================================== */
    function showResult() {
      var vol   = state.volume;
      var unit  = pricePerUnit(vol, state.product);

      /* Titel + pris */
      var prodLabel = PRODUCT_LABEL[state.product] || 'tøj';
      $('#jsk-result-title').textContent = 'Her er jeres ' + prodLabel.toLowerCase() + '-beregning';
      $('#jsk-unit-price').innerHTML = fmt(unit) + ' <small>kr.</small>';
      calc.unit = unit; calc.vol = vol; calc.prodLower = prodLabel.toLowerCase();
      recomputeTotal();

      /* Klima-impact */
      var eco = $('#jsk-eco');
      if (state.material === 'rpet') {
        eco.querySelector('h3').innerHTML  = '♻️ Klima-impact';
        eco.querySelector('.jsk__rbig').textContent = '~ ' + fmt(vol * 15) + ' flasker';
        eco.querySelector('p').textContent = 'I sparer miljøet for ca. ' + fmt(vol * 15) +
          ' plastflasker, der i stedet bliver til skrigende, holdbare klubfarver.';
      } else {
        eco.querySelector('h3').innerHTML  = '🌱 Klima-impact';
        eco.querySelector('.jsk__rbig').textContent = '100% ren';
        eco.querySelector('p').textContent = 'I sikrer 100% kemikaliefri produktion i GOTS-bomuld — blød mod huden og perfekt til kontorbrug.';
      }

      /* Red Barnet / CSR-impact — 1 doneret måltid pr. stk. */
      var csr = $('#jsk-csr');
      csr.querySelector('.jsk__rbig').textContent = fmt(vol) + ' måltider';
      csr.querySelector('p').textContent =
        'Med jeres ordre donerer Happy Seasons ca. ' + fmt(vol) +
        ' måltider til familier i nød via Red Barnet-samarbejdet.';

      /* Profit (kun sportsklub) */
      var profit = $('#jsk-profit');
      if (state.segment === 'club') {
        var perUnitProfit = Math.max(399 - unit, 0);
        profit.style.display = '';
        profit.querySelector('.jsk__rbig').textContent = fmt(perUnitProfit * vol) + ' kr.';
        profit.querySelector('p').textContent =
          'Sælger I til 399 kr. i fanshoppen, er jeres estimerede klubfortjeneste ' +
          fmt(perUnitProfit) + ' kr. pr. stk.';
      } else {
        profit.style.display = 'none';
      }

      /* Opsummering-chips */
      var segLabel = state.segment === 'club' ? 'Sportsklub' : 'Virksomhed';
      var matLabel = state.material === 'rpet' ? 'rPET (genanvendt)' : 'GOTS-bomuld';
      var chips = $('.jsk__summary');
      chips.innerHTML =
        chip('👥', segLabel) +
        chip('👕', PRODUCT_LABEL[state.product] || '') +
        chip('📦', (vol >= 5000 ? '5.000+' : fmt(vol)) + ' stk.') +
        chip('🧵', matLabel) +
        (state.month ? chip('🗓️', state.month) : '') +
        (state.color ? '<span class="jsk__chip"><span style="width:14px;height:14px;border-radius:50%;display:inline-block;border:1px solid #ccc;background:' + state.color + '"></span>Brandfarve</span>' : '');

      /* Forhåndsudfyld PDF-formularen med konfigurationen */
      if (pdfForm) {
        if (pdfForm.elements['antal'])    pdfForm.elements['antal'].value = vol;
        if (pdfForm.elements['levering'] && state.month) pdfForm.elements['levering'].value = state.month;
      }

      /* Vis */
      steps.forEach(function (s) { s.classList.remove('is-active'); });
      resultEl.classList.add('is-active');
      fill.style.width = '100%';
      labels.forEach(function (l) { l.classList.remove('is-active'); l.classList.add('is-done'); });
      scrollIntoView();
    }

    function chip(icon, text) {
      return '<span class="jsk__chip">' + icon + ' ' + text + '</span>';
    }

    /* ---- Tilbage fra resultat til redigering ---- */
    var editBtn = $('.jsk__edit');
    if (editBtn) editBtn.addEventListener('click', function () { showStep(TOTAL_STEPS); });

    /* ===========================================================
       LEAD CAPTURE — én handler, to adskilte formularer
       =========================================================== */
    var forms  = $$('.jsk__lead-form');
    var thanks = $('.jsk__thanks');

    function buildLead(form, type) {
      var val = function (n) { return form.elements[n] ? form.elements[n].value.trim() : ''; };
      var common = {
        kontaktperson: val('navn'),
        rolle:         val('rolle'),
        firma:         val('firma'),
        email:         val('email'),
        telefon:       val('telefon'),
        besked:        val('besked'),
        samtykke:      form.elements['samtykke'] ? form.elements['samtykke'].checked : false,
        tilvalg:       state.addons.map(function (id) { return ADDON_LABEL[id] || id; }),
        konfiguration: {
          segment: state.segment, volumen: state.volume, produkt: state.product,
          materiale: state.material, maaned: state.month, farve: state.color,
          prisPrStk: pricePerUnit(state.volume, state.product),
          tilvalgPrStk: addonsPerUnit()
        }
      };
      if (type === 'meeting') {
        common.type           = 'mødebooking';
        common.moedeform      = val('moedeform');
        common.moedetidspunkt = val('moedetid');
      } else {
        common.type             = 'designs+pdf';
        common.cvr              = val('cvr');
        common.ean              = val('ean');
        common.antal            = val('antal');
        common.leveringsperiode = val('levering');
        common.budget           = val('budget');
        common.oensker_stofproeve = form.elements['proeve'] ? form.elements['proeve'].checked : false;
      }
      return common;
    }

    forms.forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!form.checkValidity()) { form.reportValidity(); return; }

        var type = form.dataset.type;            // 'pdf' | 'meeting'
        var lead = buildLead(form, type);

        /* >>> Her sendes lead'et videre i et rigtigt setup (fetch til CRM/Shopify/Klaviyo).
               For demoen logger vi blot og viser kvittering. <<< */
        if (window.console) console.log('JULE-SWEATERS LEAD:', lead);
        /* Eksempel:
           fetch('/api/lead', {method:'POST', headers:{'Content-Type':'application/json'},
                               body: JSON.stringify(lead)});
        */

        var tTitle = $('.jsk__thanks-title');
        var tText  = $('.jsk__thanks-text');
        if (type === 'meeting') {
          /* Personligt møde: åbn evt. eksternt booking-link (Calendly o.l.) */
          var opened = false;
          if (BOOKING_URL) { window.open(BOOKING_URL, '_blank', 'noopener'); opened = true; }
          tTitle.textContent = 'Tak — vi glæder os til at mødes!';
          tText.textContent = opened
            ? 'Vi har åbnet vores kalender i en ny fane — vælg det tidspunkt der passer jer.'
            : 'En B2B-specialist bekræfter jeres møde på ' + lead.email + ' inden for 1 hverdag.';
        } else {
          tTitle.textContent = 'Tak! Vi er i gang.';
          tText.textContent = 'Jeres 3 designudkast og PDF-estimat sendes til ' + lead.email + ' inden for 1 hverdag.';
        }

        if (modeTabs) modeTabs.style.display = 'none';
        panels.forEach(function (p) { p.style.display = 'none'; });
        thanks.classList.add('is-active');
      });
    });

    /* ---- Genstart ---- */
    var restart = $('.jsk__restart');
    if (restart) restart.addEventListener('click', function () {
      state.segment = state.product = state.material = state.month = state.color = null;
      state.volume = 500;
      state.addons = [];
      $$('.is-selected').forEach(function (el) { el.classList.remove('is-selected'); });
      $$('.jsk__addon').forEach(function (a) { a.setAttribute('aria-pressed', 'false'); });
      if (learn1) { learn1.innerHTML = ''; learn1.parentElement.style.display = 'none'; }
      if (preview) preview.style.display = 'none';
      if (defaultDropText) defaultDropText.style.display = '';
      range.value = 500; renderVolume();
      forms.forEach(function (f) { f.reset(); });
      if (modeTabs) modeTabs.style.display = '';
      thanks.classList.remove('is-active');
      setMode('pdf');
      showStep(1);
    });

    /* ---- Init ---- */
    setMode('pdf');
    showStep(1);
  }

  /* Auto-init */
  document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.forEach.call(document.querySelectorAll('[data-jsk]'), init);
  });
})();
