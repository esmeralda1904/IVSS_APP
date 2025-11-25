import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import car from "../assets/auto.jpg";
import profile from "../assets/Logo.png";

export default function Home() {
  const navigation = useNavigation();
  const [usuario, setUsuario] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const u = await AsyncStorage.getItem('usuario');
        if (u) setUsuario(u);
      } catch (err) {
        console.error('Error leyendo usuario:', err.message);
      }
    })();
  }, []);

  return (
    <LinearGradient
      colors={["#405A9F", "#A1A9E9", "#FFFFFF"]}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ----- HEADER ----- */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Bienvenido</Text>
            <Text style={styles.subtitle}>{usuario ? usuario : 'IVSS'}</Text>
          </View>
          <Image source={profile} style={styles.profileImg} />
        </View>

        <View style={styles.vehicleCard}>
          <Image source={car} style={styles.vehicleImg} resizeMode="contain" />

        </View>

        {/* ----- ACCIONES RÁPIDAS ----- */}
       <View style={styles.actionsContainer}>
  {/* Bloquear Motor */}
  <TouchableOpacity
    style={styles.actionBox}
    onPress={() => navigation.navigate("Motor")}
  >
    <Ionicons name="lock-closed-outline" size={28} color="#2E2E2E" />
    <Text style={styles.actionText}>Bloquear Motor</Text>
  </TouchableOpacity>

  {/* ARCO */}
  <TouchableOpacity
    style={styles.actionBox}
    onPress={() => navigation.navigate("Pantalla")}
  >
    <Ionicons name="radio-outline" size={28} color="#2E2E2E" />
    <Text style={styles.actionText}>ARCO</Text>
  </TouchableOpacity>

  {/* Ubicación */}
  <TouchableOpacity
    style={styles.actionBox}
    onPress={() => navigation.navigate("Ubicacion")}
  >
    <Ionicons name="location-outline" size={28} color="#2E2E2E" />
    <Text style={styles.actionText}>Ubicación</Text>
  </TouchableOpacity>

  {/* Cámaras */}
  <TouchableOpacity
    style={styles.actionBox}
    onPress={() => navigation.navigate("Camaras")}
  >
    <Ionicons name="camera-outline" size={28} color="#2E2E2E" />
    <Text style={styles.actionText}>Cámaras</Text>
  </TouchableOpacity>
</View>

      </ScrollView>

      {/* ----- MENÚ INFERIOR FIJO ----- */}
   <View style={styles.bottomMenu}>
  <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("Home")}>
    <Ionicons name="home-outline" size={30} color="#FFFFFF" />
    <Text style={styles.menuLabel}>Inicio</Text>
  </TouchableOpacity>

  <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("Notificacion")}>
    <Ionicons name="notifications-outline" size={30} color="#FFFFFF" />
    <Text style={styles.menuLabel}>Notificaciones</Text>
  </TouchableOpacity>

  <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("Perfil")}>
    <Ionicons name="person-outline" size={30} color="#FFFFFF" />
    <Text style={styles.menuLabel}>Perfil</Text>
  </TouchableOpacity>

  <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("Login")}>
    <Ionicons name="exit-outline" size={30} color="#FFFFFF" />
    <Text style={styles.menuLabel}>Salir</Text>
  </TouchableOpacity>
</View>

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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffffff",
  },
  subtitle: {
    fontSize: 16,
    color: "#acb6ebff",
  },
  profileImg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#0656f6ff",
  },

  /* VEHÍCULO */
  vehicleCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    marginBottom: 20,
  },
  vehicleImg: {
    width: "100%",
    height: 180,
    borderRadius: 20,
  },
  vehicleTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2E2E2E",
    marginTop: 10,
  },
  vehicleInfo: {
    fontSize: 16,
    color: "#555",
    marginTop: 5,
  },

  /* ACCIONES */
  actionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 100,
  },
  actionBox: {
    backgroundColor: "#D1D9E9",
    borderRadius: 15,
    padding: 15,
    alignItems: "center",
    width: "48%",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  actionText: {
    marginTop: 8,
    fontSize: 14,
    color: "#2E2E2E",
    textAlign: "center",
  },

  /* MENÚ INFERIOR */
  bottomMenu: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 25,
    backgroundColor: "#4D5A9F",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 100,
  },
  menuItem: {
    alignItems: "center",
  },
  menuLabel: {
    fontSize: 13,
    color: "#ffffffff",
    marginTop: 5,
  },
});
