import React from 'react';
import {
	StyleSheet,
	View,
	Text,
	Alert,
	Image,
	TextInput,
	FlatList,
} from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Hosting as host } from '../../app.json'; //Lấy IP host ra từ webService
import Loading from 'react-native-whc-loading';

class UpdateApartmentUser extends React.Component {
	constructor(props) {
		super(props);
		const { idUser } = this.props.route.params;
		this.state = {
			dataHome: [],
			formData: {
				idHome: '',
				idUser: idUser,
			}
		}
	}
	componentDidMount = async () => {
		await this._loadDSCanHo();
	}
	_loadDSCanHo = async () => {
		await fetch(host + '/apartment/LoadApartmentUser.php', {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(this.state.formData)
		})
			.then((response) => response.json())
			.then((json) => {
				this.setState({ dataHome: json })
			})
			.catch((err) => { Alert.alert('', 'Không thể kết nối tới máy chủ'); console.log(err) })
	}
	_xoaCanHo = async (item) => {
		this.refs.loading.show();
		await fetch(host + '/apartment/DeleteApartmentUser.php', {
			method: 'DELETE',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				idUser: this.state.formData.idUser,
				delHome: item,
			})
		})
			.then((response) => response.json())
			.then((json) => {
				setTimeout(() => {
					if (JSON.stringify(json) == 1) {
						Alert.alert('', 'Xóa thành công');
						this._loadDSCanHo();
					}
					else if (JSON.stringify(json) == 2)
						Alert.alert('', 'Xóa thất bại');
					this.refs.loading.close();
				}, 100);
			})
			.catch((err) => {
				this.refs.loading.close();
				Alert.alert('', 'Không thể kết nối tới máy chủ');
				console.log(err)
			})
	}
	_addCanho = async () => {
		if (!this.state.formData.idHome)
			return Alert.alert('', 'Mã căn hộ không để trống');

		this.refs.loading.show();

		await fetch(host + '/apartment/AddApartmentUser.php', {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(this.state.formData)
		})
			.then((response) => response.json())
			.then((json) => {
				setTimeout(() => {
					if (JSON.stringify(json) == 2) {
						Alert.alert('', 'Thêm thành công');
						this.setState({ formData: { ...this.state.formData, idHome: null } })
						this._loadDSCanHo();
					}
					else if (JSON.stringify(json) == 3)
						Alert.alert('', 'Căn hộ đã có trong danh sách hoặc không tồn tại');
					this.refs.loading.close();
				}, 100);
			})
			.catch((err) => { Alert.alert('', 'Không thể kết nối tới máy chủ'); console.log(err) })
	}
	_renderItem = ({ item, index }) => {
		return (
			<View style={{ width: "100%" }}>
				<View style={{ borderBottomWidth: 1, borderColor: '#999999' }}></View>
				<View style={{ flexDirection: 'row', flex: 1 }}>
					<TouchableOpacity onPress={() => this.props.navigation.navigate('InfoApartment', { idMain: item.idMain })}>
						<View style={{ flexDirection: 'row' }}>
							<Image
								source={require('../../assets/icons/home.png')}
								style={{ height: 35, width: 35, marginTop: 10, marginLeft: 8, marginRight: 8 }}
							/>
							<View style={{ paddingLeft: 10, padding: 3 }}>
								<Text style={styles.txtCanho}>Mã căn hộ: <Text style={{ fontWeight: 'bold' }}>{item.idMain}</Text></Text>
								<Text style={styles.txtCanho}>Tên căn hộ: <Text style={{ fontWeight: 'bold' }}>{item.name_apartment}</Text></Text>
							</View>
						</View>
					</TouchableOpacity>
					<View style={{ justifyContent: "center", flexDirection: "column", paddingLeft: 15 }}>
						<TouchableOpacity onPress={() => { this._xoaCanHo(item.idMain) }}>
							<Text style={{ backgroundColor: '#ff6666', borderRadius: 2, padding: 5, color: '#fff', fontSize: 15, textAlign: "center" }}>Xóa</Text>
						</TouchableOpacity>
					</View>
				</View>
			</View >
		);
	}
	render() {
		const { idHome } = this.state.formData;
		const { dataHome } = this.state;
		return (
			<View style={{ flex: 1, paddingTop: 10 }}>
				<View style={styles.container}>
					<View style={{ padding: 8 }}>
						<Text style={styles.textNe}>Thêm căn hộ</Text>
						<View style={{ paddingTop: 10 }}></View>
						<View style={{ borderWidth: 0.5, borderRadius: 5, borderColor: '#666666' }}>
							<TextInput
								style={styles.txtInput}
								keyboardType="numeric"
								placeholder="Mã căn hộ"
								onChangeText={idHome => this.setState({ formData: { ...this.state.formData, idHome: idHome } })}
								value={idHome}
							/>
						</View>
						<View style={{ paddingTop: 10 }}></View>
						<TouchableOpacity onPress={() => this._addCanho()}>
							<Text style={styles.btnThem}>Thêm</Text>
						</TouchableOpacity>
						<View style={{ paddingTop: 10 }}></View>
					</View>
				</View>
				<View style={{ paddingTop: 20 }}></View>
				<View style={styles.dsCanho}>
					<Text style={styles.textNe}>Danh sách căn hộ</Text>
					<View style={{ paddingTop: 10 }}></View>
					<FlatList
						data={dataHome}
						renderItem={this._renderItem}
						keyExtractor={item => item.idMain.toString()}
					/>
				</View>
				<Loading ref="loading" />
			</View>
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
		height: '72%',
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

export default UpdateApartmentUser;