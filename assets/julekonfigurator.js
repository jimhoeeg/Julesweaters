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
      color:    null
    };

    var TOTAL_STEPS = 5;
    var current = 1;

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
       RESULTATSIDE
       =========================================================== */
    function showResult() {
      var vol   = state.volume;
      var unit  = pricePerUnit(vol, state.product);

      /* Titel + pris */
      var prodLabel = PRODUCT_LABEL[state.product] || 'tøj';
      $('#jsk-result-title').textContent = 'Her er jeres ' + prodLabel.toLowerCase() + '-beregning';
      $('#jsk-unit-price').innerHTML = fmt(unit) + ' <small>kr.</small>';
      $('#jsk-total-est').textContent =
        'Estimeret samlet ordre: ' + fmt(unit * vol) + ' kr. ekskl. moms (' +
        (vol >= 5000 ? '5.000+' : fmt(vol)) + ' stk. ' + prodLabel.toLowerCase() + ')';

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

      /* Forhåndsudfyld B2B-formularen med konfigurationen */
      if (form) {
        if (form.elements['antal'])    form.elements['antal'].value = vol;
        if (form.elements['levering'] && state.month) form.elements['levering'].value = state.month;
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
       LEAD CAPTURE
       =========================================================== */
    var form = $('.jsk__lead-form');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();

        /* Simpel HTML5-validering inkl. påkrævet samtykke */
        if (!form.checkValidity()) { form.reportValidity(); return; }

        var val = function (n) { return form.elements[n] ? form.elements[n].value.trim() : ''; };
        var lead = {
          kontaktperson: val('navn'),
          rolle:         val('rolle'),
          firma:         val('firma'),
          cvr:           val('cvr'),
          email:         val('email'),
          telefon:       val('telefon'),
          ean:           val('ean'),
          antal:         val('antal'),
          leveringsperiode: val('levering'),
          budget:        val('budget'),
          besked:        val('besked'),
          oensker_stofproeve: form.elements['proeve'] ? form.elements['proeve'].checked : false,
          samtykke:      form.elements['samtykke'] ? form.elements['samtykke'].checked : false,
          konfiguration: {
            segment: state.segment, volumen: state.volume, produkt: state.product,
            materiale: state.material, maaned: state.month,
            farve: state.color, prisPrStk: pricePerUnit(state.volume, state.product)
          }
        };

        /* >>> Her sendes lead'et videre i et rigtigt setup (fetch til CRM/Shopify/Klaviyo).
               For demoen logger vi blot og viser kvittering. <<< */
        if (window.console) console.log('JULE-SWEATERS LEAD:', lead);
        /* Eksempel:
           fetch('/api/lead', {method:'POST', headers:{'Content-Type':'application/json'},
                               body: JSON.stringify(lead)});
        */

        form.style.display = 'none';
        $('.jsk__thanks').classList.add('is-active');
      });
    }

    /* ---- Genstart ---- */
    var restart = $('.jsk__restart');
    if (restart) restart.addEventListener('click', function () {
      state.segment = state.product = state.material = state.month = state.color = null;
      state.volume = 500;
      $$('.is-selected').forEach(function (el) { el.classList.remove('is-selected'); });
      if (learn1) { learn1.innerHTML = ''; learn1.parentElement.style.display = 'none'; }
      if (preview) preview.style.display = 'none';
      if (defaultDropText) defaultDropText.style.display = '';
      range.value = 500; renderVolume();
      if (form) { form.style.display = ''; form.reset(); }
      $('.jsk__thanks').classList.remove('is-active');
      showStep(1);
    });

    /* ---- Init ---- */
    showStep(1);
  }

  /* Auto-init */
  document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.forEach.call(document.querySelectorAll('[data-jsk]'), init);
  });
})();
