export type Restaurant = {
  id: number;
  user_id: string;
  name: string;
  google_maps_url: string;
  image_url: string | null;
  created_at: string;
  distance_meters?: number
};