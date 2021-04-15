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

export default class ListPayInformation extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            idSql: '',
            dataPay: [],
        }
    }
    async componentDidMount() {
        this.data = this.props.navigation.addListener('focus', () => { this._loadDefault(); });
        await this._loadDefault();
    }
    _loadDefault = async () => {
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
        await fetch(host + '/information/DeletePayInformation.php', {
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
                            <Text style={{ fontWeight: "bold" }}>{item.NameBank}</Text>
                            <Text style={{ fontWeight: "bold" }}>{item.NumberAccount}</Text>
                        </View>
                    </TouchableOpacity>
                    <View style={{ flexDirection: "row", justifyContent: "flex-end", flex: 1 }}>
                        <View style={{ justifyContent: "center" }}>
                            <TouchableOpacity onPress={() => this.props.navigation.navigate('EditPayInformation', {
                                idSql: item.idSql,
                                NameBank: item.NameBank,
                                NameAccount: item.NameAccount,
                                BrandBank: item.BrandBank,
                                NumberAccount: item.NumberAccount,
                                FullNameBank: item.FullNameBank
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
        const { dataPay, isLoading } = this.state;
        return (
            <View style={{ flex: 1 }}>
                <TouchableOpacity onPress={() => this.props.navigation.navigate('PostPayInformation')}>
                    <View style={{ padding: 8 }}>
                        <Text style={styles.button}> <FontAwesome color="#fff" name="plus-circle" size={15} /> Thêm</Text>
                    </View>
                </TouchableOpacity>
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