export class ApiError extends Error {
  constructor(message, status, code = "") {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

async function readErrorMessage(response) {
  try {
    const payload = await response.json();
    if (payload && typeof payload.message === "string" && payload.message.trim()) {
      return {
        message: payload.message.trim(),
        code: typeof payload.code === "string" ? payload.code : ""
      };
    }
  } catch {
    // Fall through to the default status-based message.
  }

  return {
    message: `Request failed (${response.status})`,
    code: ""
  };
}

export async function requestJson(url, options = {}) {
  const response = await fetch(url, options);

  if (!response.ok) {
    const error = await readErrorMessage(response);
    throw new ApiError(error.message, response.status, error.code);
  }

  return response.json();
}
