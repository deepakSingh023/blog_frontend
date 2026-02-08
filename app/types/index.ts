
export interface User {
  email: string;
  id: string;
  username: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  id: string;
  username: string;
  role: string;
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
