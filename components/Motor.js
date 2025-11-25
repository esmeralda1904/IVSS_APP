import React, { useState } from "react";
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

export default function BloqueoMotor() {
  const navigation = useNavigation();
  const [password, setPassword] = useState("");

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
          <TextInput
            style={styles.input}
            placeholder="Ingrese su contraseña"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {/* BOTÓN BLOQUEAR */}
          <TouchableOpacity style={styles.mainButton}>
            <Ionicons name="power-outline" size={26} color="#FFF" />
            <Text style={styles.mainButtonText}>Apagar Motor</Text>
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
});
