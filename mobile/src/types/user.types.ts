export interface User {
  id: string;
  email: string;
  display_name: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
  filled_questionnaire: boolean;
}
