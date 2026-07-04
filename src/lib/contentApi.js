import { requestJson } from "./apiClient.js";

export async function fetchSiteContent() {
  return requestJson("/api/content");
}

export async function saveSiteContent(content) {
  return requestJson("/api/content", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(content)
  });
}

export async function fetchMessages() {
  return requestJson("/api/messages");
}

export async function createMessage(message) {
  return requestJson("/api/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(message)
  });
}

export async function updateMessage(message) {
  return requestJson("/api/messages", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(message)
  });
}

export async function deleteMessage(messageId) {
  return requestJson("/api/messages", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ id: messageId })
  });
}

export async function fetchVolunteers() {
  return requestJson("/api/volunteers");
}

export async function createVolunteer(volunteer) {
  return requestJson("/api/volunteers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(volunteer)
  });
}

export async function updateVolunteerStatus(volunteer) {
  return requestJson("/api/volunteers", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(volunteer)
  });
}

export async function deleteVolunteer(volunteerId) {
  return requestJson("/api/volunteers", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ id: volunteerId })
  });
}
