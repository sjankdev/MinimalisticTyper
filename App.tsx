import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainPage from './MainPage';
import TypingPage from './TypingPage';

const Stack = createNativeStackNavigator();

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Main">
        <Stack.Screen name="Main" component={MainPage} />
        <Stack.Screen name="Typing" component={TypingPage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
