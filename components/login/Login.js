import React from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  TextInput,
  Alert,
  StatusBar,
  LogBox
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { Hosting as host } from '../../app.json'; //Lấy IP host ra từ webService
import Loading from 'react-native-whc-loading';
import { SafeAreaView } from 'react-native-safe-area-context';
LogBox.ignoreLogs(["Warning: Cannot update a component from inside the function body of a different component."]);

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      formData: {
        Login: '',
        Password: '',
      },
    };
    AsyncStorage.getItem('@Token', (err, result) => {
      if (result != null) return this.props.navigation.replace('Main', { routeName: "Menu" });
      this.setState({ isLoading: false });
    });
  }
  _checkLogin = async () => {
    if (!this.state.formData.Login)
      return Alert.alert('', 'Email hoặc Số điện thoại không để trống');
    else if (!this.state.formData.Password)
      return Alert.alert('', 'Mật khẩu không để trống');
    this.refs.loading.show();
    await fetch(host + '/login/checkLogin.php', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(this.state.formData)
    })
      .then((response) => response.json())
      .then((json) => {
        setTimeout(() => {
          this.refs.loading.close();
          if (JSON.stringify(json) == 1)
            return Alert.alert('', 'Sai thông tin đăng nhập');
          if (JSON.stringify(json) == 2)
            return Alert.alert('', 'Tài khoản đã bị vô hiệu hóa');
          else {
            AsyncStorage.setItem('@Token', json);
            return this.props.navigation.replace('Main', { routeName: "Menu" });
          }
        }, 100);
      })
      .catch((error) => {
        console.error(error);
        this.refs.loading.close();
        return Alert.alert('', 'Không thể kết nối tới máy chủ');
      });
  }
  render() {
    const { Login, Password } = this.state.formData;
    if (this.state.isLoading) return null;
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="rgb(93, 109, 126)" barStyle="light-content" />
        <Text style={styles.tittle}>NSY Apartment</Text>
        <View style={{ padding: 20 }}>
          <View style={styles.viewInput}>
            <TextInput
              style={styles.txtInput}
              keyboardType="default"
              placeholder="Số điện thoại hoặc Email"
              value={Login}
              onChangeText={Login =>
                this.setState(previousState => ({
                  formData: {
                    ...previousState.formData,
                    Login
                  }
                }))
              }
            />
          </View>
          <View style={styles.viewInput}>
            <TextInput
              style={styles.txtInput}
              keyboardType="default"
              secureTextEntry={true} //Dấu tròn che mật khẩu
              placeholder="Mật khẩu"
              value={Password}
              onChangeText={Password =>
                this.setState(previousState => ({
                  formData: {
                    ...previousState.formData,
                    Password
                  }
                }))
              }
            />
          </View>
          <View style={{ padding: 5 }}>
            <TouchableOpacity onPress={this._checkLogin}>
              <Text style={styles.button}>Đăng nhập</Text>
            </TouchableOpacity>
          </View>
          <View style={{ paddingTop: 10 }}>
            <TouchableOpacity onPress={() => this.props.navigation.navigate("ForgotPassword")}>
              <Text style={styles.fgPassword}>Quên mật khẩu ?</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Loading ref="loading" />
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  txtInput: {
    padding: 8,
    fontSize: 16,
    borderRadius: 5,
    backgroundColor: '#f2f2f2',
  },
  viewInput: {
    padding: 3,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgb(93, 109, 126)',
  },
  tittle: {
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'center',
    position: 'relative',
    color: 'rgb(244, 208, 63)',
  },
  button: {
    backgroundColor: '#6699cc',
    borderRadius: 5,
    height: 40,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    paddingTop: 7,
  },
  fgPassword: {
    fontSize: 16,
    textAlign: 'center',
    color: '#fff',
  }
});

export default Login;