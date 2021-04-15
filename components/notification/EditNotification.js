import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    Alert,
    Image,
    TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { Hosting as host } from '../../app.json'; //Lấy IP host ra từ webService
import Loading from 'react-native-whc-loading';
import { ScrollView } from 'react-native-gesture-handler';
import ImagePicker from 'react-native-image-crop-picker'; //Image

class PostNotification extends React.Component {
    constructor(props) {
        super(props);
        const { title, content, idNotify, image } = this.props.route.params;
        this.state = {
            avatarSrc: {},
            formData: {
                title: title,
                content: content,
                idPost: null,
                idNotify: idNotify,
                pathImage: image,
            }
        }
    }
    async componentDidMount() {
        await AsyncStorage.getItem('@idUser_Acc', (err, result) => {
            this.setState({ formData: { ...this.state.formData, idPost: result } })
        });
    }
    saveData = async () => {
        let formDataPost = new FormData();
        const { avatarSrc, formData } = this.state;

        this.refs.loading.show(); //Hình gift Loading

        for (let p in formData) formDataPost.append(p, formData[p]);
        if (avatarSrc.path) {
            formDataPost.append('photo', { //Ghép file Avatar
                uri: avatarSrc.path,
                type: avatarSrc.mime,
                name: 'Avatar',
            });
        }

        await fetch(host + '/notification/EditNotification.php', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'multipart/form-data'
            },
            body: formDataPost
        })
            .then((response) => response.json())
            .then((json) => {
                setTimeout(() => {
                    this.refs.loading.close(); //đóng gift loading
                    if (JSON.stringify(json) == 1) {
                        Alert.alert('', 'Cập nhật thành công');
                        this.props.navigation.goBack();
                    }
                    else if (JSON.stringify(json) == 2)
                        Alert.alert('', 'Cập nhật thất bại');
                }, 100) //Load time mili giây
            })
            .catch((error) => {
                this.refs.loading.close();
                console.log(error);
                return Alert.alert('', 'Không thể kết nối tới máy chủ');
            });
    }
    openGallery = () => {
        ImagePicker.openPicker({
            width: 180, // = với style image
            height: 180,
            mediaType: 'photo',
            cropping: false //True thì đc chọn resize hình
        }).then(image => {
            this.setState({
                avatarSrc: image,
            });
        }).catch((err) => { null });
    }
    render() {
        const { title, content, pathImage } = this.state.formData;
        const sourceUri = this.state.avatarSrc.path ? { uri: this.state.avatarSrc.path } : { uri: host + '/assets/imageNotification/' + pathImage };
        return (
            <ScrollView style={{ flex: 1, padding: 5 }}>
                <View style={{ alignItems: "center", padding: 10 }}>
                    <TouchableOpacity onPress={this.openGallery}>
                        <Image
                            source={sourceUri}
                            style={{
                                width: 200,
                                height: 200,
                                borderRadius: 2,
                            }}
                        />
                    </TouchableOpacity>
                </View>
                <View style={{ paddingTop: 5 }}></View>
                <Text style={{ fontSize: 13, fontWeight: "bold", paddingBottom: 5, paddingLeft: 2 }}>TIÊU ĐỀ</Text>
                <TextInput
                    style={styles.txtInput}
                    keyboardType="default"
                    placeholder="Tiêu đề"
                    onChangeText={title =>
                        this.setState(previousState => ({
                            formData: {
                                ...previousState.formData,
                                title
                            }
                        }))
                    }
                    value={title}
                />
                <View style={{ paddingTop: 5 }}></View>
                <Text style={{ fontSize: 13, fontWeight: "bold", paddingBottom: 5, paddingLeft: 2 }}>NỘI DUNG</Text>
                <TextInput
                    style={styles.txtcontent}
                    multiline={true}
                    numberOfLines={5}
                    keyboardType="default"
                    placeholder="Nội dụng"
                    onChangeText={content => this.setState(({ formData: { ...this.state.formData, content: content } }))}
                    value={content}
                />
                <View style={{ paddingTop: 10 }}></View>
                <TouchableOpacity onPress={this.saveData}>
                    <Text style={styles.btnDangThongBao}>Cập nhật thông báo</Text>
                </TouchableOpacity>
                <View style={{ paddingBottom: 10 }}></View>
                <Loading ref="loading" />
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    txtInput: {
        height: 45,
        borderWidth: 0,
        fontSize: 17,
        backgroundColor: "#fff",
        borderRadius: 3,
        padding: 10,
    },
    txtcontent: {
        height: "auto",
        borderWidth: 0,
        fontSize: 17,
        backgroundColor: "#fff",
        borderRadius: 3,
        padding: 10,
    },
    dropdownPicker: {
        width: "100%",
        height: 35,
    },
    btnDangThongBao: {
        backgroundColor: "#668cff",
        color: "#fff",
        padding: 5,
        fontSize: 17,
        fontWeight: "bold",
        textAlign: "center",
        borderRadius: 2
    },
});

export default PostNotification;