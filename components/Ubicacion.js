// components/Ubicacion.js
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function Ubicacion() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>Ubicación del Vehículo</Text>
        <Text style={styles.subtitle}>Intelligent Vehicle Security System</Text>
      </View>

      {/* MAPA */}
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
          coordinate={{ latitude: 20.445936131278717, longitude: -103.43721378652408 }}
          title="Mi Carrito"
          description="Ubicación actual del vehículo"
        >
          <Ionicons name="car-outline" size={30} color="#4D5A9F" />
        </Marker>
      </MapView>

      {/* BOTÓN REGRESAR */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.navigate("Home")}
      >
        <Ionicons name="arrow-back-outline" size={22} color="#4D5A9F" />
        <Text style={styles.backText}>Regresar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F6FA" },

  /* HEADER */
  header: {
    paddingTop: 55,
    paddingHorizontal: 20,
    marginBottom: 10,
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

  /* MAPA */
  map: {
    flex: 1,
    margin: 20,
    borderRadius: 20,
  },

  /* BOTÓN REGRESAR */
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#4D5A9F",
    paddingVertical: 12,
    borderRadius: 12,
    margin: 20,
  },
  backText: {
    color: "#4D5A9F",
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 8,
  },
});
