import React from 'react';
import {
	StyleSheet,
	View,
	Text,
	Alert,
	StatusBar,
	ActivityIndicator,
	FlatList
} from 'react-native';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import { Hosting as host } from '../../app.json'; //Lấy IP host ra từ webService
import moment from 'moment'; //format date

export default class ApartmentNotification extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			dataNotification: [],
			listRefreshing: false,
			isLoading: false, //ActivityIndicator
			formSearch: {
				Page: '0',
				type: '1',
			}
		}
	}
	componentDidMount = async () => {
		await this._loadDefault();
		this.loadData = this.props.navigation.addListener('focus', () => {
			this._handleRefresh();
		});
	}
	_loadDefault = async () => {
		!this.state.listRefreshing ? this.setState({ isLoading: true }) : null
		await fetch(host + '/notification/ApartmentNofitication.php', {
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
					dataNotification: json,
					listRefreshing: false, //pull to refresh flat list
					isLoading: false, //ActivityIndicator
				})
			})
			.catch((error) => {
				console.log(error);
				return Alert.alert('', 'Không thể kết nối tới máy chủ');
			});
	}
	_loadMore = async () => {
		await fetch(host + '/notification/ApartmentNofitication.php', {
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
					dataNotification: this.state.dataNotification.concat(json),
				})
			})
			.catch((error) => {
				console.log(error);
				return Alert.alert('', 'Không thể kết nối tới máy chủ');
			});
	}
	_handleLoadMore = () => {
		this.setState({
			Page:
				this.setState(previousState => ({
					formSearch: {
						...previousState.formSearch,
						Page: this.state.formSearch.Page + 1,
					}
				}))
		}, this._loadMore);
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
		}, this._loadDefault)
	}
	_renderItem = ({ item }) => {
		let title = item.notify_title;
		if (title.length > 50) title = item.notify_title.substring(0, 50) + "...";
		let content = item.notify_text;
		if (content.length > 50) content = item.notify_text.substring(0, 50) + "...";
		return (
			<TouchableOpacity onPress={() => this.props.navigation.navigate('DetailNotification', {
				title: item.notify_title,
				content: item.notify_text,
				image: item.pathImage,
				user: item.Username,
				datePost: item.notify_datePost,
				idNotify: item.idNotify
			})}>
				<View style={{ backgroundColor: "#fff", borderBottomWidth: 0.2, borderColor: "rgb(80,80,80)", padding: 5 }}>
					<Text style={{ fontWeight: "bold", fontSize: 16, color: "#333333" }}>{title}</Text>
					<Text style={{ color: "#404040" }}>{content}</Text>
					<View style={{ paddingTop: 5 }}></View>
					<View style={{ flex: 1, flexDirection: "row", paddingLeft: 2, paddingRight: 2 }}>
						<Text style={{ fontSize: 13, color: "#0080ff" }}>{moment(item.notify_datePost).format('HH:mm - DD/MM/YYYY')}</Text>
						<View style={{ flex: 1 }}>
							<Text style={{ textAlign: "right", fontSize: 13, color: "rgb(50,50,50)" }}>{item.Username}</Text>
						</View>
					</View>
				</View>
			</TouchableOpacity>
		);
	}
	render() {
		const { dataNotification, isLoading } = this.state;
		return (
			<ScrollView>
				<StatusBar backgroundColor="#000" barStyle="light-content" />
				{isLoading ? <View style={{ paddingTop: 100 }}><ActivityIndicator size="large" color="#1a8cff" /></View> :
					<FlatList
						data={dataNotification}
						renderItem={this._renderItem}
						keyExtractor={item => item.idNotify.toString()}
						refreshing={this.state.listRefreshing}
						onRefresh={this._handleRefresh}
						onEndReached={this._handleLoadMore}
						onEndReachedThreshold={0.5}
					/>
				}
			</ScrollView>
		);
	}
}
