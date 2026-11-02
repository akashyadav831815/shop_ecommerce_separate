const productsElement = document.getElementById("products");
const searchInput = document.getElementById("search");
const categorySelect = document.getElementById("category");
const messageElement = document.getElementById("message");
const resultCount = document.getElementById("result-count");
const modal = document.getElementById("modal");

function formatPrice(price) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 2
  }).format(price);
}

async function loadProducts() {
  messageElement.textContent = "";
  messageElement.className = "message";
  productsElement.innerHTML = "";
  resultCount.textContent = "Loading products…";

  const params = new URLSearchParams();
  if (searchInput.value.trim()) params.set("search", searchInput.value.trim());
  if (categorySelect.value !== "all") params.set("category", categorySelect.value);

  try {
    const response = await fetch(`http://localhost:5000/api/products?${params.toString()}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Unable to load products.");
    resultCount.textContent = `${data.length} product${data.length === 1 ? "" : "s"}`;

    if (data.length === 0) {
      messageElement.textContent = "No products match your search. Try another term or category.";
      return;
    }

    data.forEach((product) => {
      const card = document.createElement("article");
      card.className = "product-card";

      const img = document.createElement("img");
      img.className = "product-image";
      img.src = product.image_url;
      img.alt = product.name;
      img.loading = "lazy";
      img.onerror = () => {
        img.src = "https://placehold.co/800x500/f7f6f0/426b50?text=Product";
      };

      const info = document.createElement("div");
      info.className = "product-info";
      const category = document.createElement("div");
      category.className = "product-category";
      category.textContent = product.category;
      const title = document.createElement("h3");
      title.textContent = product.name;
      const description = document.createElement("p");
      description.textContent = product.description;
      const bottom = document.createElement("div");
      bottom.className = "product-bottom";
      const price = document.createElement("span");
      price.className = "price";
      price.textContent = formatPrice(product.price);
      const button = document.createElement("button");
      button.className = "details-button";
      button.textContent = "View details";
      button.addEventListener("click", () => showDetails(product.id));
      bottom.append(price, button);
      info.append(category, title, description, bottom);
      card.append(img, info);
      productsElement.append(card);
    });
  } catch (error) {
    resultCount.textContent = "";
    messageElement.className = "message error";
    messageElement.textContent = `${error.message} Please check that the Node server is running.`;
  }
}

async function showDetails(id) {
  try {
    const response = await fetch(`http://localhost:5000/api/products/${id}`);
    const product = await response.json();
    if (!response.ok) throw new Error(product.error || "Unable to load product details.");
    document.getElementById("detail-image").src = product.image_url;
    document.getElementById("detail-image").alt = product.name;
    document.getElementById("detail-category").textContent = product.category;
    document.getElementById("modal-title").textContent = product.name;
    document.getElementById("detail-description").textContent = product.description;
    document.getElementById("detail-price").textContent = formatPrice(product.price);
    modal.classList.remove("hidden");
    document.getElementById("close-modal").focus();
  } catch (error) {
    messageElement.className = "message error";
    messageElement.textContent = error.message;
  }
}

function closeModal() {
  modal.classList.add("hidden");
}
document.getElementById("close-modal").addEventListener("click", closeModal);
document.getElementById("modal-backdrop").addEventListener("click", closeModal);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeModal();
});

let searchTimer;
searchInput.addEventListener("input", () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(loadProducts, 250);
});
categorySelect.addEventListener("change", loadProducts);
loadProducts();
