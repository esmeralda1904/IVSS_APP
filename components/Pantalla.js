// components/Pantalla.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from "../src/config";
import { LinearGradient } from 'expo-linear-gradient';

export default function Pantalla() {
  const navigation = useNavigation();

  const [loading, setLoading] = useState(false);
  const [solicitudes, setSolicitudes] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Form state
  const [modalVisible, setModalVisible] = useState(false);
  const [nombre, setNombre] = useState("");
  const [apPat, setApPat] = useState("");
  const [apMat, setApMat] = useState("");
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");
  const [tipo, setTipo] = useState("");
  const [complemento, setComplemento] = useState("");

  useEffect(() => {
    fetchSolicitudes();
  }, []);

  const getToken = async () => {
    try {
      const t = await AsyncStorage.getItem('token');
      return t;
    } catch (err) {
      console.error('Error leyendo token:', err.message);
      return null;
    }
  };

  const fetchSolicitudes = async () => {
    setLoading(true);
    const token = await getToken();
    console.log('Pantalla: token leido =', token);
    if (!token) {
      setLoading(false);
      Alert.alert('Token no encontrado', 'Por favor inicia sesión antes de acceder a ARCO', [
        { text: 'Ir a Login', onPress: () => navigation.navigate('Login') },
      ]);
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/api/arco/listar`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await res.json();
      if (res.status === 401 || data?.error === 'Token inválido') {
        console.warn('Token inválido detectado en fetchSolicitudes:', data);
        await AsyncStorage.removeItem('token');
        Alert.alert('Sesión inválida', 'Tu sesión ha expirado o es inválida. Por favor inicia sesión de nuevo.', [
          { text: 'Ir a Login', onPress: () => navigation.navigate('Login') }
        ]);
        setSolicitudes([]);
        return;
      }

      if (!res.ok) {
        console.error('Error al obtener solicitudes:', data);
        Alert.alert('Error', data.mensaje || data.error || 'No se pudieron cargar las solicitudes');
        setSolicitudes([]);
      } else {
        setSolicitudes(data.data || []);
      }
    } catch (err) {
      console.error('Fetch error:', err.message);
      Alert.alert('Error', 'No se pudo conectar con el servidor');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSolicitudes();
  };

  const crearSolicitud = async () => {
    if (!nombre.trim()) return Alert.alert('Validación', 'Ingresa el nombre del solicitante');

    const token = await getToken();
    if (!token) return Alert.alert('Token', 'Inicia sesión para continuar');

    const body = {
      solicitante: { nombre: nombre.trim(), ap_pat: apPat.trim(), ap_mat: apMat.trim() },
      medios_contacto: { telefono: telefono ? [telefono.trim()] : [], correo: correo ? [correo.trim()] : [] },
      tipo_solicitud: tipo ? [tipo.trim()] : [],
      complemento: complemento ? [complemento.trim()] : []
    };

    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/api/arco/registrar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (res.status === 401 || data?.error === 'Token inválido') {
        console.warn('Token inválido detectado en crearSolicitud:', data);
        await AsyncStorage.removeItem('token');
        Alert.alert('Sesión inválida', 'Tu sesión ha expirado o es inválida. Por favor inicia sesión de nuevo.', [
          { text: 'Ir a Login', onPress: () => navigation.navigate('Login') }
        ]);
        return;
      }

      if (!res.ok) {
        console.error('Error registrar:', data);
        Alert.alert('Error', data.mensaje || data.error || 'No se pudo registrar la solicitud');
        return;
      }

      Alert.alert('Éxito', data.mensaje || 'Solicitud registrada');
      // Limpiar form y cerrar modal
      setNombre(''); setApPat(''); setApMat(''); setTelefono(''); setCorreo(''); setTipo(''); setComplemento('');
      setModalVisible(false);
      fetchSolicitudes();
    } catch (err) {
      console.error('Crear solicitud error:', err.message);
      Alert.alert('Error', 'No se pudo conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => {
    const s = item.solicitante || {};
    const contacto = item.medios_contacto || {};
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{s.nombre} {s.ap_pat} {s.ap_mat}</Text>
        <Text style={styles.cardText}>Tel: {(contacto.telefono || []).join(', ')}</Text>
        <Text style={styles.cardText}>Correo: {(contacto.correo || []).join(', ')}</Text>
        <Text style={styles.cardText}>Tipo: {(item.tipo_solicitud || []).join(', ')}</Text>
      </View>
    );
  };

  return (
    <LinearGradient
      colors={["#405A9F", "#A1A9E9", "#FFFFFF"]}
      start={[0, 0]}
      end={[0, 1]}
      style={styles.container}
    >
      <Text style={styles.title}>Solicitudes ARCO</Text>

      <View style={{ width: '100%', alignItems: 'flex-end', paddingHorizontal: 20 }}>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addText}>Nueva solicitud</Text>
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#4D5A9F" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={solicitudes}
          keyExtractor={(item) => item._id || Math.random().toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 20 }}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#ffffffff' }}>No hay solicitudes</Text>}
        />
      )}

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.navigate("Home")}
      >
        <Ionicons name="arrow-back-outline" size={22} color="#4D5A9F" />
        <Text style={styles.backText}>Regresar</Text>
      </TouchableOpacity>

      {/* Modal para crear solicitud */}
      <Modal visible={modalVisible} animationType="slide">
        <ScrollView contentContainerStyle={styles.modalContainer}>
          <Text style={styles.modalTitle}>Crear Solicitud ARCO</Text>

          <Text style={styles.label}>Nombre(s)</Text>
          <TextInput style={styles.input} value={nombre} onChangeText={setNombre} placeholder="Nombre" />

          <Text style={styles.label}>Apellido Paterno</Text>
          <TextInput style={styles.input} value={apPat} onChangeText={setApPat} placeholder="Apellido paterno" />

          <Text style={styles.label}>Apellido Materno</Text>
          <TextInput style={styles.input} value={apMat} onChangeText={setApMat} placeholder="Apellido materno" />

          <Text style={styles.label}>Teléfono</Text>
          <TextInput style={styles.input} value={telefono} onChangeText={setTelefono} placeholder="5551234567" keyboardType="phone-pad" />

          <Text style={styles.label}>Correo</Text>
          <TextInput style={styles.input} value={correo} onChangeText={setCorreo} placeholder="correo@ejemplo.com" keyboardType="email-address" />

          <Text style={styles.label}>Tipo de solicitud</Text>
          <TextInput style={styles.input} value={tipo} onChangeText={setTipo} placeholder="Acceso / Rectificación / Cancelación" />

          <Text style={styles.label}>Complemento</Text>
          <TextInput style={styles.input} value={complemento} onChangeText={setComplemento} placeholder="Detalles adicionales" />

          <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
            <TouchableOpacity style={[styles.button, { flex: 1, marginRight: 8 }]} onPress={crearSolicitud} disabled={loading}>
              <Text style={styles.buttonText}>{loading ? 'Enviando...' : 'Enviar'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.cancelButton, { flex: 1 }]} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 40, backgroundColor: 'transparent', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: "bold", color: "#FFFFFF", textAlign: 'center', marginTop: 36, marginBottom: 12 },
  backButton: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#4D5A9F",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#fff'
  },
  backText: { color: "#4D5A9F", fontSize: 15, fontWeight: "600", marginLeft: 8 },

  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4D5A9F',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginTop: 6,
    marginBottom: 6,
  },
  addText: { color: '#fff', marginLeft: 8, fontWeight: '600' },

  card: { backgroundColor: '#fff', padding: 14, borderRadius: 12, marginBottom: 12, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1B253B' },
  cardText: { fontSize: 13, color: '#555', marginTop: 4 },

  modalContainer: { padding: 20, paddingTop: 40, backgroundColor: '#F4F6FA', minHeight: '100%' },
  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 16, textAlign: 'center' },
  label: { color: '#394867', marginTop: 10, marginBottom: 6 },
  input: { backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 12, height: 46, fontSize: 15, color: '#1B253B' },

  button: { backgroundColor: '#1E40FF', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '700' },

  cancelButton: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  cancelText: { color: '#333', fontWeight: '700' },
});
