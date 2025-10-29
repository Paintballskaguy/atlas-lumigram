import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseconfig";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // Validation
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Auth context will automatically redirect to tabs
    } catch (error: any) {
      // Handle different error codes
      let errorMessage = "An error occurred during login";
      
      if (error.code === "auth/invalid-credential") {
        errorMessage = "Invalid email or password";
      } else if (error.code === "auth/user-not-found") {
        errorMessage = "No account found with this email";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Incorrect password";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many failed attempts. Please try again later.";
      }
      
      Alert.alert("Login Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Atlas</Text>
      <Text style={styles.subtitle}>SCHOOL</Text>
      
      <Text style={styles.heading}>Welcome Back</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#8B9DC3"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        editable={!loading}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#8B9DC3"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!loading}
      />
      
      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Logging in..." : "Login"}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.secondaryButton}
        onPress={() => router.push("/register")}
        disabled={loading}
      >
        <Text style={styles.secondaryButtonText}>
          Don't have an account? Register
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
  buttonDisabled: {
    opacity: 0.6,
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