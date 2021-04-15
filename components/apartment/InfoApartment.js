import React from 'react';
import {
	StyleSheet,
	Text,
	View,
	FlatList,
	Image,
	ActivityIndicator,
	LogBox,
} from 'react-native';
import { TouchableOpacity, ScrollView } from 'react-native-gesture-handler';
import { Hosting as host } from '../../app.json'; //Lấy IP host ra từ webService
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import moment from 'moment'; //format date
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import NumberFormat from 'react-number-format';

LogBox.ignoreLogs(['VirtualizedLists should never be nested']);

export function Currency({ value }) {
	return (
		<NumberFormat
			value={value}
			displayType={'text'}
			thousandSeparator={true}
			suffix={' đ'}
			renderText={formattedValue => <Text>{formattedValue}</Text>} // <--- Don't forget this!
		/>
	);
}

class InfoApartment extends React.Component {
	constructor(props) {
		super(props);
		const { idMain } = this.props.route.params;
		this.state = {
			dataHome: [],
			infoHome: [],
			dataHistory: [],
			dataService: [],
			isLoading: false, //ActivityIndicator
			idMain: idMain,
		}
	}
	async componentDidMount() {
		this.setState({ isLoading: true });
		await this._loadDefault();
		this.loadData = this.props.navigation.addListener('focus', async () => {
			await this._loadDefault();
		});
	}
	_loadDefault = async () => {
		await this._loadInfoHome();
		await this._loadDataHome();
		await this._loadDataService();
		await this._loadDataHistoryService();
	}
	_loadInfoHome = async () => {
		await fetch(host + '/apartment/InfoApartment/InfoHome.php', {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ idMain: this.state.idMain })
		})
			.then((response) => response.json())
			.then((json) => {
				this.setState({ infoHome: json })
			})
			.catch(() => { null });
	}
	_loadDataHistoryService = async () => {
		await fetch(host + '/service/HistoryServiceHome.php', {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ idHome: this.state.idMain })
		})
			.then((response) => response.json())
			.then((json) => {
				this.setState({ dataHistory: json, isLoading: false })
			})
			.catch((err) => { console.error(err) });
	}
	_loadDataService = async () => {
		await fetch(host + '/apartment/InfoApartment/InfoService.php', {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ idMain: this.state.idMain })
		})
			.then((response) => response.json())
			.then((json) => {
				this.setState({ dataService: json, isLoading: false })
			})
			.catch(() => { null });
	}
	_loadDataHome = async () => {
		await fetch(host + '/apartment/InfoApartment/UserInHome.php', {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ idMain: this.state.idMain })
		})
			.then((response) => response.json())
			.then((json) => {
				this.setState({ dataHome: json, isLoading: false })
			})
			.catch(() => { null });
	}
	_btnLichSu = () => {
		if (!this.state.flagLichSu) this.setState({ flagLichSu: true });
		else this.setState({ flagLichSu: false });
	}
	_renderDanCu = ({ item }) => {
		return (
			<SafeAreaView>
				<TouchableOpacity onPress={() => {
					this.props.navigation.navigate('Profile', {
						Username: item.Username,
						Sex: item.Sex,
						PhoneNumber: item.PhoneNumber,
						Email: item.Email,
						Birthday: item.Birthday,
						pathAvatar: item.pathAvatar,
						idUser: item.idUser,
						Position: item.idPosition,
						IDCard: item.IDCard,
						Disable: item.Disable
					})
				}}>
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
				</TouchableOpacity>
			</SafeAreaView>
		);
	}
	_renderDichVuCanHo = ({ item }) => {
		return (
			<SafeAreaView>
				<View style={{ flex: 1, flexDirection: 'column', backgroundColor: '#fff', padding: 6 }}>
					<View style={{ flex: 1, flexDirection: "row" }}>
						<View style={{ borderRightWidth: 0.5, borderRightColor: "#808080", justifyContent: "center" }}>
							<Image
								source={{ uri: host + '/assets/logoService/' + item.imageTypeService }}
								style={{
									width: 75,
									height: 75,
									margin: 10,
									borderRadius: 2,
								}}
							/>
						</View>
						<TouchableOpacity onPress={() => this.props.navigation.navigate("DetailService", {
							name_service: item.name_service,
							description_service: item.description_service,
							unit: item.unit,
							price_service: item.price_service,
							type: item.type,
							imageTypeService: item.imageTypeService
						})}>
							<View style={{ flex: 1, flexDirection: 'column', paddingLeft: 5 }}>
								<View style={{ paddingTop: 5 }}></View>
								<Text style={{ fontWeight: 'bold' }}>Mã dịch vụ: {item.idService}</Text>
								<Text style={{ fontWeight: 'bold' }}>Tên dịch vụ: {item.name_service}</Text>
								<Text>Ngày đăng ký: {moment(item.regDate).format('DD/MM/yyyy')}</Text>
								<Text>Ngày hết hạn: <Text style={{ color: "#ff0000" }}>{moment(item.expDate).format('DD/MM/yyyy')}</Text></Text>
							</View>
						</TouchableOpacity>
						{item.value && item.type ?
							<View style={{ paddingTop: 5, paddingLeft: 15, paddingRight: 15, flexDirection: "column", justifyContent: "center" }}>
								<TouchableOpacity onPress={() => this.props.navigation.navigate("InfoPayment", {
									idService: item.idService,
									idHome: item.idHome,
									regDate: item.regDate,
									expDate: item.expDate,
									value: item.value,
									name_service: item.name_service,
									unit: item.unit,
									price_service: item.price_service,
									type: item.type,
								})}>
									<Text style={styles.thongtinthanhtoan}>Thanh toán</Text>
								</TouchableOpacity>
							</View>
							: !item.type && !item.value ?
								<View style={{ paddingTop: 5, paddingLeft: 15, paddingRight: 15, flexDirection: "column", justifyContent: "center" }}>
									<TouchableOpacity onPress={() => this.props.navigation.navigate("InfoPayment", {
										idService: item.idService,
										idHome: item.idHome,
										regDate: item.regDate,
										expDate: item.expDate,
										value: item.value,
										name_service: item.name_service,
										unit: item.unit,
										price_service: item.price_service,
										type: item.type,
									})}>
										<Text style={styles.thongtinthanhtoan}>Thanh toán</Text>
									</TouchableOpacity>
								</View>
								: null
						}
					</View>
				</View>
			</SafeAreaView>
		);
	}
	_renderHistoryDichVu = ({ item }) => {
		return (
			<SafeAreaView>
				<View style={{ flex: 1, flexDirection: 'row', backgroundColor: '#fff', padding: 6, borderBottomWidth: 0.8, borderBottomColor: "#808080" }}>
					<View style={{ flex: 1, flexDirection: 'column', paddingLeft: 5, borderRightWidth: 0.8, borderRightColor: "#808080" }}>
						<View style={{ paddingTop: 5 }}></View>
						<Text style={{ fontWeight: "bold" }}>Tên dịch vụ:</Text>
						<Text style={{ fontWeight: "bold" }}>{item.name_service}</Text>
						<Text>Ngày đăng ký: {moment(item.regDate).format('DD/MM/yyyy')}</Text>
						<Text>Ngày hết hạn: <Text style={{ color: "red" }}>{moment(item.expDate).format('DD/MM/yyyy')}</Text></Text>
						<Text>Loại dịch vụ: {item.type_service ? <Text>Hệ số</Text> : <Text>Không hệ số</Text>}</Text>
						<Text>Hệ số sử dụng: {item.value}</Text>
						<Text>Số tiền thanh toán:</Text>
						<Text><Currency value={item.total_payment} /></Text>
					</View>
					<View style={styles.btn}>
						{item.confirm ?
							<Text style={styles.dathanhtoan}>Đã thanh toán</Text> :
							<Text style={styles.huydichvu}>Hủy dịch vụ</Text>
						}
					</View>
				</View>
			</SafeAreaView>
		);
	}
	render() {
		const { dataHome, isLoading, infoHome, dataService, dataHistory } = this.state;
		let flagViewLS = false, count = 0;
		dataHistory.map(() => {
			count = count + 1;
			if (count == 2) flagViewLS = true;
		});
		let dateExp, dateRent, priceRent, idStatus;
		infoHome.map((item) => {
			dateExp = item.dateExp;
			dateRent = item.dateRent;
			priceRent = item.priceRent;
			idStatus = item.idStatus;
		});
		return (
			<ScrollView style={{ flex: 1 }}>
				<View style={{ padding: 5, paddingTop: 10 }}>
					<Text style={{
						fontSize: 15, padding: 5, backgroundColor: "#809fff", color: "#fff", borderTopLeftRadius: 5, borderTopRightRadius: 5, fontWeight: "bold", textAlign: "center"
					}}>Căn hộ</Text>
					<View style={{ backgroundColor: "#fff", padding: 5 }}>
						<Text style={{ fontSize: 16 }}>Mã căn hộ: {infoHome.map((item) => item.idMain)}</Text>
						<Text style={{ fontSize: 16 }}>Tên căn hộ: {infoHome.map((item) => item.name_apartment)}</Text>
						<Text style={{ fontSize: 16 }}>Trạng thái căn hộ: {infoHome.map((item) => item.name_status)}</Text>
						{idStatus == 1 ?
							<>
								<Text style={{ fontSize: 16 }}>Giá thuê: <Currency value={priceRent} /></Text>
								<Text style={{ fontSize: 16 }}>Ngày thuê: {moment(dateRent).format('DD/MM/YYYY')}</Text>
								<Text style={{ fontSize: 16 }}>Ngày hết hạn: <Text style={{ color: 'red' }}>{moment(dateExp).format('DD/MM/YYYY')}</Text></Text>
							</>
							: null
						}
					</View>
				</View>
				<View style={{ padding: 5 }}>
					<View style={{ paddingTop: 10 }}>
						<Text style={{
							fontSize: 15, padding: 5, backgroundColor: "#809fff", color: "#fff", borderTopRightRadius: 5, borderTopLeftRadius: 5, fontWeight: "bold", textAlign: "center"
						}}>Dân cư</Text>
					</View>
					{isLoading ? <View style={{ flex: 1, justifyContent: "center", padding: 30 }}><ActivityIndicator size="large" color="#1a8cff" /></View> :
						<FlatList
							data={dataHome}
							renderItem={this._renderDanCu}
							keyExtractor={item => item.idUser.toString()}
						/>
					}
				</View>
				<View style={{ padding: 5 }}>
					<View style={{ paddingTop: 10 }}>
						<Text style={{
							fontSize: 15, padding: 5, backgroundColor: "#809fff", color: "#fff", borderTopRightRadius: 5, borderTopLeftRadius: 5, fontWeight: "bold", textAlign: "center"
						}}>Dịch vụ căn hộ</Text>
					</View>
					{isLoading ? <View style={{ flex: 1, justifyContent: "center", padding: 30 }}><ActivityIndicator size="large" color="#1a8cff" /></View> :
						<FlatList
							data={dataService}
							renderItem={this._renderDichVuCanHo}
							keyExtractor={item => item.idService.toString()}
						/>
					}
				</View>
				<View style={{ padding: 5 }}>
					<TouchableOpacity onPress={() => this._btnLichSu()}>
						<View style={{ paddingTop: 10 }}>
							{this.state.flagLichSu ?
								<Text style={{
									fontSize: 15, padding: 5, backgroundColor: "#404040", color: "#fff", borderTopRightRadius: 5, borderTopLeftRadius: 5, fontWeight: "bold", textAlign: "center"
								}}><FontAwesome5 color="#fff" name="history" size={15} /> Lịch sử dịch vụ</Text>
								: <Text style={{
									fontSize: 15, padding: 5, backgroundColor: "#404040", color: "#fff", borderRadius: 5, fontWeight: "bold", textAlign: "center"
								}}><FontAwesome5 color="#fff" name="history" size={15} /> Lịch sử dịch vụ</Text>
							}
						</View>
					</TouchableOpacity>
					{isLoading ? <View style={{ flex: 1, justifyContent: "center", padding: 30 }}><ActivityIndicator size="large" color="#1a8cff" /></View> :
						this.state.flagLichSu ?
							flagViewLS ?
								<>
									<ScrollView style={{ height: 350 }}>
										<FlatList
											data={dataHistory}
											renderItem={this._renderHistoryDichVu}
											keyExtractor={item => item.idHistory.toString()}
										/>
									</ScrollView>
								</>
								: <>
									<ScrollView>
										<FlatList
											data={dataHistory}
											renderItem={this._renderHistoryDichVu}
											keyExtractor={item => item.idHistory.toString()}
										/>
									</ScrollView>
								</>
							: null
					}
				</View>
				<TouchableOpacity onPress={() => this.props.navigation.navigate("ListRegService", { idMain: this.props.route.params.idMain })}>
					<View style={{ padding: 5, justifyContent: "center" }}>
						<Text style={{
							backgroundColor: "#404040", padding: 5, textAlign: "center", color: "#fff", fontWeight: "bold", borderRadius: 5,
							fontSize: 17
						}}>
							<MaterialCommunityIcons color="#fff" name="beaker-plus" size={18} />  Đăng ký dịch vụ
						</Text>
					</View>
				</TouchableOpacity>
			</ScrollView>
		);
	}
}

const styles = StyleSheet.create({
	dropdownPicker: {
		width: "100%",
		height: 35,
	},
	dathanhtoan: {
		backgroundColor: "rgb(92,184,92)",
		color: "#fff", fontSize: 17,
		fontWeight: "bold",
		borderRadius: 3,
		textAlign: "center"
	},
	thongtinthanhtoan: {
		backgroundColor: "#00cc66",
		color: "#fff",
		fontSize: 16,
		fontWeight: "bold",
		borderRadius: 3,
		textAlign: "center",
		padding: 3,
	},
	huydichvu: {
		backgroundColor: "rgb(217,83,79)",
		color: "#fff",
		fontSize: 17,
		fontWeight: "bold",
		borderRadius: 3,
		textAlign: "center"
	},
	btn: {
		flex: 1,
		flexDirection: 'column',
		justifyContent: "center",
		paddingLeft: 6
	},
});

export default InfoApartment;