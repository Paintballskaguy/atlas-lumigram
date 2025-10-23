import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform, ScrollView, Keyboard, TouchableWithoutFeedback } from "react-native";
import { useState } from "react";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";

export default function AddPostScreen() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [caption, setCaption] = useState("");

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
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    Keyboard.dismiss();
    
    if (!selectedImage) {
      Alert.alert("No Image", "Please select an image first.");
      return;
    }
    
    // In part 2, this will actually save the post
    Alert.alert("Success", "Post saved successfully!");
    
    // Reset form
    setSelectedImage(null);
    setCaption("");
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
          />

          {/* Save Button */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>

          {/* Reset Button */}
          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <Text style={styles.resetButtonText}>Reset</Text>
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
  saveButtonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
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
});