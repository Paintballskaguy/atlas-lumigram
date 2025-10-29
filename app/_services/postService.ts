import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { deleteDoc } from "firebase/firestore";
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  getDocs, 
  Timestamp, 
  where, 
  limit, 
  startAfter,
  QueryDocumentSnapshot,
  DocumentData
} from "firebase/firestore";
import { storage, db } from "../../firebaseconfig";

// Define Post types inline to avoid Expo Router treating types folder as a route
export interface Post {
  id: string;
  imageUrl: string;
  caption: string;
  createdAt: Date;
  createdBy: string;
}

export interface NewPost {
  imageUrl: string;
  caption: string;
  createdAt: Date;
  createdBy: string;
}

/**
 * Uploads an image file to Firebase Storage
 * @param uri - Local URI of the image
 * @param userId - The user ID to organize storage
 * @returns Download URL of the uploaded image
 */
export async function uploadImage(uri: string, userId: string): Promise<string> {
  try {
    // Fetch the image as a blob
    const response = await fetch(uri);
    const blob = await response.blob();

    // Create a unique filename with timestamp
    const timestamp = Date.now();
    const filename = `posts/${userId}/${timestamp}.jpg`;

    // Create a reference to Firebase Storage
    const storageRef = ref(storage, filename);

    // Upload the file
    await uploadBytes(storageRef, blob);

    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);

    return downloadURL;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw new Error("Failed to upload image");
  }
}

/**
 * Creates a new post in Firestore
 * @param imageUrl - URL of the uploaded image
 * @param caption - Caption text for the post
 * @param userId - User ID of the post creator
 * @returns The ID of the created post
 */
export async function createPost(
  imageUrl: string,
  caption: string,
  userId: string
): Promise<string> {
  try {
    const newPost: NewPost = {
      imageUrl,
      caption,
      createdAt: new Date(),
      createdBy: userId,
    };

    // Add document to Firestore
    const docRef = await addDoc(collection(db, "posts"), {
      ...newPost,
      createdAt: Timestamp.fromDate(newPost.createdAt),
    });

    return docRef.id;
  } catch (error) {
    console.error("Error creating post:", error);
    throw new Error("Failed to create post");
  }
}

/**
 * Uploads image and creates post in one operation
 * @param imageUri - Local URI of the image
 * @param caption - Caption text
 * @param userId - User ID of the post creator
 * @returns The ID of the created post
 */
export async function uploadImageAndCreatePost(
  imageUri: string,
  caption: string,
  userId: string
): Promise<string> {
  try {
    // First upload the image
    const imageUrl = await uploadImage(imageUri, userId);

    // Then create the post with the image URL
    const postId = await createPost(imageUrl, caption, userId);

    return postId;
  } catch (error) {
    console.error("Error uploading and creating post:", error);
    throw error;
  }
}

/**
 * Fetches all posts ordered by creation date (newest first)
 * @returns Array of posts
 */
export async function getAllPosts(): Promise<Post[]> {
  try {
    const postsQuery = query(
      collection(db, "posts"),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(postsQuery);

    const posts: Post[] = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        imageUrl: data.imageUrl,
        caption: data.caption,
        createdAt: data.createdAt.toDate(),
        createdBy: data.createdBy,
      };
    });

    return posts;
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw new Error("Failed to fetch posts");
  }
}

/**
 * Fetches posts with pagination support
 * @param pageSize - Number of posts to fetch per page (default: 10)
 * @param lastDoc - Last document from previous page (for pagination)
 * @returns Object containing posts array and last visible document
 */
export async function getPostsPaginated(
  pageSize: number = 10,
  lastDoc?: QueryDocumentSnapshot<DocumentData> | null
): Promise<{
  posts: Post[];
  lastVisible: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}> {
  try {
    let postsQuery = query(
      collection(db, "posts"),
      orderBy("createdAt", "desc"),
      limit(pageSize)
    );

    // If we have a last document, start after it for pagination
    if (lastDoc) {
      postsQuery = query(
        collection(db, "posts"),
        orderBy("createdAt", "desc"),
        startAfter(lastDoc),
        limit(pageSize)
      );
    }

    const querySnapshot = await getDocs(postsQuery);

    const posts: Post[] = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        imageUrl: data.imageUrl,
        caption: data.caption,
        createdAt: data.createdAt.toDate(),
        createdBy: data.createdBy,
      };
    });

    // Get the last visible document for next page
    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1] || null;

    // Check if there are more posts by checking if we got a full page
    const hasMore = querySnapshot.docs.length === pageSize;

    return {
      posts,
      lastVisible,
      hasMore,
    };
  } catch (error) {
    console.error("Error fetching paginated posts:", error);
    throw new Error("Failed to fetch paginated posts");
  }
}

/**
 * Fetches posts by a specific user
 * @param userId - User ID to filter posts
 * @returns Array of posts by the user
 */
export async function getPostsByUser(userId: string): Promise<Post[]> {
  try {
    const postsQuery = query(
      collection(db, "posts"),
      where("createdBy", "==", userId),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(postsQuery);

    const posts: Post[] = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        imageUrl: data.imageUrl,
        caption: data.caption,
        createdAt: data.createdAt.toDate(),
        createdBy: data.createdBy,
      };
    });

    return posts;
  } catch (error) {
    console.error("Error fetching user posts:", error);
    throw new Error("Failed to fetch user posts");
  }
}

/**
 * Fetches posts by a specific user with pagination
 * @param userId - User ID to filter posts
 * @param pageSize - Number of posts to fetch per page (default: 10)
 * @param lastDoc - Last document from previous page (for pagination)
 * @returns Object containing posts array and last visible document
 */
export async function getPostsByUserPaginated(
  userId: string,
  pageSize: number = 10,
  lastDoc?: QueryDocumentSnapshot<DocumentData> | null
): Promise<{
  posts: Post[];
  lastVisible: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}> {
  try {
    let postsQuery = query(
      collection(db, "posts"),
      where("createdBy", "==", userId),
      orderBy("createdAt", "desc"),
      limit(pageSize)
    );

    if (lastDoc) {
      postsQuery = query(
        collection(db, "posts"),
        where("createdBy", "==", userId),
        orderBy("createdAt", "desc"),
        startAfter(lastDoc),
        limit(pageSize)
      );
    }

    const querySnapshot = await getDocs(postsQuery);

    const posts: Post[] = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        imageUrl: data.imageUrl,
        caption: data.caption,
        createdAt: data.createdAt.toDate(),
        createdBy: data.createdBy,
      };
    });

    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1] || null;
    const hasMore = querySnapshot.docs.length === pageSize;

    return {
      posts,
      lastVisible,
      hasMore,
    };
  } catch (error) {
    console.error("Error fetching paginated user posts:", error);
    throw new Error("Failed to fetch paginated user posts");
  }
}

// Add to the end of postService.ts

/**
 * Adds a post to user's favorites
 * @param userId - User ID
 * @param postId - Post ID to favorite
 */
export async function addFavorite(userId: string, postId: string): Promise<void> {
  try {
    // Use a composite ID to make it easy to check if already favorited
    const favoriteId = `${userId}_${postId}`;
    
    await addDoc(collection(db, "favorites"), {
      id: favoriteId,
      userId,
      postId,
      createdAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error adding favorite:", error);
    throw new Error("Failed to add favorite");
  }
}

/**
 * Removes a post from user's favorites
 * @param userId - User ID
 * @param postId - Post ID to unfavorite
 */
export async function removeFavorite(userId: string, postId: string): Promise<void> {
  try {
    const favoriteId = `${userId}_${postId}`;
    
    const favoritesQuery = query(
      collection(db, "favorites"),
      where("id", "==", favoriteId)
    );
    
    const querySnapshot = await getDocs(favoritesQuery);
    
    // Delete all matching documents (should only be one)
    const deletePromises = querySnapshot.docs.map(doc => 
      deleteDoc(doc.ref)
    );
    
    await Promise.all(deletePromises);
  } catch (error) {
    console.error("Error removing favorite:", error);
    throw new Error("Failed to remove favorite");
  }
}

/**
 * Checks if a post is favorited by a user
 * @param userId - User ID
 * @param postId - Post ID to check
 * @returns true if favorited, false otherwise
 */
export async function isFavorited(userId: string, postId: string): Promise<boolean> {
  try {
    const favoriteId = `${userId}_${postId}`;
    
    const favoritesQuery = query(
      collection(db, "favorites"),
      where("id", "==", favoriteId)
    );
    
    const querySnapshot = await getDocs(favoritesQuery);
    
    return !querySnapshot.empty;
  } catch (error) {
    console.error("Error checking favorite:", error);
    return false;
  }
}

/**
 * Gets all favorited posts for a user
 * @param userId - User ID
 * @returns Array of favorited posts
 */
export async function getFavoritePosts(userId: string): Promise<Post[]> {
  try {
    // First, get all favorite records for this user
    const favoritesQuery = query(
      collection(db, "favorites"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    
    const favoritesSnapshot = await getDocs(favoritesQuery);
    
    // Extract post IDs
    const postIds = favoritesSnapshot.docs.map(doc => doc.data().postId);
    
    if (postIds.length === 0) {
      return [];
    }
    
    // Fetch all the posts
    // Note: Firestore 'in' queries are limited to 10 items
    const posts: Post[] = [];
    
    // Process in batches of 10
    for (let i = 0; i < postIds.length; i += 10) {
      const batch = postIds.slice(i, i + 10);
      
      const postsQuery = query(
        collection(db, "posts"),
        where("__name__", "in", batch)
      );
      
      const postsSnapshot = await getDocs(postsQuery);
      
      postsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        posts.push({
          id: doc.id,
          imageUrl: data.imageUrl,
          caption: data.caption,
          createdAt: data.createdAt.toDate(),
          createdBy: data.createdBy,
        });
      });
    }
    
    return posts;
  } catch (error) {
    console.error("Error fetching favorite posts:", error);
    throw new Error("Failed to fetch favorite posts");
  }
}