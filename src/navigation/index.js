import React from 'react';
import { Pressable, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import PropertyDetailScreen from '../screens/PropertyDetailScreen';
import InspectionFormScreen from '../screens/InspectionFormScreen';
import IncidentReportScreen from '../screens/IncidentReportScreen';
import HistoryScreen from '../screens/HistoryScreen';
import DashboardScreen from '../screens/DashboardScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#1E3A5F' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: '700' },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={({ navigation }) => ({
            title: 'Properties',
            headerRight: () => (
              <Pressable onPress={() => navigation.navigate('Dashboard')} hitSlop={8}>
                <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 14 }}>Dashboard</Text>
              </Pressable>
            ),
          })}
        />
        <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{ title: 'All Properties' }}
        />
        <Stack.Screen
          name="PropertyDetail"
          component={PropertyDetailScreen}
          options={({ route }) => ({ title: route.params.property.name })}
        />
        <Stack.Screen
          name="InspectionForm"
          component={InspectionFormScreen}
          options={{ title: 'Site Audit' }}
        />
        <Stack.Screen
          name="IncidentReport"
          component={IncidentReportScreen}
          options={{ title: 'Report Incident' }}
        />
        <Stack.Screen name="History" component={HistoryScreen} options={{ title: 'History' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
