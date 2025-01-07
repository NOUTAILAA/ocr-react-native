import React, { useState, useEffect, useRef } from 'react';
import { View, Button, Image, Text, StyleSheet, Alert, ScrollView, Dimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';

export default function HomeScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<{ [key: string]: string } | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();

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
      <Button title="Choisir depuis la galerie" onPress={pickImage} />
      <Button title="Ouvrir la caméra" onPress={openCamera} />

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
  cameraContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayFrame: {
    borderColor: 'red',
    borderWidth: 4,
    position: 'absolute',
    top: '35%',
    borderRadius: 10,
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
