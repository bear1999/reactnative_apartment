import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    Image,
    FlatList,
    ActivityIndicator,
} from 'react-native';
import { Hosting as host } from '../../app.json'; //Lấy IP host ra từ webService
import Loading from 'react-native-whc-loading';
import { ScrollView } from 'react-native-gesture-handler';

export default class MyHome extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true, //ActivityIndicator
            dataUser: [],
        }
    }
    componentDidMount = async () => {
        await this._loadDataUser();
    }
    _loadDataUser = async () => {
        const { idMain } = this.props.route.params;
        await fetch(host + '/apartment/InfoApartment/UserInHome.php', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ idMain: idMain })
        })
            .then((response) => response.json())
            .then((json) => {
                this.setState({ dataUser: json, isLoading: false })
            })
            .catch(() => { null });
    }
    _renderItem = ({ item, index }) => {
        return (
            <View>
                <View style={{ flex: 1, flexDirection: 'row', backgroundColor: '#fff', padding: 6 }}>
                    <View style={{ borderRightWidth: 0.5, borderRightColor: "#808080" }}>
                        <Image
                            source={{ uri: host + '/assets/avatar/' + item.pathAvatar }}
                            style={{
                                width: 75,
                                height: 75,
                                borderRadius: 75 / 2,
                                margin: 10,
                            }}
                        />
                    </View>
                    <View style={{ flex: 1, flexDirection: 'column', paddingLeft: 5 }}>
                        <View style={{ paddingTop: 5 }}></View>
                        <Text style={{ fontWeight: 'bold' }}>ID: {item.idUser}</Text>
                        <Text>Họ tên: {item.Username}</Text>
                        <Text>Số điện thoại: {item.PhoneNumber}</Text>
                        <Text>Email: {item.Email}</Text>
                    </View>
                </View>
            </View>
        );
    }
    render() {
        const { dataUser, isLoading } = this.state;
        return (
            <ScrollView style={styles.dsCanho}>
                <Text style={styles.textNe}>Người trong căn hộ</Text>
                <View style={{ paddingTop: 10 }}></View>
                {isLoading ? <View style={{ flex: 1, justifyContent: "center", padding: 30 }}><ActivityIndicator size="large" color="#1a8cff" /></View> :
                    <FlatList
                        data={dataUser}
                        renderItem={this._renderItem}
                        keyExtractor={item => item.idUser.toString()}
                    />
                }
                <Loading ref="loading" />
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    txtCanho: {
        fontSize: 17,
    },
    dsCanho: {
        backgroundColor: '#fff',
        borderRadius: 1,
        height: '100%',
    },
    container: {
        backgroundColor: '#fff',
        borderRadius: 1,
    },
    btnThem: {
        backgroundColor: '#ff6666',
        textAlign: 'center',
        fontSize: 17,
        borderRadius: 5,
        height: 35,
        paddingTop: 5,
        color: '#fff',
        fontWeight: 'bold',
    },
    textNe: {
        paddingTop: 5,
        fontSize: 20,
        fontWeight: 'bold',
        justifyContent: 'center',
        textAlign: 'center',
        color: '#333333',
    },
    txtInput: {
        height: 44,
        fontSize: 17,
        paddingLeft: 5,
    },
});