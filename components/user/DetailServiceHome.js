import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    Image,
    FlatList,
    ActivityIndicator,
    TouchableOpacity
} from 'react-native';
import { Hosting as host } from '../../app.json'; //Lấy IP host ra từ webService
import Loading from 'react-native-whc-loading';
import { ScrollView } from 'react-native-gesture-handler';
import moment from 'moment';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
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

export default class MyHome extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            flagLichSu: false,
            isLoading: true, //ActivityIndicator
            dataService: [],
            dataHistory: [],
        }
    }
    componentDidMount = async () => {
        await this._loadDataService();
        await this._loadDataHistoryService();
    }
    _loadDataService = async () => {
        const { idMain } = this.props.route.params;
        await fetch(host + '/apartment/InfoApartment/InfoService.php', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ idMain: idMain })
        })
            .then((response) => response.json())
            .then((json) => {
                this.setState({ dataService: json, isLoading: false })
            })
            .catch(() => { null });
    }
    _loadDataHistoryService = async () => {
        const { idMain } = this.props.route.params;
        await fetch(host + '/service/HistoryServiceHome.php', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ idHome: idMain })
        })
            .then((response) => response.json())
            .then((json) => {
                this.setState({ dataHistory: json, isLoading: false })
            })
            .catch((err) => { console.error(err) });
    }
    _renderItem = ({ item, index }) => {
        return (
            <View>
                <View style={{ flex: 1, flexDirection: 'column', backgroundColor: '#fff', padding: 6 }}>
                    <View style={{ flex: 1, flexDirection: "row" }}>
                        <View style={{ borderRightWidth: 0.5, borderRightColor: "#808080", justifyContent: "center" }}>
                            <Image
                                source={{ uri: host + '/assets/logoService/' + item.imageTypeService }}
                                style={{
                                    width: 75,
                                    height: 75,
                                    margin: 10,
                                    borderRadius: 2,
                                }}
                            />
                        </View>
                        <TouchableOpacity onPress={() => this.props.navigation.navigate("DetailService", {
                            name_service: item.name_service,
                            description_service: item.description_service,
                            unit: item.unit,
                            price_service: item.price_service,
                            type: item.type,
                            imageTypeService: item.imageTypeService
                        })}>
                            <View style={{ flex: 1, flexDirection: 'column', paddingLeft: 5 }}>
                                <View style={{ paddingTop: 5 }}></View>
                                <Text style={{ fontWeight: 'bold' }}>Mã dịch vụ: {item.idService}</Text>
                                <Text style={{ fontWeight: 'bold' }}>Tên dịch vụ: {item.name_service}</Text>
                                <Text>Ngày đăng ký: {moment(item.regDate).format('DD/MM/yyyy')}</Text>
                                <Text>Ngày hết hạn: <Text style={{ color: "#ff0000" }}>{moment(item.expDate).format('DD/MM/yyyy')}</Text></Text>
                            </View>
                        </TouchableOpacity>
                        {item.value && item.type ?
                            <View style={{ paddingTop: 5, paddingLeft: 15, paddingRight: 15, flexDirection: "column", justifyContent: "center" }}>
                                <TouchableOpacity onPress={() => this.props.navigation.navigate("InfoPayment", {
                                    idService: item.idService,
                                    idHome: item.idHome,
                                    regDate: item.regDate,
                                    expDate: item.expDate,
                                    value: item.value,
                                    name_service: item.name_service,
                                    unit: item.unit,
                                    price_service: item.price_service,
                                    type: item.type,
                                })}>
                                    <Text style={styles.thongtinthanhtoan}>Thanh toán</Text>
                                </TouchableOpacity>
                            </View>
                            : !item.type && !item.value ?
                                <View style={{ paddingTop: 5, paddingLeft: 15, paddingRight: 15, flexDirection: "column", justifyContent: "center" }}>
                                    <TouchableOpacity onPress={() => this.props.navigation.navigate("InfoPayment", {
                                        idService: item.idService,
                                        idHome: item.idHome,
                                        regDate: item.regDate,
                                        expDate: item.expDate,
                                        value: item.value,
                                        name_service: item.name_service,
                                        unit: item.unit,
                                        price_service: item.price_service,
                                        type: item.type,
                                    })}>
                                        <Text style={styles.thongtinthanhtoan}>Thanh toán</Text>
                                    </TouchableOpacity>
                                </View>
                                : null
                        }
                    </View>
                </View>
            </View>
        );
    }
    _renderHistoryDichVu = ({ item }) => {
        return (
            <View>
                <View style={{ flex: 1, flexDirection: 'row', backgroundColor: '#fff', padding: 6, borderBottomWidth: 0.8, borderBottomColor: "#808080" }}>
                    <View style={{ flex: 1, flexDirection: 'column', paddingLeft: 5, borderRightWidth: 0.8, borderRightColor: "#808080" }}>
                        <View style={{ paddingTop: 5 }}></View>
                        <Text style={{ fontWeight: "bold" }}>Tên dịch vụ:</Text>
                        <Text style={{ fontWeight: "bold" }}>{item.name_service}</Text>
                        <Text>Ngày đăng ký: {moment(item.regDate).format('DD/MM/yyyy')}</Text>
                        <Text>Ngày hết hạn: <Text style={{ color: "red" }}>{moment(item.expDate).format('DD/MM/yyyy')}</Text></Text>
                        <Text>Loại dịch vụ: {item.type_service ? <Text>Hệ số</Text> : <Text>Không hệ số</Text>}</Text>
                        <Text>Hệ số sử dụng: {item.value}</Text>
                        <Text>Số tiền thanh toán:</Text>
                        <Text><Currency value={item.total_payment} /></Text>
                    </View>
                    <View style={styles.btn}>
                        {item.confirm ?
                            <Text style={styles.dathanhtoan}>Đã thanh toán</Text> :
                            <Text style={styles.huydichvu}>Hủy dịch vụ</Text>
                        }
                    </View>
                </View>
            </View>
        );
    }
    _btnLichSu = () => {
        if (!this.state.flagLichSu) this.setState({ flagLichSu: true });
        else this.setState({ flagLichSu: false });
    }
    render() {
        const { dataService, isLoading, dataHistory } = this.state;
        let flagViewLS = false, count = 0;
        dataHistory.map(() => {
            count = count + 1;
            if (count == 2) flagViewLS = true;
        });
        return (
            <ScrollView style={styles.dsCanho}>
                <Text style={styles.textNe}>Dịch vụ căn hộ</Text>
                <View style={{ paddingTop: 10 }}></View>
                {isLoading ? <View style={{ flex: 1, justifyContent: "center", padding: 30 }}><ActivityIndicator size="large" color="#1a8cff" /></View> :
                    <FlatList
                        data={dataService}
                        renderItem={this._renderItem}
                        keyExtractor={item => item.idService.toString()}
                    />
                }
                <View style={{ padding: 5 }}>
                    <TouchableOpacity onPress={() => this._btnLichSu()}>
                        <View style={{ paddingTop: 10 }}>
                            {this.state.flagLichSu ?
                                <Text style={{
                                    fontSize: 15, padding: 5, backgroundColor: "#404040", color: "#fff", borderTopRightRadius: 5, borderTopLeftRadius: 5, fontWeight: "bold", textAlign: "center"
                                }}><FontAwesome5 color="#fff" name="history" size={15} /> Lịch sử dịch vụ</Text>
                                : <Text style={{
                                    fontSize: 15, padding: 5, backgroundColor: "#404040", color: "#fff", borderRadius: 5, fontWeight: "bold", textAlign: "center"
                                }}><FontAwesome5 color="#fff" name="history" size={15} /> Lịch sử dịch vụ</Text>
                            }
                        </View>
                    </TouchableOpacity>
                    {isLoading ? <View style={{ flex: 1, justifyContent: "center", padding: 30 }}><ActivityIndicator size="large" color="#1a8cff" /></View> :
                        this.state.flagLichSu ?
                            flagViewLS ?
                                <>
                                    <ScrollView style={{ height: 350 }}>
                                        <FlatList
                                            data={dataHistory}
                                            renderItem={this._renderHistoryDichVu}
                                            keyExtractor={item => item.idHistory.toString()}
                                        />
                                    </ScrollView>
                                </>
                                : <>
                                    <ScrollView>
                                        <FlatList
                                            data={dataHistory}
                                            renderItem={this._renderHistoryDichVu}
                                            keyExtractor={item => item.idHistory.toString()}
                                        />
                                    </ScrollView>
                                </>
                            : null
                    }
                </View>
                <TouchableOpacity onPress={() => this.props.navigation.navigate("ListRegService", { idMain: this.props.route.params.idMain })}>
                    <View style={{ padding: 5, justifyContent: "center" }}>
                        <Text style={{
                            backgroundColor: "#404040", padding: 5, textAlign: "center", color: "#fff", fontWeight: "bold", borderRadius: 5,
                            fontSize: 17
                        }}>
                            <MaterialCommunityIcons color="#fff" name="beaker-plus" size={18} />  Đăng ký dịch vụ
						</Text>
                    </View>
                </TouchableOpacity>
                <Loading ref="loading" />
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    txtCanho: {
        fontSize: 17,
    },
    dsCanho: {
        backgroundColor: '#fff',
        borderRadius: 1,
        height: '100%',
    },
    container: {
        backgroundColor: '#fff',
        borderRadius: 1,
    },
    textNe: {
        paddingTop: 5,
        fontSize: 20,
        fontWeight: 'bold',
        justifyContent: 'center',
        textAlign: 'center',
        color: '#333333',
    },
    dathanhtoan: {
        backgroundColor: "rgb(92,184,92)",
        color: "#fff", fontSize: 17,
        fontWeight: "bold",
        borderRadius: 3,
        textAlign: "center"
    },
    thongtinthanhtoan: {
        backgroundColor: "#00cc66",
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
        borderRadius: 3,
        textAlign: "center",
        padding: 3,
    },
    huydichvu: {
        backgroundColor: "rgb(217,83,79)",
        color: "#fff",
        fontSize: 17,
        fontWeight: "bold",
        borderRadius: 3,
        textAlign: "center"
    },
    btn: {
		flex: 1,
		flexDirection: 'column',
		justifyContent: "center",
		paddingLeft: 6
	},
});