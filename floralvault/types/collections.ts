export interface Collection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  coverImage?: string;
  user: { username: string };
}
