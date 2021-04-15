import * as React from 'react';
import {
	StyleSheet,
	Text,
	View,
	FlatList,
	Alert,
	ActivityIndicator,
} from 'react-native';
import { TouchableOpacity, ScrollView } from 'react-native-gesture-handler';
import { Hosting as host } from '../../app.json'; //Lấy IP host ra từ webService
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-community/async-storage';

class Apartment extends React.Component {
	constructor(props) {
		super(props);
		const { idMain, currentType } = this.props.route.params;
		this.state = {
			dataBlock: [],
			listRefreshing: false,
			isLoading: false, //ActivityIndicator
			idMain: null,
			currentType: currentType + 1,
			Position: '0',
			formSearch: {
				idMain: idMain,
			},
		}
	}
	async componentDidMount() {
		this.setState({ isLoading: true });
		await AsyncStorage.getItem('@Position_Acc', (err, result) => {
			this.setState({ Position: result });
		});
		await this._loadDataDefault();
	}
	_loadDataDefault = async () => {
		await fetch(host + '/apartment/Apartment.php', {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(this.state.formSearch)
		})
			.then((response) => response.json())
			.then((json) => {
				this.setState({
					dataBlock: json,
					isLoading: false,
				})
			})
			.catch(() => { null });
	}
	_confirmButton = async (item) => {
		await this.setState({ idMain: item });
		Alert.alert("", "Bạn có chắc muốn xóa ?",
			[
				{
					text: "Có", onPress: () => this._remove()
				},
				{
					text: "Hủy",
					style: "cancel"
				},
			],
			{ cancelable: false }
		);
	}
	_remove = async () => {
		await fetch(host + '/apartment/DeleteApartment.php', {
			method: "DELETE",
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ idMain: this.state.idMain })
		})
			.then((response) => response.json())
			.then((json) => {
				if (JSON.stringify(json) == 1) {
					Alert.alert('', 'Xóa thành công');
					this._loadDataDefault();
				}
				else Alert.alert('', 'Xóa thất bại');
			})
			.catch((error) => {
				console.log(error);
				return Alert.alert('', 'Không thể kết nối tới máy chủ');
			});
	}
	_handleRefresh = () => { //refresh flatlist
		this.setState({
			listRefreshing: true,
			Page:
				this.setState(previousState => ({
					formSearch: {
						...previousState.formSearch,
						Page: 0
					}
				}))
		}, this._btnSearch)
	}
	_btnSearch = async () => {
		!this.state.listRefreshing ? this.setState({ isLoading: true }) : null
		await fetch(host + '/apartment/Apartment.php', {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(this.state.formSearch)
		})
			.then((response) => response.json())
			.then((json) => {
				this.setState({
					dataBlock: json,
					listRefreshing: false, //pull to refresh flat list
					isLoading: false, //ActivityIndicator
				})
			})
			.catch((error) => {
				console.log(error);
				return Alert.alert('', 'Không thể kết nối tới máy chủ');
			});
	}
	_renderItem = ({ item }) => {
		const { currentType } = this.state;
		const { nameTitle } = this.props.route.params;
		let Go = "Apartment";
		if (currentType == 4) Go = "InfoApartment";
		return (
			<SafeAreaView style={{ padding: 2 }}>
				<View style={{ flex: 1, flexDirection: 'row', backgroundColor: '#fff', borderRadius: 5, padding: 6 }}>
					<TouchableOpacity onPress={() => {
						this.props.navigation.push(Go, {
							idMain: item.idMain,
							currentType: this.state.currentType,
							nameTitle: nameTitle + "/" + item.name_apartment
						});
					}}>
						<View style={{ flex: 1, flexDirection: 'column' }}>
							<Text style={{ fontWeight: 'bold' }}>ID: {item.idMain}</Text>
							<Text>Tên: {item.name_apartment}</Text>
							<Text>Trạng thái: {item.name_status}</Text>
							<Text>Loại: {item.name_type_apartment}</Text>
						</View>
					</TouchableOpacity>
					{this.state.Position == 4 ? <>
						<View style={{ flexDirection: "row", justifyContent: "flex-end", flex: 1 }}>
							<View style={{ justifyContent: "center" }}>
								<TouchableOpacity onPress={() => {
									this.props.navigation.navigate('EditApartment', {
										currentType: item.type_apartment,
										currentStatus: item.idStatus,
										idMain: item.idMain,
										Tittle: item.name_apartment,
										priceRent: item.priceRent
									});
									this.loadData = this.props.navigation.addListener('focus', () => {
										this._loadDataDefault();
									});
								}}>
									<Text style={styles.btn1}><FontAwesome color="#fff" name="edit" size={14} /> Chỉnh sửa</Text>
								</TouchableOpacity>
							</View>
							<View style={{ paddingLeft: 10 }}></View>
							<View style={{ justifyContent: "center" }}>
								<TouchableOpacity onPress={() => this._confirmButton(item.idMain)}>
									<Text style={styles.btn2}><FontAwesome color="#fff" name="remove" size={15} /> Xóa</Text>
								</TouchableOpacity>
							</View>
						</View>
					</> : null}
				</View>
			</SafeAreaView >
		);
	}
	render() {
		const { dataBlock, isLoading, currentType } = this.state;
		return (
			<ScrollView style={{ flex: 1 }}>
				{this.state.Position == 4 ?
					<TouchableOpacity onPress={() => {
						this.props.navigation.navigate("AddApartment", { currentType: currentType, idSub: this.props.route.params.idMain })
						this.loadData = this.props.navigation.addListener('focus', () => {
							this._loadDataDefault();
						});
					}}>
						<View style={{ padding: 8 }}>
							<Text style={styles.button}> <FontAwesome color="#fff" name="plus-circle" size={15} /> Thêm</Text>
						</View>
					</TouchableOpacity>
					: null
				}
				<View>
					{isLoading ? <View style={{ flex: 1, justifyContent: "center", padding: 30 }}><ActivityIndicator size="large" color="#1a8cff" /></View> :
						<>
							<View style={{ paddingTop: 5 }}></View>
							<FlatList
								data={dataBlock}
								renderItem={this._renderItem}
								keyExtractor={item => item.idMain.toString()}
								refreshing={this.state.listRefreshing}
								onRefresh={this._handleRefresh}
							/>
						</>
					}
				</View>
			</ScrollView>
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

export default Apartment;