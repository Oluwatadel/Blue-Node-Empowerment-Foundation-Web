export async function fetchSiteContent() {
  const response = await fetch("/api/content");
  if (!response.ok) {
    throw new Error(`Failed to load site content (${response.status})`);
  }

  return response.json();
}

export async function saveSiteContent(content) {
  const response = await fetch("/api/content", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(content)
  });

  if (!response.ok) {
    throw new Error(`Failed to save site content (${response.status})`);
  }

  return response.json();
}
