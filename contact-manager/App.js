import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from './HomeScreen';
import AddContactScreen from './AddContact';
import EditContactScreen from './EditContact';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
       <Stack.Screen
             name="Home"
             component={HomeScreen}
               options={{ title: 'Contact Manager' }}/>
        <Stack.Screen name="Add Contact" component={AddContactScreen} />
        <Stack.Screen name="Edit Contact" component={EditContactScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
