import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform, ScrollView, Keyboard, TouchableWithoutFeedback, ActivityIndicator } from "react-native";
import { useState } from "react";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { uploadImageAndCreatePost } from "../services/postService";
import { useAuth } from "../contexts/AuthContext";

export default function AddPostScreen() {
  const { user } = useAuth();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    // Dismiss keyboard before opening image picker
    Keyboard.dismiss();
    
    // Request permission to access media library
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "You need to grant camera roll permissions to upload images.");
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8, // Reduce quality to optimize upload size
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    Keyboard.dismiss();
    
    if (!selectedImage) {
      Alert.alert("No Image", "Please select an image first.");
      return;
    }

    if (!user) {
      Alert.alert("Error", "You must be logged in to create a post.");
      return;
    }
    
    setUploading(true);
    
    try {
      // Upload image and create post
      await uploadImageAndCreatePost(selectedImage, caption, user.uid);
      
      Alert.alert("Success", "Post created successfully!", [
        {
          text: "OK",
          onPress: () => {
            // Reset form after success
            setSelectedImage(null);
            setCaption("");
          }
        }
      ]);
    } catch (error: any) {
      console.error("Error creating post:", error);
      Alert.alert(
        "Upload Failed", 
        error.message || "Failed to create post. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    Keyboard.dismiss();
    setSelectedImage(null);
    setCaption("");
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={100}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Image Display Area */}
          <TouchableOpacity 
            style={styles.imageContainer} 
            onPress={pickImage}
            activeOpacity={0.8}
            disabled={uploading}
          >
            {selectedImage ? (
              <Image
                source={{ uri: selectedImage }}
                style={styles.image}
                contentFit="cover"
              />
            ) : (
              <View style={styles.placeholderContainer}>
                <Text style={styles.placeholderText}>Tap to select an image</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Caption Input */}
          <TextInput
            style={styles.captionInput}
            placeholder="Add a caption"
            placeholderTextColor="#999"
            value={caption}
            onChangeText={setCaption}
            multiline
            maxLength={500}
            returnKeyType="done"
            blurOnSubmit={true}
            onSubmitEditing={Keyboard.dismiss}
            editable={!uploading}
          />

          {/* Save Button */}
          <TouchableOpacity 
            style={[styles.saveButton, uploading && styles.buttonDisabled]} 
            onPress={handleSave}
            disabled={uploading}
          >
            {uploading ? (
              <View style={styles.uploadingContainer}>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.saveButtonText}>Uploading...</Text>
              </View>
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </TouchableOpacity>

          {/* Reset Button */}
          <TouchableOpacity 
            style={styles.resetButton} 
            onPress={handleReset}
            disabled={uploading}
          >
            <Text style={[styles.resetButtonText, uploading && styles.textDisabled]}>
              Reset
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  scrollContent: {
    padding: 20,
    alignItems: "center",
    paddingBottom: 40,
  },
  imageContainer: {
    width: "100%",
    height: 400,
    borderRadius: 20,
    backgroundColor: "#fff",
    marginBottom: 20,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8E8E8",
  },
  placeholderText: {
    fontSize: 18,
    color: "#999",
  },
  captionInput: {
    width: "100%",
    minHeight: 80,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#3DDBBA",
    paddingHorizontal: 20,
    paddingVertical: 15,
    fontSize: 16,
    color: "#333",
    marginBottom: 20,
    textAlignVertical: "top",
  },
  saveButton: {
    width: "100%",
    height: 60,
    backgroundColor: "#3DDBBA",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: "#A8E6D7",
    opacity: 0.7,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
  },
  uploadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  resetButton: {
    width: "100%",
    height: 60,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  resetButtonText: {
    color: "#333",
    fontSize: 18,
    fontWeight: "500",
  },
  textDisabled: {
    color: "#999",
  },
});