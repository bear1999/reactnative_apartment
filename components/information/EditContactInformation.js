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
        const { NameContact, AddressContact, TelContact, idSql } = this.props.route.params;
        this.state = {
            formData: {
                idSql: idSql,
                NameContact: NameContact,
                AddressContact: AddressContact,
                TelContact: TelContact,
            }
        }
    }
    _DangThongBao = async () => {
        if (!this.state.formData.NameContact)
            return Alert.alert('', 'Tên liên hệ không được để trống');
        else if (!this.state.formData.AddressContact)
            return Alert.alert('', 'Địa chỉ liên hệ không được để trống');
        else if (!this.state.formData.TelContact)
            return Alert.alert('', 'Số điện thoại liên hệ không được để trống');
        

        this.refs.loading.show(); //Hình gift Loading

        await fetch(host + '/information/EditContactInformation.php', {
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
        const { NameContact, AddressContact, TelContact } = this.state.formData;
        return (
            <ScrollView style={{ flex: 1, padding: 5 }}>
                <View style={{ paddingTop: 5 }}></View>
                <Text style={{ fontSize: 13, fontWeight: "bold", paddingBottom: 5, paddingLeft: 2 }}>TÊN LIÊN HỆ</Text>
                <TextInput
                    style={styles.txtInput}
                    keyboardType="default"
                    placeholder="Tên liên hệ"
                    onChangeText={NameContact =>
                        this.setState(previousState => ({
                            formData: {
                                ...previousState.formData,
                                NameContact
                            }
                        }))
                    }
                    value={NameContact}
                />
                <View style={{ paddingTop: 5 }}></View>
                <Text style={{ fontSize: 13, fontWeight: "bold", paddingBottom: 5, paddingLeft: 2 }}>ĐỊA CHỈ LIÊN HỆ</Text>
                <TextInput
                    style={styles.txtInput}
                    keyboardType="default"
                    placeholder="Địa chỉ liên hệ"
                    onChangeText={AddressContact =>
                        this.setState(previousState => ({
                            formData: {
                                ...previousState.formData,
                                AddressContact
                            }
                        }))
                    }
                    value={AddressContact}
                />
                <View style={{ paddingTop: 5 }}></View>
                <Text style={{ fontSize: 13, fontWeight: "bold", paddingBottom: 5, paddingLeft: 2 }}>SỐ ĐIỆN THOẠI LIÊN HỆ</Text>
                <TextInput
                    style={styles.txtInput}
                    keyboardType="default"
                    placeholder="Số điện thoại liên hệ"
                    onChangeText={TelContact =>
                        this.setState(previousState => ({
                            formData: {
                                ...previousState.formData,
                                TelContact
                            }
                        }))
                    }
                    value={TelContact}
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