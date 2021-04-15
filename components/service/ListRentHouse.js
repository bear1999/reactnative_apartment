import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Picker } from '@react-native-community/picker'; //dropdown list
import { SearchBar } from 'react-native-elements';
import { Hosting as host } from '../../app.json'; //Lấy IP host ra từ webService
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
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

export default class ListRentHouse extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            flagTouch: false,
            dataRentHouse: [],
            dataTypeService: [],
            listRefreshing: false,
            isLoading: false, //ActivityIndicator
            formSearch: {
                typeTime: '0',
                TimKiem: '',
                Page: '0',
            },
        }
    }
    async componentDidMount() {
        this.setState({ isLoading: true });
        await this._touchSearch();
    }
    _confirmButton = async (item1) => {
        Alert.alert("", "Bạn có chắc muốn hủy dịch vụ ?",
            [
                {
                    text: "Có", onPress: () => this._remove(item1)
                },
                {
                    text: "Hủy",
                    style: "cancel"
                },
            ],
            { cancelable: false }
        );
    }
    _confirmButtonXacNhan = async (item1) => {
        Alert.alert("", "Bạn có chắc muốn xác nhận gia hạn ?",
            [
                {
                    text: "Có", onPress: () => this._confirmPayRentHouse(item1)
                },
                {
                    text: "Hủy",
                    style: "cancel"
                },
            ],
            { cancelable: false }
        );
    }
    _btnSearch = async () => {
        !this.state.listRefreshing ? this.setState({ isLoading: true }) : null
        await fetch(host + '/service/ListRentHouse.php', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(this.state.formSearch)
        })
            .then((response) => response.json())
            .then((json) => {
                this.setState({
                    dataRentHouse: json,
                    listRefreshing: false, //pull to refresh flat list
                    isLoading: false, //ActivityIndicator
                })
            })
            .catch((error) => {
                console.log(error);
                return Alert.alert('', 'Không thể kết nối tới máy chủ');
            });
    }
    _remove = async (item) => {
        await fetch(host + '/service/CancelRentHouse.php', {
            method: "POST",
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ idMain: item })
        })
            .then((response) => response.json())
            .then((json) => {
                if (JSON.stringify(json) == 1) {
                    Alert.alert('', 'Hủy thuê thành công');
                }
                else Alert.alert('', 'Hủy thuê thất bại');
            })
            .catch((error) => {
                console.log(error);
                return Alert.alert('', 'Không thể kết nối tới máy chủ');
            });
    }
    _confirmPayRentHouse = async (item) => {
        await fetch(host + '/service/confirmPayRentHouse.php', {
            method: "POST",
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ idMain: item })
        })
            .then((response) => response.json())
            .then((json) => {
                if (JSON.stringify(json) == 1) {
                    Alert.alert('', 'Gia hạn thành công');
                    this._handleRefresh();
                }
                else Alert.alert('', 'Gia hạn thất bại');
            })
            .catch((error) => {
                console.log(error);
                return Alert.alert('', 'Không thể kết nối tới máy chủ');
            });
    }
    _loadMore = async () => {
        await fetch(host + '/service/ListRentHouse.php', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(this.state.formSearch)
        })
            .then((response) => response.json())
            .then((json) => {
                this.setState({
                    dataRentHouse: this.state.dataRentHouse.concat(json),
                })
            })
            .catch((error) => {
                console.log(error);
                return Alert.alert('', 'Không thể kết nối tới máy chủ');
            });
    }
    _handleLoadMore = () => {
        this.setState({
            Page:
                this.setState(previousState => ({
                    formSearch: {
                        ...previousState.formSearch,
                        Page: this.state.formSearch.Page + 1,
                    }
                }))
        }, this._loadMore)
    }
    _handleRefresh = () => { //refresh flatlist
        this.setState({
            listRefreshing: true,
            Page:
                this.setState(previousState => ({
                    formSearch: {
                        ...previousState.formSearch,
                        Page: 0
                    }
                }))
        }, this._btnSearch)
    }
    _touchPicker = (typeService) => {
        this.setState({
            typeService:
                this.setState(previousState => ({
                    formSearch: {
                        ...previousState.formSearch,
                        typeService: typeService,
                        Page: 0,
                    },
                })),
        }, this._btnSearch)
    }
    _touchPickerThoiGian = (typeTime) => {
        this.setState({
            typeTime:
                this.setState(previousState => ({
                    formSearch: {
                        ...previousState.formSearch,
                        typeTime: typeTime,
                        Page: 0,
                    },
                })),
        }, this._btnSearch)
    }
    _touchSearch = async () => {
        this.setState({
            Page:
                this.setState(previousState => ({
                    formSearch: {
                        ...previousState.formSearch,
                        Page: 0,
                    },
                })),
        }, this._btnSearch)
    }
    _renderItem = ({ item }) => {
        return (
            <View style={{ padding: 2 }}>
                <View style={{ flex: 1, flexDirection: 'row', backgroundColor: '#fff', borderRadius: 5, padding: 6 }}>
                    <TouchableOpacity onPress={() => {
                        // this.refreshData = this.props.navigation.addListener('focus', () => {
                        //     this._handleRefresh();
                        // }),
                        this.props.navigation.navigate('InfoApartment', { idMain: item.idMain })
                    }}>
                        <View style={{ flex: 1, flexDirection: 'column' }}>
                            <Text style={{ fontWeight: 'bold' }}>Mã căn hộ: {item.idMain}</Text>
                            <Text>Giá dịch vụ: <Currency value={item.priceRent} /></Text>
                            <Text>Ngày thuê: {moment(item.dateRent).format("DD/MM/yyyy")}</Text>
                            <Text>Ngày hết hạn: <Text style={{ color: "#ff0000" }}>{moment(item.dateExp).format("DD/MM/yyyy")}</Text></Text>
                        </View>
                    </TouchableOpacity>
                    <View style={{ flexDirection: "row", justifyContent: "flex-end", flex: 1 }}>
                        <View style={{ justifyContent: "center" }}>
                            <TouchableOpacity onPress={() => this._confirmButtonXacNhan(item.idMain)}>
                                <Text style={styles.btn3}><FontAwesome color="#fff" name="edit" size={14} /> Thanh toán</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{ paddingLeft: 10 }}></View>
                        <View style={{ justifyContent: "center" }}>
                            <TouchableOpacity onPress={() => this._confirmButton(item.idMain)}>
                                <Text style={styles.btn2}><FontAwesome color="#fff" name="remove" size={15} /> Hủy</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        );
    }
    render() {
        const { dataRentHouse, isLoading } = this.state;
        const { TimKiem, typeService, typeTime } = this.state.formSearch;
        return (
            <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', backgroundColor: 'rgb(20,185,200)', padding: 5 }}>
                    <TouchableOpacity onPress={this.props.navigation.goBack}>
                        <Ionicons color="#404040" name="chevron-back-sharp" size={35} style={{ paddingTop: 4 }} />
                    </TouchableOpacity>
                    <SearchBar
                        placeholder="Tìm kiếm"
                        onChangeText={TimKiem =>
                            this.setState(previousState => ({
                                formSearch: {
                                    ...previousState.formSearch,
                                    TimKiem
                                }
                            }))
                        }
                        onSubmitEditing={this._touchSearch}
                        value={TimKiem}
                        platform="android"
                        containerStyle={{
                            height: 45,
                            borderRadius: 5,
                            flex: 1,
                            width: '100%',
                        }}
                        inputContainerStyle={{
                            height: 30,
                        }}
                        inputStyle={{
                            height: 45,
                            fontSize: 18,
                        }}
                    />
                    <TouchableOpacity onPress={this._touchSearch}>
                        <Text style={{ padding: 12, color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Tìm</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ paddingTop: 10, padding: 5 }}>
                    <Text style={{ fontSize: 12, fontWeight: "bold", paddingBottom: 5, paddingLeft: 5 }}>THỜI GIAN</Text>
                    <View style={{ backgroundColor: '#fff', borderRadius: 5, padding: 4 }}>
                        <Picker
                            selectedValue={typeTime}
                            style={styles.dropdownPicker}
                            onValueChange={this._touchPickerThoiGian}
                        >
                            <Picker.Item key="0" label="Tất cả" value="0" />
                            <Picker.Item key="1" label="--- Gần tới hạn (3 ngày)" value="1" />
                            <Picker.Item key="2" label="--- Quá hạn" value="2" />
                        </Picker>
                    </View>
                </View>
                {isLoading ? <View style={{ flex: 1, justifyContent: "center" }}><ActivityIndicator size="large" color="#1a8cff" /></View> :
                    <>
                        <View style={{ paddingTop: 5 }}></View>
                        <FlatList
                            data={dataRentHouse}
                            renderItem={this._renderItem}
                            keyExtractor={item => item.idRent.toString()}
                            refreshing={this.state.listRefreshing}
                            onRefresh={this._handleRefresh}
                            onEndReached={this._handleLoadMore}
                            onEndReachedThreshold={0.5}
                        />
                    </>
                }
            </View>
        );
    }
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#ff6666',
        padding: 8,
        borderRadius: 5,
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#fff',
    },
    dropdownPicker: {
        width: "100%",
        height: 35,
    },
    btn1: {
        backgroundColor: "#3399ff",
        color: "#fff",
        width: "100%",
        textAlign: "center",
        borderRadius: 3,
        padding: 5,
        fontWeight: "bold",
    },
    btn2: {
        backgroundColor: "#ff4d4d",
        color: "#fff",
        width: "100%",
        textAlign: "center",
        borderRadius: 3,
        padding: 5,
        fontWeight: "bold",
    },
    btn3: {
        backgroundColor: "#00cc66",
        color: "#fff",
        width: "100%",
        textAlign: "center",
        borderRadius: 3,
        padding: 5,
        fontWeight: "bold",
    },
});