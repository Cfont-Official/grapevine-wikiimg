async function searchImages() {
  const q = document.getElementById("search").value.trim();
  const safe = document.getElementById("safe").checked;
  const results = document.getElementById("results");
  results.innerHTML = "";

  if (!q) return;

  const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&safe=${safe}`);
  const data = await res.json();

  if (!data.length) {
    results.innerHTML = "<p>No results found.</p>";
    return;
  }

  data.forEach(item => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      ${item.thumb ? `<img src="${item.thumb}" alt="${item.title}">` : ""}
      <a href="${item.url}" target="_blank">${item.title}</a>
      <p style="font-size:12px; opacity:0.7;">${item.license}</p>
    `;
    results.appendChild(card);
  });
}
