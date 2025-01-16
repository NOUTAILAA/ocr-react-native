import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import axios from 'axios';

export default function OTPScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');

  const handleVerifyOTP = async () => {
    try {
      const response = await axios.post('http://192.168.1.102:5001/verify_otp', { email, otp });
      Alert.alert('Succès', 'Connexion réussie!');
      navigation.navigate('Homee');
    } catch (error) {
      Alert.alert('Erreur', error.response?.data?.error || 'Une erreur est survenue');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vérification OTP</Text>
      <Text style={styles.subtitle}>
        Entrez votre email et le code OTP que vous avez reçu
      </Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        placeholderTextColor="#B0BEC5"
      />
      <TextInput
        placeholder="Code OTP"
        value={otp}
        onChangeText={setOtp}
        keyboardType="numeric"
        style={styles.input}
        placeholderTextColor="#B0BEC5"
      />
      <TouchableOpacity style={styles.button} onPress={handleVerifyOTP}>
        <Text style={styles.buttonText}>Vérifier OTP</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E3F2FD', // Couleur de fond bleue
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E88E5', // Bleu vif
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#455A64', // Gris foncé
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#FFFFFF', // Blanc
    borderRadius: 25,
    paddingHorizontal: 20,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#CFD8DC', // Gris clair
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#1E88E5', // Bleu vif
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFFFFF', // Blanc
    fontSize: 16,
    fontWeight: 'bold',
  },
});
