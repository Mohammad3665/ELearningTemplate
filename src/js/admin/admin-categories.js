/* =========================================================
   MOBILE PAGINATION
   ========================================================= */

function updateMobilePagination() {
  const isMobile = window.innerWidth <= 640;

  const nav = document.querySelector(
    "#categories-table_wrapper .dt-paging nav"
  );

  if (!nav || !isMobile) {
    return;
  }

  const pageInfo = categoriesTable.page.info();

  const currentPage = pageInfo.page;
  const totalPages = pageInfo.pages;

  // Clear current pagination
  nav.innerHTML = "";

  let pages = [];
  let showLeftEllipsis = false;
  let showRightEllipsis = false;

  if (totalPages <= 5) {

    pages = Array.from(
      { length: totalPages },
      (_, index) => index
    );

  } else if (currentPage <= 2) {

    // Show first three pages
    pages = [0, 1, 2];
    showRightEllipsis = true;

  } else if (currentPage >= totalPages - 3) {

    // Show last four pages
    pages = [
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1
    ];

    showLeftEllipsis = true;

  } else {

    // Show pages around current page
    pages = [
      currentPage - 1,
      currentPage,
      currentPage + 1
    ];

    showLeftEllipsis = true;
    showRightEllipsis = true;
  }

  // Previous button
  const previous = document.createElement("button");

  previous.type = "button";
  previous.className =
    "dt-paging-button previous" +
    (currentPage === 0 ? " disabled" : "");

  previous.setAttribute("aria-label", "Previous");

  previous.addEventListener("click", () => {
    if (currentPage > 0) {
      categoriesTable.page("previous").draw("page");
    }
  });

  nav.appendChild(previous);

  // Left ellipsis
  if (showLeftEllipsis) {
    const ellipsis = document.createElement("span");

    ellipsis.className = "dt-paging-button disabled";
    ellipsis.textContent = "...";

    nav.appendChild(ellipsis);
  }

  // Page buttons
  pages.forEach(page => {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "dt-paging-button";

    if (page === currentPage) {
      button.classList.add("current");
      button.setAttribute("aria-current", "page");
    }

    button.textContent = page + 1;

    button.addEventListener("click", () => {
      categoriesTable.page(page).draw("page");
    });

    nav.appendChild(button);
  });

  // Right ellipsis
  if (showRightEllipsis) {
    const ellipsis = document.createElement("span");

    ellipsis.className = "dt-paging-button disabled";
    ellipsis.textContent = "...";

    nav.appendChild(ellipsis);
  }

  // Last page
  const lastPageIndex = totalPages - 1;

  if (pages[pages.length - 1] < lastPageIndex) {
    const lastPage = document.createElement("button");

    lastPage.type = "button";
    lastPage.className = "dt-paging-button";

    if (currentPage === lastPageIndex) {
      lastPage.classList.add("current");
      lastPage.setAttribute("aria-current", "page");
    }

    lastPage.textContent = totalPages;

    lastPage.addEventListener("click", () => {
      categoriesTable.page(lastPageIndex).draw("page");
    });

    nav.appendChild(lastPage);
  }

  // Next button
  const next = document.createElement("button");

  next.type = "button";
  next.className =
    "dt-paging-button next" +
    (currentPage === totalPages - 1 ? " disabled" : "");

  next.setAttribute("aria-label", "Next");

  next.addEventListener("click", () => {
    if (currentPage < totalPages - 1) {
      categoriesTable.page("next").draw("page");
    }
  });

  nav.appendChild(next);
}


/* =========================================================
   CATEGORIES DATATABLE
   ========================================================= */

const categoriesTable = new DataTable("#categories-table", {
  paging: true,
  pageLength: 5,
  lengthChange: false,
  info: false,
  ordering: true,

  responsive: {
    details: {
      type: "inline",
      target: "tr"
    }
  },

  pagingType: "simple_numbers",

  layout: {
    topStart: null,
    topEnd: null,
    bottomStart: "paging",
    bottomEnd: null
  },

  language: {
    paginate: {
      previous: "",
      next: ""
    }
  },

  columnDefs: [
    {
      // Operations column
      targets: 7,
      orderable: false,
      searchable: false
    }
  ]
});


/* =========================================================
   EVENTS
   ========================================================= */

categoriesTable.on("draw", updateMobilePagination);

window.addEventListener("resize", updateMobilePagination);

updateMobilePagination();


/* =========================================================
   CATEGORY DELETE MODAL
   ========================================================= */

const deleteBackdrop = document.getElementById("category-delete-backdrop");
const deleteModal = document.getElementById("category-delete-modal");
const deleteName = document.getElementById("category-delete-name");
const deleteError = document.getElementById("category-delete-error");

const deleteClose = document.getElementById("category-delete-close");
const deleteCancel = document.getElementById("category-delete-cancel");
const deleteConfirm = document.getElementById("category-delete-confirm");

let categoryToDelete = null;


/* Open Delete Modal */

function openCategoryDeleteModal(button) {
  categoryToDelete = {
    id: button.dataset.deleteId,
    name: button.getAttribute("aria-label")
      ?.replace(/^حذف\s*/, "") || "این دسته‌بندی"
  };

  deleteName.textContent = categoryToDelete.name;

  // Reset previous error state
  deleteError.classList.add("hidden");

  deleteBackdrop.classList.remove("hidden");
  deleteModal.classList.remove("hidden");

  document.body.classList.add("overflow-hidden");

  deleteConfirm.focus();
}


/* Close Delete Modal */

function closeCategoryDeleteModal() {
  deleteBackdrop.classList.add("hidden");
  deleteModal.classList.add("hidden");

  document.body.classList.remove("overflow-hidden");

  categoryToDelete = null;
}


/* Delete Button */

document.addEventListener("click", event => {
  const deleteButton = event.target.closest(".category-delete-btn");

  if (!deleteButton) return;

  openCategoryDeleteModal(deleteButton);
});


/* Close / Cancel */

deleteClose.addEventListener("click", closeCategoryDeleteModal);
deleteCancel.addEventListener("click", closeCategoryDeleteModal);
deleteBackdrop.addEventListener("click", closeCategoryDeleteModal);


/* Confirm Delete */

deleteConfirm.addEventListener("click", async () => {
  if (!categoryToDelete) return;

  const categoryId = categoryToDelete.id;
  const categoryName = categoryToDelete.name;

  deleteConfirm.disabled = true;
  const originalText = deleteConfirm.textContent;
  deleteConfirm.textContent = "در حال حذف...";

  try {
    /*
     * TODO:
     * Replace this section with the real delete request.
     */

    await new Promise(resolve => setTimeout(resolve, 600));

    // const res = await fetch(`/api/categories/${categoryId}`, { method: 'DELETE' });
    // if (!res.ok) throw new Error('Delete failed');

    console.log("Delete category:", categoryId);

    closeCategoryDeleteModal();

    // categoriesTable.ajax.reload();

    toast.success(`دسته‌بندی «${categoryName}» با موفقیت حذف شد`);
  } catch (error) {
    console.error(error);

    deleteError.classList.remove("hidden");

    toast.error("خطا در حذف دسته‌بندی. لطفاً دوباره تلاش کنید.");
  } finally {
    deleteConfirm.disabled = false;
    deleteConfirm.textContent = originalText;
  }
});


/* Close With Escape */

document.addEventListener("keydown", event => {
  if (event.key !== "Escape") return;
  if (deleteModal.classList.contains("hidden")) return;

  closeCategoryDeleteModal();
});


/* =========================================================
   CATEGORY ADD / EDIT MODALS (doc section 2.2)
   Powered by the ported Metronic KTModal component.
   ========================================================= */

KTModal.init();

const addModalEl = document.getElementById("category-add-modal");
const editModalEl = document.getElementById("category-edit-modal");

const addModal = KTModal.getInstance(addModalEl);
const editModal = KTModal.getInstance(editModalEl);

const addForm = document.getElementById("category-add-form");
const editForm = document.getElementById("category-edit-form");

const addName = document.getElementById("category-add-name");
const addLatin = document.getElementById("category-add-latin");
const addOrder = document.getElementById("category-add-order");
const addParent = document.getElementById("category-add-parent");
const addActive = document.getElementById("category-add-active");

const editName = document.getElementById("category-edit-name");
const editLatin = document.getElementById("category-edit-latin");
const editOrder = document.getElementById("category-edit-order");
const editParent = document.getElementById("category-edit-parent");
const editActive = document.getElementById("category-edit-active");

const editModalTitle = document.getElementById("category-edit-title");

let categoryToEdit = null;


/* ---------- Populate "Parent" selects from table rows ---------- */

function populateParentSelects() {
  const rows = document.querySelectorAll("#categories-table tbody tr");

  [addParent, editParent].forEach(select => {
    const currentValue = select.value;

    // Keep only the placeholder option
    select
      .querySelectorAll("option:not([value=''])")
      .forEach(option => option.remove());

    rows.forEach(row => {
      const cells = row.querySelectorAll("td");

      if (cells.length < 2) return;

      const name = cells[0].textContent.trim();
      const latinName = cells[1].textContent.trim();

      if (!name) return;

      const option = document.createElement("option");

      option.value = latinName;
      option.textContent = name;

      select.appendChild(option);
    });

    select.value = currentValue;
  });
}

populateParentSelects();


/* ---------- Floating-label helpers ----------
   The custom inputs float their label via
   peer-not-placeholder-shown (empty placeholder=" "),
   so programmatic values need a re-render nudge. */

function syncFloatingLabels(...inputs) {
  inputs.forEach(input => {
    if (!input) return;

    // Force Tailwind peer selectors to re-evaluate
    input.blur();
    input.autofocus = false;
  });
}


/* ---------- Reset forms ---------- */

function resetCategoryForm(form) {
  form.reset();

  form.querySelectorAll(".border-danger").forEach(el => {
    el.classList.remove("border-danger");
  });

  form.querySelectorAll("input, select").forEach(el => {
    el.dispatchEvent(new Event("change", { bubbles: true }));
  });
}


/* ---------- Open: Add ---------- */

function openCategoryAddModal() {
  resetCategoryForm(addForm);

  populateParentSelects();

  addModal.show();
}


/* ---------- Open: Edit ---------- */

function openCategoryEditModal(button) {
  const row = button.closest("tr");
  const cells = row.querySelectorAll("td");

  categoryToEdit = {
    id: button.getAttribute("data-delete-id"),
    name: cells[0].textContent.trim(),
    latinName: cells[1].textContent.trim(),
    displayOrder: cells[2].textContent.trim(),
    parent: cells[3].textContent.trim(),
    isActive: cells[4].querySelector("[data-status]")?.dataset.status === "فعال"
  };

  editName.value = categoryToEdit.name;
  editLatin.value = categoryToEdit.latinName === "—" ? "" : categoryToEdit.latinName;
  editOrder.value = categoryToEdit.displayOrder || "";

  populateParentSelects();

  editParent.value =
    categoryToEdit.parent === "—" || categoryToEdit.parent === "بدون والد"
      ? ""
      : categoryToEdit.parent;

  editActive.checked = categoryToEdit.isActive;

  editModalTitle.textContent =
    categoryToEdit.name ? `— ${categoryToEdit.name}` : "";

  syncFloatingLabels(editName, editLatin, editOrder);

  editModal.show();
}


/* ---------- Triggers ---------- */

document
  .getElementById("add-category-button")
  .addEventListener("click", openCategoryAddModal);

document.addEventListener("click", event => {
  const editButton = event.target.closest(".category-edit-btn");

  if (!editButton) return;

  openCategoryEditModal(editButton);
});


/* ---------- Submit: Add ---------- */

addForm.addEventListener("submit", async event => {
  event.preventDefault();

  const nameField = addName;

  if (!nameField.value.trim()) {
    nameField.classList.add("border-danger");
    nameField.focus();
    toast.warning("لطفاً نام دسته‌بندی را وارد کنید");
    return;
  }

  const submitBtn = document.querySelector('[form="category-add-form"]');
  const originalText = submitBtn?.textContent;

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "در حال ذخیره...";
  }

  try {
    const payload = {
      name: nameField.value.trim(),
      latinName: addLatin.value.trim(),
      displayOrder: addOrder.value,
      parentId: addParent.value || null,
      isActive: addActive.checked
    };

    /*
     * TODO:
     * Replace this section with the real create request.
     */

    await new Promise(resolve => setTimeout(resolve, 600));

    // const res = await fetch('/api/categories', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(payload)
    // });
    // if (!res.ok) throw new Error('Create failed');

    console.log("Create category:", payload);

    addModal.hide();

    // categoriesTable.ajax.reload();

    toast.success(`دسته‌بندی «${payload.name}» با موفقیت ایجاد شد`);
  } catch (error) {
    console.error(error);
    toast.error("خطا در ایجاد دسته‌بندی. لطفاً دوباره تلاش کنید.");
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  }
});


/* ---------- Submit: Edit ---------- */

editForm.addEventListener("submit", async event => {
  event.preventDefault();

  if (!categoryToEdit) return;

  const nameField = editName;

  if (!nameField.value.trim()) {
    nameField.classList.add("border-danger");
    nameField.focus();
    toast.warning("لطفاً نام دسته‌بندی را وارد کنید");
    return;
  }

  const submitBtn = document.querySelector('[form="category-edit-form"]');
  const originalText = submitBtn?.textContent;

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "در حال ذخیره...";
  }

  try {
    const payload = {
      id: categoryToEdit.id,
      name: nameField.value.trim(),
      latinName: editLatin.value.trim(),
      displayOrder: editOrder.value,
      parentId: editParent.value || null,
      isActive: editActive.checked
    };

    /*
     * TODO:
     * Replace this section with the real update request.
     */

    await new Promise(resolve => setTimeout(resolve, 600));

    // const res = await fetch(`/api/categories/${payload.id}`, {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(payload)
    // });
    // if (!res.ok) throw new Error('Update failed');

    console.log("Update category:", payload);

    editModal.hide();

    // categoriesTable.ajax.reload();

    toast.success("تغییرات با موفقیت ذخیره شد");
  } catch (error) {
    console.error(error);
    toast.error("خطا در ذخیره تغییرات. لطفاً دوباره تلاش کنید.");
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  }
});


/* ---------- Clear error state on input ---------- */

[addName, editName].forEach(input => {
  input.addEventListener("input", () => {
    input.classList.remove("border-danger");
  });
});