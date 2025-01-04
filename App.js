import React, { useState } from 'react';
import { View, Button, Image, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

export default function App() {
    const [image, setImage] = useState(null);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const takePhoto = async () => {
        let result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const uploadImage = async () => {
        if (!image) {
            Alert.alert('Erreur', 'Veuillez sélectionner ou capturer une image.');
            return;
        }

        let localUri = image;
        let filename = localUri.split('/').pop();

        let formData = new FormData();
        formData.append('image', {
            uri: localUri,
            name: filename,
            type: 'image/jpeg',
        });

        try {
            const response = await axios.post('http://192.169.1.102:5000/upload_cin', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            Alert.alert('Succès', 'Image envoyée avec succès');
        } catch (error) {
            Alert.alert('Erreur', 'Échec de l\'envoi de l\'image');
            console.error(error);
        }
    };

    return (
        <View style={styles.container}>
            <Button title="Choisir une image" onPress={pickImage} />
            <Button title="Prendre une photo" onPress={takePhoto} />
            {image && <Image source={{ uri: image }} style={styles.image} />}
            <Button title="Envoyer l'image" onPress={uploadImage} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: 300,
        height: 300,
        marginTop: 20,
    },
});
