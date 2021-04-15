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
import { Picker } from '@react-native-community/picker'; //dropdown list
import { Hosting as host } from '../../app.json'; //Lấy IP host ra từ webService
import Loading from 'react-native-whc-loading';
import { ScrollView } from 'react-native-gesture-handler';
import ImagePicker from 'react-native-image-crop-picker'; //Image

class PostNotification extends React.Component {
    constructor(props) {
        super(props);
        const { idUser } = this.props.route.params;
        this.state = {
            avatarSrc: {},
            formData: {
                typePost: '1',
                Title: '',
                Content: '',
                idPost: idUser,
            }
        }
    }
    _DangThongBao = async () => {
        let formDataPost = new FormData();
        const { avatarSrc, formData } = this.state;

        if (!avatarSrc.path)
            return Alert.alert('', 'Vui lòng chọn ảnh Thông báo');
        else if (!this.state.formData.Title)
            return Alert.alert('', 'Tiêu đề không được để trống');
        else if (!this.state.formData.Content)
            return Alert.alert('', 'Nội dung không được để trống');

        this.refs.loading.show(); //Hình gift Loading

        for (let p in formData) formDataPost.append(p, formData[p]);
        formDataPost.append('photo', { //Ghép file Avatar
            uri: avatarSrc.path,
            type: avatarSrc.mime,
            name: 'Avatar',
        });

        await fetch(host + '/notification/PostNotification.php', {
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
                    this.refs.loading.close(); //Hình gift Loading
                    if (JSON.stringify(json) == 1) {
                        Alert.alert('', 'Đăng thông báo thành công');
                        this.setState({ formData: { ...this.state.formData, Title: '', Content: '' }, avatarSrc: {} });
                    }
                    else if (JSON.stringify(json) == 2)
                        Alert.alert('', 'Đăng thông báo thất bại');
                }, 100);
            })
            .catch((error) => {
                this.refs.loading.close(); //Hình gift Loading
                console.log(error);
                Alert.alert('', 'Không thể kết nối tới máy chủ');
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
    _touchPicker = (typePost) => {
        this.setState({
            typePost:
                this.setState(previousState => ({
                    formData: {
                        ...previousState.formData,
                        typePost: typePost,
                    },
                })),
        })
    }
    render() {
        const { typePost, Title, Content } = this.state.formData;
        const sourceUri = this.state.avatarSrc.path ? { uri: this.state.avatarSrc.path } : require('../../assets/images/chooseImage.png');
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
                <Text style={{ fontSize: 13, fontWeight: "bold", paddingTop: 2, paddingLeft: 2 }}>LOẠI THÔNG BÁO</Text>
                <View style={{ paddingTop: 5 }}>
                    <View style={{ backgroundColor: '#fff', borderRadius: 5, padding: 4 }}>
                        <Picker
                            selectedValue={typePost}
                            style={styles.dropdownPicker}
                            onValueChange={this._touchPicker}
                        >
                            <Picker.Item key="1" label="Tòa nhà" value="1" />
                            <Picker.Item key="2" label="Nhân viên" value="2" />
                        </Picker>
                    </View>
                </View>
                <View style={{ paddingTop: 5 }}></View>
                <Text style={{ fontSize: 13, fontWeight: "bold", paddingBottom: 5, paddingLeft: 2 }}>TIÊU ĐỀ</Text>
                <TextInput
                    style={styles.txtInput}
                    keyboardType="default"
                    placeholder="Tiêu đề"
                    onChangeText={Title =>
                        this.setState(previousState => ({
                            formData: {
                                ...previousState.formData,
                                Title
                            }
                        }))
                    }
                    value={Title}
                />
                <View style={{ paddingTop: 5 }}></View>
                <Text style={{ fontSize: 13, fontWeight: "bold", paddingBottom: 5, paddingLeft: 2 }}>NỘI DUNG</Text>
                <TextInput
                    style={styles.txtContent}
                    multiline={true}
                    numberOfLines={5}
                    keyboardType="default"
                    placeholder="Nội dụng"
                    onChangeText={Content => this.setState(({ formData: { ...this.state.formData, Content: Content } }))}
                    value={Content}
                />
                <View style={{ paddingTop: 10 }}></View>
                <Text style={styles.btnDangThongBao} onPress={this._DangThongBao}>Đăng thông báo</Text>
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
    txtContent: {
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