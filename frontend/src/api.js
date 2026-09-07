const API_BASE_URL = "http://127.0.0.1:8000";

async function fetchWithRetry(url, options = {}) {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`Request failed (${response.status})`);
    }

    return response;
  } catch (firstError) {
    await new Promise((resolve) => setTimeout(resolve, 700));

    const retryResponse = await fetch(url, options);

    if (!retryResponse.ok) {
      throw new Error(
        "Connection issue. Make sure the backend server is running."
      );
    }

    return retryResponse;
  }
}

export async function getFirstQuestion() {
  const response = await fetchWithRetry(
    `${API_BASE_URL}/question/first`
  );

  return response.json();
}

export async function submitAnswer(payload) {
  const response = await fetchWithRetry(`${API_BASE_URL}/answer`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return response.json();
}