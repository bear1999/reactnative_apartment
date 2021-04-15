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

export default class PayInformation extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isLoading: true,
			dataPay: [],
		}
	}
	async componentDidMount() {
		await this._loadDefault();
	}
	_loadDefault = async () => {
		await fetch(host + '/information/PayInformation.php', {
			method: 'GET',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
		})
			.then((response) => response.json())
			.then((json) => {
				this.setState({
					dataPay: json,
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
					<Text style={styles.title}>{item.NameBank}</Text>
					<View style={{ paddingVertical: 2 }}></View>
					<Text style={{ fontSize: 17, textAlign: "center" }}>{item.FullNameBank}</Text>
					<View style={{ paddingVertical: 2 }}></View>
					<View style={{ flexDirection: "row" }}>
						<Text style={{ fontWeight: "bold", fontSize: 13 }}>CHỦ TÀI KHOẢN: </Text>
						<View style={{ flex: 1, flexDirection: "column" }}>
							<Text>{item.NameAccount}</Text>
						</View>
					</View>
					<View style={{ flexDirection: "row" }}>
						<Text style={{ fontWeight: "bold", fontSize: 13 }}>SỐ TÀI KHOẢN: </Text>
						<View style={{ flex: 1, flexDirection: "column" }}>
							<Text>{item.NumberAccount}</Text>
						</View>
					</View>
					<View style={{ flexDirection: "row" }}>
						<Text style={{ fontWeight: "bold", fontSize: 13 }}>CHI NHÁNH: </Text>
						<View style={{ flex: 1, flexDirection: "column" }}>
							<Text>{item.BrandBank}</Text>
						</View>
					</View>
				</View>
			</View>
		);
	}
	render() {
		const { dataPay, isLoading } = this.state;
		return (
			<ScrollView style={{ flex: 1 }}>
				{isLoading ? <View style={{ flex: 1, justifyContent: "center" }}><ActivityIndicator size="large" color="#f1a8cff" /></View> :
					<FlatList
						data={dataPay}
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