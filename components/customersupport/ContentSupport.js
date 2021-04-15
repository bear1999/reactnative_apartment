import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    TextInput,
    View,
    Alert,
    FlatList,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
// Register Form
import Loading from 'react-native-whc-loading';
import { Hosting as host } from '../../app.json'; //Lấy IP host ra từ webService
import { Server as server } from '../../app.json'; //Lấy IP host ra từ webService
import AsyncStorage from '@react-native-community/async-storage';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import moment from 'moment'; //format date
import io from "socket.io-client";


var e;
export default class ContetSupport extends React.Component {
    constructor(props) {
        super(props);
        e = this;
        const { idTicket } = this.props.route.params;
        this.state = {
            listData: [],
            formData: {
                content: '',
                idUser: '',
                idTicket: idTicket,
            }
        }
        this.socket = io(server);
        this.socket.on("server-send", function () {
            e._loadContent();
        });
    }
    componentDidMount = async () => {
        await AsyncStorage.getItem('@idUser_Acc', (err, result) => {
            this.setState({ formData: { ...this.state.formData, idUser: result } })
        });
        await this._loadContent();
    }
    _loadContent = async () => {
        await fetch(host + '/customersupport/ContentSupport.php', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                idTicket: this.props.route.params.idTicket
            })
        })
            .then((response) => response.json())
            .then((json) => {
                this.setState({ listData: json });
            })
            .catch((error) => {
                console.log(error);
                return Alert.alert('', 'Không thể kết nối tới máy chủ');
            });
    }
    _renderItem = ({ item }) => {
        return (
            <ScrollView style={{ padding: 5, backgroundColor: "#fff" }}>
                {item.idUser_post != this.state.formData.idUser ?
                    <View>
                        <Text style={{ paddingLeft: 2, color: "#404040", fontSize: 12 }}>{item.namePosition} - {item.Username} / {moment(item.dateSend).format('HH:mm DD-MM-YY')}</Text>
                        <View style={{ paddingTop: 1 }}></View>
                        <Text style={{ backgroundColor: "#5F9EA0", padding: 10, borderRadius: 5, color: "#fff", fontSize: 15, width: "70%" }}>{item.ticket_text}</Text>
                    </View>
                    : <>
                        <Text style={{ paddingLeft: 2, color: "#404040", fontSize: 12, textAlign: "right" }}>{item.Username} / {moment(item.dateSend).format('HH:mm DD-MM-YY')}</Text>
                        <View style={{ paddingTop: 1 }}></View>
                        <View style={{ flex: 1, flexDirection: "row-reverse" }}>
                            <Text style={{ backgroundColor: "#778899", padding: 10, borderRadius: 5, color: "#fff", fontSize: 15, width: "70%", textAlign: "right" }}>{item.ticket_text}</Text>
                        </View>
                    </>
                }
            </ScrollView>
        );
    }
    /* Lưu đăng ký */
    saveData = async () => {
        if (!this.state.formData.content)
            return null;

        await fetch(host + '/customersupport/PostContentSupport.php', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(this.state.formData)
        })
            .then((response) => response.json())
            .then((json) => {
                if (JSON.stringify(json) == 2)
                    Alert.alert('', 'Không thể gửi');
                else {
                    this.socket.emit("client-send");
                    this.setState({ formData: { ...this.state.formData, content: '' } });
                }
            })
            .catch((error) => {
                console.log(error);
                return Alert.alert('', 'Không thể kết nối tới máy chủ');
            });
    }
    /* End Lưu đăng ký */
    render() {
        const { content } = this.state.formData;
        const { listData } = this.state;
        const { closed } = this.props.route.params;
        return (
            <View style={{ flex: 1 }}>
                <ScrollView>
                    <FlatList
                        data={listData}
                        renderItem={this._renderItem}
                        keyExtractor={item => item.idTicket_text.toString()}
                    />
                </ScrollView>
                {/* Hiện hình loading khi nhấn đăng ký */}
                <View style={{ paddingTop: 5 }}></View>
                {!closed ? <>
                    <View style={{ flexDirection: "row", backgroundColor: "#fff", borderRadius: 5, paddingHorizontal: 5 }}>
                        <TextInput
                            style={styles.txtInput}
                            multiline={true}
                            keyboardType="default"
                            placeholder="Nội dụng"
                            onChangeText={content => this.setState(({ formData: { ...this.state.formData, content: content } }))}
                            value={content}
                        />
                        <View style={{ flexDirection: "column", justifyContent: "center", backgroundColor: "#fff" }}>
                            <TouchableOpacity onPress={this.saveData}>
                                <FontAwesome name="send" size={25} color="#ff6666" />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={{ paddingBottom: 7 }}></View>
                </> : null
                }
                <Loading ref="loading" />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    text: {
        fontSize: 14,
        fontWeight: "bold"
    },
    row: {
        marginBottom: 20,
    },
    txtInput: {
        fontSize: 17,
        backgroundColor: "#fff",
        padding: 7,
        width: "92%"
    },
});