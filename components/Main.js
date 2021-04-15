import React from 'react';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Menu from './menu/Menu'; //Main menu chính
import 'react-native-gesture-handler';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import AsyncStorage from '@react-native-community/async-storage';

import ApartmentNotification from './notification/ApartmentNotification';
import StaffNotification from './notification/StaffNotification';

const TopTab = createMaterialTopTabNavigator();
const Tab = createBottomTabNavigator();

class Notification extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      idPosition: '0',
    }
  }
  componentDidMount = async () => {
    await AsyncStorage.getItem('@Position_Acc', (err, result) => {
      this.setState({ idPosition: result });
    });
  }
  render() {
    return (
      <TopTab.Navigator
        tabBarOptions={{
          labelStyle: { fontSize: 14, fontWeight: 'bold' },
          activeTintColor: '#595959',
          inactiveTintColor: '#595959',
          indicatorStyle: {
            backgroundColor: 'rgb(20,185,200)',
          },
        }}
      >
        <TopTab.Screen name="ApartmentNotification" component={ApartmentNotification} options={{ title: 'Tòa nhà' }} />
        {this.state.idPosition != 1 ?
          <TopTab.Screen name="StaffNotification" component={StaffNotification} options={{ title: 'Nhân viên' }} />
          : null
        }
      </TopTab.Navigator>
    );
  }
}

/* Tab Navigator mấy nút menu ở dưới show lên màn hình chính */
class Main extends React.Component {
  constructor(props) {
    super(props);
    const { routeName } = this.props.route.params;
    this.state = {
      dataAccount: [],
      Token: '',
      routeName: routeName,
    }
  }
  render() {
    return (
      <Tab.Navigator
        initialRouteName={this.state.routeName}
        screenOptions={({ route }) => ({ //Đổi hình icon mỗi khi tab qua mỗi tab
          tabBarIcon: ({ color }) => {
            if (route.name === 'Notification')
              return <Ionicons name='notifications' size={22} color={color} />;
            else if (route.name === 'Menu')
              return <FontAwesome name='navicon' size={22} color={color} />;
          },
        })}
        tabBarOptions={{
          labelStyle: {
            fontSize: 14,
            paddingBottom: 4
          },
          activeTintColor: 'rgb(20, 185, 200)',
          inactiveTintColor: '#666666',
          style: {
            padding: 2,
            height: 47,
            paddingTop: 6,
          }
        }}
      >
        <Tab.Screen name="Notification" component={Notification} options={{ tabBarLabel: 'Thông báo' }} />
        <Tab.Screen name="Menu" component={Menu} options={{ tabBarLabel: 'Menu' }} />
      </Tab.Navigator>
    );
  }
}

export default Main;