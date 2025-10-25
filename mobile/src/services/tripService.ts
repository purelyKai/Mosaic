import { supabase } from '@/lib/supabase'
import { Trip, CreateTripInput, TripMember } from '../types'

/**
 * Create a new trip
 */
export const createTrip = async (input: CreateTripInput): Promise<Trip> => {
  const user = await supabase.auth.getUser()
  
  if (!user.data.user) {
    throw new Error('User not authenticated')
  }

  // Call the database function to generate trip code
  const { data: codeData, error: codeError } = await supabase
    .rpc('generate_trip_code')
    .single()

  if (codeError) {
    console.error('Error generating trip code:', codeError)
    throw new Error('Failed to generate trip code')
  }

  const tripCode = codeData as string

  // Insert the trip
  const { data: trip, error: tripError } = await supabase
    .from('trips')
    .insert({
      code: tripCode,
      name: input.name,
      city: input.city,
      latitude: input.latitude,
      longitude: input.longitude,
      radius_miles: input.radius_miles || 15,
      created_by: user.data.user.id,
    })
    .select()
    .single()

  if (tripError) {
    console.error('Error creating trip:', tripError)
    throw new Error('Failed to create trip. Please try again.')
  }

  return trip as Trip
}

/**
 * Join an existing trip by code
 */
export const joinTrip = async (code: string): Promise<Trip> => {
  const user = await supabase.auth.getUser()
  
  if (!user.data.user) {
    throw new Error('User not authenticated')
  }

  const cleanCode = code.trim().toUpperCase()
  
  if (cleanCode.length !== 6) {
    throw new Error('Trip code must be 6 characters')
  }

  // Find the trip by code
  const { data: trip, error: tripError } = await supabase
    .from('trips')
    .select('*')
    .eq('code', cleanCode)
    .maybeSingle()  // Use maybeSingle instead of single to handle not found

  if (tripError) {
    console.error('Error finding trip:', tripError)
    throw new Error('Failed to search for trip')
  }

  if (!trip) {
    throw new Error('No trip found with that code. Please check the code and try again.')
  }

  // Add the user to trip_members
  const { error: memberError } = await supabase
    .from('trip_members')
    .insert({
      trip_id: trip.id,
      user_id: user.data.user.id,
    })

  if (memberError) {
    // Check if user is already a member
    if (memberError.code === '23505') {
      throw new Error('You are already a member of this trip')
    }
    console.error('Error joining trip:', memberError)
    throw new Error('Failed to join trip. Please try again.')
  }

  return trip as Trip
}

/**
 * Get all trips for the current user
 */
export const getUserTrips = async (): Promise<Trip[]> => {
  const user = await supabase.auth.getUser()
  
  if (!user.data.user) {
    throw new Error('User not authenticated')
  }

  // Get trip IDs where user is a member
  const { data: memberships, error: memberError } = await supabase
    .from('trip_members')
    .select('trip_id')
    .eq('user_id', user.data.user.id)

  if (memberError) {
    console.error('Error fetching memberships:', memberError)
    return []  // Return empty array instead of throwing
  }

  if (!memberships || memberships.length === 0) {
    return []
  }

  const tripIds = memberships.map(m => m.trip_id)

  // Fetch the actual trips
  const { data: trips, error: tripsError } = await supabase
    .from('trips')
    .select('*')
    .in('id', tripIds)
    .order('created_at', { ascending: false })

  if (tripsError) {
    console.error('Error fetching trips:', tripsError)
    return []  // Return empty array instead of throwing
  }

  return (trips || []) as Trip[]
}

/**
 * Get trip details by ID
 */
export const getTripById = async (tripId: string): Promise<Trip | null> => {
  const { data: trip, error } = await supabase
    .from('trips')
    .select('*')
    .eq('id', tripId)
    .maybeSingle()

  if (error) {
    console.error('Error fetching trip:', error)
    return null
  }

  return trip as Trip | null
}

/**
 * Get all members of a trip
 */
export const getTripMembers = async (tripId: string): Promise<TripMember[]> => {
  const { data: members, error } = await supabase
    .from('trip_members')
    .select('*')
    .eq('trip_id', tripId)

  if (error) {
    console.error('Error fetching trip members:', error)
    return []
  }

  return (members || []) as TripMember[]
}

/**
 * Leave a trip
 */
export const leaveTrip = async (tripId: string): Promise<void> => {
  const user = await supabase.auth.getUser()
  
  if (!user.data.user) {
    throw new Error('User not authenticated')
  }

  const { error } = await supabase
    .from('trip_members')
    .delete()
    .eq('trip_id', tripId)
    .eq('user_id', user.data.user.id)

  if (error) {
    console.error('Error leaving trip:', error)
    throw new Error('Failed to leave trip')
  }
}
