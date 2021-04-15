import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    Alert
} from 'react-native';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import { Hosting as host } from '../../app.json'; //Lấy IP host ra từ webService
import moment from 'moment'; //format date
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Loading from 'react-native-whc-loading';
import AsyncStorage from '@react-native-community/async-storage';

class DetailNotification extends React.Component {
    constructor(props) {
        super(props);
        const { title, content, image, user, datePost, idNotify } = this.props.route.params;
        this.state = {
            idPosition: '1',
            formData: {
                notify_title: title,
                notify_text: content,
                pathImage: image,
                Username: user,
                notify_datePost: datePost,
                idNotify: idNotify
            }
        }
        AsyncStorage.getItem('@Position_Acc', (err, result) => {
            this.setState({ idPosition: result });
        });
    }
    _LoadDetail = async () => {
        await fetch(host + '/notification/LoadDetailNotification.php', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ idNotify: this.state.formData.idNotify })
        })
            .then((response) => response.json())
            .then((json) => {
                json.map((item) => {
                    this.setState({
                        formData: {
                            ...this.state.formData,
                            notify_title: item.notify_title,
                            notify_text: item.notify_text,
                            pathImage: item.pathImage,
                            Username: item.Username,
                            notify_datePost: item.notify_datePost
                        }
                    });
                })
            })
            .catch((error) => {
                console.log(error);
                Alert.alert('', 'Không thể kết nối tới máy chủ');
            });
    }
    _XoaThongBao = async (id) => {
        this.refs.loading.show(); //Hình gift Loading
        await fetch(host + '/notification/DeleteNotification.php', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ idNotify: id })
        })
            .then((response) => response.json())
            .then((json) => {
                setTimeout(() => {
                    this.refs.loading.close(); //Hình gift Loading
                    if (JSON.stringify(json) == 1) {
                        Alert.alert('', 'Xóa thông báo thành công');
                        this.props.navigation.goBack();
                    }
                    else if (JSON.stringify(json) == 2)
                        Alert.alert('', 'Xóa thông báo thất bại');
                }, 100);
            })
            .catch((error) => {
                this.refs.loading.close(); //Hình gift Loading
                console.log(error);
                Alert.alert('', 'Không thể kết nối tới máy chủ');
            });
    }
    render() {
        const { notify_title, notify_text, pathImage, Username, notify_datePost, idNotify } = this.state.formData;
        return (
            <ScrollView style={{ padding: 5, backgroundColor: "#fff" }}>
                <View style={{ flex: 1, flexDirection: "row", justifyContent: "center", padding: 5 }}>
                    <Image
                        source={{ uri: host + '/assets/imageNotification/' + pathImage }}
                        style={{
                            width: 250,
                            height: 250,
                            borderRadius: 2,
                            resizeMode: "contain"
                        }}
                    />
                </View>
                <View style={{ borderBottomWidth: 0.8, paddingTop: 5, borderColor: "#808080" }}></View>
                <View style={{ paddingTop: 5 }}>
                    <Text style={{ textAlign: "center", fontSize: 22, fontWeight: "bold", color: "#fff", backgroundColor: "#8080ff", padding: 2, borderRadius: 5 }}>{notify_title}</Text>
                    <View style={{ flexDirection: "row", paddingTop: 5, paddingHorizontal: 10 }}>
                        <Text style={{ fontSize: 15, fontWeight: "bold", color: "#333333" }}>{notify_text}</Text>
                    </View>
                    <View style={{ flexDirection: "row", flex: 1, paddingTop: 10, paddingHorizontal: 5 }}>
                        <Text style={{ fontSize: 13, fontWeight: "bold", color: "#666666" }}>Người đăng: {Username}</Text>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 13, fontWeight: "bold", textAlign: "right", color: "#0080ff" }}>{moment(notify_datePost).format('HH:mm - DD/MM/YYYY')}</Text>
                        </View>
                    </View>
                </View>
                <View style={{ paddingTop: 7 }}></View>
                {this.state.idPosition != 1 ?
                    <View style={{ paddingTop: 2, paddingTop: 5, flex: 1, flexDirection: "row", justifyContent: "center", borderTopWidth: 0.8, borderTopColor: "#808080", paddingBottom: 10 }}>
                        <TouchableOpacity onPress={() => {
                            this.props.navigation.navigate('EditNotification', {
                                title: notify_title,
                                content: notify_text,
                                image: pathImage,
                                idNotify: idNotify,
                            }),
                                this.loadData = this.props.navigation.addListener('focus', () => {
                                    this._LoadDetail();
                                });
                        }}>
                            <Text style={{
                                padding: 6, backgroundColor: "#40bf80", color: "#fff",
                                fontWeight: "bold", fontSize: 14, borderRadius: 5, textAlign: "center"
                            }}><FontAwesome color="#fff" name="pencil" size={15} /> Chỉnh sửa thông báo</Text>
                        </TouchableOpacity>
                        <View style={{ padding: 5 }}></View>
                        <TouchableOpacity onPress={() => this._XoaThongBao(idNotify)}>
                            <Text style={{
                                padding: 5, backgroundColor: "#ff6666", color: "#fff",
                                fontWeight: "bold", fontSize: 14, borderRadius: 5, textAlign: "center"
                            }}><FontAwesome color="#fff" name="remove" size={16} /> Xóa thông báo</Text>
                        </TouchableOpacity>
                    </View>
                    : null
                }
                <Loading ref="loading" />
            </ScrollView >
        );
    }
}

export default DetailNotification;