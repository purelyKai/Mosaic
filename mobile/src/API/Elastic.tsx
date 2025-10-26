import { Trip, Place } from '../types'
import { supabase } from '@/lib/supabase'



export const updateGroupItinerary = async (
  memberIdList: string[],
  trip: Trip
): Promise<Place[] | null> => {
  try {
    const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/generate_group_feed`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_ids: memberIdList,
        lat: String(trip.latitude),
        long: String(trip.longitude),
        radius: String(trip.radius_miles),
      }),
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }

    const data = await response.json();
    const places: Place[] = parsePlacesResponse(data);
    
    return places;
  } catch (error) {
    console.error("Error updating group feed:", error);
    return null;
  }
};


export const postTrip = async (trip: Trip): Promise<Place[] | null> => {
  const requestBody = {
    lat: trip.latitude,
    long: trip.longitude,
    radius: trip.radius_miles,
  };

  try {
    // First endpoint: /find_places
    const response1 = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/find_places`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const data1 = await response1.json();

    if (!response1.ok) {
      throw new Error(data1.message || "Error from /find_places");
    }

    // Second endpoint: /find_x_radius_locations
    const response2 = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/find_x_radius_locations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const data2 = await response2.json();

    if (!response2.ok) {
      throw new Error(data2.message || "Error from /find_x_radius_locations");
    }

    const places: Place[] = parsePlacesResponse(data2);
    return places;
  } catch (error) {
    console.error("Error posting trip:", error);
    return null;
  }
};

export const getFeed = async (trip: Trip): Promise<Place[] | null> => {
  const requestBody = {
    lat: trip.latitude,
    long: trip.longitude,
    radius: trip.radius_miles,
  };

  try {

    const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/find_x_radius_locations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Error from /find_x_radius_locations");
    }

    const places: Place[] = parsePlacesResponse(data);
    return places;
  } catch (error) {
    console.error("Error posting trip:", error);
    return null;
  }
};

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

export const parsePlacesResponse = (response: any): Place[] => {
  const placesDict = response.places;

  return Object.entries(placesDict).map(([id, placeData]) => {
    const data = placeData as { name: string; image_url: string };

    return {
      id,
      name: data.name,
      category: null, // Update if category info is available
      imageUrl: data.image_url,
    };
  });
};

export const postLike = async (userId: string, placeId: string) => {
  const requestBody = {
    userId: userId,
    placeId: placeId,
  };

  try {
    // First endpoint: /update_user_profile
    const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/update_user_profile`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Error from /update_user_profile");
    }

    console.log("Response to like: ", data.message)

    return true;
  } catch (error) {
    console.error("Error posting like:", error);
    return false;
  }
};
