import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Hosting as host } from '../../app.json'; //Lấy IP host ra từ webService

export default class ContactInformation extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            dataContact: [],
        }
    }
    async componentDidMount() {
        await this._loadDefault();
    }
    _loadDefault = async () => {
        await fetch(host + '/information/ContactInformation.php', {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
        })
            .then((response) => response.json())
            .then((json) => {
                this.setState({
                    dataContact: json,
                    isLoading: false,
                })
            })
            .catch((error) => {
                console.log(error);
                return Alert.alert('', 'Không thể kết nối tới máy chủ');
            });
    }
    _renderItem = ({ item }) => {
        return (
            <View style={{ paddingHorizontal: 3, paddingVertical: 2, borderRadius: 5 }}>
                <View style={{ backgroundColor: "#fff", padding: 5 }}>
                    <Text style={styles.title}>{item.NameContact}</Text>
                    <View style={{ flexDirection: "row", paddingVertical: 8 }}>
                        <Text style={{ fontWeight: "bold", fontSize: 15 }}>ĐỊA CHỈ: </Text>
                        <View style={{ flex: 1, flexDirection: "column" }}>
                            <Text style={{ fontSize: 15 }}>{item.AddressContact}</Text>
                        </View>
                    </View>
                    <View style={{ flexDirection: "row" }}>
                        <Text style={{ fontWeight: "bold", fontSize: 15 }}>SỐ ĐIỆN THOẠI: </Text>
                        <View style={{ flex: 1, flexDirection: "column" }}>
                            <Text style={{ fontSize: 15 }}>{item.TelContact}</Text>
                        </View>
                    </View>
                </View>
            </View>
        );
    }
    render() {
        const { dataContact, isLoading } = this.state;
        return (
            <ScrollView style={{ flex: 1 }}>
                {isLoading ? <View style={{ flex: 1, justifyContent: "center" }}><ActivityIndicator size="large" color="#f1a8cff" /></View> :
                    <FlatList
                        data={dataContact}
                        renderItem={this._renderItem}
                        keyExtractor={item => item.idSql.toString()}
                    />
                }
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    title: {
        fontSize: 18, fontWeight: "bold", textAlign: "center",
        backgroundColor: "#595959", color: "#fff", padding: 2, borderRadius: 2,
        shadowColor: "#666666",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.20,
        shadowRadius: 1.41,
        elevation: 2,
    }
});