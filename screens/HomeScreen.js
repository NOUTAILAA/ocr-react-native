import React, { useState } from 'react';
import { View, Text, Button, Image, StyleSheet, TextInput, Alert, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

export default function HomeScreen() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [extractedData, setExtractedData] = useState(null); // Pour stocker les données extraites

  // Ouvrir la galerie pour sélectionner une image
  const pickImageFromGallery = async () => {
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

  // Utiliser la caméra pour capturer une image
  const captureImageFromCamera = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  // Envoyer l'image au backend
  const uploadImage = async () => {
    if (!selectedImage) {
      Alert.alert('Erreur', 'Veuillez sélectionner ou capturer une image.');
      return;
    }

    const formData = new FormData();
    formData.append('image', {
      uri: selectedImage,
      name: 'cin_image.jpg',
      type: 'image/jpeg',
    });

    try {
      const response = await axios.post('http://192.168.1.102:5000/upload_cin', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setExtractedData(response.data); // Stocker les données extraites
    } catch (error) {
      Alert.alert('Erreur', error.response?.data?.error || 'Une erreur est survenue lors de l\'upload');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Télécharger une CIN</Text>
      <View style={styles.buttonContainer}>
        <Button title="Choisir depuis la galerie" onPress={pickImageFromGallery} />
        <Button title="Prendre une photo" onPress={captureImageFromCamera} />
      </View>
      {selectedImage && <Image source={{ uri: selectedImage }} style={styles.preview} />}
      <Button title="Envoyer" onPress={uploadImage} />
      {extractedData && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Informations extraites :</Text>
          <View style={styles.infoItem}>
            <Text style={styles.label}>Date de Naissance:</Text>
            <Text style={styles.value}>{extractedData['ddn']}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.label}>Nom:</Text>
            <Text style={styles.value}>{extractedData['nom']}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.label}>Prénom:</Text>
            <Text style={styles.value}>{extractedData['prenom']}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.label}>Numéro CIN:</Text>
            <Text style={styles.value}>{extractedData['numcin']}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.label}>Ville:</Text>
            <Text style={styles.value}>{extractedData['ville']}</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  preview: {
    width: 300,
    height: 200,
    marginVertical: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  resultContainer: {
    marginTop: 20,
    width: '100%',
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  label: {
    fontWeight: 'bold',
    color: '#555',
  },
  value: {
    color: '#000',
  },
});
