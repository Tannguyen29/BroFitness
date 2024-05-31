import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MainPage from '../(tabs)/MainPage'
import profile from '../(tabs)/profile';

const Tab = createBottomTabNavigator();

const BottomNavigation = () => {
    return (
    <Tab.Navigator initialRouteName = "MainPage">
      <Tab.Screen name="MainPage" component={MainPage} />
      <Tab.Screen name="profile" component={profile} />
    </Tab.Navigator>
  );
}

export default BottomNavigation;
