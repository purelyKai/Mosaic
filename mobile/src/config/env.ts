import Constants from 'expo-constants';

const ENV = {
  supabaseUrl: Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  apiBaseUrl: Constants.expoConfig?.extra?.apiBaseUrl || process.env.EXPO_PUBLIC_API_BASE_URL,
};

// Validate required environment variables
if (!ENV.supabaseUrl || !ENV.supabaseAnonKey || !ENV.apiBaseUrl) {
  throw new Error('Missing required environment variables. Check your .env file.');
}

export default ENV;
