import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  View,
  StatusBar,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { ScrollView } from 'react-native-gesture-handler';
import { Hosting as host } from '../../app.json'; //Lấy IP host ra từ webService
import Entypo from 'react-native-vector-icons/Entypo';

class Menu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      QLTBao: false,
      QLDVu: false,
      pathAvatar: true,
      dataAccount: {
        idUser: null,
        Username: null,
        Email: null,
        Sex: null,
        PhoneNumber: null,
        pathAvatar: null,
        Birthday: null,
        Position: null,
      },
    }
  }
  componentDidMount = async () => {
    await this._loadData();
  }
  _loadData = async () => {
    await this._loadOffline();
    await AsyncStorage.getItem('@Token', (err, result) => { this.setState({ Token: result }) });
    await this._loadInfo();
  }
  _loadInfo = async () => {
    await fetch(host + '/login/checkToken.php', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(this.state.Token)
    })
      .then((response) => response.json())
      .then((json) => {
        if (JSON.stringify(json) == 1) {// Token không hợp lệ
          Alert.alert('', 'Kết nối đã hết hạn, vui lòng đăng nhập lại');
          AsyncStorage.clear();
          return this.props.navigation.replace('Login');
        }
        else if (JSON.stringify(json) == 2) {
          Alert.alert('', 'Tài khoản đã bị vô hiệu hóa');
          AsyncStorage.clear();
          return this.props.navigation.replace('Login');
        }
        else {
          this.setState({ dataAccount: json });
          let InfoAcc = [
            ['@Username_Acc', json.Username],
            ['@Position_Acc', json.Position],
            ['@idUser_Acc', json.idUser],
            ['@Sex_Acc', json.Sex],
            ['@Birthday_Acc', json.Birthday],
            ['@Email_Acc', json.Email],
            ['@PhoneNumber_Acc', json.PhoneNumber],
            ['@pathAvatar_Acc', json.pathAvatar]
          ];
          AsyncStorage.multiSet(InfoAcc);
        }
      })
      .catch((error) => {
        this.setState({ pathAvatar: false }); //Offline ẩn avatar
        console.log(error);
      });
  }
  _loadOffline = async () => {
    await AsyncStorage.getItem('@Position_Acc', (err, result) => {
      this.setState({ dataAccount: { ...this.state.dataAccount, Position: result } })
    });
    await AsyncStorage.getItem('@pathAvatar_Acc', (err, result) => {
      this.setState({ dataAccount: { ...this.state.dataAccount, pathAvatar: result } })
    });
    await AsyncStorage.getItem('@Username_Acc', (err, result) => {
      this.setState({ dataAccount: { ...this.state.dataAccount, Username: result } })
    });
    await AsyncStorage.getItem('@idUser_Acc', (err, result) => {
      this.setState({ dataAccount: { ...this.state.dataAccount, idUser: result } })
    });
    await AsyncStorage.getItem('@Sex_Acc', (err, result) => {
      this.setState({ dataAccount: { ...this.state.dataAccount, Sex: result } })
    });
    await AsyncStorage.getItem('@Birthday_Acc', (err, result) => {
      this.setState({ dataAccount: { ...this.state.dataAccount, Birthday: result } })
    });
    await AsyncStorage.getItem('@Email_Acc', (err, result) => {
      this.setState({ dataAccount: { ...this.state.dataAccount, Email: result } })
    });
    await AsyncStorage.getItem('@PhoneNumber_Acc', (err, result) => {
      this.setState({ dataAccount: { ...this.state.dataAccount, PhoneNumber: result } })
    });
  }
  _ProfilePersonal = async () => {
    this.loadData = this.props.navigation.addListener('focus', () => {
      this._loadData();
    });
    this.props.navigation.navigate('ProfilePersonal', {
      idUser: this.state.dataAccount.idUser,
      Username: this.state.dataAccount.Username,
      Email: this.state.dataAccount.Email,
      Sex: this.state.dataAccount.Sex,
      PhoneNumber: this.state.dataAccount.PhoneNumber,
      pathAvatar: this.state.dataAccount.pathAvatar,
      Birthday: this.state.dataAccount.Birthday,
      loadAvatar: this.state.pathAvatar,
    });
  }
  _logOut = async () => {
    await AsyncStorage.clear();
    return this.props.navigation.replace('Login');
  }
  _QLDVu = () => {
    if (this.state.QLDVu)
      this.setState({ QLDVu: false })
    else this.setState({ QLDVu: true })
  }
  _QLTBao = () => {
    if (this.state.QLTBao)
      this.setState({ QLTBao: false })
    else this.setState({ QLTBao: true })
  }
  render() {
    const { idUser } = this.state.dataAccount;
    return (
      <ScrollView style={styles.container}>
        <StatusBar backgroundColor="#000" barStyle="light-content" />
        <Text style={styles.menu}>Menu</Text>
        <TouchableOpacity>
          <View style={styles.proifle}>
            <Image
              source={this.state.dataAccount.pathAvatar && this.state.pathAvatar ? { uri: host + '/assets/avatar/' + this.state.dataAccount.pathAvatar } : require('../../assets/icons/loadAvatar.png')}
              style={{
                width: 55,
                height: 55,
                borderRadius: 55 / 2,
                margin: 5,
              }}
            />
            <View style={{ flex: 1, flexDirection: 'column', padding: 10 }}>
              <TouchableOpacity onPress={() => this._ProfilePersonal()}>
                <Text style={{ fontWeight: 'bold', fontSize: 17 }}>{this.state.dataAccount.Username}</Text>
                <Text style={{ color: '#404040' }}>Xem thông tin cá nhân</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
        {
          this.state.dataAccount.Position == 1 ?
            <>
              <TouchableOpacity onPress={() => this.props.navigation.navigate('MyHome', { idUser: this.state.dataAccount.idUser, type: '1' })}>
                <Text style={styles.item}>
                  <Image source={require('../../assets/icons/myhome.png')} style={{ width: 24, height: 24, resizeMode: 'contain' }} />  Căn hộ của tôi
                    </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => this.props.navigation.navigate('MyHome', { idUser: this.state.dataAccount.idUser, type: '2' })}>
                <Text style={styles.item}>
                  <Image source={require('../../assets/icons/customer-service.png')} style={{ width: 24, height: 24, resizeMode: 'contain' }} />  Dịch vụ căn hộ
            </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => this.props.navigation.navigate('UserSupport')}>
                <Text style={styles.item}>
                  <Image source={require('../../assets/icons/send.png')} style={{ width: 24, height: 24, resizeMode: 'contain' }} />  Gửi yêu cầu hỗ trợ
            </Text>
              </TouchableOpacity>

            </> : null
        }
        {
          this.state.dataAccount.Position > 1 ?
            <>
              <TouchableOpacity onPress={() => { this.props.navigation.navigate('RegisterAccount') }}>
                <Text style={styles.item}>
                  <Image source={require('../../assets/icons/user.png')} style={{ width: 24, height: 24, resizeMode: 'contain' }} />  Đăng ký tài khoản
              </Text>
              </TouchableOpacity>
              {this.state.dataAccount.Position == 2 || this.state.dataAccount.Position == 3 ?
                <TouchableOpacity onPress={() => { this.props.navigation.navigate('ManagerCustomerAccount') }}>
                  <Text style={styles.item}>
                    <Image source={require('../../assets/icons/target.png')} style={{ width: 25, height: 25, resizeMode: 'contain' }} />  Quản lý khách hàng
                  </Text>
                </TouchableOpacity>
                : null
              }
              {this.state.dataAccount.Position == 4 ?
                <TouchableOpacity onPress={() => { this.props.navigation.navigate('ManagerAccount') }}>
                  <Text style={styles.item}>
                    <Image source={require('../../assets/icons/team.png')} style={{ width: 25, height: 25, resizeMode: 'contain' }} />  Quản lý tài khoản
                </Text>
                </TouchableOpacity>
                : null
              }
              <TouchableOpacity onPress={() => this.props.navigation.navigate('ListApartment')}>
                <Text style={styles.item}>
                  <Image source={require('../../assets/icons/apartment_1.png')} style={{ width: 24, height: 24, resizeMode: 'contain' }} />  Quản lý chung cư
              </Text>
              </TouchableOpacity>
              {/* QLDV */}
              <TouchableOpacity onPress={() => this._QLDVu()}>
                <View style={styles.item}>
                  <View style={{ flex: 1, flexDirection: 'row', paddingTop: 8 }}>
                    <Image source={require('../../assets/icons/customer-support.png')} style={{ width: 24, height: 24, resizeMode: 'contain' }} />
                    <Text style={{ fontSize: 17, paddingLeft: 9 }}>Quản lý dịch vụ</Text>
                  </View>
                  <View style={{ paddingTop: 5 }}>
                    {this.state.QLDVu ?
                      <Entypo name="chevron-small-up" size={28} color="#333333" /> : <Entypo name="chevron-small-down" size={28} color="#333333" />
                    }
                  </View>
                </View>
              </TouchableOpacity>
              {this.state.QLDVu ?
                <>
                  {this.state.dataAccount.Position == 4 ?
                    <TouchableOpacity onPress={() => this.props.navigation.navigate("AddService")}>
                      <Text style={styles.item}>
                        <Image source={require('../../assets/icons/add_home.png')} style={{ width: 24, height: 24, resizeMode: 'contain' }} />  Thêm loại dịch vụ
                      </Text>
                    </TouchableOpacity>
                    : null
                  }
                  <TouchableOpacity onPress={() => this.props.navigation.navigate("ListService")}>
                    <Text style={styles.item}>
                      <Image source={require('../../assets/icons/tools.png')} style={{ width: 24, height: 24, resizeMode: 'contain' }} />  Loại dịch vụ
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => this.props.navigation.navigate("ServiceHome")}>
                    <Text style={styles.item}>
                      <Image source={require('../../assets/icons/home-service.png')} style={{ width: 24, height: 24, resizeMode: 'contain' }} />  Danh sách dịch vụ
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => this.props.navigation.navigate("ListRentHouse")}>
                    <Text style={styles.item}>
                      <Image source={require('../../assets/icons/rent_house.png')} style={{ width: 24, height: 24, resizeMode: 'contain' }} />  Căn hộ cho thuê
                    </Text>
                  </TouchableOpacity>
                </> : null
              }
              <TouchableOpacity onPress={() => this.props.navigation.navigate('PostNotification', { idUser: idUser })}>
                <Text style={styles.item}>
                  <Image source={require('../../assets/icons/megaphone.png')} style={{ width: 24, height: 24, resizeMode: 'contain' }} />  Đăng thông báo
              </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => this.props.navigation.navigate('CustomerSupport')}>
                <Text style={styles.item}>
                  <Image source={require('../../assets/icons/customer-support1.png')} style={{ width: 24, height: 24, resizeMode: 'contain' }} />  Yêu cầu hỗ trợ
                </Text>
              </TouchableOpacity>
              {this.state.dataAccount.Position == 4 ?
                <TouchableOpacity onPress={() => this._QLTBao()}>
                  <View style={styles.item}>
                    <View style={{ flex: 1, flexDirection: 'row', paddingTop: 8 }}>
                      <Image source={require('../../assets/icons/manager.png')} style={{ width: 24, height: 24, resizeMode: 'contain' }} />
                      <Text style={{ fontSize: 17, paddingLeft: 9 }}>Thông tin chung</Text>
                    </View>
                    <View style={{ paddingTop: 5 }}>
                      {this.state.QLTBao ?
                        <Entypo name="chevron-small-up" size={28} color="#333333" /> : <Entypo name="chevron-small-down" size={28} color="#333333" />
                      }
                    </View>
                  </View>
                </TouchableOpacity>
                : null}
              {this.state.QLTBao ? <>
                <TouchableOpacity onPress={() => this.props.navigation.navigate('ListPayInformation')}>
                  <Text style={styles.item}>
                    <Image source={require('../../assets/icons/update.png')} style={{ width: 25, height: 25, resizeMode: 'contain' }} />  Cập nhật thông tin thanh toán
            </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.props.navigation.navigate('ListContactInformation')}>
                  <Text style={styles.item}>
                    <Image source={require('../../assets/icons/update1.png')} style={{ width: 25, height: 25, resizeMode: 'contain' }} />  Cập nhật thông tin liên hệ
            </Text>
                </TouchableOpacity>
              </>
                : null
              }
            </>
            : null
        }
        <View style={{ flex: 1, flexDirection: "row", justifyContent: "flex-start", paddingLeft: 10 }}>
          <TouchableOpacity onPress={() => this.props.navigation.navigate('PayInformation')}>
            <Text style={styles.itemMini}>
              <Image source={require('../../assets/icons/tax.png')} style={{ width: 24, height: 24, resizeMode: 'contain' }} />  Thông tin thanh toán
              </Text>
          </TouchableOpacity>
          <View style={{ paddingLeft: 6 }}></View>
          <TouchableOpacity onPress={() => this.props.navigation.navigate('ContactInformation')}>
            <Text style={styles.itemMini}>
              <Image source={require('../../assets/icons/contract.png')} style={{ width: 24, height: 24, resizeMode: 'contain' }} />  Thông tin liên hệ
              </Text>
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, flexDirection: "row", justifyContent: "flex-start", paddingLeft: 10 }}>
          <TouchableOpacity onPress={this._logOut}>
            <Text style={styles.itemMini}>
              <Image source={require('../../assets/icons/exit.png')} style={{ width: 24, height: 24, resizeMode: 'contain' }} />  Đăng xuất
              </Text>
          </TouchableOpacity>
        </View>
      </ScrollView >
    );
  }
}

const styles = StyleSheet.create({
  logout: {
    flexDirection: 'row',
    paddingTop: 12,
    paddingRight: 5,
  },
  container: {
    flex: 1,
    flexDirection: "column",
  },
  proifle: {
    fontSize: 25,
    marginHorizontal: 10,
    fontWeight: "bold",
    padding: 1,
    flex: 1,
    flexDirection: 'row',
  },
  menu: {
    fontSize: 25,
    marginHorizontal: 10,
    fontWeight: "bold",
    paddingLeft: 5,
    paddingTop: 8,
    paddingBottom: 5
  },
  item: {
    paddingTop: 4,
    padding: 9,
    marginVertical: 3,
    marginHorizontal: 10,
    fontSize: 17,
    backgroundColor: '#fff',
    borderRadius: 5,
    flex: 1,
    flexDirection: 'row',
    //Shadow generator
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 2,
    //end shadow
  },
  item1: {
    width: "120%",
    paddingTop: 15,
    padding: 9,
    marginVertical: 3,
    backgroundColor: '#fff',
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    //Shadow generator
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 2,
    //end shadow
  },
  itemMini: {
    paddingTop: 4,
    padding: 9,
    marginVertical: 3,
    //marginHorizontal: 10,
    fontSize: 16,
    backgroundColor: '#fff',
    borderRadius: 20,
    flex: 1,
    flexDirection: 'row',
    //Shadow generator
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 2,
    //end shadow
  },
});

export default Menu;