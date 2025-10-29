// Post type for Firestore documents
export interface Post {
  id: string;
  imageUrl: string;
  caption: string;
  createdAt: Date;
  createdBy: string; // User ID from Firebase Auth
}

// Type for creating a new post (before Firestore generates the ID)
export interface NewPost {
  imageUrl: string;
  caption: string;
  createdAt: Date;
  createdBy: string;
}