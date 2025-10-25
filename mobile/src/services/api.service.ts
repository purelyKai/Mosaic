import ENV from '../config/env';
import { getSession } from './supabase.service';
import { Group, CreateGroupInput, Place, CategoryType, Recommendation } from '../types';

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = ENV.apiBaseUrl;
  }

  private async getAuthHeaders(): Promise<HeadersInit> {
    const session = await getSession();
    return {
      'Content-Type': 'application/json',
      'Authorization': session?.access_token ? `Bearer ${session.access_token}` : '',
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers = await this.getAuthHeaders();
    
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'API request failed');
      }

      return response.json();
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // Groups API
  async getUserGroups(): Promise<Group[]> {
    // TODO: Implement when backend is ready
    // return this.request<Group[]>('/groups');
    console.log('API: getUserGroups (mock)');
    return [];
  }

  async createGroup(input: CreateGroupInput): Promise<Group> {
    // TODO: Implement when backend is ready
    // return this.request<Group>('/groups', {
    //   method: 'POST',
    //   body: JSON.stringify(input),
    // });
    console.log('API: createGroup (mock)', input);
    return {} as Group;
  }

  async joinGroup(code: string): Promise<Group> {
    // TODO: Implement when backend is ready
    // return this.request<Group>('/groups/join', {
    //   method: 'POST',
    //   body: JSON.stringify({ code }),
    // });
    console.log('API: joinGroup (mock)', code);
    return {} as Group;
  }

  async getGroupDetails(groupId: string): Promise<Group> {
    // TODO: Implement when backend is ready
    // return this.request<Group>(`/groups/${groupId}`);
    console.log('API: getGroupDetails (mock)', groupId);
    return {} as Group;
  }

  // Places API
  async getPlaces(groupId: string, categories: CategoryType[]): Promise<Place[]> {
    // TODO: Implement when backend is ready
    // const params = new URLSearchParams({ categories: categories.join(',') });
    // return this.request<Place[]>(`/groups/${groupId}/places?${params}`);
    console.log('API: getPlaces (mock)', groupId, categories);
    return [];
  }

  async submitVote(groupId: string, placeId: string, liked: boolean): Promise<void> {
    // TODO: Implement when backend is ready
    // return this.request<void>(`/groups/${groupId}/votes`, {
    //   method: 'POST',
    //   body: JSON.stringify({ placeId, liked }),
    // });
    console.log('API: submitVote (mock)', groupId, placeId, liked);
  }

  // Recommendations API
  async getRecommendations(groupId: string): Promise<Recommendation[]> {
    // TODO: Implement when backend is ready
    // return this.request<Recommendation[]>(`/groups/${groupId}/recommendations`);
    console.log('API: getRecommendations (mock)', groupId);
    return [];
  }
}

export const apiService = new ApiService();
