// components/Ubicacion.js
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

export default function Ubicacion() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <LinearGradient
        colors={["#5B67F6", "#4D9FEF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <Text style={styles.title}>Ubicación del Vehículo</Text>
        <Text style={styles.subtitle}>Intelligent Vehicle Security System</Text>
      </LinearGradient>

      {/* MAPA - dentro de una tarjeta con sombra */}
      <View style={styles.mapCard}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 20.445608,
            longitude: -103.432328,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Marker
            coordinate={{ latitude: 20.483317692107487, longitude: -103.53311753173269 }}
            title="Mi Carrito"
            description="Ubicación actual del vehículo"
          >
            <View style={styles.markerWrap}>
              <View style={styles.markerPulse} />
              <View style={styles.markerIcon}>
                <Ionicons name="car-sport" size={20} color="#fff" />
              </View>
            </View>
          </Marker>
        </MapView>
      </View>

      {/* BOTÓN FLOTA */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("Home")}
        activeOpacity={0.85}
      >
        <LinearGradient colors={["#4D9FEF", "#5B67F6"]} style={styles.fabGradient}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F6FA" },

  /* HEADER */
  header: {
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
  },
  subtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.9)",
    marginTop: 6,
  },

  /* MAP CARD */
  mapCard: {
    flex: 1,
    margin: 18,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#fff",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 18,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  map: {
    width: "100%",
    height: "100%",
  },

  /* MARKER */
  markerWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  markerPulse: {
    position: "absolute",
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(77,159,239,0.18)",
  },
  markerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#4D9FEF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },

  /* FAB */
  fab: {
    position: "absolute",
    bottom: 26,
    right: 22,
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: "hidden",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.18, shadowOffset: { width: 0, height: 8 }, shadowRadius: 12 },
      android: { elevation: 6 },
    }),
  },
  fabGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
