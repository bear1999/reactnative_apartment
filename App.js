import * as React from 'react';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { LogBox } from 'react-native'
LogBox.ignoreAllLogs();

/* import screen */
import RegisterAccount from './components/menu/RegisterAccount'; //Màn hình trong menu chuyển hướng đăng ký tài khoản
import Login from './components/login/Login'; //Màn hình Login
import ForgotPassword from './components/login/ForgotPassword';
import ConfirmOTP from './components/login/ConfirmOTP';

import ManagerAccount from './components/menu/ManagerAccount'; //Quản lý tài khoản
import ManagerCustomerAccount from './components/menu/ManagerCustomerAccount'; //Quản lý tài khoản khách
import Profile from './components/menu/Profile'; //Thông tin cá nhân
import ChangePassword from './components/menu/ChangePassword';
import ChangePasswordForAdmin from './components/menu/ChangePasswordForAdmin';
import SplashScreen from './components/SplashSreen';
import Main from './components/Main';
import ProfilePersonal from './components/menu/ProfilePersonal';

import UpdateApartmentUser from './components/apartment/UpdateApartmentUser';
import ListApartment from './components/apartment/ListApartment';
import AddApartment from './components/apartment/AddApartment';
import Apartment from './components/apartment/Apartment';
import EditApartment from './components/apartment/EditApartment';
import InfoApartment from './components/apartment/InfoApartment';
import InfoPayment from './components/apartment/InfoPayment';
import ListRegService from './components/apartment/ListRegService';

import AddService from './components/service/AddService';
import DetailService from './components/service/DetailService';
import ListService from './components/service/ListService';
import EditService from './components/service/EditService';
import ServiceHome from './components/service/ServiceHome';
import UpdateServiceHome from './components/service/UpdateServiceHome';
import ListRentHouse from './components/service/ListRentHouse';

import PostNotification from './components/notification/PostNotification';
import DetailNotification from './components/notification/DetailNotification';
import EditNotification from './components/notification/EditNotification';

import PayInformation from './components/information/PayInformation';
import PostPayInformation from './components/information/PostPayInformation';
import PostContactInformation from './components/information/PostContactInformation';
import EditPayInformation from './components/information/EditPayInformation';
import EditContactInformation from './components/information/EditContactInformation';
import ListPayInformation from './components/information/ListPayInformation';
import ListContactInformation from './components/information/ListContactInformation';
import ContactInformation from './components/information/ContactInformation';

import CustomerSupport from './components/customersupport/CustomerSupport';
import UserSupport from './components/customersupport/UserSupport';
import PostSupport from './components/customersupport/PostSupport';
import ContentSupport from './components/customersupport/ContentSupport';

import MyHome from './components/user/MyHome';
import DetailHome from './components/user/DetailHome';
import DetailServiceHome from './components/user/DetailServiceHome';
//import Test from './components/customersupport/Test';
/* end screen */

const Stack = createStackNavigator();

/* 
Chuyển hướng rồi quay lại sử dụng Stack phải bỏ màn hình sử dụng vào Stack
Do App bao gồm Tab nên bỏ component App vào Stack là được các Stack khác là màn hình muốn đưa vào
*/
class Root extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
    };
    setTimeout(() => { this.setState({ isLoading: false }) }, 1000);
  }
  render() {
    if (this.state.isLoading) return <SplashScreen />
    return (
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerStyle: {
              backgroundColor: 'rgb(20,185,200)',
              height: 50,
            },
            headerTintColor: '#fff',
          }}
        >
          <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
          <Stack.Screen name="ForgotPassword" component={ForgotPassword} options={{ headerShown: false }} />
          <Stack.Screen name="ConfirmOTP" component={ConfirmOTP} options={{ headerShown: false }} />
          <Stack.Screen name="Main" component={Main} options={{ headerShown: false }} />
          <Stack.Screen name="RegisterAccount" component={RegisterAccount} options={{ title: 'Đăng ký tài khoản' }} />
          <Stack.Screen name="ManagerAccount" component={ManagerAccount} options={{ headerShown: false }} />
          <Stack.Screen name="ManagerCustomerAccount" component={ManagerCustomerAccount} options={{ headerShown: false }} />
          <Stack.Screen name="Profile" component={Profile} options={{ title: 'Thông tin cá nhân' }} />
          <Stack.Screen name="ChangePasswordForAdmin" component={ChangePasswordForAdmin} options={{ title: 'Đổi mật khẩu' }} />
          <Stack.Screen name="ChangePassword" component={ChangePassword} options={{ title: 'Đổi mật khẩu' }} />
          <Stack.Screen name="ProfilePersonal" component={ProfilePersonal} options={{ title: 'Thông tin cá nhân' }} />
          <Stack.Screen name="UpdateApartmentUser" component={UpdateApartmentUser} options={{ title: 'Thông tin căn hộ khách hàng' }} />

          <Stack.Screen name="AddApartment" component={AddApartment} options={{ title: 'Thêm chung cư' }} />
          <Stack.Screen name="EditApartment" component={EditApartment} options={{ title: 'Chỉnh sửa chung cư' }} />

          <Stack.Screen name="ListApartment" component={ListApartment} options={{ headerShown: false, title: 'Danh sách căn hộ' }} />
          <Stack.Screen name="InfoApartment" component={InfoApartment} options={{ title: 'Thông tin căn hộ' }} />
          <Stack.Screen name="InfoPayment" component={InfoPayment} options={{ title: 'Thông tin thanh toán dịch vụ' }} />
          <Stack.Screen name="ListRegService" component={ListRegService} options={{ title: 'Đăng ký dịch vụ', headerShown: false }} />
          <Stack.Screen name="Apartment" component={Apartment} options={({ route }) => ({ title: route.params.nameTitle })} />

          <Stack.Screen name="AddService" component={AddService} options={{ title: 'Thêm dịch vụ' }} />
          <Stack.Screen name="ListService" component={ListService} options={{ title: 'Danh sách dịch vụ', headerShown: false }} />
          <Stack.Screen name="EditService" component={EditService} options={{ title: 'Chỉnh sửa dịch vụ' }} />
          <Stack.Screen name="DetailService" component={DetailService} options={{ title: 'Chi tiết dịch vụ' }} />
          <Stack.Screen name="ServiceHome" component={ServiceHome} options={{ headerShown: false }} />
          <Stack.Screen name="UpdateServiceHome" component={UpdateServiceHome} options={{ title: 'Cập nhật dịch vụ' }} />
          <Stack.Screen name="ListRentHouse" component={ListRentHouse} options={{ headerShown: false }} />

          <Stack.Screen name="PostNotification" component={PostNotification} options={{ title: 'Đăng thông báo' }} />
          <Stack.Screen name="DetailNotification" component={DetailNotification} options={{ title: 'Thông báo' }} />
          <Stack.Screen name="EditNotification" component={EditNotification} options={{ title: 'Chỉnh sửa thông báo' }} />

          <Stack.Screen name="EditPayInformation" component={EditPayInformation} options={{ title: 'Chỉnh sửa thông tin thanh toán' }} />
          <Stack.Screen name="EditContactInformation" component={EditContactInformation} options={{ title: 'Chỉnh sửa thông tin liên hệ' }} />
          <Stack.Screen name="PostPayInformation" component={PostPayInformation} options={{ title: 'Đăng thông tin thanh toán' }} />
          <Stack.Screen name="PostContactInformation" component={PostContactInformation} options={{ title: 'Đăng thông tin liên hệ' }} />
          <Stack.Screen name="PayInformation" component={PayInformation} options={{ title: 'Thông tin thanh toán' }} />
          <Stack.Screen name="ListPayInformation" component={ListPayInformation} options={{ title: 'Danh sách thông tin thanh toán' }} />
          <Stack.Screen name="ContactInformation" component={ContactInformation} options={{ title: 'Thông tin liên hệ' }} />
          <Stack.Screen name="ListContactInformation" component={ListContactInformation} options={{ title: 'Danh sách thông tin liên hệ' }} />

          <Stack.Screen name="CustomerSupport" component={CustomerSupport} options={{ headerShown: false }} />
          <Stack.Screen name="UserSupport" component={UserSupport} options={{ title: 'Phiếu hỗ trợ' }} />
          <Stack.Screen name="PostSupport" component={PostSupport} options={{ title: 'Gửi phiếu hỗ trợ' }} />
          <Stack.Screen name="ContentSupport" component={ContentSupport} options={{ title: 'Chi tiết hỗ trợ' }} />

          <Stack.Screen name="MyHome" component={MyHome} options={{ title: 'Căn hộ của tôi' }} />
          <Stack.Screen name="DetailHome" component={DetailHome} options={{ title: 'Chi tiết căn hộ' }} />
          <Stack.Screen name="DetailServiceHome" component={DetailServiceHome} options={{ title: 'Chi tiết dịch vụ căn hộ' }} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
}
export default Root;
