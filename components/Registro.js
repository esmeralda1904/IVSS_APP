// components/RegistroUsuario.js
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../src/config';

export default function RegistroUsuario() {
  const navigation = useNavigation();

  // Estados para los campos
  const [nombre, setNombre] = useState("");
  const [apPat, setApPat] = useState("");
  const [apMat, setApMat] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [entidad, setEntidad] = useState("");

  const onPasswordChange = (text) => {
    setContrasena(text);
    // regex: min 8, at least one uppercase, at least one digit, only A-Z / a-z and digits
    const pwRegex = /^(?=.{8,}$)(?=.*[A-Z])(?=.*\d)[A-Za-z0-9]+$/;
    if (!text) {
      setPasswordError("");
    } else if (!pwRegex.test(text)) {
      setPasswordError('La contraseña debe tener mínimo 8 caracteres, al menos una mayúscula, al menos un número y sólo letras (A-Z) y dígitos.');
    } else {
      setPasswordError("");
    }
  };
  const [municipio, setMunicipio] = useState("");
  // Vehículo opcional para crear junto con el usuario
  const [includeVehiculo, setIncludeVehiculo] = useState(false);
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [placas, setPlacas] = useState("");
  const [vin, setVin] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    try {
      // Si ya se guardó, entonces navegar a Registrocarr
      // o
      if (saved) {
        navigation.navigate("Registrocarro");
        return;
      }

      // Preparar datos para el backend
      // Validar campos requeridos
      if (!nombre || !apPat || !correo) {
        Alert.alert('Campos incompletos', 'Por favor completa nombre, apellido paterno y correo.');
        return;
      }

      if (includeVehiculo && (!marca || !modelo || !placas)) {
        Alert.alert('Datos de vehículo incompletos', 'Completa Marca, Modelo y Placas para registrar el vehículo ahora.');
        return;
      }

      // Seguridad extra: evitar continuar si la contraseña actual es inválida
      if (contrasena && passwordError) {
        Alert.alert('Contraseña inválida', passwordError);
        return;
      }

      const usuarioData = {
        nombre_usuario: {
          nombre,
          ap_pat: apPat,
          ap_mat: apMat,
        },
        usuario: usuario || correo.split('@')[0],
        contrasena: contrasena || Math.random().toString(36).slice(-8),
        correo: [correo],
        telefono: [telefono],
        numero_vehiculos: 1,
        entidad: entidad || "",
        municipio: municipio || "",
      };

      // Incluir vehículo opcional para que el backend lo cree en la misma petición
      if (includeVehiculo) {
        usuarioData.vehiculo = {
          marca,
          modelo,
          placas,
          VIN: vin || ''
        };
      }

      setLoading(true);

      // Intentar enviar al backend
      try {
        const res = await fetch(`${BASE_URL}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(usuarioData),
        });

        const body = await res.json();

        if (!res.ok) {
          console.error('Error registro backend:', body);
          setLoading(false);
          Alert.alert('Error', body.error || 'No se pudo registrar en el servidor');
          return;
        }

        // Guardar localmente también
        await AsyncStorage.setItem('registro_usuario', JSON.stringify(usuarioData));
        setSaved(true);
        setLoading(false);

        // Preparar payload para enviar a la vista Login
        const payload = {
          usuario: body.usuario || usuarioData,
          vehiculo: body.vehiculo || usuarioData.vehiculo || null,
        };

        // Navegar a Login pasando los datos registrados
        Alert.alert('Éxito', 'Usuario registrado correctamente', [
          {
            text: 'Ir a Iniciar sesión',
            onPress: () => navigation.navigate('Login', { registro: payload }),
          },
        ]);

      } catch (err) {
        console.error('Error conectando al backend:', err.message || err);
        setLoading(false);
        Alert.alert('Error', 'No se pudo conectar al servidor. Los datos se guardaron localmente.');
        // Guardar localmente como fallback
        await AsyncStorage.setItem('registro_usuario', JSON.stringify(usuarioData));
        setSaved(true);

        // Navegar a Login pasando los datos guardados localmente
        navigation.navigate('Login', { registro: { usuario: usuarioData, vehiculo: usuarioData.vehiculo || null } });
      }
    } catch (error) {
      setLoading(false);
      console.error('Error guardando datos:', error);
      Alert.alert('Error', 'No se pudieron guardar los datos.');
    }
  };

  return (
    <LinearGradient colors={["#405A9F", "#A1A9E9", "#FFFFFF"]} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>Registro de Usuario</Text>
          <Text style={styles.subtitle}>Datos Personales</Text>
        </View>

        {/* FORMULARIO */}
        <View style={styles.card}>
          <TextInput
            style={styles.input}
            placeholder="Nombre"
            value={nombre}
            onChangeText={setNombre}
          />
          <TextInput
            style={styles.input}
            placeholder="Apellido Paterno"
            value={apPat}
            onChangeText={setApPat}
          />
          <TextInput
            style={styles.input}
            placeholder="Apellido Materno"
            value={apMat}
            onChangeText={setApMat}
          />
          <TextInput
            style={styles.input}
            placeholder="Correo Electrónico"
            value={correo}
            onChangeText={setCorreo}
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Teléfono"
            value={telefono}
            onChangeText={setTelefono}
            keyboardType="phone-pad"
          />
          <TextInput
            style={styles.input}
            placeholder="Usuario (usuario de acceso)"
            value={usuario}
            onChangeText={setUsuario}
            autoCapitalize="none"
          />
          <View style={{ marginBottom: 6 }}>
            <View style={{ position: 'relative' }}>
              <TextInput
                style={[styles.input, { paddingRight: 45 }]}
                placeholder="Contraseña"
                value={contrasena}
                onChangeText={onPasswordChange}
                secureTextEntry={!passwordVisible}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setPasswordVisible(!passwordVisible)}
                style={{ position: 'absolute', right: 12, top: 12 }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name={passwordVisible ? 'eye-off' : 'eye'} size={22} color="#666" />
              </TouchableOpacity>
            </View>
            {passwordError ? <Text style={{ color: '#cc3333', fontSize: 13, marginTop: 6 }}>{passwordError}</Text> : null}
          </View>
          <TextInput
            style={styles.input}
            placeholder="Entidad"
            value={entidad}
            onChangeText={setEntidad}
          />
          <TextInput
            style={styles.input}
            placeholder="Municipio"
            value={municipio}
            onChangeText={setMunicipio}
          />

          {/* Vehículo opcional: si quieres registrar el vehículo ahora, activa y completa */}
          <View style={{ marginTop: 10, marginBottom: 10 }}>
            <TouchableOpacity onPress={() => setIncludeVehiculo(!includeVehiculo)} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 18, height: 18, borderRadius: 4, borderWidth: 1, borderColor: '#4D5A9F', backgroundColor: includeVehiculo ? '#4D5A9F' : 'transparent', marginRight: 10 }} />
              <Text style={{ color: '#333' }}>{includeVehiculo ? 'Registrar vehículo ahora' : 'Registrar vehículo después (opcional)'}</Text>
            </TouchableOpacity>
          </View>

          {includeVehiculo && (
            <>
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
            </>
          )}
        </View>

        {/* BOTONES */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate("Login")}
          >
            <Ionicons name="arrow-back-outline" size={22} color="#4D5A9F" />
            <Text style={styles.secondaryButtonText}>Retroceder</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.mainButton, (loading || passwordError) && styles.disabledButton]} onPress={handleNext} disabled={loading || !!passwordError}>
            {loading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <>
                <Ionicons name="arrow-forward-outline" size={22} color="#FFF" />
                <Text style={styles.mainButtonText}>{saved ? 'Ir a Registro de vehículos' : 'Siguiente'}</Text>
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
  disabledButton: {
    opacity: 0.7,
  },
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
