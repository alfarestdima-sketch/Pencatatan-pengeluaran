/* KostKu: semua data disimpan lokal di browser melalui localStorage. */
const STORAGE_KEY = "kostku-data-v1";
const DEFAULT_CATEGORIES = ["Makan", "Transport", "Belanja", "Tagihan", "Hiburan", "Kesehatan", "Lainnya"];

let data = loadData();
const $ = (selector, root = document) => root.querySelector(selector);
const elements = {
  transactionForm: $("#transactionForm"), description: $("#description"), amount: $("#amount"), date: $("#date"), category: $("#category"), editId: $("#editId"),
  budgetForm: $("#budgetForm"), budget: $("#budget"), categoryForm: $("#categoryForm"), newCategory: $("#newCategory"), categoryChips: $("#categoryChips"),
  searchInput: $("#searchInput"), filterCategory: $("#filterCategory"), filterMonth: $("#filterMonth"), transactionList: $("#transactionList"), emptyState: $("#emptyState"),
  monthlyTotal: $("#monthlyTotal"), allTimeTotal: $("#allTimeTotal"), transactionCount: $("#transactionCount"), topCategory: $("#topCategory"), monthTitle: $("#monthTitle"),
  budgetUsedText: $("#budgetUsedText"), budgetPercent: $("#budgetPercent"), budgetProgress: $("#budgetProgress"), budgetRemainingText: $("#budgetRemainingText"),
  formTitle: $("#formTitle"), submitText: $("#submitText"), cancelEditBtn: $("#cancelEditBtn"), resetDataBtn: $("#resetDataBtn"), toast: $("#toast"), template: $("#transactionTemplate")
};

function loadData() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && Array.isArray(saved.transactions)) return { transactions: saved.transactions, categories: saved.categories?.length ? saved.categories : DEFAULT_CATEGORIES, budget: Number(saved.budget) || 0 };
  } catch (error) { console.warn("Data tersimpan tidak dapat dibaca.", error); }
  return { transactions: [], categories: [...DEFAULT_CATEGORIES], budget: 0 };
}
function saveData() { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
function formatRupiah(number) { return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(number); }
function localDate() { const now = new Date(); const offset = now.getTimezoneOffset(); return new Date(now.getTime() - offset * 60000).toISOString().slice(0, 10); }
function currentMonth() { return localDate().slice(0, 7); }
function monthLabel(month) { if (!month) return "Semua bulan"; return new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(new Date(`${month}-01T00:00:00`)); }
function friendlyDate(date) { return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${date}T00:00:00`)); }
function makeId() { return `${Date.now()}-${Math.random().toString(16).slice(2)}`; }
function showToast(message) { elements.toast.textContent = message; elements.toast.classList.add("show"); clearTimeout(showToast.timer); showToast.timer = setTimeout(() => elements.toast.classList.remove("show"), 2400); }
function monthTransactions() { const month = currentMonth(); return data.transactions.filter((item) => item.date.startsWith(month)); }

function renderCategories() {
  const options = data.categories.map((name) => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`).join("");
  const selected = elements.category.value;
  elements.category.innerHTML = options;
  if (data.categories.includes(selected)) elements.category.value = selected;
  elements.filterCategory.innerHTML = `<option value="">Semua kategori</option>${options}`;
  elements.categoryChips.innerHTML = "";
  data.categories.forEach((name) => {
    const chip = document.createElement("span"); chip.className = "chip"; chip.textContent = name;
    const remove = document.createElement("button"); remove.type = "button"; remove.title = `Hapus kategori ${name}`; remove.setAttribute("aria-label", `Hapus kategori ${name}`); remove.textContent = "×";
    remove.disabled = data.categories.length === 1;
    remove.addEventListener("click", () => removeCategory(name)); chip.append(remove); elements.categoryChips.append(chip);
  });
}
function renderSummary() {
  const list = monthTransactions(); const total = list.reduce((sum, item) => sum + item.amount, 0); const all = data.transactions.reduce((sum, item) => sum + item.amount, 0);
  elements.monthTitle.textContent = `Pengeluaran ${monthLabel(currentMonth())}`;
  elements.monthlyTotal.textContent = formatRupiah(total); elements.allTimeTotal.textContent = formatRupiah(all); elements.transactionCount.textContent = `${list.length} transaksi`;
  const amounts = {}; list.forEach((item) => amounts[item.category] = (amounts[item.category] || 0) + item.amount);
  const top = Object.entries(amounts).sort((a, b) => b[1] - a[1])[0]; elements.topCategory.textContent = top ? top[0] : "—";
  const budget = data.budget;
  if (budget > 0) { const percentage = Math.round((total / budget) * 100); elements.budgetUsedText.textContent = `${formatRupiah(total)} dari ${formatRupiah(budget)}`; elements.budgetPercent.textContent = `${percentage}%`; elements.budgetProgress.style.width = `${Math.min(percentage, 100)}%`; elements.budgetProgress.classList.toggle("over", percentage > 100); elements.budgetRemainingText.textContent = total > budget ? `Melebihi anggaran ${formatRupiah(total - budget)}.` : `Sisa anggaran ${formatRupiah(budget - total)}.`; }
  else { elements.budgetUsedText.textContent = "Belum ada anggaran"; elements.budgetPercent.textContent = "0%"; elements.budgetProgress.style.width = "0%"; elements.budgetProgress.classList.remove("over"); elements.budgetRemainingText.textContent = "Atur anggaran agar keuangan lebih terarah."; }
}
function filteredTransactions() {
  const query = elements.searchInput.value.trim().toLowerCase(), category = elements.filterCategory.value, month = elements.filterMonth.value;
  return data.transactions.filter((item) => (!query || item.description.toLowerCase().includes(query)) && (!category || item.category === category) && (!month || item.date.startsWith(month))).sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt);
}
function renderTransactions() {
  const list = filteredTransactions(); elements.transactionList.innerHTML = ""; elements.emptyState.classList.toggle("hidden", list.length > 0);
  list.forEach((item) => { const node = elements.template.content.cloneNode(true); $(".transaction-category", node).textContent = item.category.slice(0, 2); $(".transaction-description", node).textContent = item.description; $(".transaction-meta", node).textContent = `${item.category} · ${friendlyDate(item.date)}`; $(".transaction-amount", node).textContent = formatRupiah(item.amount); $(".edit-button", node).addEventListener("click", () => startEdit(item.id)); $(".delete-button", node).addEventListener("click", () => deleteTransaction(item.id)); elements.transactionList.append(node); });
}
function escapeHtml(value) { const box = document.createElement("div"); box.textContent = value; return box.innerHTML; }
function renderAll() { renderCategories(); renderSummary(); renderTransactions(); }
function resetForm() { elements.transactionForm.reset(); elements.editId.value = ""; elements.date.value = localDate(); elements.formTitle.textContent = "Tambah pengeluaran"; elements.submitText.textContent = "Simpan transaksi"; elements.cancelEditBtn.classList.add("hidden"); }
function startEdit(id) { const item = data.transactions.find((transaction) => transaction.id === id); if (!item) return; elements.editId.value = item.id; elements.description.value = item.description; elements.amount.value = item.amount; elements.date.value = item.date; elements.category.value = item.category; elements.formTitle.textContent = "Edit pengeluaran"; elements.submitText.textContent = "Simpan perubahan"; elements.cancelEditBtn.classList.remove("hidden"); window.scrollTo({ top: 0, behavior: "smooth" }); elements.description.focus(); }
function deleteTransaction(id) { const item = data.transactions.find((transaction) => transaction.id === id); if (!item || !confirm(`Hapus transaksi “${item.description}”?`)) return; data.transactions = data.transactions.filter((transaction) => transaction.id !== id); saveData(); if (elements.editId.value === id) resetForm(); renderAll(); showToast("Transaksi dihapus."); }
function removeCategory(category) { const used = data.transactions.some((item) => item.category === category); if (used) return showToast("Kategori masih dipakai oleh transaksi dan tidak bisa dihapus."); if (!confirm(`Hapus kategori “${category}”?`)) return; data.categories = data.categories.filter((item) => item !== category); saveData(); renderCategories(); showToast("Kategori dihapus."); }

elements.transactionForm.addEventListener("submit", (event) => { event.preventDefault(); const description = elements.description.value.trim(), amount = Number(elements.amount.value), date = elements.date.value, category = elements.category.value; if (!description || !Number.isFinite(amount) || amount <= 0 || !date || !category) return showToast("Lengkapi data transaksi dengan benar."); const id = elements.editId.value; if (id) { const item = data.transactions.find((transaction) => transaction.id === id); Object.assign(item, { description, amount, date, category }); showToast("Transaksi diperbarui."); } else { data.transactions.push({ id: makeId(), description, amount, date, category, createdAt: Date.now() }); showToast("Transaksi disimpan."); } saveData(); resetForm(); renderAll(); });
elements.budgetForm.addEventListener("submit", (event) => { event.preventDefault(); const amount = Number(elements.budget.value); if (!Number.isFinite(amount) || amount < 0) return showToast("Masukkan nominal anggaran yang valid."); data.budget = amount; saveData(); renderSummary(); showToast(amount ? "Anggaran bulanan disimpan." : "Anggaran dihapus."); });
elements.categoryForm.addEventListener("submit", (event) => { event.preventDefault(); const name = elements.newCategory.value.trim().replace(/\s+/g, " "); if (!name) return; if (data.categories.some((category) => category.toLowerCase() === name.toLowerCase())) return showToast("Kategori tersebut sudah ada."); data.categories.push(name); saveData(); elements.newCategory.value = ""; renderCategories(); showToast("Kategori ditambahkan."); });
[elements.searchInput, elements.filterCategory, elements.filterMonth].forEach((input) => input.addEventListener(input.tagName === "SELECT" || input.type === "month" ? "change" : "input", renderTransactions));
elements.cancelEditBtn.addEventListener("click", resetForm);
elements.resetDataBtn.addEventListener("click", () => { if (!confirm("Hapus semua transaksi, kategori tambahan, dan anggaran? Tindakan ini tidak dapat dibatalkan.")) return; data = { transactions: [], categories: [...DEFAULT_CATEGORIES], budget: 0 }; saveData(); elements.budget.value = ""; elements.searchInput.value = ""; elements.filterMonth.value = ""; resetForm(); renderAll(); showToast("Semua data telah direset."); });

elements.date.value = localDate(); elements.budget.value = data.budget || ""; renderAll();
elements.filterMonth.value = currentMonth(); elements.filterCategory.value = ""; elenments.searchInput.value = "";
elements.searcjInput.placeholder = "Cari transaksi...";
elements.filterCategory.innterHTML = '<option value="">Semua kategory</option>' + data.categories.map((name) => '<option value="' + escapeHtml(name) + '">' + escapeHtml(name) + '</option>').join("");
elements.monthlyTotal.textContent = formatRupiah(monthTransactions().reduce((sum, item) => sum + item.amount, 0));

