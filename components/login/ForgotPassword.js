import React from 'react';
import {
    StyleSheet,
    View,
    TouchableOpacity,
    Text,
    TextInput,
    Alert,
    StatusBar
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { Hosting as host } from '../../app.json'; //Lấy IP host ra từ webService
import Loading from 'react-native-whc-loading';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

class ForgotPassword extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            Email: '',
        };
    }
    _checkEmail = async () => {
        if (!this.state.Email)
            return Alert.alert('', 'Vui lòng nhập địa chỉ Email');

        this.refs.loading.show();
        await fetch(host + '/login/ForgotPassword.php', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ Email: this.state.Email })
        })
            .then((response) => response.json())
            .then((json) => {
                setTimeout(() => {
                    this.refs.loading.close();
                    if (JSON.stringify(json) == 1)
                        return Alert.alert('', 'Địa chỉ Email này không tồn tại');
                    else {
                        AsyncStorage.setItem('@OTP', JSON.stringify(json));
                        AsyncStorage.setItem('@otpEmail', JSON.stringify(this.state.Email));
                        Alert.alert('', 'Mã OTP đã được gửi tới Email của bạn');
                        this.props.navigation.replace("ConfirmOTP");
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
        const { Email } = this.state;
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar backgroundColor="rgb(93, 109, 126)" barStyle="light-content" />
                <View style={{ padding: 10 }}>
                    <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
                        <View style={{
                            justifyContent: "flex-start", width: "26%", color: "#000", backgroundColor: "#fff", padding: 2, borderRadius: 20,
                            flexDirection: "row"
                        }}>
                            <Ionicons name="arrow-back-outline" size={25} color="#696969" />
                            <View style={{ justifyContent: "center", paddingBottom: 2 }}>
                                <Text style={{ fontSize: 15, fontWeight: "bold", textAlign: "center", color: "#696969" }}> Quay lại</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={{ justifyContent: "center", flex: 1 }}>
                    <Text style={styles.tittle}>Quên mật khẩu</Text>
                    <View style={{ padding: 10 }}>
                        <View style={styles.viewInput}>
                            <TextInput
                                style={styles.txtInput}
                                keyboardType="default"
                                placeholder="Nhập địa chỉ Email"
                                value={Email}
                                onChangeText={Email => this.setState({ Email: Email })}
                            />
                        </View>
                        <View style={{ paddingTop: 5 }}>
                            <TouchableOpacity onPress={this._checkEmail}>
                                <Text style={styles.button}>Tiếp tục</Text>
                            </TouchableOpacity>
                        </View>
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
        textAlign: 'center',
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

export default ForgotPassword;