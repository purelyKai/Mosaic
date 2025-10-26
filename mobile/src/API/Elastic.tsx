export const postPreferences = async (
  id: string,
  sentences: string
) => {
  try {
    const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/add_user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        form_responses: sentences,
        userId: id,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Unexpected error occurred");
    }
    return true;
  } catch (error) {
    throw error;
  }
};