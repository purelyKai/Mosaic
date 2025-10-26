
import { Trip } from '../types'
import { supabase } from '@/lib/supabase'



export const updateGroupItinerary = async (
  memberIdList: string[],
  trip: Trip
): Promise<string[] | null> => {
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
    const placeIds = data["group place ids"] as string[];
    console.log(placeIds);
    return placeIds;
  } catch (error) {
    console.error("Error updating group feed:", error);
    return null;
  }
};


export const postTrip = async (trip: Trip): Promise<string[] | null> => {
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

    const result = data2.result as string[];
    console.log("Place IDs in radius:", result);
    return result;
  } catch (error) {
    console.error("Error posting trip:", error);
    return null;
  }
};


// to populate user_ids list of request body to flask generate_group_feed endpoint
export const getUsersByTrip = async (tripId: string): Promise<string[]>  => {
  const { data, error } = await supabase
    .from('trip_members')
    .select('user_id')
    .eq('trip_id', tripId)

  if (error) {
    console.error('Error fetching users:', error)
    return []
  }

  return data.map(member => member.user_id)
}