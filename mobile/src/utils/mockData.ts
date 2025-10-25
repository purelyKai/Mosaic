import { Group, Place } from '../types';

export const mockGroups: Group[] = [
  {
    id: '1',
    code: 'ABC123',
    name: 'Tokyo Adventure',
    location: {
      city: 'Tokyo',
      coordinates: { lat: 35.6762, lng: 139.6503 },
      radiusMiles: 15,
    },
    memberIds: ['user1', 'user2'],
    createdBy: 'user1',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    code: 'XYZ789',
    name: 'Paris Trip 2024',
    location: {
      city: 'Paris',
      coordinates: { lat: 48.8566, lng: 2.3522 },
      radiusMiles: 15,
    },
    memberIds: ['user1', 'user3', 'user4'],
    createdBy: 'user3',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

export const mockPlaces: Place[] = [
  {
    id: '1',
    name: 'Sushi Saito',
    category: 'food',
    description: 'Best sushi in Tokyo with fresh ingredients',
    imageUrl: 'https://via.placeholder.com/400x300',
    location: { lat: 35.6762, lng: 139.6503 },
    address: '1-1-1 Shibuya, Tokyo',
  },
  {
    id: '2',
    name: 'Tokyo Skytree',
    category: 'entertainment',
    description: 'Iconic tower with stunning city views',
    imageUrl: 'https://via.placeholder.com/400x300',
    location: { lat: 35.7101, lng: 139.8107 },
    address: '1-1-2 Oshiage, Tokyo',
  },
  {
    id: '3',
    name: 'Yoyogi Park',
    category: 'nature',
    description: 'Beautiful urban park perfect for relaxation',
    imageUrl: 'https://via.placeholder.com/400x300',
    location: { lat: 35.6719, lng: 139.6958 },
    address: 'Yoyogi Kamizonocho, Tokyo',
  },
  {
    id: '4',
    name: 'Golden Gai Bar',
    category: 'drinks',
    description: 'Traditional Japanese bar in Shinjuku',
    imageUrl: 'https://via.placeholder.com/400x300',
    location: { lat: 35.6938, lng: 139.7044 },
    address: '1-1-6 Kabukicho, Shinjuku',
  },
];
