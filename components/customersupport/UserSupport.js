import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    Alert,
    ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Hosting as host } from '../../app.json'; //Lấy IP host ra từ webService
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import moment from 'moment'; //format date

class ManagerAccount extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            listData: [],
            dataStatus: [],
            dataPosition: [],
            listRefreshing: false,
            isLoading: false,
            formSearch: {
                Page: '0',
                idUser: ''
            },
        }
    }
    async componentDidMount() {
        this.setState({ isLoading: true });
        await AsyncStorage.getItem('@idUser_Acc', (err, result) => {
            this.setState({ formSearch: { ...this.state.formSearch, idUser: result } })
        });
        await this._btnSearch();
    }
    _btnSearch = async () => {
        !this.state.listRefreshing ? this.setState({ isLoading: true }) : null
        await fetch(host + '/customersupport/UserSupport.php', {
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
        await fetch(host + '/customersupport/UserSupport.php', {
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
    _renderItem = ({ item }) => {
        return (
            <View style={{ padding: 6, backgroundColor: "#fff", borderBottomWidth: 0.8 }}>
                <TouchableOpacity onPress={() => {
                    this.loadData = this.props.navigation.addListener('focus', () => {
                        this._handleRefresh();
                    })
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
                        <Text style={{ fontWeight: "bold", fontSize: 14 }}>Gửi tới: </Text>
                        <Text style={{ backgroundColor: "#0099ff", color: "#fff", fontWeight: "bold", paddingHorizontal: 4, borderRadius: 2 }}>{item.namePosition}</Text>
                    </View>
                </TouchableOpacity>
            </View>
        );
    }
    render() {
        const { listData, isLoading } = this.state;
        return (
            <View style={{ flex: 1 }}>
                <View style={{ paddingTop: 5 }}></View>
                <TouchableOpacity onPress={() => {
                    this.loadData = this.props.navigation.addListener('focus', () => {
                        this._handleRefresh();
                    });
                    this.props.navigation.navigate('PostSupport');
                }}>
                    <View style={{ padding: 8 }}>
                        <Text style={styles.button}> <FontAwesome color="#fff" name="send" size={17} />  Yêu cầu hỗ trợ</Text>
                    </View>
                </TouchableOpacity>
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
    },
    button: {
        backgroundColor: '#ff6666',
        padding: 8,
        borderRadius: 5,
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#fff',
    },
});

export default ManagerAccount;