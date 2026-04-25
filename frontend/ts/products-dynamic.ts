/**
 * products.ts – Produktliste, Kategorien, Drag & Drop
 * Sprint 1: SCRUM-55, SCRUM-58 (Produktsuche), SCRUM-57/56 (Warenkorb)
 */

// TODO Sprint 1: loadProducts(), loadCategories()
// TODO Sprint 2: addToCart(), initDragDrop()
/**
 * products.ts – Produktliste & Kategoriefilter
 */

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category_id: number;
  file_path: string;
  rating?: number;
}

const CATEGORY_ID_TO_NAME: { [key: number]: string } = {
  1: "black",
  2: "green",
  3: "fruit",
  4: "herbal",
};

$(document).ready(function () {
  loadProducts("getAll");
  setupFilterLogic();

  $("#search-input").on("input", function () {
    $(".category-chip.active").removeClass("active");
    $("#button-all").addClass("active");

    const searchTerm = ($(this).val() as string).toLowerCase().trim();

    // Alle Produkt-Spalten durchlaufen
    $("#product-list .col-md-6").each(function () {
      const card = $(this);
      // Wir holen uns den Text aus Titel und Beschreibung
      const title = card.find(".tea-card-title").text().toLowerCase();
      // Prüfen, ob der Suchbegriff in Titel ODER Beschreibung vorkommt
      if (title.includes(searchTerm)) {
        card.show(); // Treffer zeigen
      } else {
        card.hide(); // Kein Treffer verstecken
      }
    });
  });

  function loadProducts(method: String) {
    console.log("Mehtode:" + method);
    $.ajax({
      url: "/itea/backend/serviceHandler.php?handler=products&method=" + method,
      method: "GET",
      success: function (data: Product[]) {
        $("#no-products").hide();
        if (!data || data.length === 0) {
          const $container = $("#product-list");
          $container.empty();
          $("#no-products").show();
          return;
        }
        renderProducts(data);
      },
      error: function (err) {
        console.error("Error loading products: ", err);
        $("#no-products").show();
      },
    });
  }

  function renderProducts(products: Product[]) {
    const $container = $("#product-list");
    $container.empty();

    if (!products) {
      console.error("Daten konnten nicht geladen werden oder sind leer.");
      return;
    }

    products.forEach((product) => {
      // Kurze Validierung: Sind alle Pflichtfelder da?
      if (!product.id || !product.name || !product.price) return;

      const categoryName = CATEGORY_ID_TO_NAME[product.category_id];
      const stars = "★".repeat(Math.floor(product.rating || 0)).padEnd(5, "☆");
      const reviewText = product.rating > 0 ? "" : " (0 reviews)";

      const cardHtml = `
            <div class="col-md-6 col-xl-4 product-item" data-category="${categoryName}"> 
                <a href="productInfo.php?id=${product.id}" class="text-decoration-none text-dark">
                    <article class="tea-card h-100">
                        <div class="tea-card-image-wrapper">
                            <img src="/itea/backend/productpictures/${product.file_path}" class="tea-card-image" alt="${product.name}">
                        </div>
                        <div class="tea-card-body d-flex flex-column">
                            <h2 class="tea-card-title">${product.name}</h2>
                            <p class="tea-card-description">${product.description}</p>
                            <p class="tea-card-rating mb-3">${stars}<span class="text-muted small">${reviewText}</span></p>
                            <div class="tea-card-footer mt-auto d-flex justify-content-between align-items-center gap-3">
                                <p class="tea-card-price mb-0">€${Number(product.price).toFixed(2)}</p>
                                <button class="btn tea-card-button add-to-cart-btn">Add to cart</button>
                            </div>
                        </div>
                    </article>
                </a>
            </div>`;

      $container.append(cardHtml);
    });
  }
  function setupFilterLogic() {
    // Wir hängen den Event-Listener an die CSS-klasse .category-chip (somit können wir alle Buttons gleichzeitig verwalten)
    $(".category-chip").on("click", function () {
      // allen klassen active look wegnehmen und nur dem geklickten Button geben
      $(".category-chip").removeClass("active");
      $(this).addClass("active");

      // 2. Filter-Wert aus dem data-Attribut holen (z.B. "black" oder "all")
      const filterValue = $(this).attr("data-category");

      // 3. Filtern
      if (filterValue === "all") {
        $(".product-item").show();
      } else {
        $(".product-item").hide(); // Erst alle weg
        $(`.product-item[data-category="${filterValue}"]`).show(); // Nur die richtigen herzeigen
      }

      // 4. "Keine Produkte gefunden" Check
      const visibleCards = $(".product-item:visible").length;
      if (visibleCards === 0) {
        $("#no-products").show();
      } else {
        $("#no-products").hide();
      }
    });
  }
});
