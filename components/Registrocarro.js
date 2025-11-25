import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../src/config';

export default function Registrocarro() {
	const navigation = useNavigation();

	const [marca, setMarca] = useState("");
	const [modelo, setModelo] = useState("");
	const [placas, setPlacas] = useState("");
	const [vin, setVin] = useState("");
	const [loading, setLoading] = useState(false);

	const handleRegister = async () => {
		if (!marca || !modelo || !placas) {
			Alert.alert('Campos incompletos', 'Por favor completa Marca, Modelo y Placas.');
			return;
		}

		setLoading(true);

		try {
			const token = await AsyncStorage.getItem('token');
			if (!token) {
				setLoading(false);
				Alert.alert('Error', 'No estás autenticado. Por favor inicia sesión.');
				navigation.navigate('Login');
				return;
			}

			const vehiculoData = {
				marca,
				modelo,
				placas,
				VIN: vin,
				estado_motor: true,
			};

			const res = await fetch(`${BASE_URL}/api/vehiculos/agregar`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`,
				},
				body: JSON.stringify(vehiculoData),
			});

			const body = await res.json();

			if (!res.ok) {
				console.error('Error registrando vehículo:', body);
				Alert.alert('Error', body.error || 'No se pudo registrar el vehículo');
				setLoading(false);
				return;
			}

			Alert.alert('Éxito', 'Vehículo registrado correctamente');
			setMarca(''); setModelo(''); setPlacas(''); setVin('');
			setLoading(false);
			navigation.navigate('Home');
		} catch (error) {
			console.error('Error conexión:', error);
			Alert.alert('Error', 'No se pudo conectar al servidor. Intenta de nuevo.');
			setLoading(false);
		}
	};

	return (
		<LinearGradient colors={["#405A9F", "#A1A9E9", "#FFFFFF"]} style={styles.container}>
			<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
				<View style={styles.header}>
					<Text style={styles.title}>Registro de Vehículo</Text>
					<Text style={styles.subtitle}>Agrega los datos del vehículo</Text>
				</View>

				<View style={styles.card}>
					<TextInput
						style={styles.input}
						placeholder="Marca"
						value={marca}
						onChangeText={setMarca}
					/>

					<TextInput
						style={styles.input}
						placeholder="Modelo"
						value={modelo}
						onChangeText={setModelo}
					/>

					<TextInput
						style={styles.input}
						placeholder="Placas"
						value={placas}
						onChangeText={setPlacas}
						autoCapitalize="characters"
					/>

					<TextInput
						style={styles.input}
						placeholder="VIN (opcional)"
						value={vin}
						onChangeText={setVin}
						autoCapitalize="characters"
					/>
				</View>

				<View style={styles.buttonsContainer}>
					<TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.goBack()}>
						<Ionicons name="arrow-back-outline" size={20} color="#4D5A9F" />
						<Text style={styles.secondaryButtonText}>Volver</Text>
					</TouchableOpacity>

					<TouchableOpacity style={[styles.mainButton, loading && styles.disabledButton]} onPress={handleRegister} disabled={loading}>
						{loading ? (
							<ActivityIndicator size="small" color="#FFF" />
						) : (
							<>
								<Ionicons name="cloud-upload-outline" size={20} color="#FFF" />
								<Text style={styles.mainButtonText}>Registrar Vehículo</Text>
							</>
						)}
					</TouchableOpacity>
				</View>
			</ScrollView>
		</LinearGradient>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, paddingTop: 55, paddingHorizontal: 20 },
	header: { marginBottom: 20 },
	title: { fontSize: 26, fontWeight: "bold", color: "#FFF" },
	subtitle: { fontSize: 16, color: "#2E2E2E", marginTop: 5 },
	card: {
		backgroundColor: "#FFF",
		borderRadius: 20,
		padding: 20,
		shadowColor: "#000",
		shadowOpacity: 0.1,
		shadowRadius: 10,
		marginBottom: 30,
	},
	input: {
		borderWidth: 1,
		borderColor: "#D1D9E9",
		borderRadius: 10,
		padding: 12,
		marginBottom: 15,
		fontSize: 15,
		backgroundColor: "#F9FAFB",
	},
	buttonsContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 40,
	},
	mainButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#4D5A9F",
		paddingVertical: 15,
		paddingHorizontal: 20,
		borderRadius: 12,
	},
	disabledButton: { opacity: 0.7 },
	mainButtonText: { color: "#FFF", fontSize: 16, fontWeight: "bold", marginLeft: 8 },
	secondaryButton: {
		flexDirection: "row",
		alignItems: "center",
		borderWidth: 1,
		borderColor: "#4D5A9F",
		paddingVertical: 12,
		paddingHorizontal: 20,
		borderRadius: 12,
	},
	secondaryButtonText: { color: "#4D5A9F", fontSize: 15, fontWeight: "600", marginLeft: 8 },
});

