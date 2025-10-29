import { View, Text, StyleSheet, Alert, Dimensions, ActivityIndicator, RefreshControl } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useState, useEffect, useCallback } from "react";
import { Image } from "expo-image";
import { getPostsPaginated } from "./services/postService";
import { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";
import { Post } from "./services/postService";

const { width } = Dimensions.get("window");

// Number of posts to load per page
const PAGE_SIZE = 10;

function PostItem({ post }: { post: Post }) {
  const [showCaption, setShowCaption] = useState(false);

  // Long press gesture to show caption
  const longPressGesture = Gesture.LongPress()
    .minDuration(500)
    .onStart(() => {
      setShowCaption(true);
    })
    .onEnd(() => {
      setShowCaption(false);
    })
    .runOnJS(true);

  // Double tap gesture to favorite
  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      Alert.alert("Double Tap", "Added to favorites!");
    })
    .runOnJS(true);

  // Combine gestures
  const composedGesture = Gesture.Exclusive(doubleTapGesture, longPressGesture);

  return (
    <View style={styles.postContainer}>
      <GestureDetector gesture={composedGesture}>
        <View>
          <Image
            source={{ uri: post.imageUrl }}
            style={styles.image}
            contentFit="cover"
          />
          {showCaption && (
            <View style={styles.captionOverlay}>
              <Text style={styles.captionText}>{post.caption}</Text>
              <Text style={styles.authorText}>By: {post.createdBy}</Text>
              <Text style={styles.dateText}>
                {new Date(post.createdAt).toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>
      </GestureDetector>
    </View>
  );
}

export default function HomeScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);

  // Fetch initial posts
  const fetchPosts = async (refresh: boolean = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const result = await getPostsPaginated(PAGE_SIZE);
      setPosts(result.posts);
      setLastVisible(result.lastVisible);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error("Error fetching posts:", error);
      Alert.alert("Error", "Failed to load posts. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load more posts for pagination
  const loadMorePosts = async () => {
    if (!hasMore || loadingMore) {
      return;
    }

    try {
      setLoadingMore(true);
      const result = await getPostsPaginated(PAGE_SIZE, lastVisible);
      
      // Append new posts to existing posts
      setPosts((prevPosts) => [...prevPosts, ...result.posts]);
      setLastVisible(result.lastVisible);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error("Error loading more posts:", error);
      Alert.alert("Error", "Failed to load more posts.");
    } finally {
      setLoadingMore(false);
    }
  };

  // Handle pull-to-refresh
  const handleRefresh = useCallback(() => {
    fetchPosts(true);
  }, []);

  // Fetch posts on mount
  useEffect(() => {
    fetchPosts();
  }, []);

  // Render footer with loading indicator when loading more
  const renderFooter = () => {
    if (!loadingMore) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#3DDBBA" />
      </View>
    );
  };

  // Initial loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3DDBBA" />
        <Text style={styles.loadingText}>Loading posts...</Text>
      </View>
    );
  }

  // Empty state
  if (posts.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No posts yet!</Text>
        <Text style={styles.emptySubtext}>Be the first to create a post</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlashList
        data={posts}
        renderItem={({ item }) => <PostItem post={item} />}
        estimatedItemSize={400}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#3DDBBA"]}
            tintColor="#3DDBBA"
          />
        }
        onEndReached={loadMorePosts}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  emptyText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: "#666",
  },
  postContainer: {
    marginBottom: 20,
  },
  image: {
    width: width - 16,
    height: 400,
    marginHorizontal: 8,
    borderRadius: 16,
  },
  captionOverlay: {
    position: "absolute",
    bottom: 0,
    left: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  captionText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  authorText: {
    color: "#3DDBBA",
    fontSize: 14,
    marginBottom: 2,
  },
  dateText: {
    color: "#ccc",
    fontSize: 12,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});