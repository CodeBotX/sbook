import os
import math
import json

TAILWIND_CDN = '''
<link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
'''

JS_SCRIPT = '''
<script>
let currentSlide = 0;
let listItems = [];
let gridItems = [];
let itemsPerSlide = 20;
let currentView = "grid";

function filterList() {
  const input = document.getElementById("search").value.toLowerCase();
  const items = document.querySelectorAll(".file-item");
  items.forEach(item => {
    const name = item.getAttribute("data-name").toLowerCase();
    item.style.display = name.includes(input) ? "" : "none";
  });
}

function setView(mode) {
  currentView = mode;
  const gridContainer = document.getElementById("file-container");
  const listContainer = document.getElementById("list-container");
  const nav = document.getElementById("list-nav");

  if (mode === "grid") {
    gridContainer.style.display = "grid";
    listContainer.style.display = "none";
    nav.style.display = "none";
    renderGridItems();
  } else {
    gridContainer.style.display = "none";
    listContainer.style.display = "grid";
    nav.style.display = "flex";
    renderListSlides();
  }
}

function sortItems(order) {
  listItems.sort((a, b) => {
    const nameA = a.name.toLowerCase();
    const nameB = b.name.toLowerCase();
    return order === "asc" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
  });

  gridItems = [...listItems];

  if (currentView === "list") {
    renderListSlides();
  } else {
    renderGridItems();
  }
}

function renderListSlides() {
  const listContainer = document.getElementById("list-container");
  listContainer.innerHTML = "";
  const slides = Math.ceil(listItems.length / itemsPerSlide);

  const start = currentSlide * itemsPerSlide;
  const end = start + itemsPerSlide;
  const currentItems = listItems.slice(start, end);

  const columns = 2;
  const rows = Math.ceil(currentItems.length / columns);
  let cols = [];

  for (let i = 0; i < columns; i++) {
    const col = document.createElement("div");
    col.className = "space-y-1";
    cols.push(col);
  }

  currentItems.forEach((item, index) => {
    const a = document.createElement("a");
    a.href = item.link;
    a.className = "flex items-center text-blue-600 hover:underline";
    a.innerHTML = `<span class="text-lg mr-2">${item.icon}</span><span class="truncate">${item.name}</span>`;
    cols[index % columns].appendChild(a);
  });

  cols.forEach(col => listContainer.appendChild(col));

  document.getElementById("slide-indicator").innerText = `${currentSlide + 1} / ${slides}`;
  document.getElementById("prev-slide").disabled = currentSlide === 0;
  document.getElementById("next-slide").disabled = currentSlide >= slides - 1;
}

function renderGridItems() {
  const gridContainer = document.getElementById("file-container");
  gridContainer.innerHTML = "";

  gridItems.forEach(item => {
    const div = document.createElement("div");
    div.className = "file-item";
    div.setAttribute("data-name", item.name);

    div.innerHTML = `
      <a href="${item.link}" class="block p-4 bg-white border rounded shadow hover:shadow-md text-center">
        <div class="text-2xl">${item.icon}</div>
        <div class="mt-2 text-sm truncate">${item.name}</div>
      </a>`;
    
    gridContainer.appendChild(div);
  });
}

function nextSlide() {
  currentSlide++;
  renderListSlides();
}

function prevSlide() {
  currentSlide--;
  renderListSlides();
}

function initList(data) {
  listItems = data;
  gridItems = [...data];
  sortItems("asc"); // mặc định A-Z
}
</script>
'''

def generate_index_html(directory):
    items = os.listdir(directory)
    items.sort()

    rel_path = os.path.relpath(directory, start='.')
    title = rel_path if rel_path != '.' else 'Trang chính'

    list_data = []

    html = f"""<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>{title}</title>
  {TAILWIND_CDN}
  {JS_SCRIPT}
</head>
<body class="bg-gray-50 text-gray-900 p-6">
  <div class="max-w-5xl mx-auto">
    <div class="flex flex-wrap justify-between items-center mb-4 gap-2">
      <h1 class="text-2xl font-bold">{title}</h1>
      <div class="space-x-2">
        <button onclick="setView('grid')" class="px-2 py-1 border rounded bg-white hover:bg-gray-100">🧱 Grid</button>
        <button onclick="setView('list')" class="px-2 py-1 border rounded bg-white hover:bg-gray-100">📋 List</button>
        <button onclick="sortItems('asc')" class="px-2 py-1 border rounded bg-white hover:bg-gray-100">🔼 A-Z</button>
        <button onclick="sortItems('desc')" class="px-2 py-1 border rounded bg-white hover:bg-gray-100">🔽 Z-A</button>
      </div>
    </div>

    <input id="search" type="text" onkeyup="filterList()" placeholder="🔍 Tìm kiếm..."
           class="w-full mb-6 p-2 border border-gray-300 rounded" />

    <!-- Grid view -->
    <div id="file-container" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
    </div>
"""

    if rel_path != '.':
        list_data.append({
            "name": "Back",
            "link": "../index.html",
            "icon": "⬅️"
        })

    for item in items:
        if item == "index.html":
            continue
        if item in [".git", "assets"]:
            continue
        path = os.path.join(directory, item)
        if os.path.isdir(path):
            icon = "📁"
            link = f"{item}/index.html"
        elif item.endswith(".html"):
            icon = "📄"
            link = item
        else:
            continue

        list_data.append({
            "name": item,
            "link": link,
            "icon": icon
        })

    html += f"""

    <!-- List View -->
    <div id="list-container" class="hidden grid-cols-2 gap-8 mb-4"></div>

    <!-- Navigation -->
    <div id="list-nav" class="hidden items-center justify-between mt-4">
      <button id="prev-slide" onclick="prevSlide()" class="px-3 py-1 border rounded bg-white hover:bg-gray-100">⬅️ Previous</button>
      <span id="slide-indicator" class="text-sm text-gray-600">1 / 1</span>
      <button id="next-slide" onclick="nextSlide()" class="px-3 py-1 border rounded bg-white hover:bg-gray-100">Next ➡️</button>
    </div>
  </div>

  <script>
    const listItemsData = {json.dumps(list_data)};
    initList(listItemsData);
    setView("grid");
  </script>
</body>
</html>
"""

    with open(os.path.join(directory, "index.html"), "w", encoding="utf-8") as f:
        f.write(html)
    print(f"✅ Tạo index.html tại: {directory}")

def walk_and_generate(root="."):
    for dirpath, _, _ in os.walk(root):
        # Bỏ qua thư mục assets và git
        if "assets" in dirpath.split(os.sep) or ".git" in dirpath.split(os.sep):
            continue
        generate_index_html(dirpath)

if __name__ == "__main__":
    walk_and_generate()
