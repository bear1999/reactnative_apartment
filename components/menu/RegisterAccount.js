import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
  View,
  KeyboardAvoidingView,
  Alert,
  Image,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
// Register Form
import RadioForm from 'react-native-simple-radio-button';
import { Picker } from '@react-native-community/picker'; //dropdown list
import moment from 'moment'; //format date
import DateTimePickerModal from "react-native-modal-datetime-picker";
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Loading from 'react-native-whc-loading';
import ImagePicker from 'react-native-image-crop-picker'; //Image
import { Hosting as host } from '../../app.json'; //Lấy IP host ra từ webService
import AsyncStorage from '@react-native-community/async-storage';

class Register extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dataPosition: [],
      dataSex: [{ label: 'Nam', value: 1 }, { label: 'Nữ', value: 0 }], //True, false php ko chạy để 1, 0
      isVisible: false,
      avatarSrc: {},
      repeatPassword: '',
      Position: '0',
      //Form lưu vào database
      formData: {
        idPosition: '1', //Vị trí mặc định là Khách hàng
        PhoneNumber: '',
        Email: '',
        Password: '',
        Birthday: '',
        Username: '', //Null, vừa gõ vừa lưu Username
        Sex: 1, //Mặc định button chọn nam để true => 1
        CMND: '',
        idHome: '',
      }
    }
  }
  async componentDidMount() {
    await AsyncStorage.getItem('@Position_Acc', (err, result) => {
      this.setState({ Position: result });
    });
    try {
      await fetch(host + '/getdata/GetPosition.php')
        .then((response) => response.json())
        .then((json) => {
          this.setState({
            dataPosition: json,
          })
        })
    }
    catch (error) { Alert.alert('', 'Không thể kết nối tới máy chủ') }
  }
  /* DateTime */
  handlePicker = (date) => {
    this.setState({
      isVisible: false,
      //Lưu vào formData vào database
      Birthday:
        this.setState(previousState => ({
          formData: {
            ...previousState.formData,
            Birthday: moment(date).format('DD/MM/yyyy'),
          }
        })),
    })
  }
  hidePicker = () => {
    this.setState({
      isVisible: false,
    })
  }
  showPicker = () => {
    this.setState({
      isVisible: true,
    })
  }
  /* End DateTime */
  /* Chọn avatar */
  openGallery = () => {
    ImagePicker.openPicker({
      width: 180, // = với style image
      height: 180,
      mediaType: 'photo',
      cropping: false //True thì đc chọn resize hình
    }).then(image => {
      this.setState({
        avatarSrc: image,
      });
    }).catch((err) => { null });
  }
  /* End chọn avatar */

  /* Lưu đăng ký */
  saveData = async () => {
    let formDataPost = new FormData();
    const { avatarSrc, formData } = this.state;

    if (!avatarSrc.path)
      return Alert.alert('', 'Vui lòng chọn ảnh đại diện');
    else if (!this.state.formData.Username) //! => false => != null
      return Alert.alert('', 'Vui lòng nhập Họ tên');
    else if (this.state.formData.Username.length < 6)
      return Alert.alert('', 'Họ tên phải dài hơn 6 ký tự');
    else if (!this.state.formData.Birthday)
      return Alert.alert('', 'Vui lòng chọn Ngày sinh');
    else if (!this.state.formData.PhoneNumber)
      return Alert.alert('', 'Vui lòng nhập Số điện thoại');
    else if (isNaN(this.state.formData.PhoneNumber))
      return Alert.alert('', 'Số điện thoại không hợp lệ');
    else if (this.state.formData.PhoneNumber.length < 10)
      return Alert.alert('', 'Số điện thoại phải dài hơn 10 ký tự');
    else if (!this.state.formData.Email)
      return Alert.alert('', 'Vui lòng nhập Địa chỉ Email');
    else if (this.state.formData.Email.length < 5)
      return Alert.alert('', 'Địa chỉ Email phải dài hơn 6 ký tự');
    else if (!this.state.formData.Email.includes('@'))
      return Alert.alert('', 'Địa chỉ Email không hợp lệ');
    else if (this.state.formData.CMND.length < 9)
      return Alert.alert('', 'Thẻ căn cước / CMND phải dài hơn 9 ký tự');
    else if (!this.state.formData.idHome && this.state.formData.idPosition == 1)
      return Alert.alert('', 'Vui lòng nhập Mã căn hộ');
    else if (!this.state.formData.Password)
      return Alert.alert('', 'Vui lòng nhập Mật khẩu');
    else if (this.state.formData.Password.length < 6)
      return Alert.alert('', 'Mật khẩu phải dài hơn 6 ký tự');
    else if (this.state.repeatPassword !== this.state.formData.Password)
      return Alert.alert('', 'Mật khẩu bạn nhập lại không đúng');

    this.refs.loading.show(); //Hình gift Loading

    for (let p in formData) formDataPost.append(p, formData[p]);
    formDataPost.append('photo', { //Ghép file Avatar
      uri: avatarSrc.path,
      type: avatarSrc.mime,
      name: 'Avatar',
    });

    await fetch(host + '/menu/RegisterAccount.php', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'multipart/form-data'
      },
      body: formDataPost
    })
      .then((response) => response.json())
      .then((json) => {
        setTimeout(() => {
          this.refs.loading.close(); //đóng gift loading
          if (JSON.stringify(json) == 1) //Trùng email
            Alert.alert('', 'Địa chỉ Email này đã có người sử dụng');
          else if (JSON.stringify(json) == 2) //Trùng SĐT
            Alert.alert('', 'Số điện thoại này đã có người sử dụng');
          else if (JSON.stringify(json) == 5) //check căn hộ
            Alert.alert('', 'Mã căn hộ không tồn tại');
          else {
            if (JSON.stringify(json) == 3) //Đăng ký thành công
              Alert.alert('', 'Đăng ký thành công');
            else if (JSON.stringify(json) == 4) //Đăng ký thất bại
              Alert.alert('', 'Đăng ký thất bại, vui lòng thử lại');
            this.props.navigation.replace('RegisterAccount'); //Sau khi đăng ký xong reset lại page
          }
        }, 100) //Load time mili giây
      })
      .catch((error) => {
        this.refs.loading.close();
        console.log(error);
        return Alert.alert('', 'Không thể kết nối tới máy chủ');
      });
  }
  /* End Lưu đăng ký */
  render() {
    /* Lưu database */
    const {
      idPosition,
      PhoneNumber,
      Email,
      Password,
      Username,
      repeatPassword,
      CMND,
      idHome,
    } = this.state.formData;
    /* End Lưu database */
    const sourceUri = this.state.avatarSrc.path ? { uri: this.state.avatarSrc.path } : require('../../assets/images/chooseAvatar.png');
    return (
      <ScrollView>
        <KeyboardAvoidingView style={styles.container} enabled>
          <View style={styles.avatar}>
            <TouchableOpacity onPress={this.openGallery}>
              <Image
                source={sourceUri}
                style={{
                  width: 180,
                  height: 180,
                  borderRadius: 180 / 2,
                }}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.text}>Họ tên</Text>
          <TextInput
            style={styles.txtInput}
            underlineColorAndroid='#8c8c8c'
            keyboardType="default"
            placeholder="Họ tên"
            onChangeText={Username =>
              this.setState(previousState => ({
                formData: {
                  ...previousState.formData,
                  Username
                }
              }))
            }
            value={Username}
          />
          <Text style={styles.text}>Giới tính</Text>
          <RadioForm
            radio_props={this.state.dataSex}
            initial={0}
            formHorizontal={true} //Nằm ngang
            labelHorizontal={true}
            buttonColor={'#2196f3'}
            buttonSize={15}
            //buttonOuterSize={20}
            animation={true}
            labelStyle={{ paddingRight: 15, fontSize: 17 }}
            onPress={Sex =>
              this.setState(previousState => ({
                formData: {
                  ...previousState.formData,
                  Sex
                }
              }))
            }
          />
          <Text style={styles.text}>Ngày sinh</Text>
          <Text style={styles.cssBirthday} onPress={this.showPicker}><FontAwesome5 color="#8c8c8c" name="birthday-cake" size={23} />  {this.state.formData.Birthday}</Text>
          <DateTimePickerModal
            isVisible={this.state.isVisible}
            onConfirm={this.handlePicker}
            onCancel={this.hidePicker}
            mode="date"
            is24Hour={true}
            onPress={this.showPicker}
          />
          <Text style={styles.text}>Số điện thoại</Text>
          <TextInput
            style={styles.txtInput}
            underlineColorAndroid='#8c8c8c'
            keyboardType="phone-pad"
            placeholder="Số điện thoại"
            onChangeText={PhoneNumber =>
              this.setState(previousState => ({
                formData: {
                  ...previousState.formData,
                  PhoneNumber
                }
              }))
            }
            value={PhoneNumber}
          />
          <Text style={styles.text}>Địa chỉ Email</Text>
          <TextInput
            style={styles.txtInput}
            underlineColorAndroid='#8c8c8c'
            keyboardType="email-address"
            placeholder="Email"
            onChangeText={Email =>
              this.setState(previousState => ({
                formData: {
                  ...previousState.formData,
                  Email
                }
              }))
            }
            value={Email}
          />
          {idPosition == 1 ? <>
            <Text style={styles.text}>Mã căn hộ</Text>
            <TextInput
              style={styles.txtInput}
              underlineColorAndroid='#8c8c8c'
              keyboardType="numeric"
              placeholder="Mã căn hộ"
              onChangeText={idHome =>
                this.setState(previousState => ({
                  formData: {
                    ...previousState.formData,
                    idHome
                  }
                }))
              }
              value={idHome}
            />
          </>
            : null}
          <Text style={styles.text}>Thẻ căn cước / CMND</Text>
          <TextInput
            style={styles.txtInput}
            underlineColorAndroid='#8c8c8c'
            keyboardType="numeric"
            placeholder="Thẻ căn cước / CMND"
            onChangeText={CMND =>
              this.setState(previousState => ({
                formData: {
                  ...previousState.formData,
                  CMND
                }
              }))
            }
            value={CMND}
          />
          <Text style={styles.text}>Mật khẩu</Text>
          <TextInput
            style={styles.txtInput}
            underlineColorAndroid='#8c8c8c'
            keyboardType="default"
            secureTextEntry={true} //Dấu tròn che mật khẩu
            placeholder="Mật khẩu"
            onChangeText={Password =>
              this.setState(previousState => ({
                formData: {
                  ...previousState.formData,
                  Password
                }
              }))
            }
            value={Password}
          />
          <Text style={styles.text}>Nhập lại mật khẩu</Text>
          <TextInput
            style={styles.txtInput}
            underlineColorAndroid='#8c8c8c'
            keyboardType="default"
            secureTextEntry={true} //Dấu tròn che mật khẩu
            placeholder="Nhập lại mật khẩu"
            onChangeText={repeatPassword =>
              this.setState({
                repeatPassword
              })
            }
            value={repeatPassword}
          />
          {this.state.Position == 4 ? <>
            <Text style={styles.text}>Chức vụ</Text>
            <View style={{ backgroundColor: '#fff', borderRadius: 5, padding: 5 }}>
              <Picker
                selectedValue={idPosition}
                style={{ height: 35 }}
                onValueChange={idPosition =>
                  this.setState(previousState => ({
                    formData: {
                      ...previousState.formData,
                      idPosition
                    }
                  }))
                }
              >
                {
                  this.state.dataPosition.map((item, index) =>
                    <Picker.Item key={item.idPosition} label={item.namePosition} value={item.idPosition} /> //Tên namePosition trong SQL
                  )
                }
              </Picker>
            </View>
          </>
            : null}
          <View style={{ padding: 4 }}></View>
          <TouchableOpacity onPress={this.saveData}>
            <Text style={styles.button}>Đăng ký</Text>
          </TouchableOpacity>

        </KeyboardAvoidingView>
        {/* Hiện hình loading khi nhấn đăng ký */}
        <Loading ref="loading" />
      </ScrollView >
    );
  }
}

const styles = StyleSheet.create({
  avatar: {
    flex: 1,
    alignItems: 'center',
  },
  container: {
    flex: 1,
    padding: 10,
  },
  text: {
    fontSize: 18,
    padding: 3,
  },
  row: {
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#ff6666',
    padding: 8,
    marginVertical: 3,
    borderRadius: 5,
    fontSize: 20,
    textAlign: 'center',
    color: '#fff',
  },
  txtInput: {
    height: 45,
    borderWidth: 0,
    fontSize: 17,
  },
  cssBirthday: {
    height: 40,
    fontSize: 18,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: '#8c8c8c',
    paddingTop: 7,
    padding: 7,
  },
});

export default Register;