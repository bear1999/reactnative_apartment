import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    TextInput,
    View,
    KeyboardAvoidingView,
    Alert,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
// Register Form
import { Picker } from '@react-native-community/picker'; //dropdown list
import Loading from 'react-native-whc-loading';
import { Hosting as host } from '../../app.json'; //Lấy IP host ra từ webService
import AsyncStorage from '@react-native-community/async-storage';

export default class PostSupport extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dataPosition: [],
            dataHome: [],
            formData: {
                title: '',
                content: '',
                position: '',
                idUser: '',
                idHome: '',
            }
        }
    }
    componentDidMount = async () => {
        await AsyncStorage.getItem('@idUser_Acc', (err, result) => {
            this.setState({ formData: { ...this.state.idUser, idUser: result } })
        });
        await fetch(host + '/getdata/getPositionEmployee.php', { method: 'POST' })
            .then((response) => response.json())
            .then((json) => {
                this.setState({
                    dataPosition: json,
                })
            })
            .catch(() => { return Alert.alert('', 'Không thể kết nối tới máy chủ') });
        await fetch(host + '/customersupport/GetUserHome.php', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ idUser: this.state.formData.idUser })
        })
            .then((response) => response.json())
            .then((json) => {
                this.setState({ dataHome: json });
            })
            .catch((error) => {
                this.refs.loading.close();
                console.log(error);
                return Alert.alert('', 'Không thể kết nối tới máy chủ');
            });
    }
    /* Lưu đăng ký */
    saveData = async () => {
        if (!this.state.formData.title)
            return Alert.alert('', 'Tiêu đề không được để trống');
        else if (!this.state.formData.content)
            return Alert.alert('', 'Nội dung không được để trống');

        this.refs.loading.show(); //Hình gift Loading
        await fetch(host + '/customersupport/PostSupport.php', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(this.state.formData)
        })
            .then((response) => response.json())
            .then((json) => {
                this.refs.loading.close();
                setTimeout(() => {
                    if (JSON.stringify(json) == 1) {
                        Alert.alert('', "Gửi thành công");
                        this.props.navigation.goBack();
                    }
                    else if (JSON.stringify(json) == 2)
                        Alert.alert('', 'Gửi thất bại');
                }, 100) //Load time mili giây
            })
            .catch((error) => {
                this.refs.loading.close();
                console.log(error);
                return Alert.alert('', 'Không thể kết nối tới máy chủ');
            });
    }
    /* End Lưu đăng ký */
    render() {
        /* Lưu database */
        const { title, content, position, idHome } = this.state.formData;
        /* End Lưu database */
        return (
            <ScrollView>
                <KeyboardAvoidingView style={styles.container} enabled>
                    <Text style={styles.text}>BỘ PHẬN</Text>
                    <View style={{ paddingTop: 4 }}></View>
                    <View style={{ backgroundColor: '#fff', borderRadius: 5, padding: 5 }}>
                        <Picker
                            selectedValue={position}
                            style={{ height: 30 }}
                            onValueChange={position =>
                                this.setState(previousState => ({
                                    formData: {
                                        ...previousState.formData,
                                        position
                                    }
                                }))
                            }
                        >
                            {
                                this.state.dataPosition.map((item, index) =>
                                    <Picker.Item key={item.idPosition} label={item.namePosition} value={item.idPosition} /> //Tên name_type_apartment trong SQL
                                )
                            }
                        </Picker>
                    </View>
                    <View style={{ paddingTop: 4 }}></View>
                    <Text style={styles.text}>CĂN HỘ</Text>
                    <View style={{ paddingTop: 4 }}></View>
                    <View style={{ backgroundColor: '#fff', borderRadius: 5, padding: 5 }}>
                        <Picker
                            selectedValue={idHome}
                            style={{ height: 30 }}
                            onValueChange={idHome =>
                                this.setState(previousState => ({
                                    formData: {
                                        ...previousState.formData,
                                        idHome
                                    }
                                }))
                            }
                        >
                            {
                                this.state.dataHome.map((item, index) =>
                                    <Picker.Item key={item.idMain} label={item.name_apartment} value={item.idMain} /> //Tên name_type_apartment trong SQL
                                )
                            }
                        </Picker>
                    </View>
                    <View style={{ paddingTop: 4 }}></View>
                    <Text style={styles.text}>TIÊU ĐỀ</Text>
                    <View style={{ paddingTop: 4 }}></View>
                    <TextInput
                        style={styles.txtInput}
                        keyboardType="default"
                        placeholder="Tiêu đề"
                        onChangeText={title => this.setState(({ formData: { ...this.state.formData, title: title } }))}
                        value={title}
                    />
                    <View style={{ paddingTop: 4 }}></View>
                    <Text style={styles.text}>NỘI DỤNG</Text>
                    <View style={{ paddingTop: 4 }}></View>
                    <TextInput
                        style={styles.txtInput}
                        multiline={true}
                        numberOfLines={4}
                        keyboardType="default"
                        placeholder="Nội dụng"
                        onChangeText={content => this.setState(({ formData: { ...this.state.formData, content: content } }))}
                        value={content}
                    />
                    <View style={{ paddingTop: 5 }}></View>
                    {/* Loại */}
                    <View style={{ paddingTop: 5 }}></View>
                    <TouchableOpacity onPress={this.saveData}>
                        <Text style={styles.button}>Gửi hỗ trợ</Text>
                    </TouchableOpacity>
                </KeyboardAvoidingView>
                {/* Hiện hình loading khi nhấn đăng ký */}
                <Loading ref="loading" />
            </ScrollView >
        );
    }
}

const styles = StyleSheet.create({
    formatMoney: { paddingTop: 6, textAlign: "center", borderWidth: 1, borderColor: "#8c8c8c", borderRadius: 2, height: 35, fontSize: 17 },
    container: {
        flex: 1,
        padding: 10,
    },
    text: {
        fontSize: 14,
        fontWeight: "bold"
    },
    row: {
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#ff6666',
        padding: 8,
        marginVertical: 3,
        borderRadius: 5,
        fontSize: 20,
        textAlign: 'center',
        color: '#fff',
    },
    txtInput: {
        height: "auto",
        fontSize: 17,
        backgroundColor: "#fff",
        borderRadius: 3,
        padding: 5
    },
});