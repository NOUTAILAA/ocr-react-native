import { Stack } from "expo-router";
import React from "react";
import { AuthProvider, useAuth } from "./AuthContext";

export default function Layout() {
  return (
    <AuthProvider>
      <AuthStack />
    </AuthProvider>
  );
}

function AuthStack() {
  const { isAuthenticated } = useAuth();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="loginscreen" options={{ title: "LoginScreen" }} />
      ) : (
        <Stack.Screen name="homescreen" options={{ title: "HomeScreen" }} />
      )}
    </Stack>
  );
}
