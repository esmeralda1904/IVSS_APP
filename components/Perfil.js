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
import { useNavigation } from '@react-navigation/native';
import { BASE_URL } from '../src/config';

export default function Perfil() {
  const navigation = useNavigation();
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

        // Si no hay sesión, forzar al login
        if (!storedToken && !storedUsuario) {
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
          return;
        }

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
        <ActivityIndicator size="large" color={stylesVars.primary} />
        <Text style={{ marginTop: 12 }}>Cargando perfil...</Text>
      </View>
    );
  }

  const fullName = userData?.nombre_usuario ? `${userData.nombre_usuario.nombre} ${userData.nombre_usuario.ap_pat || ''}` : usuario || 'Usuario';
  const email = userData?.correo ? (Array.isArray(userData.correo) ? userData.correo[0] : userData.correo) : '';

  return (
    <View style={styles.container}>
      <View style={styles.headerBackground}>
        <View style={styles.headerInner}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>{/* initials */}
              <Text style={styles.avatarText}>{getInitials()}</Text>
            </View>
          </View>

          <View style={styles.headerInfo}>
            <Text style={styles.title}>{fullName}</Text>
            <Text style={styles.subtitleSmall}>{email}</Text>
          </View>

          <TouchableOpacity style={styles.editButton} onPress={() => Alert.alert('Editar', 'Función de editar pendiente')}>
            <Text style={styles.editButtonText}>Editar</Text>
          </TouchableOpacity>
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
              <TouchableOpacity style={styles.vehiculoCard} activeOpacity={0.8} onPress={() => Alert.alert('Vehículo', `${item.marca} ${item.modelo}\nPlacas: ${item.placas}`)}>
                <View style={styles.brandCircle}><Text style={styles.brandLetter}>{item.marca ? item.marca.substring(0,1).toUpperCase() : 'V'}</Text></View>
                <View style={styles.vehiculoMiddle}>
                  <Text style={styles.vehiculoText}>{item.marca} {item.modelo}</Text>
                  <Text style={styles.small}>Placas: {item.placas}</Text>
                </View>
                <View style={styles.vehiculoRight}>
                  <Text style={styles.chevron}>›</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )}

        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.addButtonText}>Agregar vehículo</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Nuevo vehículo</Text>
            <Text style={styles.inputLabel}>Marca</Text>
            <TextInput placeholder="Ej. Toyota" style={styles.input} value={marca} onChangeText={t=>setMarca(t)} />
            <Text style={styles.inputLabel}>Modelo</Text>
            <TextInput placeholder="Ej. Corolla" style={styles.input} value={modelo} onChangeText={t=>setModelo(t)} />
            <Text style={styles.inputLabel}>Placas</Text>
            <TextInput placeholder="ABC1234" style={styles.input} value={placas} onChangeText={t=>setPlacas(t.toUpperCase())} autoCapitalize="characters" />
            <Text style={styles.inputLabel}>VIN (opcional)</Text>
            <TextInput placeholder="1HGCM82633A004352" style={styles.input} value={vin} onChangeText={t=>setVin(t.toUpperCase())} autoCapitalize="characters" />

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setModalVisible(false)} disabled={submitting}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.modalButton, (!marca || !modelo || !placas || submitting) && styles.buttonDisabled]} onPress={handleAddVehicle} disabled={!marca || !modelo || !placas || submitting}>
                {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.addText}>Agregar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const stylesVars = {
  primary: '#3650A8',
  bg: '#F4F6FB',
  card: '#FFFFFF',
  muted: '#6B7280',
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: stylesVars.bg, padding: 0 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerBackground: { backgroundColor: stylesVars.primary, paddingBottom: 22, paddingTop: 54 },
  headerInner: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18 },
  avatarWrap: { marginRight: 12 },
  avatar: { width: 76, height: 76, borderRadius: 40, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 4 },
  avatarText: { fontSize: 28, fontWeight: '700', color: stylesVars.primary },
  headerInfo: { flex: 1 },
  title: { fontSize: 20, fontWeight: '700', color: '#fff' },
  subtitleSmall: { fontSize: 13, color: '#E8EEF9', marginTop: 4 },
  editButton: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  editButtonText: { color: '#fff', fontWeight: '600' },

  statsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 18, marginTop: -18 },
  statCard: { flex: 1, backgroundColor: stylesVars.card, marginHorizontal: 6, borderRadius: 12, padding: 14, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 3 },
  statNumber: { fontSize: 18, fontWeight: '700', color: '#111827' },
  statLabel: { fontSize: 12, color: stylesVars.muted, marginTop: 4 },

  card: { backgroundColor: stylesVars.card, borderRadius: 12, padding: 14, margin: 18, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10, color: '#111827' },
  empty: { color: stylesVars.muted },

  vehiculoCard: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0F2F7' },
  brandCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  brandLetter: { color: stylesVars.primary, fontWeight: '700' },
  vehiculoMiddle: { flex: 1 },
  vehiculoText: { fontSize: 15, fontWeight: '700', color: '#111827' },
  small: { fontSize: 12, color: stylesVars.muted },
  vehiculoRight: { width: 24, alignItems: 'center' },
  chevron: { fontSize: 22, color: '#CBD5E1' },

  addButton: { marginTop: 12, backgroundColor: stylesVars.primary, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  addButtonText: { color: '#fff', fontWeight: '700' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(2,6,23,0.45)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { width: '92%', backgroundColor: stylesVars.card, borderRadius: 12, padding: 16 },
  modalTitle: { fontSize: 18, fontWeight: '800', marginBottom: 8, color: '#111827' },
  inputLabel: { fontSize: 12, color: stylesVars.muted, marginTop: 8 },
  input: { borderWidth: 1, borderColor: '#EEF2FF', borderRadius: 8, padding: 10, marginTop: 6, backgroundColor: '#FBFCFF' },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 },
  modalButton: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginHorizontal: 6, backgroundColor: stylesVars.primary },
  cancelButton: { backgroundColor: '#F3F4F6' },
  cancelText: { color: '#111827', fontWeight: '600' },
  addText: { color: '#fff', fontWeight: '700' },
  buttonDisabled: { opacity: 0.6 },
});
