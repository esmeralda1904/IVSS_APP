// components/Notificacion.js
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';

export default function Notificacion() {
  const [notificaciones, setNotificaciones] = useState([]);
  const nextId = useRef(1);

  const pushNotification = (title, message) => {
    const item = {
      id: String(nextId.current++),
      title,
      message,
      time: new Date().toLocaleString(),
    };
    // newest first
    setNotificaciones(prev => [item, ...prev]);
  };

  const handleMotorFromWatch = () => {
    pushNotification('Motor', 'Se bloqueó el motor desde el reloj');
  };

  const handleMotorUnlockFromWatch = () => {
    pushNotification('Motor', 'Se desbloqueó el motor desde el reloj');
  };

  const handleProximityAlert = () => {
    pushNotification('Proximidad', '¡Alguien está muy cerca del carro!');
  };

  const handleWearConnected = () => {
    pushNotification('Conexión', 'Se conectó a un dispositivo Wear OS');
  };

  const renderItem = ({ item }) => (
    <View style={styles.notificationItem}>
      <Text style={styles.notificationTitle}>{item.title}</Text>
      <Text style={styles.notificationMessage}>{item.message}</Text>
      <Text style={styles.notificationTime}>{item.time}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Notificaciones</Text>
        <TouchableOpacity style={styles.deleteButton} onPress={() => setNotificaciones([])}>
          <Text style={styles.deleteButtonText}>Eliminar</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        style={styles.flatList}
        data={notificaciones}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No hay notificaciones</Text>}
        inverted={false}
      />

      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={handleMotorFromWatch}>
          <Text style={styles.buttonText}>Bloquear motor</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleProximityAlert}>
          <Text style={styles.buttonText}>Alerta proximidad</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleWearConnected}>
          <Text style={styles.buttonText}>Conectar reloj</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleMotorUnlockFromWatch}>
          <Text style={styles.buttonText}>Desbloquear motor</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { fontSize: 22, fontWeight: '600', textAlign: 'center', padding: 12 },
  list: { paddingHorizontal: 12, paddingBottom: 12 },
  empty: { textAlign: 'center', marginTop: 40, color: '#666' },
  notificationItem: {
    backgroundColor: '#f7f7f7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    elevation: 1,
  },
  notificationTitle: { fontWeight: '500', marginBottom: 4 },
  notificationMessage: { color: '#333' },
  notificationTime: { color: '#888', fontSize: 12, marginTop: 6 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  button: {
    flex: 1,
    marginHorizontal: 6,
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    opacity: 0.7,
  },
  buttonText: { color: '#ffffffff', fontWeight: '500' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, marginTop: 24, paddingVertical: 6 },
  deleteButton: { backgroundColor: '#d9534f', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6 },
  deleteButtonText: { color: '#fff', fontWeight: '700' },
  flatList: { flex: 1 },
});
