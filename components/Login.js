import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../src/config';

// IMPORTAMOS EL LOGO
import logo from '../assets/Logo.png';   // <-- AJUSTA la ruta si está en otra carpeta

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();

  useEffect(() => {
    const reg = route.params?.registro;
    if (!reg) return;

    let prefill = '';
    // reg.usuario puede ser un string o un objeto dependiendo del backend
    if (typeof reg.usuario === 'string') prefill = reg.usuario;
    else if (reg.usuario && typeof reg.usuario.usuario === 'string') prefill = reg.usuario.usuario;
    else if (reg.usuario && Array.isArray(reg.usuario.correo) && reg.usuario.correo.length) prefill = reg.usuario.correo[0];

    if (prefill) setUsername(prefill);
  }, [route.params]);

  const handleLogin = () => {
    // Validación básica
    if (username === '' || password === '') {
      Alert.alert('Error', 'Por favor, completa todos los campos.');
      return;
    }

    // Llamada al backend
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`${BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ usuario: username, contrasena: password })
        });

        const data = await res.json();

        if (!res.ok) {
          Alert.alert('Error', data.error || 'Error al iniciar sesión');
          setLoading(false);
          return;
        }

        // Guardar token en AsyncStorage (opcional)
        if (data.token) {
          await AsyncStorage.setItem('token', data.token);
        }

        // Guardar el nombre de usuario para mostrar en la pantalla Home
        if (data.usuario) {
          await AsyncStorage.setItem('usuario', data.usuario);
        } else {
          // si el backend no devuelve el usuario, guardar el que escribió el usuario
          await AsyncStorage.setItem('usuario', username);
        }

        Alert.alert('Bienvenido', `Usuario: ${data.usuario}`);
        navigation.navigate('Home');
      } catch (error) {
        console.error('Login error:', error.message);
        Alert.alert('Error', 'No se pudo conectar al servidor');
      } finally {
        setLoading(false);
      }
    })();
  };

  return (
    <LinearGradient
      colors={['#3A60FF', '#8EBBFF']}
      style={styles.container}
    >
      {/* Tarjeta superior */}
      <View style={styles.headerCard}>
        <View>
          <Text style={styles.title}>Bienvenido</Text>
          <Text style={styles.subtitle}>INTELLIGENT VEHICLE SECURITY SYSTEM</Text>
        </View>

        <Ionicons name="shield-checkmark" size={55} color="#3A60FF" />
      </View>

      {/* Tarjeta del formulario */}
      <View style={styles.formCard}>

        {/* LOGO + TÍTULO */}
        <Image source={logo} style={styles.logo} resizeMode="contain" />
        <Text style={styles.appTitle}>IVSS</Text>

        {/* USUARIO */}
        <Text style={styles.label}>Usuario</Text>
        <TextInput
          style={styles.input}
          placeholder="Ingresa tu usuario"
          placeholderTextColor="#8c8c8c"
          value={username}
          onChangeText={setUsername}
        />

        {/* CONTRASEÑA */}
        <Text style={styles.label}>Contraseña</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.inputText}
            placeholder="********"
            placeholderTextColor="#8c8c8c"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(s => !s)} style={styles.eyeButton} accessibilityLabel="Mostrar contraseña">
            <Ionicons name={showPassword ? 'eye' : 'eye-off'} size={22} color="#8c8c8c" />
          </TouchableOpacity>
        </View>

        {/* BOTÓN */}
        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Cargando...' : 'Iniciar Sesión'}</Text>
        </TouchableOpacity>

        {/* REGISTRO */}  
        <TouchableOpacity onPress={() => navigation.navigate('Registro')}>
          <Text style={styles.registerText}>¿No tienes cuenta? Regístrate</Text>
        </TouchableOpacity>

      </View>

      <Text style={styles.footer}>Sistema de Registro Vehicular</Text>

    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 25,
    justifyContent: "center",
  },

  /* TARJETA SUPERIOR */
  headerCard: {
    backgroundColor: "white",
    borderRadius: 25,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 6,
    marginBottom: 35,
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1B253B",
  },

  subtitle: {
    fontSize: 14,
    color: "#4B5A75",
    marginTop: 3,
  },

  /* FORM */
  formCard: {
    backgroundColor: "white",
    padding: 25,
    borderRadius: 25,
    width: "100%",
    elevation: 6,
    alignItems: "center",
  },

 logo: {
  width: 90,
  height: 90,
  marginBottom: 10,
  borderRadius: 45,
  overflow: "hidden",
  borderWidth: 2,
  borderColor: "#1B253B",
},

  appTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1B253B",
    marginBottom: 25,
  },

  label: {
    width: "100%",
    color: "#394867",
    fontSize: 14,
    marginBottom: 6,
    marginTop: 12,
  },

  input: {
    width: "100%",
    backgroundColor: "#F2F4F8",
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 15,
    color: "#1B253B",
  },

  inputContainer: {
    width: '100%',
    backgroundColor: '#F2F4F8',
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },

  inputText: {
    flex: 1,
    fontSize: 15,
    color: '#1B253B',
  },

  eyeButton: {
    padding: 6,
  },

  button: {
    width: "100%",
    backgroundColor: "#1E40FF",
    paddingVertical: 14,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 25,
  },

  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },

  registerText: {
    marginTop: 15,
    color: "#1B253B",
    fontSize: 14,
  },

  footer: {
    textAlign: "center",
    marginTop: 30,
    color: "white",
    opacity: 0.8,
  },
});
