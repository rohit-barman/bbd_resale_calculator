(() => {
  // Change these thresholds if your resale strategy changes.
  const BUY_MARGIN = 8;
  const NEGOTIATE_MARGIN = 4;

  const STORAGE_KEY = "bbd_phones";

  let selected = null;

  /*
   * Load saved phones from localStorage.
   *
   * phones.js provides the default phones array.
   * If localStorage contains saved data, it replaces
   * the default data.
   */
  function loadSavedPhones() {
    const savedPhones = localStorage.getItem(STORAGE_KEY);

    if (!savedPhones) {
      return;
    }

    try {
      const parsedPhones = JSON.parse(savedPhones);

      if (!Array.isArray(parsedPhones)) {
        return;
      }

      phones.length = 0;
      phones.push(...parsedPhones);
    } catch (error) {
      console.error("Unable to load saved phone data:", error);
    }
  }

  /*
   * Save current phones to localStorage.
   */
  function savePhones() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(phones));
    } catch (error) {
      console.error("Unable to save phone data:", error);
    }
  }

  const $ = (id) => document.getElementById(id);

  const money = (value) =>
    "₹" + Math.round(Number(value) || 0).toLocaleString("en-IN");

  function numberValue(id, fallback = 0) {
    const value = Number($(id).value);

    return Number.isFinite(value) && value >= 0 ? value : fallback;
  }

  function renderPhones() {
    const query = $("search").value.trim().toLowerCase();

    const list = $("phoneList");

    list.innerHTML = "";

    phones
      .filter((phone) =>
        `${phone.name} ${phone.category}`.toLowerCase().includes(query),
      )
      .forEach((phone) => {
        const row = document.createElement("div");

        row.className = "phone" + (selected?.id === phone.id ? " active" : "");

        row.tabIndex = 0;

        row.innerHTML = `
          <div class="phone-name">
            ${phone.name}
          </div>

          <div class="phone-meta">
            ${phone.category}
            · Market selling price:
            ${money(phone.marketPrice)}
          </div>
        `;

        row.addEventListener("click", () => selectPhone(phone));

        row.addEventListener("keydown", (event) => {
          if (event.key === "Enter") {
            selectPhone(phone);
          }
        });

        list.appendChild(row);
      });

    if (!list.children.length) {
      list.innerHTML = `
        <div class="muted">
          No phones found.
        </div>
      `;
    }
  }

  function selectPhone(phone) {
    selected = phone;

    $("selectedName").textContent = phone.name;

    $("marketText").textContent =
      "Expected local market selling price: " + money(phone.marketPrice);

    // Automatically copy phone name and category
    const copyText = `${phone.name}\n${phone.category}`;

    navigator.clipboard
      .writeText(copyText)
      .then(() => {
        console.log("Phone details copied:", copyText);
      })
      .catch((error) => {
        console.error("Unable to copy phone details:", error);
      });

    renderPhones();

    calculate();

    // Scroll to calculator section after selecting a phone
    $("selectedName").scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function calculate() {
    if (!selected) {
      return;
    }

    const buyPrice = numberValue("buyPrice");

    const discount = numberValue("discount");

    const cashback = numberValue("cashback");

    const units = Math.max(1, Math.floor(numberValue("units", 1)));

    const effectiveCost = Math.max(0, buyPrice - discount - cashback);

    const profit = selected.marketPrice - effectiveCost;

    const profitPercent =
      effectiveCost > 0 ? (profit / effectiveCost) * 100 : 0;

    $("effective").textContent = money(effectiveCost);

    $("profit").textContent = money(profit);

    $("profitPct").textContent =
      (Number.isFinite(profitPercent) ? profitPercent : 0).toFixed(2) + "%";

    $("totalProfit").textContent = money(profit * units);

    const decision = $("decision");

    decision.className = "decision";

    if (effectiveCost <= 0) {
      decision.classList.add("neutral");

      decision.textContent = "Enter a valid BBD purchase price.";

      return;
    }

    if (profitPercent >= BUY_MARGIN) {
      decision.classList.add("buy");

      decision.textContent = `BUY — margin is ${profitPercent.toFixed(2)}%`;
    } else if (profitPercent >= NEGOTIATE_MARGIN) {
      decision.classList.add("negotiate");

      decision.textContent = `NEGOTIATE — margin is ${profitPercent.toFixed(2)}%`;
    } else {
      decision.classList.add("skip");

      decision.textContent = `SKIP — margin is only ${profitPercent.toFixed(2)}%`;
    }
  }

  /*
   * Export the current phone list as JSON.
   */
  function exportJson() {
    const json = JSON.stringify(phones, null, 2);

    const blob = new Blob([json], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = "phones.json";

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);
  }

  /*
   * Initialize saved phone data
   * before rendering the calculator.
   */
  loadSavedPhones();

  ["buyPrice", "discount", "cashback", "units"].forEach((id) => {
    $(id).addEventListener("input", calculate);
  });

  $("search").addEventListener("input", renderPhones);

  $("exportBtn").addEventListener("click", exportJson);

  renderPhones();
})();
