import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../src/config';

export default function Perfil() {
  const [loading, setLoading] = useState(true);
  const [usuario, setUsuario] = useState(null); // nombre de usuario (string) almacenado localmente
  const [userData, setUserData] = useState(null); // objeto usuario obtenido del backend o almacenado
  const [vehiculos, setVehiculos] = useState([]);
  const [token, setToken] = useState(null);

  // Modal / form state
  const [modalVisible, setModalVisible] = useState(false);
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [placas, setPlacas] = useState('');
  const [vin, setVin] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const storedUsuario = await AsyncStorage.getItem('usuario');
        const storedToken = await AsyncStorage.getItem('token');
        setUsuario(storedUsuario);
        setToken(storedToken);

        // Intentar obtener datos del backend usando token (si existe)
        if (storedToken) {
          // Intentamos endpoints comunes. Si backend no tiene estos endpoints, capturamos el error y usamos fallback local.
          try {
            const res = await fetch(`${BASE_URL}/api/usuario/me`, {
              headers: { Authorization: `Bearer ${storedToken}` },
            });

            if (res.ok) {
              const body = await res.json();
              setUserData(body.usuario || body);
              // si viene lista de vehículos
              setVehiculos(body.vehiculos || body.vehiculos_usuario || []);
              setLoading(false);
              return;
            }
          } catch (err) {
            // ignore and try next
            console.warn('No se obtuvo user/me:', err.message || err);
          }

          // Intentar obtener vehículos por token
          try {
            const res2 = await fetch(`${BASE_URL}/api/vehiculo/mis-vehiculos`, {
              headers: { Authorization: `Bearer ${storedToken}` },
            });
            if (res2.ok) {
              const body2 = await res2.json();
              setVehiculos(body2.vehiculos || body2);
              setLoading(false);
              return;
            }
          } catch (err) {
            console.warn('No se obtuvo vehiculos:', err.message || err);
          }
        }

        // Fallback: intentar cargar datos guardados localmente (registro_usuario)
        const registro = await AsyncStorage.getItem('registro_usuario');
        if (registro) {
          const parsed = JSON.parse(registro);
          setUserData(parsed);
          if (parsed.vehiculo) setVehiculos([parsed.vehiculo]);
        }
      } catch (error) {
        console.error('Error cargando perfil:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const getInitials = () => {
    const name = userData?.nombre_usuario?.nombre || usuario || '';
    const parts = name.trim().split(' ');
    if (parts.length === 0) return '';
    if (parts.length === 1) return parts[0].substring(0, 1).toUpperCase();
    return (parts[0].substring(0, 1) + parts[1].substring(0, 1)).toUpperCase();
  };

  const handleAddVehicle = async () => {
    if (!marca.trim() || !modelo.trim() || !placas.trim()) {
      Alert.alert('Campos incompletos', 'Por favor completa Marca, Modelo y Placas.');
      return;
    }

    setSubmitting(true);

    // normalizar placas a mayúsculas
    const placasNorm = placas.toUpperCase();
    const payload = { marca: marca.trim(), modelo: modelo.trim(), placas: placasNorm, VIN: (vin || '').trim() };

    // Si hay token, intentar enviar al backend
    if (token) {
      try {
        const res = await fetch(`${BASE_URL}/api/vehiculo`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        const body = await res.json();
        if (!res.ok) {
          console.warn('Error backend agregar vehiculo:', body);
          Alert.alert('Error', body.error || 'No se pudo agregar el vehículo');
          setSubmitting(false);
          return;
        }

        // Asumimos que el backend devuelve el vehículo creado
        const nuevo = body.vehiculo || body;
        setVehiculos(prev => [...prev, nuevo]);
        Alert.alert('Éxito', 'Vehículo agregado correctamente');
        setModalVisible(false);
        // limpiar campos
        setMarca(''); setModelo(''); setPlacas(''); setVin('');
        setSubmitting(false);
        return;
      } catch (err) {
        console.warn('Error conectando al backend para agregar vehículo:', err.message || err);
      }
    }

    // Fallback local: agregar al arreglo y guardar en registro local
    const nuevoLocal = { marca: marca.trim(), modelo: modelo.trim(), placas: placasNorm, VIN: (vin || '').trim() };
    setVehiculos(prev => [...prev, nuevoLocal]);

    try {
      const registro = await AsyncStorage.getItem('registro_usuario');
      const parsed = registro ? JSON.parse(registro) : {};
      // Si ya tenía un vehiculo, convertir a array
      if (!parsed.vehiculos) parsed.vehiculos = [];
      parsed.vehiculos.push(nuevoLocal);
      await AsyncStorage.setItem('registro_usuario', JSON.stringify(parsed));
    } catch (e) {
      console.warn('No se pudo guardar en storage local:', e.message || e);
    }

    Alert.alert('Agregado', 'Vehículo agregado a la información del usuario');
    setModalVisible(false);
    setMarca(''); setModelo(''); setPlacas(''); setVin('');
    setSubmitting(false);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4D5A9F" />
        <Text style={{ marginTop: 12 }}>Cargando perfil...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.avatar}>{/* initials */}
          <Text style={styles.avatarText}>{getInitials()}</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.title}>{userData?.nombre_usuario ? `${userData.nombre_usuario.nombre} ${userData.nombre_usuario.ap_pat || ''}` : usuario || 'Usuario'}</Text>
          <Text style={styles.subtitleSmall}>{userData?.correo ? userData.correo[0] : ''}</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{vehiculos.length}</Text>
          <Text style={styles.statLabel}>Vehículos</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{userData?.precio_suscripcion ? `$${userData.precio_suscripcion}` : '-'}</Text>
          <Text style={styles.statLabel}>Suscripción</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Vehículos</Text>
        {vehiculos.length === 0 ? (
          <Text style={styles.empty}>No hay vehículos registrados.</Text>
        ) : (
          <FlatList
            data={vehiculos}
            keyExtractor={(item, idx) => item._id ? item._id : `${item.placas}-${idx}`}
            renderItem={({ item }) => (
              <View style={styles.vehiculoCard}>
                <View style={styles.vehiculoLeft}>
                  <View style={styles.brandCircle}><Text style={styles.brandLetter}>{item.marca ? item.marca.substring(0,1).toUpperCase() : 'V'}</Text></View>
                </View>
                <View style={styles.vehiculoMiddle}>
                  <Text style={styles.vehiculoText}>{item.marca} {item.modelo}</Text>
                  <Text style={styles.small}>Placas: {item.placas}</Text>
                </View>
                <View style={styles.vehiculoRight}>
                  <Text style={styles.small}>{item.VIN ? 'VIN' : ''}</Text>
                </View>
              </View>
            )}
          />
        )}

        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.addButtonText}>Agregar otro vehículo</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Nuevo vehículo</Text>
            <TextInput placeholder="Marca" style={styles.input} value={marca} onChangeText={t=>setMarca(t)} />
            <TextInput placeholder="Modelo" style={styles.input} value={modelo} onChangeText={t=>setModelo(t)} />
            <TextInput placeholder="Placas" style={styles.input} value={placas} onChangeText={t=>setPlacas(t.toUpperCase())} autoCapitalize="characters" />
            <TextInput placeholder="VIN (opcional)" style={styles.input} value={vin} onChangeText={t=>setVin(t.toUpperCase())} autoCapitalize="characters" />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
              <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#EEE' }]} onPress={() => setModalVisible(false)} disabled={submitting}>
                <Text style={{ color: '#333' }}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.modalButton, !marca || !modelo || !placas || submitting ? styles.buttonDisabled : null]} onPress={handleAddVehicle} disabled={!marca || !modelo || !placas || submitting}>
                {submitting ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff' }}>Agregar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 18, backgroundColor: '#F6F8FB' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { marginBottom: 12 },
  title: { fontSize: 26, fontWeight: '700', color: '#1B253B' },
  subtitle: { fontSize: 14, color: '#4B5A75', marginTop: 4 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, elevation: 3 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  empty: { color: '#666' },
  vehiculoRow: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  vehiculoText: { fontSize: 16, fontWeight: '600' },
  small: { fontSize: 12, color: '#666' },
  addButton: { marginTop: 12, backgroundColor: '#4D5A9F', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  addButtonText: { color: '#fff', fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { width: '90%', backgroundColor: '#fff', borderRadius: 10, padding: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#E3E7F0', borderRadius: 8, padding: 10, marginTop: 8 },
  modalButton: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 8, backgroundColor: '#4D5A9F', alignItems: 'center' },
});
