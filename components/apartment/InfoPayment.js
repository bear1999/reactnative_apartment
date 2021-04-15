import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    ActivityIndicator,
    ScrollView,
    Alert
} from 'react-native';
import { Hosting as host } from '../../app.json'; //Lấy IP host ra từ webService
import moment from 'moment'; //format date
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

class InfoApartment extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            dataPay: [],
        }
    }
    async componentDidMount() {
        await fetch(host + '/information/PayInformation.php', {
            method: "GET",
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
        })
            .then((response) => response.json())
            .then((json) => {
                this.setState({ dataPay: json, isLoading: false });
            })
            .catch((error) => {
                console.log(error);
                return Alert.alert('', 'Không thể kết nối tới máy chủ');
            });
    }
    _renderItem = ({ item }) => {
        return (
            <View style={{ paddingHorizontal: 3, paddingVertical: 2, borderRadius: 5 }}>
                <View style={{ backgroundColor: "#fff", padding: 5 }}>
                    <Text style={styles.title}>{item.NameBank}</Text>
                    <View style={{ paddingVertical: 2 }}></View>
                    <Text style={{ fontSize: 17, textAlign: "center" }}>{item.FullNameBank}</Text>
                    <View style={{ paddingVertical: 2 }}></View>
                    <View style={{ flexDirection: "row" }}>
                        <Text style={{ fontWeight: "bold", fontSize: 13 }}>CHỦ TÀI KHOẢN: </Text>
                        <View style={{ flex: 1, flexDirection: "column" }}>
                            <Text>{item.NameAccount}</Text>
                        </View>
                    </View>
                    <View style={{ flexDirection: "row" }}>
                        <Text style={{ fontWeight: "bold", fontSize: 13 }}>SỐ TÀI KHOẢN: </Text>
                        <View style={{ flex: 1, flexDirection: "column" }}>
                            <Text>{item.NumberAccount}</Text>
                        </View>
                    </View>
                    <View style={{ flexDirection: "row" }}>
                        <Text style={{ fontWeight: "bold", fontSize: 13 }}>CHI NHÁNH: </Text>
                        <View style={{ flex: 1, flexDirection: "column" }}>
                            <Text>{item.BrandBank}</Text>
                        </View>
                    </View>
                </View>
            </View>
        );
    }
    render() {
        const { idService, idHome, name_service, regDate, expDate, value, unit, type, price_service } = this.props.route.params;
        const { isLoading, dataPay } = this.state;
        let DangDV = "Không hệ số";
        let TongTien = price_service;
        if (type) {
            DangDV = "Hệ số";
            TongTien = value * price_service;
        }
        return (
            <ScrollView style={{ padding: 5 }}>
                <View style={{ backgroundColor: "#fff", padding: 8 }}>
                    <Text style={styles.tittle}>THÔNG TIN DỊCH VỤ</Text>
                    <View style={{ paddingTop: 5 }}></View>
                    <Text style={styles.subTittle}>Mã dịch vụ: {idService}</Text>
                    <Text style={styles.subTittle}>Mã căn hộ: {idHome}</Text>
                    <Text style={styles.subTittle}>Tên dịch vụ: {name_service}</Text>
                    <Text style={styles.content}>Ngày đăng ký: {moment(regDate).format('DD/MM/yyyy')}</Text>
                    <Text style={styles.content}>Ngày hết hạn: <Text style={{ color: "#ff0000" }}>{moment(expDate).format('DD/MM/yyyy')}</Text></Text>
                    <Text style={styles.content}>Dạng dịch vụ: {DangDV}</Text>
                    {type ? <Text style={styles.content}>Hệ số sử dụng: {value ? value : 0} {unit}</Text> : null}
                    <Text style={styles.subTittle}>Tổng số tiền thanh toán: <Currency value={TongTien} /></Text>
                </View>
                <View style={{ paddingTop: 5 }}></View>
                <Text style={styles.tittle2}>THÔNG TIN THANH TOÁN</Text>
                {isLoading ? <View style={{ flex: 1, justifyContent: "center" }}><ActivityIndicator size="large" color="#1a8cff" /></View> :
                    <>
                        <View style={{ paddingTop: 5 }}></View>
                        <FlatList
                            data={dataPay}
                            renderItem={this._renderItem}
                            keyExtractor={item => item.idSql.toString()}
                        />
                    </>
                }
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    tittle: {
        fontSize: 17,
        fontWeight: "bold",
        textAlign: "center",
        backgroundColor: "#ffb366",
        color: "#fff",
        borderRadius: 3,
        padding: 4,
    },
    subTittle: {
        fontSize: 15,
        fontWeight: "bold",
    },
    content: {
        fontSize: 15
    },
    tittle2: {
        fontSize: 17,
        fontWeight: "bold",
        textAlign: "center",
        backgroundColor: "#00cc66",
        color: "#fff",
        borderRadius: 3,
        padding: 4,
    },
    title: {
        fontSize: 18, fontWeight: "bold", textAlign: "center",
        backgroundColor: "#595959", color: "#fff", padding: 2, borderRadius: 2,
        shadowColor: "#666666",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.20,
        shadowRadius: 1.41,
        elevation: 2,
    }
});

export default InfoApartment;