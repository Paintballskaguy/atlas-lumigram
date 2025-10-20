import { View, Text, StyleSheet } from "react-native";

export default function AddPostScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Post</Text>
      <Text style={styles.subtitle}>
        Create and share your moments
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#00003C",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});