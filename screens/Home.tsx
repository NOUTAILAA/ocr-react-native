import React, { useState, useEffect, useRef } from 'react';
import { View, Button, Image, Text, StyleSheet, Alert, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<{ [key: string]: string } | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const navigation = useNavigation();
  const screenWidth = Dimensions.get('window').width;
  const frameWidth = screenWidth * 0.9;
  const frameHeight = (frameWidth / 1318) * 832;

  useEffect(() => {
    (async () => {
      if (!permission) {
        const { status } = await requestPermission();
        if (status !== 'granted') {
          Alert.alert('Permission refusée', 'Veuillez autoriser l\'accès à la caméra.');
        }
      }
    })();
  }, [permission]);

  const openCamera = () => {
    if (permission?.granted) {
      setCameraOpen(true);
    } else {
      Alert.alert('Permission refusée', 'Vous devez autoriser l\'accès à la caméra.');
    }
  };

  const takePhoto = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();

      if (photo) {
        const croppedImage = await cropImageToFrame(photo);
        setImage(croppedImage.uri);
        setCameraOpen(false);
        setOcrResult(null);
      } else {
        Alert.alert('Erreur', 'La capture de la photo a échoué.');
      }
    }
  };

  const cropImageToFrame = async (photo: any) => {
    const scaleFactor = photo.width / Dimensions.get('window').width;
    const cropX = (screenWidth - frameWidth) / 2 * scaleFactor;
    const cropY = (photo.height - frameHeight * scaleFactor) / 2;
    const cropWidth = frameWidth * scaleFactor;
    const cropHeight = frameHeight * scaleFactor;

    return await ImageManipulator.manipulateAsync(
      photo.uri,
      [
        {
          crop: {
            originX: cropX,
            originY: cropY,
            width: cropWidth,
            height: cropHeight,
          },
        },
      ],
      { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
    );
  };

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
      setOcrResult(null);
    }
  };

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
        setOcrResult(response.data);
        Alert.alert('Succès', 'Image envoyée avec succès');
      } else {
        Alert.alert('Erreur', 'Échec de l\'envoi de l\'image');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Échec de l\'envoi de l\'image');
      console.error(error);
    }
  };

  if (cameraOpen) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing="back"
        />
        <View style={[styles.overlayFrame, { width: frameWidth, height: frameHeight }]} />
        <Button title="Prendre la photo" onPress={takePhoto} />
        <Button title="Fermer la caméra" onPress={() => setCameraOpen(false)} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.actionButton} onPress={pickImage}>
          <Text style={styles.buttonText}>Galerie</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={openCamera}>
          <Text style={styles.buttonText}>Caméra</Text>
        </TouchableOpacity>
      </View>
  
      {image && <Image source={{ uri: image }} style={styles.image} />}
  
      <TouchableOpacity style={styles.uploadButton} onPress={uploadImage}>
        <Text style={styles.uploadButtonText}>Enregistrer</Text>
      </TouchableOpacity>
  
      {ocrResult && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Résultats OCR :</Text>
          {Object.entries(ocrResult).map(([key, value]) => (
            <View key={key} style={styles.resultRow}>
              <Text style={styles.fieldName}>{key}:</Text>
              <Text style={styles.fieldValue}> {value}</Text>
            </View>
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
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#1E88E5', // Bleu vif
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF', // Blanc
    fontSize: 16,
    fontWeight: 'bold',
  },
  image: {
    width: 300,
    height: 300,
    marginTop: 20,
    borderRadius: 8,
  },
  uploadButton: {
    backgroundColor: '#4CAF50', // Vert
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 2,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#FFFFFF', // Blanc
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultContainer: {
    marginTop: 20,
    width: '100%',
    paddingHorizontal: 10,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#CFD8DC',
  },
  fieldName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#455A64',
  },
  fieldValue: {
    fontSize: 16,
    color: '#616161',
  },
  overlayFrame: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#1E88E5', // Bleu vif
    borderRadius: 10,
  },
  cameraContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000', // Fond noir pour l'affichage de la caméra
  },
  
});