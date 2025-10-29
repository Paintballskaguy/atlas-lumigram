import { View, Text, StyleSheet, Alert, Dimensions, ActivityIndicator, RefreshControl } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useState, useEffect, useCallback } from "react";
import { Image } from "expo-image";
import { getFavoritePosts, removeFavorite, Post } from "../_services/postService";
import { useAuth } from "../_contexts/AuthContext";

const { width } = Dimensions.get("window");

function PostItem({ post, userId, onRemove }: { post: Post; userId: string; onRemove: () => void }) {
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

  // Double tap gesture to unfavorite
  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(async () => {
      try {
        await removeFavorite(userId, post.id);
        Alert.alert("Removed", "Post removed from favorites!");
        onRemove();
      } catch (error) {
        Alert.alert("Error", "Failed to remove from favorites");
      }
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

export default function FavoritesScreen() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch favorites
  const fetchFavorites = async (refresh: boolean = false) => {
    if (!user) return;

    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const posts = await getFavoritePosts(user.uid);
      setFavorites(posts);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      Alert.alert("Error", "Failed to load favorites. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle pull-to-refresh
  const handleRefresh = useCallback(() => {
    fetchFavorites(true);
  }, [user]);

  // Fetch favorites on mount
  useEffect(() => {
    fetchFavorites();
  }, [user]);

  // Handle remove favorite
  const handleRemove = () => {
    fetchFavorites(true);
  };

  // Loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3DDBBA" />
        <Text style={styles.loadingText}>Loading favorites...</Text>
      </View>
    );
  }

  // Empty state
  if (favorites.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No favorites yet!</Text>
        <Text style={styles.emptySubtext}>Double tap posts to add them to favorites</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Please log in</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlashList
        data={favorites}
        renderItem={({ item }) => (
          <PostItem post={item} userId={user.uid} onRemove={handleRemove} />
        )}
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
    textAlign: "center",
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
});