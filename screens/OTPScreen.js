import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import axios from 'axios';

export default function OTPScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');

  const handleVerifyOTP = async () => {
    try {
      const response = await axios.post('http://192.168.100.45:5001/verify_otp', { email, otp });
      Alert.alert('Succès', 'Connexion réussie!');
      navigation.navigate('Home');
    } catch (error) {
      Alert.alert('Erreur', error.response?.data?.error || 'Une erreur est survenue');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vérification OTP</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput
        placeholder="Code OTP"
        value={otp}
        onChangeText={setOtp}
        keyboardType="numeric"
        style={styles.input}
      />
      <Button title="Vérifier OTP" onPress={handleVerifyOTP} />
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
