export interface User {
  id: string;
  username: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Profile {
  username: string;
  bio: string | null;
  profilePic: string | null;
}

export interface Blog {
  id: string;
  title: string;
  content: string;
  image?: string;
  createdAt: string;
}

export interface BlogFeedResponse {
  blogs: Blog[];
  nextCursor: string | null;
}
