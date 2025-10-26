import { supabase } from '@/lib/supabase'

export const postPreferences = async (
  id: string,
  sentences: string
) => {
  try {
    console.log("sending req to: ", `${process.env.EXPO_PUBLIC_API_BASE_URL}/add_user`)
    console.log("req body: ", JSON.stringify({form_responses: sentences, userId: id,}))
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
    await userFilledTrue(id)
    
    if (!response.ok) {
      throw new Error(data.message || "Unexpected error occurred");
    }
    return true;
  } catch (error) {
    throw error;
  }
};

export const userFilledTrue = async (
  id: string
) => {
  console.log("userFilledTrue")
  try {
    await supabase.from('users')
    .update({ filled_questionnaire: 'TRUE'})
    .eq('id', id); // userId should match the user's UUID
  } catch (error) {
    throw error;
  }
};
