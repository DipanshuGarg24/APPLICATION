(function () {
  var STORAGE_KEY = "hra-bond-form-v4";
  var THEME_KEY = "hra-bond-theme";

  var DEFAULTS = {
    fullName: "",
    appNo: "Advt156/",
    pisId: "2026AB",
    discipline: "",
    track: "",
    phone: "+91 ",
    email: "",
    joinDate: "2026-07-01",
    letterDate: "", // Populated with today's date if empty
    offerNo: "DRDO-HRV/O5(DRDS-III)56091/ADVT-156/",
    offerDate: "xx June 2026",
    hasMasters: true
  };

  var textIds = [
    "fullName",
    "appNo",
    "pisId",
    "discipline",
    "track",
    "phone",
    "email",
    "joinDate",
    "letterDate",
    "offerNo",
    "offerDate"
  ];

  // Count meaningful entries (excluding untouched starter prefixes/templates)
  function isMeaningfullyFilled(id) {
    var v = $(id).value.trim();
    if (!v) return false;
    var def = (DEFAULTS[id] || "").trim();
    if (id === "appNo" && v === "Advt156/") return false;
    if (id === "pisId" && v === "2026AB") return false;
    if (id === "phone" && (v === "+91" || v === "+91-")) return false;
    if (id === "offerNo" && v === "DRDO-HRV/O5(DRDS-III)56091/ADVT-156/") return false;
    if (id === "offerDate" && v.toLowerCase() === "xx june 2026") return false;
    if (id === "joinDate" && v === def) return true; // Default joining date counts as filled
    return true;
  }

  var reqIds = [
    "fullName",
    "appNo",
    "pisId",
    "discipline",
    "track",
    "phone",
    "email",
    "joinDate",
    "letterDate",
    "offerNo"
  ];

  var $ = function (id) {
    return document.getElementById(id);
  };
  var st = $("st");
  var mem = {};

  function getTodayISO() {
    var d = new Date();
    var mm = String(d.getMonth() + 1).padStart(2, "0");
    var dd = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + mm + "-" + dd;
  }

  // Theme initialization
  function applyTheme(t) {
    if (t === "dark" || t === "light") {
      document.documentElement.setAttribute("data-theme", t);
    }
  }
  try {
    var savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme) applyTheme(savedTheme);
  } catch (e) {}

  $("themeBtn").onclick = function () {
    var cur = document.documentElement.getAttribute("data-theme");
    var next = cur === "dark" ? "light" : "dark";
    applyTheme(next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch (e) {}
  };

  // Mobile Tab Switcher
  var tabBtns = document.querySelectorAll(".tab-btn");
  var workspace = $("workspace");
  tabBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      tabBtns.forEach(function (b) {
        b.classList.remove("active");
      });
      btn.classList.add("active");
      var view = btn.getAttribute("data-view");
      workspace.className = "workspace view-" + view;
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  function applyDefaultsToEmpty() {
    textIds.forEach(function (id) {
      if (id === "letterDate") {
        if (!$(id).value) $(id).value = getTodayISO();
      } else if ($(id).value === "" && DEFAULTS[id]) {
        $(id).value = DEFAULTS[id];
      }
    });
    if (typeof $("hasMasters").checked !== "boolean") {
      $("hasMasters").checked = DEFAULTS.hasMasters;
    }
  }

  function load() {
    var hasSaved = false;
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        mem = JSON.parse(raw) || {};
        hasSaved = true;
      }
    } catch (e) {}

    if (hasSaved) {
      textIds.forEach(function (id) {
        if (mem[id] != null) $(id).value = mem[id];
      });
      if (typeof mem.hasMasters === "boolean") {
        $("hasMasters").checked = mem.hasMasters;
      }
    }
    applyDefaultsToEmpty();
  }

  function updateProgress() {
    var filled = 0;
    reqIds.forEach(function (id) {
      if (isMeaningfullyFilled(id)) filled++;
    });
    $("progText").textContent = filled + " / " + reqIds.length + " completed";
    $("progFill").style.width = Math.round((filled / reqIds.length) * 100) + "%";
  }

  function save(silent) {
    textIds.forEach(function (id) {
      mem[id] = $(id).value;
    });
    mem.hasMasters = $("hasMasters").checked;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mem));
      if (!silent) st.textContent = "Saved locally on this device ✓";
    } catch (e) {
      st.textContent = "Browser storage restricted; download your file before closing.";
    }
    updateProgress();
    renderPreview();
  }

  textIds.forEach(function (id) {
    $(id).addEventListener("input", function () {
      save(false);
    });
    $(id).addEventListener("change", function () {
      save(false);
    });
  });

  $("hasMasters").addEventListener("change", function () {
    save(false);
  });

  function esc(s) {
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function fmtInputDate(val, fallback, isPreview) {
    if (!val) {
      return isPreview
        ? '<span class="ph">[' + fallback + "]</span>"
        : "[" + fallback + "]";
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
      var p = val.split("-");
      return p[2] + "." + p[1] + "." + p[0];
    }
    return esc(val);
  }

  function val(id, ph, isPreview) {
    var v = $(id).value.trim();
    if (v) return esc(v);
    return isPreview ? '<span class="ph">[' + ph + "]</span>" : "[" + ph + "]";
  }

  function buildBodyHTML(isPreview) {
    var jd = fmtInputDate($("joinDate").value, "Your Joining Date", isPreview);
    var ld = fmtInputDate($("letterDate").value, "Insert Date", isPreview);
    var od = fmtInputDate($("offerDate").value, "xx June 2026", isPreview);

    var fullName = val("fullName", "Your Full Name", isPreview);
    var appNo = val("appNo", "Advt156/...", isPreview);
    var pisId = val("pisId", "2026ABxxxx", isPreview);
    var discipline = val("discipline", "Discipline", isPreview);
    var offerNo = val("offerNo", "DRDO-HRV/O5(DRDS-III)56091/ADVT-156/...", isPreview);
    var phone = val("phone", "+91 XXXXXXXXXX", isPreview);
    var email = val("email", "Insert Email", isPreview);

    var tk = $("track").value;
    var arrears =
      tk === "points"
        ? "<b>~₹70,380/-</b> over the 6-month residential training period at DIAT (for officers already holding an M.Tech/Ph.D. degree undergoing 6-month Post-Induction Training / POINTS)."
        : tk === "mtech"
        ? "<b>~₹1,40,760/- (approx. ₹1.41 lakhs)</b> over the 12-month residential training period at DIAT (for officers undergoing the 2-year M.Tech Post-Induction Training / EX POINTS, with the second year at their respective labs)."
        : (isPreview
            ? '<span class="ph">[~₹1,40,760/- over 12 months (2-Year M.Tech) OR ~₹70,380/- over 6 months (6-Month POINTS)]</span>'
            : "[~₹1,40,760/- over 12 months (2-Year M.Tech) OR ~₹70,380/- over 6 months (6-Month POINTS)]") + ".";

    var trackTxt =
      tk === "points"
        ? "6-Month Post-Induction Training (POINTS)"
        : tk === "mtech"
        ? "2-Year M.Tech (EX POINTS)"
        : isPreview
        ? '<span class="ph">[2-Year M.Tech (EX POINTS) / 6-Month Post-Induction Training (POINTS)]</span>'
        : "[2-Year M.Tech (EX POINTS) / 6-Month Post-Induction Training (POINTS)]";

    var hasMasters = $("hasMasters").checked;

    var subjectBondClause = hasMasters
      ? "issuance of written policy, reasonable quantification, and transferability provisions for the proposed Service Bond, and non-applicability of the bond to Master’s degree holders"
      : "issuance of written policy, reasonable quantification, and transferability provisions for the proposed Service Bond";

    var h = [];

    h.push("<p><b>Date: " + ld + "</b></p>");
    h.push(
      "<p><b>To,</b><br>" +
        "<b>The Head of DRDO ITM Cell,</b><br>" +
        "DRDO ITM CELL, C.V. Raman Building,<br>" +
        "Defence Institute of Advanced Technology (DIAT), Girinagar, Pune – 411025</p>"
    );
    h.push(
      "<p><i>(Through Proper Channel — with a humble request to forward to the Director, ITM Mussoorie; Directorate of Human Resource &amp; Vigilance (DRDS-III), DRDO HQ, New Delhi; and CDA (R&amp;D), Pune)</i></p>"
    );
    h.push(
      "<p><b>Subject: Representation regarding (1) Admissibility and release of House Rent Allowance (HRA) with arrears w.e.f. " +
        jd +
        ", and (2) " +
        subjectBondClause +
        " — Scientist ‘B’ (Advt. No. 156).</b></p>"
    );
    h.push("<p>Respected Sir/Madam,</p>");
    h.push(
      "<p>I, <b>" +
        fullName +
        "</b>, Scientist ‘B’ (Application No. <b>" +
        appNo +
        "</b>, Discipline: <b>" +
        discipline +
        "</b>), joined DRDO on <b>" +
        jd +
        "</b> pursuant to Offer Letter No. <b>" +
        offerNo +
        "</b> dated <b>" +
        od +
        "</b>, and am currently undergoing the Post-Induction Training (POINTS) Programme at DIAT, Pune. I respectfully submit this individual representation seeking urgent administrative clarity and redressal on two critical service matters affecting my pay entitlements and contractual obligations.</p>"
    );

    // PART I
    h.push(
      '<p class="doc-part">Part I: Admissibility and Release of House Rent Allowance (HRA) with Arrears from ' +
        jd +
        "</p>"
    );

    h.push(
      '<p class="doc-sub">1. Expectation Created by Recruitment Documents &amp; Absence of Mandatory Hostel Clause:</p>'
    );
    h.push(
      "<ul>" +
        "<li><b>RAC Advertisement No. 156</b> explicitly notified that Scientist ‘B’ posts are in Pay Level-10 (Basic Pay ₹56,100/-) with <i>“Total emoluments (inclusive of HRA and all other allowances) at the time of joining will be approximately Rs. 1,00,000/- p.m. at the present metro city rate.”</i></li>" +
        "<li>Neither <b>Advertisement No. 156</b>, nor the subsequent <b>Post-Induction Training Addendum</b>, nor my <b>Offer of Appointment (Para 4 &amp; Para 9)</b> contains any stipulation that staying in the DIAT campus hostel is compulsory or that HRA shall be forfeited during the Post-Induction Training period.</li>" +
        "</ul>"
    );

    h.push(
      '<p class="doc-sub">2. Dispensation of “No Accommodation Certificate (NAC)” Requirement under MoF &amp; MoD Orders:</p>'
    );
    h.push(
      "<ul>" +
        "<li>It has been informally conveyed that HRA—which was already incorporated into the payslip from September 2026 onwards—has now been withheld on the ground that a <b>Non-Availability of Accommodation Certificate (NAC)</b> could not be obtained from the DIAT campus.</li>" +
        "<li>This objection is contrary to extant Government of India and Ministry of Defence policy:" +
        "<ul>" +
        "<li><b>Ministry of Finance (Dept. of Expenditure) O.M. No. 2/5/2017-E.IIB dated 05.03.2019</b> (<i>Swamy’s Compilation of FRSR Part V — HRA &amp; CCA</i>, General Orders) formally abolished the requirement of applying for Government accommodation and furnishing an NAC to become eligible for HRA.</li>" +
        "<li><b>CGDA Policy Letter (February 2020)</b> extended the dispensation of NAC to DAD Pool accommodations w.e.f. 05.03.2019.</li>" +
        "<li>Most conclusively, <b>Ministry of Defence (Dept. of Defence, D(Civ-I)) ID No. 4(01)/2019-D(Civ-I) dated 21.10.2026</b> (issued with MoD Finance concurrence; copy enclosed) has formally <b>dispensed with the condition of furnishing an NAC for admissibility of HRA in respect of all Defence Civilian Employees under the Ministry of Defence</b> whose pay is debitable to Defence Service Estimates.</li>" +
        "</ul></li>" +
        "<li>Consequently, withholding HRA for want of an NAC from DIAT is unsustainable under current MoD and MoF orders.</li>" +
        "</ul>"
    );

    h.push(
      '<p class="doc-sub">3. Admissibility of HRA During Training in India (FRSR Part V, Para 6(5)):</p>'
    );
    h.push(
      "<ul>" +
        "<li>Under the <b>Ministry of Finance O.M. No. 2(37)-E.II(B)/64 dated 27.11.1965</b>, as compiled in <i>Swamy’s Compilation of FRSR Part V (HRA &amp; CCA), Para 6(5)</i> (Swamy’s Handbook, <i>“Regulation of HRA during Training in India”</i>), where a Government servant undergoing training in India does <b>not</b> draw <b>Daily Allowance (under Travelling Allowance Rules)</b>—which is distinct from regular Dearness Allowance drawn on Basic Pay and Transport Allowance—HRA is fully admissible at the rate applicable to the duty/training station (Pune being an ‘X’ Class city, attracting <b>30% of Basic Pay = ₹16,830/- p.m.</b>).</li>" +
        "<li>Since I am not drawing any Tour/Training Daily Allowance under TA Rules while undergoing Post-Induction Training at DIAT, Pune, I am fully entitled to Pune ‘X’ Class HRA from the date of joining (<b>" +
        jd +
        "</b>).</li>" +
        "</ul>"
    );

    h.push(
      '<p class="doc-sub">4. DIAT Twin-Sharing Room Is Neither “Rent-Free” Nor “Subsidized Entitled Government Accommodation”:</p>'
    );
    h.push(
      "<ul>" +
        "<li>Under <i>Swamy’s Compilation of FRSR Part V, Para 4 &amp; Para 5(c)(i)</i> (<b>MoF O.M. No. 21011/13/89-E.II(B) dated 20.12.1989</b>), HRA is barred only where an employee occupies rent-free accommodation, General Pool/Defence Pool Residential Accommodation, or hostel accommodation provided by an Autonomous/Semi-Autonomous body at subsidized rent.</li>" +
        "<li>Since joining, I have been paying <b>₹170 per day (~₹5,100/- per month)</b> out of pocket to DIAT (a Deemed-to-be University) for a small twin-sharing student hostel room on the outskirts of Pune. This amounts to ~₹10,200/- per month collected per single room—which is comparable to commercial PG tariffs in the locality and far higher than the statutory licence fee for a Group ‘A’ officer’s entitled Type-IV residential quarter.</li>" +
        "<li>A twin-sharing student hostel room is drastically below the residential entitlement of a Pay Level-10 Group ‘A’ Gazetted Officer and does not constitute “Government/Defence Pool accommodation” or “subsidized rent” under FRSR Part V.</li>" +
        "<li>The recent verbal proposal to reimburse ₹170/day in lieu of ₹16,830/month HRA causes a net financial loss of <b>~₹11,730/- every month</b>, amounting to " +
        arrears +
        "</li>" +
        "<li>Moreover, this retroactively strips an allowance that was already admitted in the September 2026 pay processing. I am fully willing to continue paying the ₹170/day DIAT hostel tariff directly from my own pocket without claiming reimbursement, provided my rightful Pune ‘X’ Class HRA (with arrears w.e.f. <b>" +
        jd +
        "</b>) is released.</li>" +
        "</ul>"
    );

    // PART II
    h.push(
      '<p class="doc-part">Part II: Written Policy, Reasonable Quantification, and Fair Terms for the Service Bond</p>'
    );

    var secNum = 1;
    h.push(
      '<p class="doc-sub">' +
        secNum++ +
        ". Absence of Official Written Policy &amp; Contractual Uncertainty (Section 29, Indian Contract Act, 1872):</p>"
    );
    h.push(
      "<ul>" +
        "<li>Neither <b>Advertisement No. 156</b> nor the <b>Post-Induction Training Addendum</b> mentioned any service bond requirement.</li>" +
        "<li><b>Para 10 of the Offer Letter</b> only mentions signing <i>“a bond agreement, binding you to serve the organisation for a minimum period of 03 years, after successful completion of the training programme,”</i> without specifying any bond amount, basis of computation, surety requirement, or governing DRDO HQ policy order.</li>" +
        "<li>Despite verbal directions to execute a bond, no official DRDO HQ policy circular or approved draft bond agreement has been issued via email or formal letter. Under <b>Section 29 of the Indian Contract Act, 1872</b>, uncertain and unquantified obligations cannot be validly enforced, and executing a binding instrument requires prior written disclosure of all material terms approved by the Competent Authority.</li>" +
        "</ul>"
    );

    if (hasMasters) {
      h.push(
        '<p class="doc-sub">' +
          secNum++ +
          ". Verbal Assurance of No Service Bond for Candidates with a Master’s Degree (Legitimate Expectation &amp; Promissory Estoppel):</p>"
      );
      h.push(
        "<ul>" +
          "<li>At the time of joining the organisation, the officials concerned <b>clearly and repeatedly stated verbally</b> that <b>no service bond would be applicable to those who had already completed their Master’s degree (M.Tech or equivalent)</b>.</li>" +
          "<li>Despite this, a service bond is now being imposed on these Scientists as well, who already hold a Master’s degree, without any written order, circular, or amendment withdrawing the assurance given. No reason or policy basis for this change has been communicated.</li>" +
         "</ul>"
      );
    }

    h.push(
      '<p class="doc-sub">' +
        secNum++ +
        ". Prohibition Against Punitive Recovery of Earned Pay &amp; Allowances (Section 74, Indian Contract Act, 1872 &amp; Supreme Court Law):</p>"
    );
    h.push(
      "<ul>" +
        "<li>As expressly notified in the <b>Post-Induction Training Addendum</b>, the training period at DIAT is <b>counted as probation</b> in DRDS service. Salary and allowances drawn during this period are statutory remuneration for full-time service as a Group ‘A’ Gazetted Officer, not a gratuitous scholarship or stipend.</li>" +
        "<li>Under <b>Section 74 of the Indian Contract Act, 1872</b>, and the settled principles laid down by the Hon’ble Supreme Court—including in <b><i>Vijaya Bank &amp; Anr. v. Prashant B. Narnaware</i></b> (14.05.2025)—liquidated damages in a public-sector service bond are enforceable only when they are reasonable, proportionate to actual recruitment/training cost, disclosed transparently, and not so exorbitant or punitive as to render resignation illusory.</li>" +
        "<li>Accordingly, any bond liability must be strictly capped at the <b>actual, verifiable direct academic/training fee paid by DRDO to DIAT</b>, and <b>must NOT include recovery of Basic Pay, Dearness Allowance, or other allowances earned during service/probation</b>, nor any penal interest.</li>" +
        "</ul>"
    );

    h.push(
      '<p class="doc-sub">' + secNum++ + ". Mandatory Inclusion of Pro-Rata Reduction Clause:</p>"
    );
    h.push(
      "<ul>" +
        "<li>In consonance with principles of proportionality and <b>Article 14 of the Constitution</b>, any recoverable training cost under the bond should reduce proportionately on a <b>pro-rata basis</b> corresponding to the completed fraction of the 3-year post-training service period.</li>" +
        "</ul>"
    );

    h.push(
      '<p class="doc-sub">' +
        secNum++ +
        ". Mandatory Inclusion of Bond Transferability on Joining Other Government/PSU Posts (DoPT &amp; DPE Guidelines):</p>"
    );
    h.push(
      "<ul>" +
        "<li>Under <b>MHA/DoPT O.M. No. 70/10/60-Estt.(A) dated 09.05.1960</b>, consolidated in <b>DoPT Guidelines on Forwarding of Applications (24.11.2022)</b> (<i>Swamy’s Complete Manual on Establishment and Administration</i>, Chapter on <i>Forwarding of Applications / Enforcement of Bond</i>), <b>DoPT O.M. No. 28020/1/2010-Estt.(C) dated 17.08.2016</b> (<i>Technical Resignation &amp; Lien</i>), and the analogous policy in <b>DPE O.M. No. 15(2)/2003-DPE(GM)/GL-57 dated 29.07.2004</b>, the terms of a service bond executed by scientific and technical personnel need not be enforced if the officer applies through proper channel for another post under the Central Government, State Government, Autonomous Body, or Public Sector Undertaking; instead, the unexpired bond obligation is carried forward / transferred to the new public employer upon submission of an undertaking.</li>" +
        "<li>The draft bond must expressly incorporate this Government-mandated <b>transfer-of-bond clause</b>.</li>" +
        "</ul>"
    );

    h.push(
      '<p class="doc-sub">' +
        secNum++ +
        ". Execution Commensurate with Regularization (Offer Letter Para 1 &amp; Para 3):</p>"
    );
    h.push(
      "<ul>" +
        "<li>Per <b>Para 1</b> of the Offer Letter, my appointment is currently provisional and on an <b>ad-hoc basis up to 31.12.2026</b>, subject to unilateral termination under <b>Para 3</b>. It is respectfully submitted that execution of a multi-year binding contract should follow formal notification of the approved DRDO HQ bond policy and be aligned with the regularization of appointment.</li>" +
        "</ul>"
    );

    // PART III
    h.push('<p class="doc-part">Part III: Reliefs Respectfully Requested</p>');
    h.push(
      "<p>In view of the rules, Government orders, and legal provisions cited above, I humbly request the Competent Authority to:</p>"
    );

    var relief3 = hasMasters
      ? "<li><b>Exempt me from execution of any Service Bond</b>, as I joined with a Master’s degree, in line with the repeated verbal assurance that no bond would be applicable to Master’s degree holders; or, if the exemption has been withdrawn, provide in writing the order/policy under which it was withdrawn and the reasons for imposing the bond on this category; and</li>"
      : "";

    h.push(
      "<ol>" +
        "<li><b>Release House Rent Allowance (HRA) at Pune ‘X’ Class rate (30% of Basic Pay) along with full arrears w.e.f. " +
        jd +
        "</b>, in terms of MoD ID No. 4(01)/2019-D(Civ-I) dated 21.10.2026, MoF O.M. dated 05.03.2019, and FRSR Part V, Para 6(5)—allowing me to continue paying the ₹170/day DIAT hostel charges directly without claiming hostel fee reimbursement;</li>" +
        "<li><b>Provide a copy of any written CDA(R&amp;D) audit objection or Government Order</b>, if HRA is still sought to be denied, citing the specific statutory rule under which a paid twin-sharing student hostel room disqualifies a Level-10 Group ‘A’ officer from HRA;</li>" +
        relief3 +
        "<li><b>Circulate in writing the official DRDO HQ policy letter and approved draft Service Bond</b> before requiring execution, ensuring that: <b>(a)</b> bond liability is strictly limited to <b>actual direct training/tuition cost</b> (excluding earned salary and allowances); <b>(b)</b> a <b>pro-rata reduction clause</b> is included for partial service rendered; and <b>(c)</b> a <b>transfer-of-bond clause</b> is explicitly incorporated in accordance with DoPT O.M. dated 09.05.1960 / 24.11.2022 and O.M. dated 17.08.2016.</li>" +
        "</ol>"
    );

    h.push("<p>Thank you for your kind consideration and support.</p>");
    h.push("<p>Yours faithfully,<br><br><br><b>(Signature)</b></p>");
    h.push(
      "<p>" +
        "<b>Name:</b> " + fullName + "<br>" +
        "<b>Designation:</b> Scientist ‘B’ (POINTS Batch – Advt. No. 156)<br>" +
        "<b>Training Track:</b> " + trackTxt + "<br>" +
        "<b>PIS / Employee ID:</b> " + pisId + "<br>" +
        "<b>Contact / Email:</b> " + phone + " | " + email +
        "</p>"
    );
    h.push(
      "<p><b>Encl.:</b> <i>Copy of Ministry of Defence (Dept. of Defence, D(Civ-I)) ID No. 4(01)/2019-D(Civ-I) dated 21.10.2026 (Dispensation of NAC for admissibility of HRA).</i></p>"
    );

    return h.join("\n");
  }

  function buildWordDoc() {
    var css =
      "@page { size: A4; margin: 2cm 2cm 2cm 2cm; }" +
      "body { font-family: Calibri, Arial, sans-serif; font-size: 10.5pt; line-height: 1.35; color: #000000; }" +
      "p { margin: 0pt 0pt 6pt 0pt; text-align: justify; mso-pagination: widow-orphan; }" +
      "p.doc-part { font-weight: bold; color: #1b365d; border-bottom: 1pt solid #1b365d; padding-bottom: 2pt; margin-top: 12pt; margin-bottom: 6pt; font-size: 11pt; text-align: left; page-break-after: avoid; }" +
      "p.doc-sub { font-weight: bold; margin-top: 8pt; margin-bottom: 3pt; text-align: left; page-break-after: avoid; }" +
      "ul { margin-top: 0pt; margin-bottom: 6pt; margin-left: 22pt; padding-left: 0pt; list-style-type: disc; }" +
      "ul ul { margin-top: 2pt; margin-bottom: 2pt; margin-left: 18pt; padding-left: 0pt; list-style-type: circle; }" +
      "ol { margin-top: 0pt; margin-bottom: 6pt; margin-left: 22pt; padding-left: 0pt; }" +
      "li { margin-top: 0pt; margin-bottom: 4pt; text-align: justify; mso-pagination: widow-orphan; }";

    return (
      '<html xmlns:o="urn:schemas-microsoft-com:office:office" ' +
      'xmlns:w="urn:schemas-microsoft-com:office:word" ' +
      'xmlns="http://www.w3.org/TR/REC-html40">' +
      "<head><meta charset=\"utf-8\"><title>HRA and Bond Representation</title>" +
      "<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom></w:WordDocument></xml><![endif]-->" +
      "<style>" + css + "</style></head>" +
      "<body>" + buildBodyHTML(false) + "</body></html>"
    );
  }

  function renderPreview() {
    $("previewSheet").innerHTML = buildBodyHTML(true);
  }

  function downloadDoc() {
    save(true);
    var blob = new Blob(["\ufeff" + buildWordDoc()], {
      type: "application/msword;charset=utf-8"
    });
    var a = document.createElement("a");
    var cleanName = ($("fullName").value.trim() || "Scientist_B").replace(/[^\w]+/g, "_");
    a.href = URL.createObjectURL(blob);
    a.download = "HRA_and_Bond_Representation_" + cleanName + ".doc";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () {
      URL.revokeObjectURL(a.href);
    }, 4000);
    st.textContent = "Downloaded Word document ✓";
  }

  function printDoc() {
    save(true);
    var w = window.open("", "_blank");
    if (!w) {
      st.textContent = "Pop-up blocked — please allow pop-ups or download the .doc file.";
      return;
    }
    w.document.write(buildWordDoc());
    w.document.close();
    w.focus();
    setTimeout(function () {
      w.print();
    }, 300);
  }

  function copyDoc() {
    var temp = document.createElement("div");
    temp.innerHTML = buildBodyHTML(false);
    var plain = temp.innerText || temp.textContent;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(plain).then(function () {
        st.textContent = "Representation text copied to clipboard ✓";
      });
    } else {
      st.textContent = "Clipboard access unavailable in this browser.";
    }
  }

  // Reset to smart defaults (not blank!)
  function resetToDefaults() {
    if (!confirm("Reset all fields back to default prefixes & values?")) return;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
    textIds.forEach(function (id) {
      $(id).value = id === "letterDate" ? getTodayISO() : DEFAULTS[id];
    });
    $("hasMasters").checked = DEFAULTS.hasMasters;
    mem = {};
    save(true);
    st.textContent = "Reset to default prefixes & values ✓";
  }

  document.querySelectorAll(".dl-btn").forEach(function (b) {
    b.addEventListener("click", downloadDoc);
  });
  document.querySelectorAll(".pr-btn").forEach(function (b) {
    b.addEventListener("click", printDoc);
  });
  document.querySelectorAll(".cp-btn").forEach(function (b) {
    b.addEventListener("click", copyDoc);
  });
  document.querySelectorAll(".clr-btn").forEach(function (b) {
    b.addEventListener("click", resetToDefaults);
  });

  // Init
  load();
  updateProgress();
  renderPreview();
})();