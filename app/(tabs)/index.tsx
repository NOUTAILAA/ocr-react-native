import React, { useState } from 'react';
import { View, Button, Image, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

export default function HomeScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<{ [key: string]: string } | null>(null);

  // Sélectionner une image depuis la galerie
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'Veuillez autoriser l\'accès à la galerie.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setOcrResult(null);  // Réinitialiser le résultat précédent
    }
  };

  // Prendre une photo
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'Veuillez autoriser l\'accès à la caméra.');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setOcrResult(null);  // Réinitialiser le résultat précédent
    }
  };

  // Envoyer l'image au backend Flask
  const uploadImage = async () => {
    if (!image) {
      Alert.alert('Erreur', 'Veuillez capturer ou sélectionner une image.');
      return;
    }

    let localUri = image;
    let filename = localUri.split('/').pop() || 'photo.jpg';

    let formData = new FormData();
    formData.append('image', {
      uri: localUri,
      name: filename,
      type: 'image/jpeg',
    } as any);

    try {
      const response = await axios.post('http://192.168.1.102:5000/upload_cin', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.status === 201) {
        setOcrResult(response.data);  // Stocker le résultat OCR
        Alert.alert('Succès', 'Image envoyée avec succès');
      } else {
        Alert.alert('Erreur', 'Échec de l\'envoi de l\'image');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Échec de l\'envoi de l\'image');
      console.error(error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Button title="Choisir depuis la galerie" onPress={pickImage} />
      <Button title="Prendre une photo" onPress={takePhoto} />
      
      {image && <Image source={{ uri: image }} style={styles.image} />}
      
      <Button title="Envoyer l'image" onPress={uploadImage} />
      
      {ocrResult && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Résultats OCR :</Text>
          {Object.entries(ocrResult).map(([key, value]) => (
            <Text key={key} style={styles.resultText}>
              <Text style={styles.fieldName}>{key}:</Text> {value}
            </Text>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  image: {
    width: 300,
    height: 300,
    marginTop: 20,
  },
  resultContainer: {
    marginTop: 20,
    alignItems: 'flex-start',
    width: '100%',
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  resultText: {
    fontSize: 16,
    marginBottom: 5,
  },
  fieldName: {
    fontWeight: 'bold',
  },
});
