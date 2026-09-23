(() => {
  const STORAGE_KEY = "bbd_phones";

  let phoneData = [];
  let editingId = null;

  const $ = (id) => document.getElementById(id);

  const money = (value) =>
    "₹" + Math.round(Number(value) || 0).toLocaleString("en-IN");

  /*
   * ----------------------------------------
   * Load phones
   * ----------------------------------------
   *
   * 1. First check localStorage.
   * 2. If localStorage has data, use it.
   * 3. Otherwise use phones.js.
   */
  function loadPhones() {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      try {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          phoneData = parsed.map((phone) => ({
            id: Number(phone.id),
            name: String(phone.name || "").trim(),
            category: String(phone.category || "").trim(),
            marketPrice: Number(phone.marketPrice) || 0,
          }));

          return;
        }
      } catch (error) {
        console.error("Invalid saved phone data:", error);
      }
    }

    /*
     * No localStorage data.
     * Use the original phones.js data.
     */
    phoneData = phones.map((phone) => ({
      id: Number(phone.id),
      name: phone.name,
      category: phone.category,
      marketPrice: Number(phone.marketPrice) || 0,
    }));
  }

  /*
   * ----------------------------------------
   * Save phones to localStorage
   * ----------------------------------------
   */
  function savePhones() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(phoneData));

      /*
       * Keep global phones variable
       * synchronized as well.
       */
      phones.length = 0;
      phones.push(...phoneData);

      renderPhones();
    } catch (error) {
      console.error("Unable to save phone data:", error);

      alert("Unable to save phone data.");
    }
  }

  /*
   * ----------------------------------------
   * Show status message
   * ----------------------------------------
   */
  function showStatus(message) {
    const status = $("status");

    if (!status) {
      return;
    }

    status.textContent = message;

    status.style.display = "block";

    setTimeout(() => {
      status.style.display = "none";
    }, 2500);
  }

  /*
   * ----------------------------------------
   * Render phone table
   * ----------------------------------------
   */
  function renderPhones() {
    const tbody = $("phoneTableBody");

    if (!tbody) {
      return;
    }

    tbody.innerHTML = "";

    $("phoneCount").textContent = phoneData.length;

    if (phoneData.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td
            colspan="5"
            style="text-align:center;"
          >
            No phones found.
          </td>
        </tr>
      `;

      return;
    }

    phoneData.forEach((phone) => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>
          ${escapeHtml(phone.name)}
        </td>

        <td>
          ${escapeHtml(phone.category)}
        </td>

        <td>
          ${money(phone.marketPrice)}
        </td>

        <td>
          <div class="table-actions">

            <button
              type="button"
              class="edit-btn icon-btn"
              data-id="${phone.id}"
              title="Edit phone"
              aria-label="Edit ${escapeHtml(phone.name)}"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M12 20h9"/>
                <path
                  d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"
                />
              </svg>
            </button>

            <button
              type="button"
              class="delete-btn icon-btn"
              data-id="${phone.id}"
              title="Delete phone"
              aria-label="Delete ${escapeHtml(phone.name)}"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M3 6h18"/>
                <path d="M8 6V4h8v2"/>
                <path d="M19 6l-1 14H6L5 6"/>
                <path d="M10 11v5"/>
                <path d="M14 11v5"/>
              </svg>
            </button>

          </div>
        </td>
      `;

      tbody.appendChild(row);
    });

    /*
     * Edit buttons
     */
    tbody.querySelectorAll(".edit-btn").forEach((button) => {
      button.addEventListener("click", () => {
        const id = Number(button.dataset.id);

        editPhone(id);
      });
    });

    /*
     * Delete buttons
     */
    tbody.querySelectorAll(".delete-btn").forEach((button) => {
      button.addEventListener("click", () => {
        const id = Number(button.dataset.id);

        deletePhone(id);
      });
    });
  }

  /*
   * ----------------------------------------
   * Escape HTML
   * ----------------------------------------
   */
  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /*
   * ----------------------------------------
   * Add / Update phone
   * ----------------------------------------
   */
  $("phoneForm").addEventListener("submit", (event) => {
    event.preventDefault();

    const name = $("phoneName").value.trim();

    const category = $("phoneCategory").value.trim();

    const marketPrice = Number($("marketPrice").value);

    if (!name) {
      alert("Please enter phone name.");

      return;
    }

    if (!category) {
      alert("Please enter category.");

      return;
    }

    if (!Number.isFinite(marketPrice) || marketPrice < 0) {
      alert("Please enter a valid market price.");

      return;
    }

    /*
     * Update existing phone
     */
    if (editingId !== null) {
      const phone = phoneData.find(
        (item) => Number(item.id) === Number(editingId),
      );

      if (!phone) {
        return;
      }

      phone.name = name;

      phone.category = category;

      phone.marketPrice = marketPrice;

      savePhones();

      showStatus("Phone updated successfully.");
    } else {
      /*
       * Add new phone
       */
      const nextId =
        phoneData.length > 0
          ? Math.max(...phoneData.map((phone) => Number(phone.id) || 0)) + 1
          : 1;

      phoneData.push({
        id: nextId,
        name: name,
        category: category,
        marketPrice: marketPrice,
      });

      savePhones();

      showStatus("Phone added successfully.");
    }

    resetForm();
  });

  /*
   * ----------------------------------------
   * Edit phone
   * ----------------------------------------
   */
  function editPhone(id) {
    const phone = phoneData.find((item) => Number(item.id) === Number(id));

    if (!phone) {
      return;
    }

    editingId = Number(id);

    $("phoneName").value = phone.name;

    $("phoneCategory").value = phone.category;

    $("marketPrice").value = phone.marketPrice;

    $("saveBtn").textContent = "Update Phone";

    $("cancelBtn").style.display = "inline-block";

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  /*
   * ----------------------------------------
   * Delete phone
   * ----------------------------------------
   */
  function deletePhone(id) {
    const phone = phoneData.find((item) => Number(item.id) === Number(id));

    if (!phone) {
      return;
    }

    const confirmed = confirm(
      `Are you sure you want to delete "${phone.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    phoneData = phoneData.filter((item) => Number(item.id) !== Number(id));

    savePhones();

    resetForm();

    showStatus("Phone deleted successfully.");
  }

  /*
   * ----------------------------------------
   * Cancel editing
   * ----------------------------------------
   */
  $("cancelBtn").addEventListener("click", resetForm);

  /*
   * ----------------------------------------
   * Reset form
   * ----------------------------------------
   */
  function resetForm() {
    editingId = null;

    $("phoneForm").reset();

    $("saveBtn").textContent = "Add Phone";

    $("cancelBtn").style.display = "none";
  }

  /*
   * ----------------------------------------
   * Export phones.js
   * ----------------------------------------
   */
  function exportJson() {
    try {
      const savedPhones = localStorage.getItem(STORAGE_KEY);

      if (!savedPhones) {
        alert("No phone data found in localStorage.");
        return;
      }

      const phonesFromStorage = JSON.parse(savedPhones);

      if (!Array.isArray(phonesFromStorage)) {
        throw new Error("Invalid phone data in localStorage.");
      }

      const blob = new Blob([JSON.stringify(phonesFromStorage, null, 2)], {
        type: "application/json",
      });

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "phones.json";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);

      showStatus(`${phonesFromStorage.length} phones exported successfully.`);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Unable to export phone data.");
    }
  }

  $("exportBtn").addEventListener("click", exportJson);

  /*
   * ----------------------------------------
   * Import JSON
   * ----------------------------------------
   */
  $("importBtn").addEventListener("click", () => {
    $("importFile").click();
  });

  $("importFile").addEventListener("change", importJson);

  async function importJson(event) {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    try {
      const text = await file.text();

      const importedPhones = JSON.parse(text);

      if (!Array.isArray(importedPhones)) {
        throw new Error("JSON must contain an array.");
      }

      const validPhones = importedPhones.every((phone) => {
        return (
          phone &&
          Number.isFinite(Number(phone.id)) &&
          typeof phone.name === "string" &&
          typeof phone.category === "string" &&
          Number.isFinite(Number(phone.marketPrice))
        );
      });

      if (!validPhones) {
        throw new Error("Invalid phone data.");
      }

      /*
       * Update global phones variable.
       */
      phones.length = 0;

      phones.push(
        ...importedPhones.map((phone) => ({
          id: Number(phone.id),
          name: phone.name.trim(),
          category: phone.category.trim(),
          marketPrice: Number(phone.marketPrice),
        })),
      );

      /*
       * Keep admin data synchronized.
       */
      phoneData = phones.map((phone) => ({
        ...phone,
      }));

      /*
       * Save imported data
       * permanently in localStorage.
       */
      localStorage.setItem(STORAGE_KEY, JSON.stringify(phoneData));

      renderPhones();

      resetForm();

      showStatus(`${phoneData.length} phones imported successfully and saved.`);
    } catch (error) {
      console.error("Import failed:", error);

      alert("Unable to import JSON. Please select a valid JSON file.");
    } finally {
      event.target.value = "";
    }
  }

  /*
   * ----------------------------------------
   * Reset to original phones.js data
   * ----------------------------------------
   */
  $("resetBtn").addEventListener("click", () => {
    const confirmed = confirm(
      "Reset all phone data to the original phones.js data?",
    );

    if (!confirmed) {
      return;
    }

    /*
     * Restore original phones.js data.
     */
    phoneData = phones.map((phone) => ({
      ...phone,
    }));

    /*
     * Save the restored data
     * to localStorage.
     */
    localStorage.setItem(STORAGE_KEY, JSON.stringify(phoneData));

    renderPhones();

    resetForm();

    showStatus("Phone data reset to default and saved.");
  });

  /*
   * ----------------------------------------
   * Initial load
   * ----------------------------------------
   */
  loadPhones();

  /*
   * Synchronize global phones
   * with loaded phoneData.
   */
  phones.length = 0;

  phones.push(
    ...phoneData.map((phone) => ({
      ...phone,
    })),
  );

  renderPhones();
})();
