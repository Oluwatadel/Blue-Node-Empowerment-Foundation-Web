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
    const serverMessage = typeof payload?.message === "string" ? payload.message.trim() : "";
    const serverError = typeof payload?.error === "string" ? payload.error.trim() : "";

    if (response.status >= 500) {
      return {
        message: "Something went wrong on our side. Please try again.",
        code: typeof payload?.code === "string" && payload.code.trim() ? payload.code.trim() : "SERVER_ERROR"
      };
    }

    if (serverMessage) {
      return {
        message: serverMessage,
        code: typeof payload?.code === "string" ? payload.code : ""
      };
    }

    if (serverError) {
      return {
        message: serverError,
        code: typeof payload?.code === "string" ? payload.code : ""
      };
    }
  } catch {
    // Fall through to the default status-based message.
  }

  return {
    message: response.status >= 500 ? "Something went wrong on our side. Please try again." : "Something went wrong. Please try again.",
    code: response.status >= 500 ? "SERVER_ERROR" : ""
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
