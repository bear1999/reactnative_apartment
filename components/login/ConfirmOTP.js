import React from 'react';
import {
    StyleSheet,
    View,
    TouchableOpacity,
    Text,
    TextInput,
    Alert,
    StatusBar,
    BackHandler
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { Hosting as host } from '../../app.json'; //Lấy IP host ra từ webService
import Loading from 'react-native-whc-loading';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackgroundTimer from 'react-native-background-timer';

class ConfirmOTP extends React.Component {
    countNe = 0;
    constructor(props) {
        super(props);
        this.state = {
            countDown: 119,
            OTP: null,
            confirmMatKhau: '',
            MatKhau: '',
        };
    }
    componentDidMount = async () => {
        this.countNe = BackgroundTimer.setInterval(() => { this.setState({ countDown: this.state.countDown - 1 }) }, 1000);
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
    }
    componentWillUnmount = async () => {
        BackgroundTimer.clearInterval(this.countNe);
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
        AsyncStorage.removeItem("@OTP");
        AsyncStorage.removeItem("@otpEmail");
    }
    handleBackButton = () => {
        Alert.alert(
            '', 'Bạn có chắc muốn thoát ?',
            [{ text: 'Hủy', style: 'cancel' },
            { text: 'Có', onPress: () => BackHandler.exitApp() }], {
            cancelable: false
        })
        return true;
    }
    _checkEmail = async () => {
        const OTP = await AsyncStorage.getItem("@OTP");
        const Email = await AsyncStorage.getItem("@otpEmail");

        if (!this.state.OTP)
            return Alert.alert('', 'Vui lòng nhập Mã OTP');
        else if (!this.state.MatKhau)
            return Alert.alert('', 'Mật khẩu mới không để trống');
        else if (this.state.MatKhau.length < 6)
            return Alert.alert('', 'Mật khẩu mới phải dài hơn 6 ký tự');
        else if (!this.state.confirmMatKhau)
            return Alert.alert('', 'Nhập lại mật khẩu mới không để trống');
        else if (this.state.OTP != OTP)
            return Alert.alert('', 'Mã OTP của bạn không đúng');

        this.refs.loading.show();
        await fetch(host + '/login/ConfirmOTP.php', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ MatKhau: this.state.MatKhau, Email: Email })
        })
            .then((response) => response.json())
            .then((json) => {
                setTimeout(() => {
                    this.refs.loading.close();
                    if (JSON.stringify(json) == 1) Alert.alert('', 'Đổi mật khẩu thành công');
                    else Alert.alert('', 'Đổi mật khẩu thất bại vui lòng thử lại');
                    this.props.navigation.replace("Login");
                }, 100);
            })
            .catch((error) => {
                console.error(error);
                this.refs.loading.close();
                return Alert.alert('', 'Không thể kết nối tới máy chủ');
            });
    }
    render() {
        const { MatKhau, confirmMatKhau, OTP } = this.state;
        if (this.state.countDown <= 0) {
            AsyncStorage.removeItem("@OTP");
            AsyncStorage.removeItem("@otpEmail");
            this.props.navigation.goBack();
        }
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar backgroundColor="rgb(93, 109, 126)" barStyle="light-content" />
                <Text style={styles.tittle}>Xác nhận OTP</Text>
                <Text style={{ textAlign: "center", paddingTop: 5, fontSize: 15, color: "#fff" }}>Mã OTP của bạn sẽ hết hạn sau: {this.state.countDown} giây</Text>
                <View style={{ padding: 10 }}>
                    <View style={styles.viewInput}>
                        <TextInput
                            style={styles.txtInput}
                            keyboardType="numeric"
                            placeholder="Nhập Mã OTP"
                            value={OTP}
                            onChangeText={OTP => this.setState({ OTP: OTP })}
                        />
                    </View>
                    <View style={styles.viewInput}>
                        <TextInput
                            style={styles.txtInput}
                            keyboardType="default"
                            placeholder="Nhập Mật khẩu mới"
                            value={MatKhau}
                            secureTextEntry={true}
                            onChangeText={MatKhau => this.setState({ MatKhau: MatKhau })}
                        />
                    </View>
                    <View style={styles.viewInput}>
                        <TextInput
                            style={styles.txtInput}
                            keyboardType="default"
                            placeholder="Nhập lại Mật khẩu mới"
                            value={confirmMatKhau}
                            secureTextEntry={true}
                            onChangeText={confirmMatKhau => this.setState({ confirmMatKhau: confirmMatKhau })}
                        />
                    </View>
                    <View style={{ paddingTop: 5 }}>
                        <TouchableOpacity onPress={this._checkEmail}>
                            <Text style={styles.button}>Đổi mật khẩu</Text>
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
});

export default ConfirmOTP;