import { View, Text, StyleSheet, Alert, Dimensions } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useState } from "react";
import { Image } from "expo-image";
import { homeFeed } from "../../placeholder";

const { width } = Dimensions.get("window");

interface Post {
  id: string;
  image: string;
  caption: string;
  createdBy: string;
}

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
      Alert.alert("Double Tap", "Image favorited!");
    })
    .runOnJS(true);

  // Combine gestures
  const composedGesture = Gesture.Exclusive(doubleTapGesture, longPressGesture);

  return (
    <View style={styles.postContainer}>
      <GestureDetector gesture={composedGesture}>
        <View>
          <Image
            source={{ uri: post.image }}
            style={styles.image}
            contentFit="cover"
          />
          {showCaption && (
            <View style={styles.captionOverlay}>
              <Text style={styles.captionText}>{post.caption}</Text>
            </View>
          )}
        </View>
      </GestureDetector>
    </View>
  );
}

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <FlashList
        data={homeFeed}
        renderItem={({ item }) => <PostItem post={item} />}
        estimatedItemSize={400}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
  },
});