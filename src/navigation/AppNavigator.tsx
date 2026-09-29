import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { NavigatorScreenParams } from '@react-navigation/native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SymbolView } from 'expo-symbols';

import { AttendanceHistoryScreen } from '../screens/AttendanceHistoryScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { OfficeSettingsScreen } from '../screens/OfficeSettingsScreen';

export type RootTabParamList = {
  Home: undefined;
  AttendanceHistory: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<RootTabParamList>;
  OfficeSettings: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#64748b',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Home',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <SymbolView
              name={{ ios: 'house.fill', android: 'home', web: 'home' }}
              tintColor={color}
              size={size}
            />
          ),
        }}
      />
      <Tab.Screen
        name="AttendanceHistory"
        component={AttendanceHistoryScreen}
        options={{
          title: 'Attendance History',
          tabBarLabel: 'History',
          tabBarIcon: ({ color, size }) => (
            <SymbolView
              name={{
                ios: 'clock.arrow.circlepath',
                android: 'history',
                web: 'history',
              }}
              tintColor={color}
              size={size}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="OfficeSettings"
          component={OfficeSettingsScreen}
          options={{ title: 'Office Settings' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
