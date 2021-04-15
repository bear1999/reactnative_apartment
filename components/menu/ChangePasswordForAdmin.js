import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    TextInput,
    View,
    Alert,
} from 'react-native';
import Loading from 'react-native-whc-loading';
import { Hosting as host } from '../../app.json'; //Lấy IP host ra từ webService

class ChangePasswordForAdmin extends React.Component {
    constructor(props) {
        super(props);
        const { idUser } = this.props.route.params;
        this.state = {
            repeatPassword: '',
            formData: {
                idUser: idUser,
                newPassword: '',
            }
        }
    }

    _savePassword = async () => {
        if (!this.state.formData.newPassword)
            return Alert.alert('', 'Mật khẩu mới không được trống');
        else if (this.state.formData.newPassword.length < 6)
            return Alert.alert('', 'Mật khẩu mới phải dài hơn 6 ký tự');
        else if (!this.state.repeatPassword)
            return Alert.alert('', 'Nhập lại mật khẩu mới không được trống');
        else if (this.state.repeatPassword != this.state.formData.newPassword)
            return Alert.alert('', 'Mật khẩu nhập lại không khớp');

        this.refs.loading.show(); //Hình gift Loading

        try {
            await fetch(host + '/menu/ChangePasswordForAdmin.php', {
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
                            Alert.alert("", "Đổi mật khẩu thành công!", [{ text: "Ok", onPress: () => this.props.navigation.goBack() }]);
                        else if (JSON.stringify(json) == 2)
                            Alert.alert('', 'Đổi mật khẩu thất bại!');
                    }, 100)
                })
                .catch((error) => {
                    this.refs.loading.close(); //đóng gift loading
                    console.error(error);
                });
        }
        catch (error) {
            this.refs.loading.close();
            Alert.alert('', 'Không thể kết nối tới máy chủ');
        }
    }

    render() {
        const { newPassword } = this.state.formData;
        const { repeatPassword } = this.state;
        return (
            <View style={styles.container}>
                <View style={styles.containInput}>
                    <View style={{ borderBottomWidth: 1, borderBottomColor: '#cccccc' }}>
                        <TextInput
                            style={styles.txtInput}
                            keyboardType="default"
                            secureTextEntry={true} //Dấu tròn che mật khẩu
                            placeholder="Mật khẩu mới"
                            value={newPassword}
                            onChangeText={newPassword =>
                                this.setState(previousState => ({
                                    formData: {
                                        ...previousState.formData,
                                        newPassword
                                    }
                                }))
                            }
                        />
                    </View>
                    <TextInput
                        style={styles.txtInput}
                        keyboardType="default"
                        secureTextEntry={true} //Dấu tròn che mật khẩu
                        placeholder="Nhập lại mật khẩu mới"
                        value={repeatPassword}
                        onChangeText={repeatPassword => this.setState(({ repeatPassword: repeatPassword }))}
                    />
                </View>
                <View style={{ paddingTop: 5 }}>
                    <TouchableOpacity onPress={this._savePassword}>
                        <Text style={styles.button}>Đổi mật khẩu</Text>
                    </TouchableOpacity>
                </View>
                <Loading ref="loading" />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 5,
        paddingTop: 10,
    },
    containInput: {
        backgroundColor: '#fff',
        borderRadius: 5,
    },
    txtInput: {
        height: 45,
        borderWidth: 0,
        fontSize: 17,
        padding: 10
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
})


export default ChangePasswordForAdmin;