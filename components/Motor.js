import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

export default function BloqueoMotor() {
  const navigation = useNavigation();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const u = await AsyncStorage.getItem('usuario');
        if (u) setUsuarioActual(u);
      } catch (err) {
        console.warn('No se pudo leer usuario de AsyncStorage', err.message);
      }
    })();
  }, []);

  const handleApagar = async () => {
    // obtener usuario almacenado (si no se cargó aún)
    let stored = usuarioActual;
    if (!stored) {
      try {
        stored = await AsyncStorage.getItem('usuario');
      } catch (err) {
        console.warn('Error leyendo usuario:', err.message);
      }
    }

    // Intentar obtener la contraseña guardada en registro local (registro_usuario)
    let registro = null;
    try {
      const raw = await AsyncStorage.getItem('registro_usuario');
      if (raw) registro = JSON.parse(raw);
    } catch (err) {
      console.warn('Error leyendo registro_usuario:', err.message);
    }

    // Reunir candidatos de contraseña para comparar
    const candidatos = [];
    if (registro) {
      if (registro.contrasena) candidatos.push(registro.contrasena);
      // si la estructura es { usuario: { contrasena: ... } }
      if (registro.usuario && typeof registro.usuario === 'object' && registro.usuario.contrasena) candidatos.push(registro.usuario.contrasena);
    }
    // fallback: el valor 'usuario' guardado (puede ser username) — se añade solo como último recurso
    if (stored) candidatos.push(stored);

    const coincide = candidatos.some(c => c && password === c);
    if (!password || !coincide) {
      Alert.alert('Error', 'Contraseña incorrecta');
      return;
    }

    // Pregunta de confirmación según el estado (bloqueado o no)
    if (!isBlocked) {
      Alert.alert(
        'Confirmación',
        '¿Seguro que quieres bloquear el motor?',
        [
          { text: 'No', style: 'cancel' },
          {
            text: 'Sí',
            onPress: () => {
              setIsBlocked(true);
              Alert.alert('Motor bloqueado');
              setPassword('');
            },
          },
        ],
        { cancelable: true }
      );
    } else {
      // desbloquear
      Alert.alert(
        'Confirmación',
        '¿Seguro que quieres desbloquear el motor?',
        [
          { text: 'No', style: 'cancel' },
          {
            text: 'Sí',
            onPress: () => {
              setIsBlocked(false);
              Alert.alert('Motor desbloqueado');
              setPassword('');
            },
          },
        ],
        { cancelable: true }
      );
    }
  };

  return (
    <LinearGradient
      colors={["#FFFFFF", "#D1D9E9", "#4D5A9F", "#2E2E2E"]}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>Bloqueo de Motor</Text>
          <Text style={styles.subtitle}>Intelligent Vehicle Security System</Text>
        </View>

        {/* TARJETA DE INFORMACIÓN */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Bloqueo Manual del Motor</Text>
          <Text style={styles.description}>
            Para bloquear el motor de su vehículo de manera manual presione el botón
            “Apagar motor” e ingrese su contraseña.{"\n\n"}
            Para desactivar el bloqueo, vuelva a presionarlo e ingrese su contraseña.{"\n\n"}
            Recuerde que el motor se bloqueará de manera automática en caso de que se
            detecte un intento de robo.
          </Text>

          {/* INPUT DE CONTRASEÑA */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.inputText}
              placeholder="Ingrese su contraseña"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(s => !s)} style={styles.eyeButton} accessibilityLabel="Mostrar contraseña">
              <Ionicons name={showPassword ? 'eye' : 'eye-off'} size={22} color="#8c8c8c" />
            </TouchableOpacity>
          </View>

          {/* BOTÓN BLOQUEAR / DESBLOQUEAR */}
          <TouchableOpacity
            style={[styles.mainButton, isBlocked ? styles.blockedButton : null]}
            onPress={handleApagar}
          >
            <Ionicons name={isBlocked ? 'lock-closed' : 'power-outline'} size={26} color="#FFF" />
            <Text style={styles.mainButtonText}>{isBlocked ? 'Desbloquear Motor' : 'Apagar Motor'}</Text>
          </TouchableOpacity>

          {/* BOTÓN REGRESAR */}
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate("Home")}
          >
            <Ionicons name="arrow-back-outline" size={22} color="#4D5A9F" />
            <Text style={styles.secondaryButtonText}>Regresar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 55,
    paddingHorizontal: 20,
  },

  /* HEADER */
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#2E2E2E",
  },
  subtitle: {
    fontSize: 16,
    color: "#4D5A9F",
    marginTop: 5,
  },

  /* CARD */
  card: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2E2E2E",
    marginBottom: 10,
  },
  description: {
    fontSize: 15,
    color: "#555",
    marginBottom: 20,
    lineHeight: 22,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D9E9",
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    fontSize: 15,
  },

  /* BOTONES */
  mainButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4D5A9F",
    paddingVertical: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  mainButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#4D5A9F",
    paddingVertical: 12,
    borderRadius: 12,
  },
  secondaryButtonText: {
    color: "#4D5A9F",
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 8,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: "#D1D9E9",
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 20,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputText: {
    flex: 1,
    fontSize: 15,
  },
  eyeButton: {
    padding: 6,
  },
  blockedButton: {
    backgroundColor: '#C53030',
  },
});
