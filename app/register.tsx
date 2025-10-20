import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = () => {
    // Navigate to tabs (home) after registration
    // Account creation and validation will be implemented in part 2
    router.replace("/(tabs)");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Atlas</Text>
      <Text style={styles.subtitle}>SCHOOL</Text>
      
      <Text style={styles.heading}>Register</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#8B9DC3"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#8B9DC3"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Create Account</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.secondaryButton}
        onPress={() => router.back()}
      >
        <Text style={styles.secondaryButtonText}>
          Login to existing account
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
    backgroundColor: "#00003C",
  },
  title: {
    fontSize: 64,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 2,
    marginBottom: -10,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#3DDBBA",
    letterSpacing: 8,
    marginBottom: 60,
  },
  heading: {
    fontSize: 28,
    fontWeight: "400",
    color: "#FFFFFF",
    marginBottom: 30,
    alignSelf: "flex-start",
  },
  input: {
    width: "100%",
    height: 60,
    borderWidth: 2,
    borderColor: "#3DDBBA",
    borderRadius: 12,
    paddingHorizontal: 20,
    marginBottom: 20,
    fontSize: 18,
    color: "#FFFFFF",
    backgroundColor: "transparent",
  },
  button: {
    width: "100%",
    height: 60,
    backgroundColor: "#3DDBBA",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 15,
  },
  buttonText: {
    color: "#00003C",
    fontSize: 20,
    fontWeight: "600",
  },
  secondaryButton: {
    width: "100%",
    height: 60,
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#3DDBBA",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "400",
  },
});