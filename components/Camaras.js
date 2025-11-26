import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Linking, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const TARGET_URL = 'http://192.168.100.13';

export default function Camaras() {
  const openLink = async (cameraName) => {
    try {
      const can = await Linking.canOpenURL(TARGET_URL);
      if (!can) {
        Alert.alert('No se puede abrir', `No se puede abrir la URL: ${TARGET_URL}`);
        return;
      }
      await Linking.openURL(TARGET_URL);
    } catch (err) {
      Alert.alert('Error', err.message || String(err));
    }
  };

  const StatusBadge = ({ status }) => {
    const s = (status || '').toLowerCase();
    const bg = s.includes('act') ? '#34D399' : s.includes('inact') ? '#F97316' : '#9CA3AF';
    return (
      <View style={[styles.badge, { backgroundColor: bg }]}> 
        <Text style={styles.badgeText}>{status}</Text>
      </View>
    );
  };

  const CameraCard = ({ label, sub }) => (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => openLink(label)}
      style={styles.cardWrapper}
    >
      <LinearGradient colors={["#FFFFFF", "#F7FAFF"]} style={styles.card} start={[0,0]} end={[1,1]}>
        <View style={styles.left}>
          <View style={styles.iconCircle}>
            <Text style={styles.icon}>📷</Text>
          </View>
        </View>

        <View style={styles.right}>
          <Text style={styles.cardTitle}>{label}</Text>
          <View style={styles.subtitleRow}>
            <StatusBadge status={sub} />
            <Text style={styles.cardSubtitle}>Última conexión: --</Text>
          </View>
        </View>

        <View style={styles.chev}>
          <Text style={styles.chevText}>›</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={["#1E3A8A", "#4F46E5"]}
      start={[0, 0]}
      end={[0, 1]}
      style={styles.container}
    >
      <Text style={styles.header}>Cámaras disponibles</Text>
      <Text style={styles.subHeader}>Toca una cámara para ver la transmisión</Text>

      <CameraCard label="Cámara 1" sub="Inactiva" />
      <CameraCard label="Cámara 2" sub="Inactiva" />
      <CameraCard label="Cámara 3" sub="Activa" />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 48,
    alignItems: 'stretch',
  },
  header: { fontSize: 26, fontWeight: '800', color: '#FFFFFF', marginBottom: 4 },
  subHeader: { fontSize: 14, color: 'rgba(255,255,255,0.9)', marginBottom: 18 },

  cardWrapper: { marginBottom: 14, alignSelf: 'center', width: '100%', maxWidth: 720 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    // glassy effect
    backgroundColor: 'rgba(255,255,255,0.92)',
    ...Platform.select({
      ios: {
        shadowColor: '#0b1220',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
      },
      android: { elevation: 6 },
    }),
  },
  left: { marginRight: 14 },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: { fontSize: 26 },

  right: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  subtitleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  cardSubtitle: { fontSize: 13, color: '#6B7280', marginLeft: 10 },

  badge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 999,
    minWidth: 76,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#02111A', fontWeight: '700', fontSize: 12 },

  chev: { marginLeft: 10 },
  chevText: { fontSize: 22, color: '#9CA3AF' },
});
