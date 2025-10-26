
export const updateGroupItinerary = async (prevGroupIds: string, userId: string, tripId: string): Promise<any> => {
    try {
        const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/generate_group_feed`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            user_ids: [...prevGroupIds, userId],
        }),
        });
        const data = await response.json();
        console.log(data)
        return data;
    } catch (error) {
        console.error('Error updating group feed:', error);
        return null;
    }
}
