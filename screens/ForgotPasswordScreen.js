import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import axios from 'axios';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');

  const handleForgotPassword = async () => {
    try {
      const response = await axios.post('http://192.168.100.45:5001/forgot_password', { email });
      Alert.alert('Succès', response.data.message);
    } catch (error) {
      Alert.alert('Erreur', error.response?.data?.error || 'Une erreur est survenue');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mot de passe oublié</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <Button title="Réinitialiser le mot de passe" onPress={handleForgotPassword} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderBottomWidth: 1,
    marginBottom: 10,
    padding: 8,
  },
});
