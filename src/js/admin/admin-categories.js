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

deleteConfirm.addEventListener("click", () => {
  if (!categoryToDelete) return;

  const categoryId = categoryToDelete.id;

  /*
   * TODO:
   * Replace this section with the real delete request.
   */

  console.log("Delete category:", categoryId);

  closeCategoryDeleteModal();
});


/* Close With Escape */

document.addEventListener("keydown", event => {
  if (event.key !== "Escape") return;
  if (deleteModal.classList.contains("hidden")) return;

  closeCategoryDeleteModal();
});