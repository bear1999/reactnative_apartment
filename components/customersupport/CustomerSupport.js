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
import moment from 'moment'; //format date

export default class CustomerSupport extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            listData: [],
            dataStatus: [],
            dataPosition: [],
            listRefreshing: false,
            isLoading: false,
            idTicket: '',
            formSearch: {
                Status: '0',
                Position: '0', //Vị trí mặc định là Tất cả
                TimKiem: '',
                Page: '0',
            },
        }
    }
    async componentDidMount() {
        this.setState({ isLoading: true });
        await fetch(host + '/getdata/getPositionEmployee.php', { method: 'POST' })
            .then((response) => response.json())
            .then((json) => {
                this.setState({
                    dataPosition: json,
                })
            })
            .catch(() => { return Alert.alert('', 'Không thể kết nối tới máy chủ') });
        await fetch(host + '/getdata/StatusTicket.php', { method: 'POST' })
            .then((response) => response.json())
            .then((json) => {
                this.setState({
                    dataStatus: json,
                })
            })
            .catch(() => { return Alert.alert('', 'Không thể kết nối tới máy chủ') });
        await this._touchSearch();
    }
    _btnXuLy = async () => {
        await fetch(host + '/customersupport/ProcessingTicket.php', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ idTicket: this.state.idTicket })
        })
            .then((response) => response.json())
            .then((json) => {
                if (JSON.stringify(json) == 1) {
                    Alert.alert('', 'Cập nhật thành công');
                    this._handleRefresh();
                } else Alert.alert('', 'Cập nhật thất bại');
            })
            .catch((error) => {
                console.log(error);
                return Alert.alert('', 'Không thể kết nối tới máy chủ');
            });
    }
    _btnHoanThanh = async () => {
        await fetch(host + '/customersupport/CompleteTicket.php', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ idTicket: this.state.idTicket })
        })
            .then((response) => response.json())
            .then((json) => {
                if (JSON.stringify(json) == 1) {
                    Alert.alert('', 'Cập nhật thành công');
                    this._handleRefresh();
                } else Alert.alert('', 'Cập nhật thất bại');
            })
            .catch((error) => {
                console.log(error);
                return Alert.alert('', 'Không thể kết nối tới máy chủ');
            });
    }
    _confirmXuLy = async (item) => {
        await this.setState({ idTicket: item });
        Alert.alert("", "Bạn có chắc muốn cập nhật ?",
            [
                {
                    text: "Có", onPress: () => this._btnXuLy()
                },
                {
                    text: "Hủy",
                    style: "cancel"
                },
            ],
            { cancelable: false }
        );
    }
    _confirmHoanThanh = async (item) => {
        await this.setState({ idTicket: item });
        Alert.alert("", "Bạn có chắc muốn cập nhật ?",
            [
                {
                    text: "Có", onPress: () => this._btnHoanThanh()
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
        await fetch(host + '/customersupport/CustomerSupport.php', {
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
                    listData: json,
                    listRefreshing: false, //pull to refresh flat list
                    isLoading: false, //ActivityIndicator
                })
            })
            .catch((error) => {
                console.log(error);
                return Alert.alert('', 'Không thể kết nối tới máy chủ');
            });
    }
    _loadMore = async () => {
        await fetch(host + '/customersupport/CustomerSupport.php', {
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
                    listData: this.state.listData.concat(json),
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
        }, this._loadMore);
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
    _touchPicker = (Position) => {
        this.setState({
            Position:
                this.setState(previousState => ({
                    formSearch: {
                        ...previousState.formSearch,
                        Position: Position,
                        Page: 0,
                    },
                })),
        }, this._btnSearch)
    }
    _touchStatus = (Status) => {
        this.setState({
            Status:
                this.setState(previousState => ({
                    formSearch: {
                        ...previousState.formSearch,
                        Status: Status,
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
            <View style={{ padding: 5, backgroundColor: "#fff", borderBottomWidth: 0.8 }}>
                <TouchableOpacity onPress={() => {
                    this.loadData = this.props.navigation.addListener('focus', () => {
                        this._handleRefresh();
                    });
                    this.props.navigation.navigate('ContentSupport', { idTicket: item.idTicket, closed: item.closed });
                }}>
                    <Text style={{ fontWeight: "bold", fontSize: 15 }}>Mã ticket: #{item.idTicket} ({item.name_apartment})</Text>
                    <Text><Text style={{ fontWeight: "bold", fontSize: 15 }}>Tiêu đề:</Text> {item.tittle_ticket.length > 40 ? item.tittle_ticket.substring(0, 40) + "..." : item.tittle_ticket}</Text>
                    <Text><Text style={{ fontWeight: "bold", fontSize: 15 }}>Thời gian:</Text> <Text style={{ color: "red" }}>{moment(item.dateCreate).format('DD/MM/YYYY HH:mm')}</Text></Text>
                    <Text><Text style={{ fontWeight: "bold", fontSize: 15 }}>Trả lời:</Text> {item.Username}</Text>
                    <View style={{ paddingTop: 2 }}></View>
                    <View style={{ flexDirection: "row" }}>
                        <Text style={{ fontWeight: "bold", fontSize: 14 }}>Trạng thái: </Text>
                        <Text style={{ backgroundColor: "#00cc66", color: "#fff", fontWeight: "bold", paddingHorizontal: 4, borderRadius: 2 }}>{item.name_status}</Text>
                    </View>
                    <View style={{ paddingTop: 2 }}></View>
                    <View style={{ flexDirection: "row" }}>
                        <Text style={{ fontWeight: "bold", fontSize: 14 }}>Bộ phận: </Text>
                        <Text style={{ backgroundColor: "#0099ff", color: "#fff", fontWeight: "bold", paddingHorizontal: 4, borderRadius: 2 }}>{item.namePosition}</Text>
                    </View>
                    <View style={{ paddingTop: 4 }}></View>
                </TouchableOpacity>
                {!item.closed ?
                    <View style={{ flexDirection: "row" }}>
                        <TouchableOpacity onPress={() => this._confirmXuLy(item.idTicket)}>
                            <Text style={{ backgroundColor: "#595959", fontWeight: "bold", color: "#fff", padding: 3, paddingHorizontal: 5, textAlign: "center", borderRadius: 2, fontSize: 15 }}>Đang xử lý</Text>
                        </TouchableOpacity>
                        <View style={{ padding: 3 }}></View>
                        <TouchableOpacity onPress={() => this._confirmHoanThanh(item.idTicket)}>
                            <Text style={{ backgroundColor: "#668cff", fontWeight: "bold", color: "#fff", padding: 3, paddingHorizontal: 5, textAlign: "center", borderRadius: 2, fontSize: 15 }}>Đã hoàn thành</Text>
                        </TouchableOpacity>
                    </View>
                    : null
                }
            </View>
        );
    }
    render() {
        const { listData, isLoading } = this.state;
        const { Position, TimKiem, Status } = this.state.formSearch;
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
                <View style={{ paddingTop: 5 }}></View>
                <Text style={{ paddingLeft: 7, fontWeight: "bold" }}>BỘ PHẬN</Text>
                <View style={{ paddingTop: 5, padding: 5 }}>
                    <View style={{ backgroundColor: '#fff', borderRadius: 5, padding: 4 }}>
                        <Picker
                            selectedValue={Position}
                            style={styles.dropdownPicker}
                            onValueChange={this._touchPicker}
                        >
                            <Picker.Item key="0" label="Tất cả" value="0" />
                            {
                                this.state.dataPosition.map((item, index) =>
                                    <Picker.Item key={item.idPosition} label={item.namePosition} value={item.idPosition} />
                                )
                            }
                        </Picker>
                    </View>
                </View>
                <Text style={{ paddingLeft: 7, fontWeight: "bold" }}>TRẠNG THÁI</Text>
                <View style={{ paddingTop: 5, padding: 5 }}>
                    <View style={{ backgroundColor: '#fff', borderRadius: 5, padding: 4 }}>
                        <Picker
                            selectedValue={Status}
                            style={styles.dropdownPicker}
                            onValueChange={this._touchStatus}
                        >
                            <Picker.Item key="0" label="Tất cả" value="0" />
                            {
                                this.state.dataStatus.map((item, index) =>
                                    <Picker.Item key={item.idStatus} label={item.name_status} value={item.idStatus} />
                                )
                            }
                        </Picker>
                    </View>
                </View>
                <View style={{ paddingTop: 5 }}></View>
                {isLoading ? <View style={{ flex: 1, justifyContent: "center" }}><ActivityIndicator size="large" color="#1a8cff" /></View> :
                    <FlatList
                        data={listData}
                        renderItem={this._renderItem}
                        keyExtractor={item => item.idTicket.toString()}
                        refreshing={this.state.listRefreshing}
                        onRefresh={this._handleRefresh}
                        onEndReached={this._handleLoadMore}
                        onEndReachedThreshold={0.5}
                    />
                }
            </View>
        );
    }
}

const styles = StyleSheet.create({
    dropdownPicker: {
        width: "100%",
        height: 35,
    }
});