import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    Alert,
} from 'react-native';
import { Hosting as host } from '../../app.json'; //Lấy IP host ra từ webService
import Loading from 'react-native-whc-loading';
import { ScrollView } from 'react-native-gesture-handler';

class PostNotification extends React.Component {
    constructor(props) {
        super(props);
        const { NameBank, FullNameBank, BrandBank, NumberAccount, NameAccount, idSql } = this.props.route.params;
        this.state = {
            formData: {
                idSql: idSql,
                NameBank: NameBank,
                FullNameBank: FullNameBank,
                BrandBank: BrandBank,
                NumberAccount: NumberAccount,
                NameAccount: NameAccount,
            }
        }
    }
    _DangThongBao = async () => {
        if (!this.state.formData.NameBank)
            return Alert.alert('', 'Tên ngân hàng không được để trống');
        else if (!this.state.formData.FullNameBank)
            return Alert.alert('', 'Tên CTY ngân hàng không được để trống');
        else if (!this.state.formData.NameAccount)
            return Alert.alert('', 'Tên chủ tài khoản không được để trống');
        else if (!this.state.formData.NumberAccount)
            return Alert.alert('', 'Số tài khoản không được để trống');
        else if (!this.state.formData.BrandBank)
            return Alert.alert('', 'Chi nhánh không được để trống');

        this.refs.loading.show(); //Hình gift Loading

        await fetch(host + '/information/EditPayInformation.php', {
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
                    this.refs.loading.close(); //Hình gift Loading
                    if (JSON.stringify(json) == 1) {
                        Alert.alert('', 'Cập nhật thành công');
                        this.props.navigation.goBack();
                    }
                    else if (JSON.stringify(json) == 2)
                        Alert.alert('', 'Cập nhật thất bại');
                }, 100);
            })
            .catch((error) => {
                this.refs.loading.close(); //Hình gift Loading
                console.log(error);
                Alert.alert('', 'Không thể kết nối tới máy chủ');
            });
    }
    render() {
        const { NameBank, FullNameBank, BrandBank, NumberAccount, NameAccount } = this.state.formData;
        return (
            <ScrollView style={{ flex: 1, padding: 5 }}>
                <View style={{ paddingTop: 5 }}></View>
                <Text style={{ fontSize: 13, fontWeight: "bold", paddingBottom: 5, paddingLeft: 2 }}>TÊN NGÂN HÀNG</Text>
                <TextInput
                    style={styles.txtInput}
                    keyboardType="default"
                    placeholder="Tên ngân hàng"
                    onChangeText={NameBank =>
                        this.setState(previousState => ({
                            formData: {
                                ...previousState.formData,
                                NameBank
                            }
                        }))
                    }
                    value={NameBank}
                />
                <View style={{ paddingTop: 5 }}></View>
                <Text style={{ fontSize: 13, fontWeight: "bold", paddingBottom: 5, paddingLeft: 2 }}>TÊN CTY NGÂN HÀNG</Text>
                <TextInput
                    style={styles.txtInput}
                    keyboardType="default"
                    placeholder="Tên CTY Ngân hàng"
                    onChangeText={FullNameBank =>
                        this.setState(previousState => ({
                            formData: {
                                ...previousState.formData,
                                FullNameBank
                            }
                        }))
                    }
                    value={FullNameBank}
                />
                <View style={{ paddingTop: 5 }}></View>
                <Text style={{ fontSize: 13, fontWeight: "bold", paddingBottom: 5, paddingLeft: 2 }}>CHỦ TÀI KHOẢN</Text>
                <TextInput
                    style={styles.txtInput}
                    keyboardType="default"
                    placeholder="Chủ tài khoản"
                    onChangeText={NameAccount =>
                        this.setState(previousState => ({
                            formData: {
                                ...previousState.formData,
                                NameAccount
                            }
                        }))
                    }
                    value={NameAccount}
                />
                <View style={{ paddingTop: 5 }}></View>
                <Text style={{ fontSize: 13, fontWeight: "bold", paddingBottom: 5, paddingLeft: 2 }}>SỐ TÀI KHOẢN</Text>
                <TextInput
                    style={styles.txtInput}
                    keyboardType="numeric"
                    placeholder="Số tài khoản"
                    onChangeText={NumberAccount =>
                        this.setState(previousState => ({
                            formData: {
                                ...previousState.formData,
                                NumberAccount
                            }
                        }))
                    }
                    value={NumberAccount}
                />
                <View style={{ paddingTop: 5 }}></View>
                <Text style={{ fontSize: 13, fontWeight: "bold", paddingBottom: 5, paddingLeft: 2 }}>CHI NHÁNH</Text>
                <TextInput
                    style={styles.txtInput}
                    keyboardType="default"
                    placeholder="Chi nhánh"
                    onChangeText={BrandBank =>
                        this.setState(previousState => ({
                            formData: {
                                ...previousState.formData,
                                BrandBank
                            }
                        }))
                    }
                    value={BrandBank}
                />
                <View style={{ paddingTop: 10 }}></View>
                <Text style={styles.btnDangThongBao} onPress={this._DangThongBao}>Cập nhật thông tin</Text>
                <View style={{ paddingBottom: 10 }}></View>
                <Loading ref="loading" />
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    txtInput: {
        height: 45,
        borderWidth: 0,
        fontSize: 17,
        backgroundColor: "#fff",
        borderRadius: 3,
        padding: 10,
    },
    txtContent: {
        height: "auto",
        borderWidth: 0,
        fontSize: 17,
        backgroundColor: "#fff",
        borderRadius: 3,
        padding: 10,
    },
    dropdownPicker: {
        width: "100%",
        height: 35,
    },
    btnDangThongBao: {
        backgroundColor: "#668cff",
        color: "#fff",
        padding: 5,
        fontSize: 17,
        fontWeight: "bold",
        textAlign: "center",
        borderRadius: 2
    },
});

export default PostNotification;