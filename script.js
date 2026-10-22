const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const results = document.getElementById("results");
const status = document.getElementById("status");
const clearButton = document.getElementById("clear-button");
const quickSearchButtons = document.querySelectorAll(".chip");

function render(items) {
  results.innerHTML = "";
  let renderedCount = 0;

  items.forEach((item) => {
    if (!item || typeof item !== "object") {
      return;
    }

    const imageInfo = item.imageinfo && item.imageinfo[0];
    const thumbnailUrl = imageInfo && imageInfo.thumburl;

    if (
      typeof item.title !== "string" ||
      typeof thumbnailUrl !== "string" ||
      thumbnailUrl.trim() === ""
    ) {
      return;
    }

    const card = document.createElement("article");
    card.className = "card";

    const image = document.createElement("img");
    image.src = thumbnailUrl;
    image.alt = item.title;

    const caption = document.createElement("p");
    caption.className = "card-caption";
    caption.textContent = item.title;

    card.appendChild(image);
    card.appendChild(caption);
    results.appendChild(card);
    renderedCount += 1;
  });

  if (renderedCount === 0) {
    const emptyState = document.createElement("p");
    emptyState.className = "empty-state";
    emptyState.textContent = "No images found.";
    results.appendChild(emptyState);
  }

  return renderedCount;
}

searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const query = searchInput.value.trim();
  if (!query) {
    return;
  }

  const url =
    "https://commons.wikimedia.org/w/api.php?action=query&generator=search" +
    `&gsrsearch=${encodeURIComponent(query)}` +
    "&gsrnamespace=6&gsrlimit=12&prop=imageinfo&iiprop=url" +
    "&iiurlwidth=300&format=json&origin=*";

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Image search failed: ${response.status}`);
    }

    const data = await response.json();
    const pages = data.query && data.query.pages;
    const items = pages && typeof pages === "object" ? Object.values(pages) : [];
    const renderedCount = render(items);
    status.textContent = `Showing ${renderedCount} results for ${query}`;

    if (renderedCount === 0) {
      results.querySelector(".empty-state").textContent = `No images found for ${query}.`;
    }
  } catch (error) {
    console.error(error);
    status.textContent = "Search failed. Please try again.";
  }
});

clearButton.addEventListener("click", () => {
  searchInput.value = "";
  results.innerHTML = "";

  const emptyState = document.createElement("p");
  emptyState.className = "empty-state";
  emptyState.textContent = "Search to see results";
  results.appendChild(emptyState);
  status.textContent = "Showing 0 results";
  searchInput.focus();
});

quickSearchButtons.forEach((button) => {
  button.addEventListener("click", () => {
    searchInput.value = button.textContent.trim();
    searchForm.requestSubmit();
  });
});
