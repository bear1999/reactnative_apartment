import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    TextInput,
    View,
    KeyboardAvoidingView,
    Alert,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
// Register Form
import Loading from 'react-native-whc-loading';
import { Hosting as host } from '../../app.json'; //Lấy IP host ra từ webService
import moment from 'moment';
import NumberFormat from 'react-number-format';

export function Currency({ value }) {
    return (
        <NumberFormat
            value={value}
            displayType={'text'}
            thousandSeparator={true}
            suffix={' đ'}
            renderText={formattedValue => <Text>{formattedValue}</Text>} // <--- Don't forget this!
        />
    );
}

class UpdateServiceHome extends React.Component {
    constructor(props) {
        super(props);
        const { value, idService } = this.props.route.params;
        this.state = {
            HeSo: value,
            idService: idService,
        }
    }
    _xacNhanThanhToan = async () => {
        this.refs.loading.show(); //Hình gift Loading

        let TongTien;
        if (this.props.route.params.type) TongTien = this.state.HeSo * this.props.route.params.price_service;
        else TongTien = this.props.route.params.price_service;

        await fetch(host + '/service/confirmPaymentService.php', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ idService: this.state.idService, TongTien: TongTien })
        })
            .then((response) => response.json())
            .then((json) => {
                setTimeout(() => {
                    this.refs.loading.close(); //đóng gift loading
                    if (JSON.stringify(json) == 1) {
                        Alert.alert('', 'Thanh toán thành công');
                        return this.props.navigation.goBack();
                    }
                    else if (JSON.stringify(json) == 2)
                        Alert.alert('', 'Thanh toán thất bại');
                    else if (JSON.stringify(json) == 3)
                        Alert.alert('', 'Dịch vụ chưa cập nhật hệ số, thanh toán thất bại');
                    else if (JSON.stringify(json) == 4)
                        Alert.alert('', 'Chưa tới ngày thanh toán, thanh toán thất bại');
                }, 100) //Load time mili giây
            })
            .catch((error) => {
                this.refs.loading.close();
                console.log(error);
                return Alert.alert('', 'Không thể kết nối tới máy chủ');
            });
    }
    saveData = async () => {
        if (!this.state.HeSo)
            return Alert.alert('', 'Vui lòng nhập Hệ số sử dụng');
        this.refs.loading.show(); //Hình gift Loading
        await fetch(host + '/service/UpdateServiceHome.php', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ value: this.state.HeSo, idService: this.state.idService })
        })
            .then((response) => response.json())
            .then((json) => {
                setTimeout(() => {
                    this.refs.loading.close(); //đóng gift loading
                    if (JSON.stringify(json) == 1) {
                        Alert.alert('', 'Cập nhật thành công');
                        return this.props.navigation.goBack();
                    }
                    else Alert.alert('', 'Cập nhật thất bại');
                }, 100) //Load time mili giây
            })
            .catch((error) => {
                this.refs.loading.close();
                console.log(error);
                return Alert.alert('', 'Không thể kết nối tới máy chủ');
            });
    }
    render() {
        const { HeSo } = this.state;
        const { idService, idHome, name_service, regDate, expDate, unit, type, typeUpdate, price_service } = this.props.route.params;
        let TongTien;
        if (type === 1) TongTien = HeSo * price_service;
        else TongTien = price_service;
        /* End Lưu database */
        return (
            <ScrollView>
                <KeyboardAvoidingView style={styles.container} enabled>
                    <Text style={styles.cssForm}>Mã dịch vụ: {idService}</Text>
                    <View style={{ padding: 5 }}></View>
                    <Text style={styles.cssForm}>Mã căn hộ: {idHome}</Text>
                    <View style={{ padding: 5 }}></View>
                    <Text style={styles.cssForm}>Tên dịch vụ: {name_service}</Text>
                    <View style={{ padding: 5 }}></View>
                    <Text style={styles.cssForm}>Ngày đăng ký: {moment(regDate).format("DD/MM/yyyy")}</Text>
                    <View style={{ padding: 5 }}></View>
                    <Text style={styles.cssForm}>Ngày hết hạn: <Text style={{ color: "red" }}>{moment(expDate).format("DD/MM/yyyy")}</Text></Text>
                    <View style={{ padding: 5 }}></View>
                    {type == 1 ? <>
                        <Text style={styles.cssForm}>Dạng dịch vụ: Hệ số</Text>
                        <View style={{ padding: 5 }}></View>
                        <Text style={styles.cssForm}>Đơn vị: {unit}</Text>
                    </>
                        :
                        <Text style={styles.cssForm}>Dạng dịch vụ: Không hệ số</Text>
                    }
                    <View style={{ padding: 5 }}></View>
                    {typeUpdate && type ? <>
                        <Text style={styles.text}>Hệ số sử dụng</Text>
                        <TextInput
                            style={styles.txtInput}
                            underlineColorAndroid='#8c8c8c'
                            keyboardType="numeric"
                            placeholder="Hệ số sử dụng"
                            onChangeText={HeSo => this.setState({ HeSo: HeSo })}
                            value={HeSo ? HeSo.toString() : HeSo}
                        />
                    </>
                        : <>
                            {type ? <>
                                <Text style={styles.cssForm}>Hệ số sử dụng: {HeSo}</Text>
                                <View style={{ padding: 5 }}></View>
                                <Text style={styles.cssForm}>Tổng số tiền thanh toán: <Currency value={TongTien} /></Text>
                            </> : null
                            }

                        </>
                    }
                    <View style={{ padding: 4 }}></View>
                    {typeUpdate ?
                        <TouchableOpacity onPress={this.saveData}>
                            <Text style={styles.button}>Cập nhật</Text>
                        </TouchableOpacity>
                        :
                        <TouchableOpacity onPress={this._xacNhanThanhToan}>
                            <Text style={styles.button1}>Xác nhận thanh toán</Text>
                        </TouchableOpacity>
                    }
                </KeyboardAvoidingView>
                {/* Hiện hình loading khi nhấn đăng ký */}
                <Loading ref="loading" />
            </ScrollView >
        );
    }
}

const styles = StyleSheet.create({
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
        borderRadius: 2,
        fontSize: 18,
        textAlign: 'center',
        color: '#fff',
        fontWeight: "bold"
    },
    button1: {
        backgroundColor: "rgb(74,210,149)",
        padding: 8,
        marginVertical: 3,
        borderRadius: 2,
        fontSize: 18,
        textAlign: 'center',
        color: '#fff',
        fontWeight: "bold"
    },
    txtInput: {
        height: 45,
        borderWidth: 0,
        fontSize: 17,
    },
    cssForm: {
        height: 40,
        fontSize: 18,
        borderWidth: 1,
        borderRadius: 2,
        borderColor: '#8c8c8c',
        paddingTop: 7,
        padding: 7,
    },
});

export default UpdateServiceHome;