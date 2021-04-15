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
import DateTimePickerModal from "react-native-modal-datetime-picker";
import moment from 'moment'; //format date
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Loading from 'react-native-whc-loading';
import ImagePicker from 'react-native-image-crop-picker'; //Image
import { Hosting as host } from '../../app.json'; //Lấy IP host ra từ webService

class Register extends React.Component {
  constructor(props) {
    super(props);
    const { Username, Sex, PhoneNumber, Email, Birthday, idUser, Position, pathAvatar, IDCard, Disable } = this.props.route.params;
    this.state = {
      dataPosition: [],
      dataSex: [{ label: 'Nam', value: 1 }, { label: 'Nữ', value: 0 }], //True, false php ko chạy để 1, 0
      isVisible: false,
      avatarSrc: {},
      //Form lưu vào database
      formData: {
        idUser: idUser,
        Position: Position, //Vị trí mặc định là cập nhật
        PhoneNumber: PhoneNumber,
        Email: Email,
        Birthday: moment(Birthday).format('DD/MM/yyyy'),
        Username: Username, //Null, vừa gõ vừa lưu Username
        Sex: Sex, //Mặc định button chọn nam để true => 1
        pathAvatar: pathAvatar, //lấy link avatar hiện tại xóa ảnh trên server
        IDCard: IDCard,
        Disable: Disable
      }
    }
  }
  async componentDidMount() {
    await fetch(host + '/getdata/GetPosition.php')
      .then((response) => response.json())
      .then((json) => {
        this.setState({
          dataPosition: json,
        })
      })
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
    }).catch((err) => { null });
  }
  /* End chọn avatar */
  _VoHieuHoa = async () => {
    const { idUser, Disable } = this.state.formData;
    let flagDisable = true;
    if(Disable) flagDisable = false;
    await fetch(host + '/menu/DisableAccount.php', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ idUser: idUser, Disable: flagDisable })
    })
      .then((response) => response.json())
      .then((json) => {
        setTimeout(() => {
          this.refs.loading.close(); //đóng gift loading
          if (JSON.stringify(json) == 1) {
            Alert.alert('', 'Đã được thực hiện');
            this.props.navigation.goBack();
          }
          else if (JSON.stringify(json) == 2)
            Alert.alert('', 'Thất bại');
        }, 100); //Load time mili giây
      })
      .catch((error) => {
        this.refs.loading.close();
        console.error(error);
      });
  }
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
    else if (this.state.formData.IDCard.length < 9)
      return Alert.alert('', 'Thẻ căn cước / CMND phải dài hơn 9 ký tự');

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
              this.props.navigation.goBack();
            }
            else if (JSON.stringify(json) == 4) //Đăng ký thất bại
              Alert.alert('', 'Cập nhật thất bại, vui lòng thử lại');
          }
        }, 100); //Load time mili giây
      })
      .catch((error) => {
        this.refs.loading.close();
        console.error(error);
      });
  }
  /* End Lưu đăng ký */
  render() {
    /* Lưu database */
    const {
      Position,
      PhoneNumber,
      Email,
      Username,
      IDCard,
      Disable
    } = this.state.formData;
    const { idUser, pathAvatar } = this.props.route.params;
    /* End Lưu database */
    const sourceUri = this.state.avatarSrc.path ? { uri: this.state.avatarSrc.path } : { uri: host + '/assets/avatar/' + pathAvatar };
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
          <Text style={styles.text}>Thẻ căn cước / CMND</Text>
          <TextInput
            style={styles.txtInput}
            underlineColorAndroid='#8c8c8c'
            keyboardType="numeric"
            placeholder="Thẻ căn cước / CMND"
            onChangeText={IDCard =>
              this.setState(previousState => ({
                formData: {
                  ...previousState.formData,
                  IDCard
                }
              }))
            }
            value={IDCard}
          />
          <Text style={styles.text}>Mật khẩu</Text>
          <TouchableOpacity onPress={() => this.props.navigation.navigate('ChangePasswordForAdmin', { idUser: idUser })}>
            <Text style={styles.password}> **************</Text>
          </TouchableOpacity>
          {this.state.formData.Position == 1 ?
            <>
              <Text style={styles.text}>Căn hộ</Text>
              <TouchableOpacity onPress={() => this.props.navigation.navigate('UpdateApartmentUser', { idUser: idUser })}>
                <View style={styles.picker}>
                  <Text style={{ borderRadius: 5, height: 35, paddingLeft: 8, fontSize: 17, backgroundColor: '#fff' }}>
                    <Image source={require('../../assets/icons/apartment_1.png')} style={{ width: 24, height: 24, resizeMode: 'contain' }} />  Thông tin căn hộ
                  </Text>
                </View>
              </TouchableOpacity>
            </>
            : null
          }

          <Text style={styles.text}>Chức vụ</Text>
          <View style={{ paddingBottom: 10 }}>
            <View style={styles.picker}>
              <Picker
                selectedValue={Position}
                style={{ width: "100%", flex: 1, height: 35 }}
                onValueChange={Position =>
                  this.setState(previousState => ({
                    formData: {
                      ...previousState.formData,
                      Position
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
          </View>

          <TouchableOpacity onPress={this.saveData}>
            <Text style={styles.button1}>Cập nhật</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={this._VoHieuHoa}>
            {Disable ? <Text style={styles.button2}>Kích hoạt tài khoản</Text>
              : <Text style={styles.button}>Vô hiệu hóa tài khoản</Text>
            }
          </TouchableOpacity>
        </KeyboardAvoidingView>
        {/* Hiện hình loading khi nhấn đăng ký */}
        <Loading ref="loading" />
      </ScrollView >
    );
  }
}

const styles = StyleSheet.create({
  picker: {
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 4,
  },
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
    padding: 5,
    marginVertical: 3,
    borderRadius: 5,
    fontSize: 18,
    textAlign: 'center',
    color: '#fff',
  },
  button1: {
    backgroundColor: '#80bfff',
    padding: 5,
    marginVertical: 3,
    borderRadius: 5,
    fontSize: 18,
    textAlign: 'center',
    color: '#fff',
  },
  button2: {
    backgroundColor: '#00e673',
    padding: 5,
    marginVertical: 3,
    borderRadius: 5,
    fontSize: 18,
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
  position: {
    height: 40,
    fontSize: 16,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: '#8c8c8c',
    padding: 7,
    paddingTop: 8,
  },
});

export default Register;