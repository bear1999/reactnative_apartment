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
import { Hosting as host } from '../../app.json'; //Lấy IP host ra từ webService
import FontAwesome from 'react-native-vector-icons/FontAwesome';

export default class ListContactInformation extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            idSql: '',
            dataContact: [],
        }
    }
    async componentDidMount() {
        this.data = this.props.navigation.addListener('focus', () => { this._loadDefault(); });
        await this._loadDefault();
    }
    _loadDefault = async () => {
        await fetch(host + '/information/ContactInformation.php', {
            method: "GET",
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
        })
            .then((response) => response.json())
            .then((json) => {
                this.setState({ dataContact: json, isLoading: false });
            })
            .catch((error) => {
                console.log(error);
                return Alert.alert('', 'Không thể kết nối tới máy chủ');
            });
    }
    _confirmButton = async (item) => {
        await this.setState({ idSql: item });
        Alert.alert("", "Bạn có chắc muốn xóa ?",
            [
                {
                    text: "Có", onPress: () => this._remove()
                },
                {
                    text: "Hủy",
                    onPress: () => console.log("Hủy"),
                    style: "cancel"
                },
            ],
            { cancelable: false }
        );
    }
    _remove = async () => {
        await fetch(host + '/information/DeleteContactInformation.php', {
            method: "POST",
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ idSql: this.state.idSql })
        })
            .then((response) => response.json())
            .then((json) => {
                if (JSON.stringify(json) == 1) {
                    Alert.alert('', 'Xóa thành công');
                    this._loadDefault();
                }
                else Alert.alert('', 'Xóa thất bại');
            })
            .catch((error) => {
                console.log(error);
                return Alert.alert('', 'Không thể kết nối tới máy chủ');
            });
    }
    _renderItem = ({ item }) => {
        return (
            <View style={{ padding: 2 }}>
                <View style={{ flex: 1, flexDirection: 'row', backgroundColor: '#fff', borderRadius: 5, padding: 6 }}>
                    <TouchableOpacity>
                        <View style={{ flex: 1, flexDirection: 'column' }}>
                            <Text style={{ fontWeight: "bold" }}>{item.NameContact}</Text>
                            <Text style={{ fontWeight: "bold" }}>{
                                item.AddressContact.length > 30 ?
                                    item.AddressContact.substring(0, 30) + "..."
                                    : item.AddressContact}
                            </Text>
                            <Text style={{ fontWeight: "bold" }}>{item.TelContact}</Text>
                        </View>
                    </TouchableOpacity>
                    <View style={{ flexDirection: "row", justifyContent: "flex-end", flex: 1 }}>
                        <View style={{ justifyContent: "center" }}>
                            <TouchableOpacity onPress={() => this.props.navigation.navigate('EditContactInformation', {
                                idSql: item.idSql,
                                NameContact: item.NameContact,
                                AddressContact: item.AddressContact,
                                TelContact: item.TelContact
                            })}>
                                <Text style={styles.btn1}><FontAwesome color="#fff" name="edit" size={14} /> Chỉnh sửa</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{ paddingLeft: 10 }}></View>
                        <View style={{ justifyContent: "center" }}>
                            <TouchableOpacity onPress={() => this._confirmButton(item.idSql)}>
                                <Text style={styles.btn2}><FontAwesome color="#fff" name="remove" size={15} /> Xóa</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        );
    }
    render() {
        const { dataContact, isLoading } = this.state;
        return (
            <View style={{ flex: 1 }}>
                <TouchableOpacity onPress={() => this.props.navigation.navigate('PostContactInformation')}>
                    <View style={{ padding: 8 }}>
                        <Text style={styles.button}> <FontAwesome color="#fff" name="plus-circle" size={15} /> Thêm</Text>
                    </View>
                </TouchableOpacity>
                {isLoading ? <View style={{ flex: 1, justifyContent: "center" }}><ActivityIndicator size="large" color="#1a8cff" /></View> :
                    <>
                        <View style={{ paddingTop: 5 }}></View>
                        <FlatList
                            data={dataContact}
                            renderItem={this._renderItem}
                            keyExtractor={item => item.idSql.toString()}
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
});