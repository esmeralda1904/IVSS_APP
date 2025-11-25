import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Home from './components/Home';
import Login from './components/Login';
import Notificacion from './components/Notificacion';
import Perfil from './components/Perfil';
import Motor from './components/Motor';
import Pantalla from './components/Pantalla';
import Ubicacion from './components/Ubicacion';
import Camaras from './components/Camaras';
import Registro from './components/Registro';
import Registrocarro from './components/Registrocarro';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen 
          name="Login" 
          component={Login} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Home" 
          component={Home} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Notificacion" 
          component={Notificacion} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Perfil" 
          component={Perfil} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Motor" 
          component={Motor} 
          options={{ headerShown: false }} 
        />
      <Stack.Screen name="Pantalla" component={Pantalla} options={{ headerShown: false }} />

        <Stack.Screen 
          name="Ubicacion" 
          component={Ubicacion} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Camaras" 
          component={Camaras} 
          options={{ headerShown: false }} 
        />
         <Stack.Screen 
          name="Registro" 
          component={Registro} 
          options={{ headerShown: false }} 
        /> 
         <Stack.Screen 
          name="Registrocarro" 
          component={Registrocarro} 
          options={{ headerShown: false }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
