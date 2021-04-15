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
  StatusBar
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
// Register Form
import RadioForm from 'react-native-simple-radio-button';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import moment from 'moment'; //format date
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Loading from 'react-native-whc-loading';
import ImagePicker from 'react-native-image-crop-picker'; //Image
import { Hosting as host } from '../../app.json'; //Lấy IP host ra từ webService

class Register extends React.Component {
  constructor(props) {
    super(props);
    const { idUser, PhoneNumber, Email, Birthday, Username, Sex, pathAvatar } = this.props.route.params;
    this.state = {
      dataSex: [{ label: 'Nam', value: 1 }, { label: 'Nữ', value: 0 }], //True, false php ko chạy để 1, 0
      isVisible: false,
      avatarSrc: {},
      //Form lưu vào database
      formData: {
        idUser: idUser,
        PhoneNumber: PhoneNumber,
        Email: Email,
        Birthday: moment(Birthday).format('DD/MM/yyyy'),
        Username: Username, //Null, vừa gõ vừa lưu Username
        Sex: Sex, //Mặc định button chọn nam để true => 1
        pathAvatar: pathAvatar, //lấy link avatar hiện tại xóa ảnh trên server
      }
    }
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
      console.log(image);
      this.setState({
        avatarSrc: image,
      });
    }).catch(() => { null });
  }
  /* End chọn avatar */
  /* Lưu đăng ký */
  saveData = async () => {
    let formDataPost = new FormData();
    const { avatarSrc, formData } = this.state;

    if (!this.state.formData.Username) //! => false => != null
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

    this.refs.loading.show(); //Hình gift Loading

    for (let p in formData) formDataPost.append(p, formData[p]);

    if (avatarSrc.path) {
      formDataPost.append('photo', { //Ghép file Avatar
        uri: avatarSrc.path,
        type: avatarSrc.mime,
        name: 'Avatar',
      });
    }

    await fetch(host + '/menu/UpdateAccount.php', {
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
          else {
            if (JSON.stringify(json) == 3) {//Đăng ký thành công
              Alert.alert('', 'Cập nhật thành công');
              return this.props.navigation.navigate('Menu');
            } else if (JSON.stringify(json) == 4) //Đăng ký thất bại
              Alert.alert('', 'Cập nhật thất bại, vui lòng thử lại');
          }
        }, 100); //Load time mili giây
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
      PhoneNumber,
      Email,
      Username,
    } = this.state.formData;
    const { idUser, pathAvatar, loadAvatar } = this.props.route.params;
    /* End Lưu database */
    const sourceUri = this.state.avatarSrc.path ? { uri: this.state.avatarSrc.path } : { uri: host + '/assets/avatar/' + pathAvatar };
    return (
      <ScrollView>
        <KeyboardAvoidingView style={styles.container} enabled>
          <View style={styles.avatar}>
            {loadAvatar ?
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
              :
              <View style={{ paddingTop: 5 }}>
                <Image source={require('../../assets/icons/cloud.png')} style={{ height: 50, width: 50 }} />
              </View>
            }
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
            initial={this.state.formData.Sex == 1 ? 0 : 1}
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
          <Text style={styles.birthday} onPress={this.showPicker}><FontAwesome5 color="#8c8c8c" name="birthday-cake" size={23} />  {this.state.formData.Birthday}</Text>
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
          <Text style={styles.text}>Mật khẩu</Text>
          <TouchableOpacity onPress={() => this.props.navigation.navigate('ChangePassword', { idUser: idUser })}>
            <Text style={styles.password}> **************</Text>
          </TouchableOpacity>
          <View style={{ paddingTop: 8 }}></View>
          <TouchableOpacity onPress={this.saveData}>
            <Text style={styles.button}>Cập nhật</Text>
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
    fontSize: 16,
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
  birthday: {
    height: 40,
    fontSize: 18,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: '#8c8c8c',
    padding: 7,
    paddingTop: 7
  },
  password: {
    height: 40,
    fontSize: 16,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: '#8c8c8c',
    padding: 7,
    paddingTop: 10,
  },
});

export default Register;